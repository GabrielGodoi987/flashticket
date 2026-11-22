package realtime

import (
	"sync"

	"github.com/GabrielGodoi987/flashticket/notifications/internal/notification"
)

type Hub struct {
	mu          sync.RWMutex
	subscribers map[string]map[chan notification.Notification]struct{}
}

func NewHub() *Hub {
	return &Hub{subscribers: make(map[string]map[chan notification.Notification]struct{})}
}

func (hub *Hub) Subscribe(recipientID string) (<-chan notification.Notification, func()) {
	channel := make(chan notification.Notification, 16)
	hub.mu.Lock()
	if hub.subscribers[recipientID] == nil {
		hub.subscribers[recipientID] = make(map[chan notification.Notification]struct{})
	}
	hub.subscribers[recipientID][channel] = struct{}{}
	hub.mu.Unlock()

	cancel := func() {
		hub.mu.Lock()
		if subscribers := hub.subscribers[recipientID]; subscribers != nil {
			delete(subscribers, channel)
			if len(subscribers) == 0 {
				delete(hub.subscribers, recipientID)
			}
		}
		close(channel)
		hub.mu.Unlock()
	}
	return channel, cancel
}

func (hub *Hub) Publish(recipientID string, value notification.Notification) {
	hub.mu.RLock()
	defer hub.mu.RUnlock()
	for subscriber := range hub.subscribers[recipientID] {
		select {
		case subscriber <- value:
		default:
		}
	}
}
