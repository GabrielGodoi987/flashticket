package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/GabrielGodoi987/flashticket/notifications/internal/auth"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/realtime"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/store"
	"github.com/rabbitmq/amqp091-go"
)

type Handler struct {
	repository store.Repository
	hub        *realtime.Hub
	verifier   *auth.Verifier
	rabbit     *amqp091.Connection
	channel    *amqp091.Channel
	logger     *slog.Logger
}

type contextKey string

const recipientKey contextKey = "recipientID"

func NewHandler(repository store.Repository, hub *realtime.Hub, verifier *auth.Verifier, rabbit *amqp091.Connection, channel *amqp091.Channel, logger *slog.Logger) *Handler {
	return &Handler{repository: repository, hub: hub, verifier: verifier, rabbit: rabbit, channel: channel, logger: logger}
}

func (handler *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handler.health)
	mux.Handle("GET /api/v1/notifications", handler.requireUser(http.HandlerFunc(handler.list)))
	mux.Handle("POST /api/v1/notifications/{id}/read", handler.requireUser(http.HandlerFunc(handler.markRead)))
	mux.Handle("GET /api/v1/notifications/stream", handler.requireUser(http.HandlerFunc(handler.stream)))
	return mux
}

func (handler *Handler) health(writer http.ResponseWriter, request *http.Request) {
	ctx, cancel := context.WithTimeout(request.Context(), 3*time.Second)
	defer cancel()
	mongoErr := handler.repository.Ping(ctx)
	rabbitOK := handler.rabbit != nil && !handler.rabbit.IsClosed() &&
		handler.channel != nil && !handler.channel.IsClosed()
	status := http.StatusOK
	body := map[string]string{"status": "ok", "mongodb": "ok", "rabbitmq": "ok"}
	if mongoErr != nil {
		handler.logger.Error("health check failed for MongoDB", "error", mongoErr)
		body["mongodb"] = "unavailable"
	}
	if !rabbitOK {
		body["rabbitmq"] = "unavailable"
	}
	if mongoErr != nil || !rabbitOK {
		status = http.StatusServiceUnavailable
		body["status"] = "error"
	}
	writeJSON(writer, status, body)
}

func (handler *Handler) requireUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		const prefix = "Bearer "
		authorization := request.Header.Get("Authorization")
		if !strings.HasPrefix(authorization, prefix) || strings.TrimSpace(strings.TrimPrefix(authorization, prefix)) == "" {
			writeJSON(writer, http.StatusUnauthorized, map[string]string{"error": "bearer token required"})
			return
		}
		subject, err := handler.verifier.Subject(request.Context(), strings.TrimSpace(strings.TrimPrefix(authorization, prefix)))
		switch {
		case errors.Is(err, auth.ErrNotConfigured):
			writeJSON(writer, http.StatusServiceUnavailable, map[string]string{"error": "IAM JWT validation is not configured"})
			return
		case errors.Is(err, auth.ErrUnavailable):
			handler.logger.Error("IAM signing keys unavailable", "error", err)
			writeJSON(writer, http.StatusServiceUnavailable, map[string]string{"error": "identity provider unavailable"})
			return
		case err != nil:
			writeJSON(writer, http.StatusUnauthorized, map[string]string{"error": "invalid bearer token"})
			return
		}
		ctx := context.WithValue(request.Context(), recipientKey, subject)
		next.ServeHTTP(writer, request.WithContext(ctx))
	})
}

func (handler *Handler) list(writer http.ResponseWriter, request *http.Request) {
	limit := int64(20)
	if rawLimit := request.URL.Query().Get("limit"); rawLimit != "" {
		value, err := strconv.ParseInt(rawLimit, 10, 64)
		if err != nil || value < 1 {
			writeJSON(writer, http.StatusBadRequest, map[string]string{"error": "limit must be an integer between 1 and 100"})
			return
		}
		limit = value
	}
	if limit > 100 {
		limit = 100
	}
	recipientID := request.Context().Value(recipientKey).(string)
	ctx, cancel := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancel()
	records, err := handler.repository.ListByRecipient(ctx, recipientID, limit)
	if err != nil {
		handler.logger.Error("list notifications", "error", err)
		writeJSON(writer, http.StatusInternalServerError, map[string]string{"error": "could not load notifications"})
		return
	}
	writeJSON(writer, http.StatusOK, records)
}

func (handler *Handler) markRead(writer http.ResponseWriter, request *http.Request) {
	recipientID := request.Context().Value(recipientKey).(string)
	ctx, cancel := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancel()
	found, err := handler.repository.MarkRead(ctx, request.PathValue("id"), recipientID)
	if err != nil {
		handler.logger.Error("mark notification as read", "error", err)
		writeJSON(writer, http.StatusInternalServerError, map[string]string{"error": "could not update notification"})
		return
	}
	if !found {
		writeJSON(writer, http.StatusNotFound, map[string]string{"error": "notification not found"})
		return
	}
	writer.WriteHeader(http.StatusNoContent)
}

func (handler *Handler) stream(writer http.ResponseWriter, request *http.Request) {
	flusher, ok := writer.(http.Flusher)
	if !ok {
		writeJSON(writer, http.StatusInternalServerError, map[string]string{"error": "streaming is not supported"})
		return
	}
	writer.Header().Set("Content-Type", "text/event-stream")
	writer.Header().Set("Cache-Control", "no-cache")
	writer.Header().Set("Connection", "keep-alive")
	writer.Header().Set("X-Accel-Buffering", "no")

	recipientID := request.Context().Value(recipientKey).(string)
	notifications, unsubscribe := handler.hub.Subscribe(recipientID)
	defer unsubscribe()
	_, _ = fmt.Fprint(writer, ": connected\n\n")
	flusher.Flush()

	keepAlive := time.NewTicker(20 * time.Second)
	defer keepAlive.Stop()
	for {
		select {
		case <-request.Context().Done():
			return
		case value, open := <-notifications:
			if !open {
				return
			}
			encoded, err := json.Marshal(value)
			if err != nil {
				handler.logger.Error("encode SSE notification", "error", err)
				continue
			}
			if _, err := fmt.Fprintf(writer, "event: notification\ndata: %s\n\n", encoded); err != nil {
				return
			}
			flusher.Flush()
		case <-keepAlive.C:
			if _, err := fmt.Fprint(writer, ": keepalive\n\n"); err != nil {
				return
			}
			flusher.Flush()
		}
	}
}

func writeJSON(writer http.ResponseWriter, status int, value any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	if err := json.NewEncoder(writer).Encode(value); err != nil {
		slog.Error("write JSON response", "error", err)
	}
}
