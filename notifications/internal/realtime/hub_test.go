package realtime

import (
	"testing"
	"time"

	"github.com/GabrielGodoi987/flashticket/notifications/internal/notification"
)

func TestHubPublishesOnlyToRecipientSubscribers(t *testing.T) {
	hub := NewHub()
	userEvents, unsubscribe := hub.Subscribe("user-1")
	defer unsubscribe()
	otherUserEvents, unsubscribeOther := hub.Subscribe("user-2")
	defer unsubscribeOther()

	value := notification.Notification{EventID: "event-1", CreatedAt: time.Now()}
	hub.Publish("user-1", value)

	select {
	case got := <-userEvents:
		if got.EventID != value.EventID {
			t.Fatalf("event id = %q, want %q", got.EventID, value.EventID)
		}
	default:
		t.Fatal("expected notification for subscribed recipient")
	}
	select {
	case <-otherUserEvents:
		t.Fatal("notification leaked to a different recipient")
	default:
	}
}
