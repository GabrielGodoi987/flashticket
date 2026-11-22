# Referência rápida de Go

## Comandos

| Comando | Uso |
|---|---|
| `gofmt -w .` | Formatar |
| `go test ./...` | Testar todos pacotes |
| `go test -race ./...` | Detectar data races exercitadas |
| `go test -cover ./...` | Cobertura |
| `go test ./... -run TestName -count=1` | Rodar teste sem cache |
| `go vet ./...` | Diagnósticos estáticos |
| `go mod tidy` | Sincronizar módulos |
| `go doc pkg.Type` | Documentação local |
| `go test -bench=. -benchmem ./...` | Benchmark e alocações |

## Padrões

```go
// Envolver erro
return fmt.Errorf("save event %s: %w", id, err)

// Classificar
if errors.Is(err, ErrNotFound) { ... }
var networkErr net.Error
if errors.As(err, &networkErr) && networkErr.Timeout() { ... }

// Context com timeout
ctx, cancel := context.WithTimeout(parent, 3*time.Second)
defer cancel()

// Fechar recurso
defer response.Body.Close()

// Inicializar mapa/slice
counts := make(map[string]int)
items := make([]Item, 0, 16)

// HTTP test
req := httptest.NewRequest(http.MethodGet, "/health", nil)
recorder := httptest.NewRecorder()
handler.ServeHTTP(recorder, req)
```

## Glossário

- **module:** conjunto versionado de pacotes, definido em `go.mod`.
- **package:** unidade de compilação/import, normalmente pasta.
- **zero value:** valor inicial automático do tipo.
- **interface:** conjunto de métodos; implementação é implícita.
- **slice:** visão com length/capacity sobre array.
- **goroutine:** execução concorrente leve gerenciada pelo runtime.
- **channel:** comunicação/sincronização entre goroutines.
- **data race:** acessos concorrentes conflitantes sem sincronização.
- **context:** cancelamento, deadline e metadados transitórios.
- **adapter:** implementação de dependência externa atrás de contrato.
- **idempotência:** repetir operação produz mesmo efeito lógico.
- **backpressure:** mecanismo para limitar ritmo quando consumidor não acompanha.
- **liveness/readiness:** processo está vivo / pronto para receber tráfego.

## Checklist de revisão

- input validado e limitado?
- identidade confiável e autorização escopada?
- erros preservados e mapeados?
- timeout/cancelamento em I/O?
- retry limitado e efeito idempotente?
- goroutines encerradas e estado sincronizado?
- teste cobre falha e concorrência relevante?
- log sem segredo/PII; métrica sem cardinalidade perigosa?
- contrato e configuração documentados?
