package httpapi

import (
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/GabrielGodoi987/flashticket/notifications/internal/auth"
	"github.com/GabrielGodoi987/flashticket/notifications/internal/realtime"
)

func TestNotificationRoutesRequireBearerToken(t *testing.T) {
	handler := NewHandler(nil, realtime.NewHub(), auth.NewVerifier("", "", ""), nil, nil, slog.Default())
	request := httptest.NewRequest(http.MethodGet, "/api/v1/notifications", nil)
	response := httptest.NewRecorder()

	handler.Routes().ServeHTTP(response, request)

	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusUnauthorized)
	}
}
