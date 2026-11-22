# 7. HTTP e APIs

## `net/http`

Go tem servidor HTTP na biblioteca padrão. Um handler recebe writer e request:

```go
func health(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
    defer cancel()
    if err := database.Ping(ctx); err != nil {
        http.Error(w, "unavailable", http.StatusServiceUnavailable)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _, _ = io.WriteString(w, `{"status":"ok"}`)
}
```

Use `http.Server` com `ReadHeaderTimeout`, `IdleTimeout` e shutdown gracioso.
Não use `http.ListenAndServe` sem timeout de cabeçalho em serviço exposto.

## Contrato de endpoint

Defina verbo, caminho, autenticação, payload, status codes, limites e
idempotência. Erro deve ter forma estável e não revelar stack trace/SQL. Valide
entrada no limite HTTP antes de chamar domínio.

Convenção sugerida:

- `GET`: leitura sem efeitos.
- `POST`: criação/ação, podendo ser idempotente por chave.
- `PATCH`: mudança parcial.
- `DELETE`: remoção.
- 400: input inválido; 401: ausente/inválido; 403: sem permissão; 404: não existe;
  409: conflito; 429: limite; 500: falha inesperada; 503: dependência indisponível.

## JSON

Limite tamanho do body com `http.MaxBytesReader`, rejeite JSON malformado e
campos inválidos. Para contrato versionado, trate campos desconhecidos de forma
consciente: compatibilidade pode exigir tolerância, segurança pode exigir
rejeição. Nunca decodifique qualquer payload sem limite.

Tags JSON são API pública. Evite serializar campos internos como email privado,
segredos, status de envio interno ou IDs de outras pessoas.

## Autenticação e autorização

Validar JWT não é só decodificar Base64. Verifique assinatura, algoritmo
permitido, `iss`, `aud`, `exp`, `nbf` e identidade. Obtenha JWKS de origem
confiável, atualize chaves e falhe fechado se não puder validar. Autorização
precisa usar a identidade validada, nunca `userId` vindo da query do cliente.

## Server-Sent Events

SSE usa `text/event-stream`, eventos unidirecionais e reconexão do cliente.
Envie keep-alive, não faça buffering no proxy e remova subscriptions quando a
conexão terminar. SSE não substitui histórico persistido: após reconexão o
cliente deve sincronizar por REST. WebSocket é apropriado se comunicação
bidirecional for necessária.

## Health, readiness e liveness

- **Liveness:** processo responde e não está irrecuperavelmente travado.
- **Readiness:** dependências essenciais permitem receber tráfego.
- **Healthcheck detalhado:** informa dependências sem vazar credenciais ou
  detalhes sensíveis.

Não reinicie serviço apenas porque provedor de email está temporariamente fora;
email é trabalho assíncrono e pode ficar pendente.

## Prática

- Teste handlers com `httptest.NewRecorder` e `httptest.NewRequest`.
- Teste limites de JSON, autenticação, autorização e códigos HTTP.
- Faça um cliente SSE desconectar e prove cleanup de recursos.
