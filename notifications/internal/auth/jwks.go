package auth

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"
)

var (
	ErrNotConfigured = errors.New("IAM JWT validation is not configured")
	ErrUnavailable   = errors.New("IAM signing keys are unavailable")
	ErrUnauthorized  = errors.New("invalid bearer token")
)

type Verifier struct {
	url      string
	issuer   string
	audience string
	client   *http.Client

	mu        sync.RWMutex
	keys      map[string]*rsa.PublicKey
	fetchedAt time.Time
}

func NewVerifier(url, issuer, audience string) *Verifier {
	return &Verifier{
		url:      url,
		issuer:   issuer,
		audience: audience,
		client:   &http.Client{Timeout: 5 * time.Second},
	}
}

type jwtHeader struct {
	Algorithm string `json:"alg"`
	KeyID     string `json:"kid"`
}

type jwtClaims struct {
	Subject   string          `json:"sub"`
	Issuer    string          `json:"iss"`
	Audience  json.RawMessage `json:"aud"`
	ExpiresAt int64           `json:"exp"`
	NotBefore int64           `json:"nbf"`
}

type jwksDocument struct {
	Keys []struct {
		KeyType  string `json:"kty"`
		KeyID    string `json:"kid"`
		Use      string `json:"use"`
		Modulus  string `json:"n"`
		Exponent string `json:"e"`
	} `json:"keys"`
}

func (v *Verifier) Subject(ctx context.Context, token string) (string, error) {
	if v.url == "" || v.issuer == "" || v.audience == "" {
		return "", ErrNotConfigured
	}
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", ErrUnauthorized
	}

	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", ErrUnauthorized
	}
	var header jwtHeader
	if json.Unmarshal(headerBytes, &header) != nil || header.Algorithm != "RS256" || header.KeyID == "" {
		return "", ErrUnauthorized
	}

	key, err := v.key(ctx, header.KeyID)
	if err != nil {
		return "", err
	}
	signingInput := parts[0] + "." + parts[1]
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return "", ErrUnauthorized
	}
	digest := sha256.Sum256([]byte(signingInput))
	if err := rsa.VerifyPKCS1v15(key, crypto.SHA256, digest[:], signature); err != nil {
		return "", ErrUnauthorized
	}

	claimsBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", ErrUnauthorized
	}
	var claims jwtClaims
	if json.Unmarshal(claimsBytes, &claims) != nil {
		return "", ErrUnauthorized
	}
	now := time.Now().Unix()
	if claims.Subject == "" || claims.Issuer != v.issuer || claims.ExpiresAt <= now || (claims.NotBefore != 0 && claims.NotBefore > now) {
		return "", ErrUnauthorized
	}
	audiences, err := parseAudiences(claims.Audience)
	if err != nil || !contains(audiences, v.audience) {
		return "", ErrUnauthorized
	}
	return claims.Subject, nil
}

func (v *Verifier) key(ctx context.Context, keyID string) (*rsa.PublicKey, error) {
	v.mu.RLock()
	key := v.keys[keyID]
	stale := time.Since(v.fetchedAt) >= 5*time.Minute
	v.mu.RUnlock()
	if key != nil && !stale {
		return key, nil
	}

	if err := v.refresh(ctx); err != nil {
		return nil, err
	}
	v.mu.RLock()
	defer v.mu.RUnlock()
	if key := v.keys[keyID]; key != nil {
		return key, nil
	}
	return nil, ErrUnauthorized
}

func (v *Verifier) refresh(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, v.url, nil)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrUnavailable, err)
	}
	response, err := v.client.Do(req)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrUnavailable, err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("%w: JWKS endpoint returned %s", ErrUnavailable, response.Status)
	}

	var document jwksDocument
	if err := json.NewDecoder(response.Body).Decode(&document); err != nil {
		return fmt.Errorf("%w: invalid JWKS response", ErrUnavailable)
	}
	keys := make(map[string]*rsa.PublicKey, len(document.Keys))
	for _, jwk := range document.Keys {
		if jwk.KeyType != "RSA" || jwk.KeyID == "" || (jwk.Use != "" && jwk.Use != "sig") {
			continue
		}
		publicKey, err := parseRSAKey(jwk.Modulus, jwk.Exponent)
		if err != nil {
			continue
		}
		keys[jwk.KeyID] = publicKey
	}
	if len(keys) == 0 {
		return fmt.Errorf("%w: no supported RSA signing keys found", ErrUnavailable)
	}
	v.mu.Lock()
	v.keys = keys
	v.fetchedAt = time.Now()
	v.mu.Unlock()
	return nil
}

func parseRSAKey(modulus, exponent string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(modulus)
	if err != nil {
		return nil, err
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(exponent)
	if err != nil || len(eBytes) == 0 || len(eBytes) > 4 {
		return nil, errors.New("invalid RSA exponent")
	}
	e := 0
	for _, b := range eBytes {
		e = e<<8 | int(b)
	}
	if e < 3 || e%2 == 0 {
		return nil, errors.New("invalid RSA exponent")
	}
	modulusInt := new(big.Int).SetBytes(nBytes)
	if modulusInt.BitLen() < 2048 {
		return nil, errors.New("RSA modulus must be at least 2048 bits")
	}
	return &rsa.PublicKey{N: modulusInt, E: e}, nil
}

func parseAudiences(raw json.RawMessage) ([]string, error) {
	var single string
	if err := json.Unmarshal(raw, &single); err == nil {
		return []string{single}, nil
	}
	var multiple []string
	if err := json.Unmarshal(raw, &multiple); err != nil {
		return nil, err
	}
	return multiple, nil
}

func contains(values []string, wanted string) bool {
	for _, value := range values {
		if value == wanted {
			return true
		}
	}
	return false
}
