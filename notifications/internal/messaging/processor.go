package messaging

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"time"

	"github.com/GabrielGodoi987/flashticket/notifications/internal/email"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/notification"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/realtime"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/store"
	"github.com/rabbitmq/amqp091-go"
)

type Processor struct {
	repository store.Repository
	sender     email.Sender
	hub        *realtime.Hub
	logger     *slog.Logger
}

func NewProcessor(repository store.Repository, sender email.Sender, hub *realtime.Hub, logger *slog.Logger) *Processor {
	return &Processor{repository: repository, sender: sender, hub: hub, logger: logger}
}

func (processor *Processor) Consume(ctx context.Context, deliveries <-chan amqp091.Delivery) error {
	for {
		select {
		case <-ctx.Done():
			return nil
		case delivery, ok := <-deliveries:
			if !ok {
				return errors.New("RabbitMQ delivery channel closed")
			}
			if err := processor.Handle(ctx, delivery.Body); err != nil {
				processor.logger.Error("reject notification event", "error", err)
				requeue := !errors.Is(err, notification.ErrInvalidEvent)
				if requeue {
					timer := time.NewTimer(time.Second)
					select {
					case <-ctx.Done():
						timer.Stop()
					case <-timer.C:
					}
				}
				if nackErr := delivery.Nack(false, requeue); nackErr != nil {
					processor.logger.Error("reject RabbitMQ message", "error", nackErr)
				}
				continue
			}
			if err := delivery.Ack(false); err != nil {
				processor.logger.Error("acknowledge RabbitMQ message", "error", err)
			}
		}
	}
}

func (processor *Processor) Handle(ctx context.Context, body []byte) error {
	if len(body) == 0 || len(body) > 1<<20 {
		return notification.ErrInvalidEvent
	}
	var event notification.Event
	if err := json.Unmarshal(body, &event); err != nil {
		return notification.ErrInvalidEvent
	}
	if err := event.Validate(); err != nil {
		return err
	}
	record, inserted, err := processor.repository.InsertEvent(ctx, event)
	if err != nil {
		return err
	}
	if inserted {
		processor.hub.Publish(record.RecipientID, record)
	}
	return nil
}

func (processor *Processor) SendPendingEmails(ctx context.Context) {
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	processor.sendPending(ctx)
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			processor.sendPending(ctx)
		}
	}
}

func (processor *Processor) sendPending(ctx context.Context) {
	if !processor.sender.Configured() {
		processor.logger.Warn("email delivery disabled; configure RESEND_API_KEY and RESEND_FROM")
		return
	}
	records, err := processor.repository.PendingEmail(ctx, 25)
	if err != nil {
		processor.logger.Error("load pending notification emails", "error", err)
		return
	}
	for _, record := range records {
		claimCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		claimed, err := processor.repository.ClaimEmail(claimCtx, record.EventID, time.Now().UTC())
		cancel()
		if err != nil {
			processor.logger.Error("claim notification email", "event_id", record.EventID, "error", err)
			continue
		}
		if !claimed {
			continue
		}

		sendCtx, cancel := context.WithTimeout(ctx, 20*time.Second)
		err = processor.sender.Send(sendCtx, record)
		cancel()
		status := "sent"
		if err != nil {
			status = "pending"
			processor.logger.Error("send notification email", "event_id", record.EventID, "error", err)
		}
		updateCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		if updateErr := processor.repository.MarkEmail(updateCtx, record.EventID, status); updateErr != nil {
			processor.logger.Error("update notification email status", "event_id", record.EventID, "error", updateErr)
		}
		cancel()
	}
}
