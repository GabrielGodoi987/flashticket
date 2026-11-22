package auth

import (
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestVerifierSubject(t *testing.T) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(writer).Encode(map[string]any{
			"keys": []map[string]string{{
				"kty": "RSA", "kid": "key-1", "use": "sig", "alg": "RS256",
				"n": base64.RawURLEncoding.EncodeToString(privateKey.N.Bytes()),
				"e": base64.RawURLEncoding.EncodeToString(big.NewInt(int64(privateKey.E)).Bytes()),
			}},
		})
	}))
	defer server.Close()

	verifier := NewVerifier(server.URL, "https://iam.example.test", "notifications")
	token := signedToken(t, privateKey, jwtHeader{Algorithm: "RS256", KeyID: "key-1"}, jwtClaims{
		Subject:   "user-42",
		Issuer:    "https://iam.example.test",
		Audience:  json.RawMessage(`["notifications","web"]`),
		ExpiresAt: time.Now().Add(time.Minute).Unix(),
	})

	subject, err := verifier.Subject(context.Background(), token)
	if err != nil {
		t.Fatalf("Subject() error = %v", err)
	}
	if subject != "user-42" {
		t.Fatalf("Subject() = %q, want user-42", subject)
	}
}

func TestVerifierRejectsInvalidIssuerAndExpiredToken(t *testing.T) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(writer).Encode(map[string]any{
			"keys": []map[string]string{{
				"kty": "RSA", "kid": "key-1", "use": "sig",
				"n": base64.RawURLEncoding.EncodeToString(privateKey.N.Bytes()),
				"e": base64.RawURLEncoding.EncodeToString(big.NewInt(int64(privateKey.E)).Bytes()),
			}},
		})
	}))
	defer server.Close()

	verifier := NewVerifier(server.URL, "https://iam.example.test", "notifications")
	for name, claims := range map[string]jwtClaims{
		"wrong issuer": {
			Subject: "user-42", Issuer: "https://other.example.test",
			Audience: json.RawMessage(`"notifications"`), ExpiresAt: time.Now().Add(time.Minute).Unix(),
		},
		"expired": {
			Subject: "user-42", Issuer: "https://iam.example.test",
			Audience: json.RawMessage(`"notifications"`), ExpiresAt: time.Now().Add(-time.Minute).Unix(),
		},
	} {
		t.Run(name, func(t *testing.T) {
			token := signedToken(t, privateKey, jwtHeader{Algorithm: "RS256", KeyID: "key-1"}, claims)
			if _, err := verifier.Subject(context.Background(), token); err != ErrUnauthorized {
				t.Fatalf("Subject() error = %v, want ErrUnauthorized", err)
			}
		})
	}
}

func TestVerifierRequiresConfiguration(t *testing.T) {
	verifier := NewVerifier("", "", "")
	if _, err := verifier.Subject(context.Background(), "token"); err != ErrNotConfigured {
		t.Fatalf("Subject() error = %v, want ErrNotConfigured", err)
	}
}

func signedToken(t *testing.T, privateKey *rsa.PrivateKey, header jwtHeader, claims jwtClaims) string {
	t.Helper()
	headerBytes, err := json.Marshal(header)
	if err != nil {
		t.Fatal(err)
	}
	claimsBytes, err := json.Marshal(claims)
	if err != nil {
		t.Fatal(err)
	}
	encode := base64.RawURLEncoding.EncodeToString
	signingInput := encode(headerBytes) + "." + encode(claimsBytes)
	digest := sha256.Sum256([]byte(signingInput))
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, digest[:])
	if err != nil {
		t.Fatal(err)
	}
	return fmt.Sprintf("%s.%s", signingInput, encode(signature))
}
