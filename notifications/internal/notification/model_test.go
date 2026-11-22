package notification

import (
	"errors"
	"testing"
	"time"
)

func TestEventValidate(t *testing.T) {
	valid := Event{
		EventID: "event-1", EventType: "reservation.confirmed", Version: 1,
		OccurredAt: time.Now(), RecipientID: "user-1",
		Title: "Reservation confirmed", Message: "Your reservation is confirmed.",
	}
	if err := valid.Validate(); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	invalidEmail := valid
	invalidEmail.SendEmail = true
	if err := invalidEmail.Validate(); !errors.Is(err, ErrInvalidEvent) {
		t.Fatalf("Validate() error = %v, want ErrInvalidEvent", err)
	}
}
