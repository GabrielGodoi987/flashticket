# Event Storming — FlashTicket

Este documento registra um ponto de partida colaborativo. Eventos candidatos
não são contratos definitivos de integração.

## Atores

- Cliente/Customer.
- Organizador/Producer.
- Administrador.
- Serviço de pagamento simulado.
- Serviço de email (Resend).
- Operador de plataforma.
- Sistema de entrada/validação futuro.

## Comandos candidatos

| Contexto | Comando |
|---|---|
| IAM | RegisterAccount, Authenticate, UpdateOwnProfile, DeactivateAccount |
| Events | CreateEvent, PublishEvent, CancelEvent, CreateSector, CreateSeatInventory, CreateTicketType |
| Reservations | RequestReservation, CancelReservation, ExpireReservation, ConfirmReservation |
| Payments | StartPayment, ProcessPayment, RejectPayment, RefundPayment |
| Tickets | EmitTickets, ValidateTicket, CancelTicket, TransferTicket |
| Notifications | NotifyRecipient, MarkNotificationRead |

## Eventos de domínio candidatos

- EventCreated
- EventPublished
- EventCancelled
- TicketTypeCreated
- CapacityChanged
- ReservationPending
- ReservationConfirmed
- ReservationExpired
- ReservationCancelled
- PaymentAttemptCreated
- PaymentApproved
- PaymentRejected
- TicketIssued
- TicketUsed
- TicketCancelled
- NotificationRead

Os nomes definitivos devem incluir namespace/contexto, versão e timestamp no
payload de integração.

## Políticas candidatas

- Ao `ReservationRequested`, verificar elegibilidade e alocar estoque atomically.
- Ao `PaymentApproved`, confirmar reserva se ainda PENDING.
- Ao `PaymentRejected`, cancelar reserva elegível.
- Ao `ReservationExpired`, liberar assentos e reduzir contadores.
- Ao `ReservationConfirmed`, emitir um ingresso por item.
- Ao `TicketIssued`, publicar notification.
- Ao `EventCancelled`, cancelar reservas futuras elegíveis.
- Ao `PaymentApprovedAfterExpiration`, iniciar estorno ou compensação definida.

## Regras

Ver referência central em [DOMAIN.md](DOMAIN.md).

## Aggregates candidatos

- Show/Event.
- TicketType/Offer.
- Reservation.
- PaymentAttempt.
- Ticket.
- Notification.

## Pontos de integração

Fluxos conhecidos no repositório:

- Notifications consome topic `notifications.events` com routing key
  `notification.#`.
- A validação REST usa JWT por JWKS, mas IAM ainda não publica o issuer.
- Payment declara dependências RabbitMQ/PostgreSQL, sem producer ou modelo.
- Reservations possui PostgreSQL, Redis e RabbitMQ provisionados, sem consumidor.

Fluxos ainda não definidos:

- payments -> reservations;
- reservations -> tickets;
- tickets -> notifications;
- events -> reservations;
- IAM -> demais contextos.

## Falhas e fluxos alternativos

- estoque insuficiente: reserva não é criada;
- pagamento recusado: cancelamento da reserva;
- timeout: payment fica PENDING ou PROCESSING e precisa reconciliação;
- callback tardio: expiração prevalece conforme política;
- Redis indisponível: operações não podem aceitar alocações não verificadas;
- RabbitMQ indisponível: efeito local persiste e integração deve ser recuperável;
- publicação duplicada: idempotency key/eventId evita efeito duplicado;
- eventos fora de ordem: cada contexto aplica transições válidas;
- consumo duplicado: inbox ou chave única/eventId;
- payload desconhecido ou incompatível: rejeitar ou DLQ conforme versão.

## Decisões pendentes

- DRAFT, SALES_OPEN, SALES_CLOSED, FINISHED representam estados do evento ou da
  venda?
- TicketType é agregado próprio ou parte de Event?
- Reservas permanecem no serviço atual ou recebem microsserviço próprio?
- Outbox fica em PostgreSQL de origem ou em biblioteca comum?
- Qual tecnologia será Event Store, se adotada?
- RabbitMQ deve transportar notification events, domain events ou ambos?
- Payload levará dados completos ou apenas IDs e histórico de versão?

## Laboratório EDA

| Conceito | Problema | Cenário no FlashTicket | Aceite | Pré-requisitos | Falha testada | Evidência | Status |
|---|---|---|---|---|---|---|---|
| Domain Event | Capturar fato do domínio | Reserva confirmada | evento só ocorre após transição válida | aggregate e policy | retry da transição | teste + outbox | PLANEJADO |
| Integration Event | Comunicar contextos desacoplados | payment.approved -> tickets | consumidor não duplica efeito | contrato e envelope | producer duplicado | schema + teste | PARCIAL para notifications |
| Event Notification | Informar fato ocorrido | notifications do resultado | destinatário correto | eventId e recipient | payload inválido | idempotency test | IMPLEMENTADO no Notifications |
| Event-Carried State Transfer | Reduzir consulta síncrona | entregar dados mínimos de reserva | campos suficientes sem segredo | schema/version | consumidor antigo | contrato/version test | PENDENTE |
| Eventual Consistency | Sincronizar modelos assíncronos | ticket emitido após payment | convergência e estado stale visível | retry/replay | atraso/broker off | comparação final | PENDENTE |
| Idempotency | Repetir sem efeito duplicado | eventId/callback duplicate | um efeito comercial | chave persistida | redelivery | contagens final | PARCIAL no Notifications |
| At-least-once | Não perder mensagens | producer/fila/consumer | reprocessamento seguro | ack após persistência | crash pós-send | redelivery test | IMPLEMENTADO no Notifications |
| Ordering | Tratar eventos fora de sequência | expiração e approval | transição válida ou espera | sequencia/causalidade | entrega invertida | state machine test | PENDENTE |
| Retry | Recuperar falha transitória | Mongo unavailable | backoff limitado | jitter/timeout | broker/downstream down | logs/metrics | PARCIAL |
| DLQ | Isolar evento impossível | JSON inválido | não bloqueia fila principal | exchange/queue | evento permanente inválido | DLQ content | IMPLEMENTADO no Notifications |
| Transactional Outbox | Não perder intenção após commit | payment approval | evento persistido na mesma transação | publisher worker | crash origem | reconciliação | PENDENTE |
| Inbox | Deduplikar consumo | callback/payment | eventId único | tabela/índice única | duplicate/redelivery | contagem zero extra | PENDENTE |
| Saga | Coordenar reserva/pagamento/ingresso | confirmação ponta a ponta | progressão/compensação | state machine | falha cada etapa | scenario test | PENDENTE |
| Compensating Action | Corrigir efeito parcial | payment approved/issue failed | reversão definida | policy/owner | crash and retry | reconciliation | PENDENTE |
| Event Versioning | Evoluir contrato | notification v2 | compatibilidade explicitada | schema registry/policy | old/new payload | contract test | PENDENTE |
| Schema Evolution | Ler campos novos/antigos | envelope de integração | backward/forward policy | compatible rules | campos removidos | parser test | PENDENTE |
