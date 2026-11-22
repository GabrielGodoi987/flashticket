# Notifications

Serviço de notificações em Go. Consome eventos do RabbitMQ, persiste as
notificações no MongoDB, publica atualizações em tempo real por SSE e envia
emails usando o SDK oficial do Resend para Go.

## Executar

Na raiz do repositório:

```bash
docker compose up --build notifications notifications_db
```

O serviço fica disponível em `http://localhost:3003`. O MongoDB publica a porta
`27017` para administração local.

### MongoDB Compass

Conecte o MongoDB Compass à URI:

```text
mongodb://notifications:notifications@localhost:27017/?authSource=admin
```

O banco `notifications` e a coleção `notifications` são criados pelo serviço.
Os índices de `eventId`, destinatário/data e estado de email são criados no
startup.

### Resend

Configure `RESEND_API_KEY` e `RESEND_FROM` no `.env` da raiz do Compose. Não
coloque credenciais no código nem em `.env.example`. `RESEND_FROM` deve ser um
remetente verificado no Resend; `onboarding@resend.dev` só serve para testes
limitados.

O email só é enviado quando o evento traz `"sendEmail": true`. Se o Resend não
estiver configurado, o evento continua salvo e a entrega do email fica pendente;
o worker tentará novamente depois que as variáveis forem definidas e o serviço
reiniciado.

## Contrato de eventos RabbitMQ

O serviço declara o exchange durable do tipo `topic` `notifications.events`,
uma fila durable `notifications.events` e o binding `notification.#`. Os
produtores publicam JSON no exchange com uma routing key como
`notification.reservation.confirmed`.

```json
{
  "eventId": "reservation-confirmed-01J...",
  "eventType": "reservation.confirmed",
  "version": 1,
  "occurredAt": "2026-11-22T12:00:00Z",
  "recipientId": "user-123",
  "recipientEmail": "cliente@example.com",
  "title": "Reserva confirmada",
  "message": "Sua reserva foi confirmada.",
  "sendEmail": true,
  "metadata": {
    "reservationId": "reservation-456"
  }
}
```

`eventId` é idempotente: há um índice único no MongoDB e redeliveries não criam
notificações duplicadas. O consumidor confirma a mensagem depois da persistência.
Emails ficam em uma fila persistente na própria coleção, com novas tentativas
após falhas transitórias. O envio é at-least-once: uma falha de processo entre a
aceitação do email pelo Resend e a atualização do MongoDB pode causar reenvio.
Eventos inválidos são enviados à dead-letter queue `notifications.events.dead`;
falhas de persistência são reentregues com um pequeno atraso e não são
confirmadas antes de salvar.

## API

`GET /health` não exige autenticação e verifica MongoDB e RabbitMQ.

As demais rotas exigem `Authorization: Bearer <JWT>`. O `sub` validado no token
é o `recipientId`; não aceite identidade enviada em query/body pelo cliente.
Configure `IAM_JWKS_URL`, `IAM_ISSUER` e `IAM_AUDIENCE` em conjunto. O validador
aceita tokens RS256 com chaves RSA de pelo menos 2048 bits. Enquanto essas
variáveis estiverem ausentes, as rotas do usuário falham de forma fechada com
HTTP 503.

- `GET /api/v1/notifications?limit=20` — lista as notificações mais recentes do
  usuário (limite máximo 100).
- `POST /api/v1/notifications/{id}/read` — marca como lida; só atualiza
  documentos pertencentes ao usuário do token.
- `GET /api/v1/notifications/stream` — SSE para notificações novas do usuário.
  A conexão envia keep-alive a cada 20 segundos; use a listagem REST para buscar
  histórico e reconciliar eventos após reconexão.

## Configuração

Veja [.env.example](./.env.example). Em containers, RabbitMQ usa o hostname
`rabbitmq` na rede compartilhada `bus`; MongoDB usa a rede privada
`notifications-net`.

## Desenvolvimento Go

```bash
go test ./...
go test -race ./...
go vet ./...
go run ./cmd/notifications
```

As dependências são registradas em `go.mod`/`go.sum`. Go não usa `node_modules`;
os módulos baixados ficam no cache global do Go. `vendor/` e artefatos locais
estão ignorados pelo `.gitignore`.
