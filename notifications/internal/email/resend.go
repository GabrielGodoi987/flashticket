package email

import (
	"context"
	"errors"
	"html"
	"net/http"
	"time"

	"github.com/GabrielGodoi987/flashticket/notifications/internal/notification"
	"github.com/resend/resend-go/v4"
)

type Sender interface {
	Configured() bool
	Send(context.Context, notification.Notification) error
}

type ResendSender struct {
	client *resend.Client
	from   string
}

func NewResendSender(apiKey, from string) *ResendSender {
	if apiKey == "" {
		return &ResendSender{from: from}
	}
	client := resend.NewCustomClient(&http.Client{Timeout: 15 * time.Second}, apiKey)
	return &ResendSender{client: client, from: from}
}

func (sender *ResendSender) Configured() bool {
	return sender.client != nil && sender.from != ""
}

func (sender *ResendSender) Send(ctx context.Context, value notification.Notification) error {
	if !sender.Configured() {
		return errors.New("Resend is not configured; set RESEND_API_KEY and RESEND_FROM")
	}
	if err := ctx.Err(); err != nil {
		return err
	}
	_, err := sender.client.Emails.Send(&resend.SendEmailRequest{
		From:    sender.from,
		To:      []string{value.RecipientEmail},
		Subject: value.Title,
		Text:    value.Message,
		Html:    "<p>" + html.EscapeString(value.Message) + "</p>",
	})
	return err
}
