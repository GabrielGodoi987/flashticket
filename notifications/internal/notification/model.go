package notification

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

var ErrInvalidEvent = errors.New("invalid notification event")

type Event struct {
	EventID        string            `json:"eventId" bson:"eventId"`
	EventType      string            `json:"eventType" bson:"eventType"`
	Version        int               `json:"version" bson:"version"`
	OccurredAt     time.Time         `json:"occurredAt" bson:"occurredAt"`
	RecipientID    string            `json:"recipientId" bson:"recipientId"`
	RecipientEmail string            `json:"recipientEmail,omitempty" bson:"recipientEmail,omitempty"`
	Title          string            `json:"title" bson:"title"`
	Message        string            `json:"message" bson:"message"`
	SendEmail      bool              `json:"sendEmail" bson:"sendEmail"`
	Metadata       map[string]string `json:"metadata,omitempty" bson:"metadata,omitempty"`
}

func (event Event) Validate() error {
	if event.EventID == "" || event.EventType == "" || event.Version != 1 ||
		event.OccurredAt.IsZero() || event.RecipientID == "" ||
		event.Title == "" || event.Message == "" ||
		(event.SendEmail && event.RecipientEmail == "") {
		return ErrInvalidEvent
	}
	return nil
}

type Notification struct {
	ID             primitive.ObjectID `json:"id" bson:"_id"`
	EventID        string             `json:"eventId" bson:"eventId"`
	EventType      string             `json:"eventType" bson:"eventType"`
	OccurredAt     time.Time          `json:"occurredAt" bson:"occurredAt"`
	RecipientID    string             `json:"-" bson:"recipientId"`
	Title          string             `json:"title" bson:"title"`
	Message        string             `json:"message" bson:"message"`
	Metadata       map[string]string  `json:"metadata,omitempty" bson:"metadata,omitempty"`
	CreatedAt      time.Time          `json:"createdAt" bson:"createdAt"`
	ReadAt         *time.Time         `json:"readAt,omitempty" bson:"readAt,omitempty"`
	SendEmail      bool               `json:"-" bson:"sendEmail"`
	RecipientEmail string             `json:"-" bson:"recipientEmail,omitempty"`
	EmailStatus    string             `json:"-" bson:"emailStatus"`
	EmailAttemptAt *time.Time         `json:"-" bson:"emailAttemptAt,omitempty"`
}

func New(event Event, now time.Time) Notification {
	status := "skipped"
	if event.SendEmail {
		status = "pending"
	}
	return Notification{
		ID:             primitive.NewObjectID(),
		EventID:        event.EventID,
		EventType:      event.EventType,
		OccurredAt:     event.OccurredAt,
		RecipientID:    event.RecipientID,
		Title:          event.Title,
		Message:        event.Message,
		Metadata:       event.Metadata,
		CreatedAt:      now,
		SendEmail:      event.SendEmail,
		RecipientEmail: event.RecipientEmail,
		EmailStatus:    status,
	}
}
