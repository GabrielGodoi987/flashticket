package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/GabrielGodoi987/flashticket/notifications/internal/auth"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/config"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/email"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/httpapi"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/messaging"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/realtime"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/store"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	cfg, err := config.Load()
	if err != nil {
		logger.Error("invalid configuration", "error", err)
		os.Exit(1)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		logger.Error("connect to MongoDB", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			logger.Error("disconnect MongoDB", "error", err)
		}
	}()

	pingCtx, pingCancel := context.WithTimeout(ctx, 5*time.Second)
	err = mongoClient.Ping(pingCtx, nil)
	pingCancel()
	if err != nil {
		logger.Error("ping MongoDB", "error", err)
		os.Exit(1)
	}

	repository := store.NewMongoRepository(mongoClient.Database(cfg.MongoDatabase))
	if err := repository.EnsureIndexes(ctx); err != nil {
		logger.Error("create MongoDB indexes", "error", err)
		os.Exit(1)
	}

	rabbit, err := messaging.Connect(ctx, cfg.RabbitURL, cfg.RabbitExchange, cfg.RabbitDLX, cfg.RabbitDLQ, cfg.RabbitQueue, cfg.RabbitRoutingKey)
	if err != nil {
		logger.Error("connect to RabbitMQ", "error", err)
		os.Exit(1)
	}
	defer rabbit.Close()

	hub := realtime.NewHub()
	emailSender := email.NewResendSender(cfg.ResendAPIKey, cfg.ResendFrom)
	processor := messaging.NewProcessor(repository, emailSender, hub, logger)
	go func() {
		if err := processor.Consume(ctx, rabbit.Deliveries); err != nil && ctx.Err() == nil {
			logger.Error("RabbitMQ consumer stopped", "error", err)
			stop()
		}
	}()
	go processor.SendPendingEmails(ctx)

	verifier := auth.NewVerifier(cfg.JWKSURL, cfg.Issuer, cfg.Audience)
	api := httpapi.NewHandler(repository, hub, verifier, rabbit.Connection, rabbit.Channel, logger)
	server := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           api.Routes(),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		logger.Info("notifications service listening", "address", cfg.HTTPAddr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("HTTP server stopped", "error", err)
			stop()
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("shutdown HTTP server", "error", err)
	}
}
