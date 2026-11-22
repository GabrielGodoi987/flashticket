package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	HTTPAddr         string
	MongoURI         string
	MongoDatabase    string
	RabbitURL        string
	RabbitExchange   string
	RabbitDLX        string
	RabbitDLQ        string
	RabbitQueue      string
	RabbitRoutingKey string
	ResendAPIKey     string
	ResendFrom       string
	JWKSURL          string
	Issuer           string
	Audience         string
}

func Load() (Config, error) {
	cfg := Config{
		HTTPAddr:         value("HTTP_ADDR", ":3000"),
		MongoURI:         value("MONGODB_URI", ""),
		MongoDatabase:    value("MONGODB_DATABASE", "notifications"),
		RabbitURL:        value("RABBITMQ_URL", ""),
		RabbitExchange:   value("RABBITMQ_EXCHANGE", "notifications.events"),
		RabbitDLX:        value("RABBITMQ_DEAD_LETTER_EXCHANGE", "notifications.events.dlx"),
		RabbitDLQ:        value("RABBITMQ_DEAD_LETTER_QUEUE", "notifications.events.dead"),
		RabbitQueue:      value("RABBITMQ_QUEUE", "notifications.events"),
		RabbitRoutingKey: value("RABBITMQ_ROUTING_KEY", "notification.#"),
		ResendAPIKey:     value("RESEND_API_KEY", ""),
		ResendFrom:       value("RESEND_FROM", ""),
		JWKSURL:          value("IAM_JWKS_URL", ""),
		Issuer:           value("IAM_ISSUER", ""),
		Audience:         value("IAM_AUDIENCE", ""),
	}

	if cfg.MongoURI == "" {
		return Config{}, fmt.Errorf("MONGODB_URI is required")
	}
	if cfg.MongoDatabase == "" {
		return Config{}, fmt.Errorf("MONGODB_DATABASE cannot be empty")
	}
	if cfg.RabbitURL == "" {
		return Config{}, fmt.Errorf("RABBITMQ_URL is required")
	}
	if cfg.ResendAPIKey != "" && cfg.ResendFrom == "" {
		return Config{}, fmt.Errorf("RESEND_FROM is required when RESEND_API_KEY is configured")
	}
	if (cfg.JWKSURL == "") != (cfg.Issuer == "") || (cfg.JWKSURL == "") != (cfg.Audience == "") {
		return Config{}, fmt.Errorf("IAM_JWKS_URL, IAM_ISSUER, and IAM_AUDIENCE must be configured together")
	}
	return cfg, nil
}

func value(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
