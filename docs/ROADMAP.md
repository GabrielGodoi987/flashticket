# Roadmap incremental

## Fluxo vertical recomendado

Antes de implantar todos os contextos isoladamente, criar um fluxo vertical
evidenciável:

1. IAM mínimo emite/valida identidade e organiza papel.
2. Events permite criar e publicar um show.
3. Reservations cria hold real com estoque transacional.
4. Payments cria tentativa aprovada simulada.
5. Reservations confirma e Tickets emite ingressos idempotentemente.
6. Notifications persiste e entrega o resultado.

Fases posteriores devem ampliar resiliência e observabilidade sem bloquear este
MVP vertical.

## Fase 0 — Foundation

**Objetivo:** execução local, convenções e baseline verificável.

**Problema:** diferenças de ambiente e ausência de CI dificultam evolução.

**Escopo:** Compose, JDK, documentação e testes automatizados.

**Pré-requisitos:** revisão das portas e credenciais locais.

- [ ] F0-01 — Fixar versão de Java compatível com a infraestrutura.
- [ ] F0-02 — Documentar requisitos locais por serviço.
- [ ] F0-03 — Confirmar health checks via Docker.
- [ ] F0-04 — Adicionar CI de build/test por serviço.
- [ ] F0-05 — Remover credenciais padrão antes de exposição fora do laboratório.

**Aceite:** todos os comandos documentados executam no ambiente previsto.

**Testes:** smoke local, build, testes unitários.

**Conhecimento:** Compose, toolchains poliglotas e baseline.

## Fase 1 — IAM

**Objetivo:** identidade mínima e autorização verificável.

- [ ] Selecionar identidade interna e formato de token.
- [ ] Definir CUSTOMER/ORGANIZER/ADMIN e associação organizacional.
- [ ] Implementar cadastro, login, perfil, recuperação e desativação.
- [ ] Definir revogação de sessão e refresh.
- [ ] Registrar serviço de conta para comunicação interna.

**Aceite:** cliente não modifica recurso alheio; privilegiado requer papel.

**Testes:** unidade, integração, e2e de login/guard.

## Fase 2 — Events

**Objetivo:** evento publicado com catálogo de setores e ofertas.

- [ ] Criar Show/Category/Sector/Seat/TicketType via API.
- [ ] Separar estados de evento e venda.
- [ ] Implementar publicação com validações.
- [ ] Preservar histórico quando preço/capacidade mudam.

**Aceite:** evento não publica sem dados mínimos; publicação é auditável.

**Testes:** DTO, banco, autorização e transições.

## Fase 3 — Reservations

**Objetivo:** holds temporários sem overbooking.

- [ ] Definir propriedade da capacidade/disponibilidade.
- [ ] Implementar RequestReservation em transação.
- [ ] Implementar expiracao idempotente.
- [ ] Implementar cancelamento e confirmação.
- [ ] Resolver pagamento x expiração.

**Aceite:** 100 reservas concorrentes alocam exatamente o estoque disponível.

**Testes:** concorrência multi-instância, falha, retry e limites.

## Fase 4 — Payments

**Objetivo:** pagamento simulador com estado e idempotência.

- [ ] Persistir tentativa.
- [ ] Distinguir PENDING/PROCESSING/APPROVED/REJECTED/CANCELLED/REFUNDED.
- [ ] Deduplicar callback por transação/evento.
- [ ] Reconciliação e timeout futuro.

**Aceite:** o mesmo callback não confirma duas vezes.

**Testes:** duplicidade, fora de ordem, falha técnica e expiração.

## Fase 5 — Ticket Issuance

**Objetivo:** emissão única após compra.

- [ ] Confirmar associação reserva/pagamento.
- [ ] Emitir por reservation item.
- [ ] Implementar consulta pelo comprador.
- [ ] Definir states de uso/cancelamento.

**Aceite:** reprocessamento cria zero ingressos extras.

**Testes:** retry, crash após pagamento antes da emissão, reemit.

## Fase 6 — Notifications

**Objetivo:** ampliar o serviço Go já existente.

- [ ] Cobrir todos os tipos previstos.
- [ ] Definir retenção e paginação por cursor.
- [ ] Testar falhas de email e RabbitMQ.
- [ ] Definir política operacional de retries.

**Aceite:** evento duplicado persiste uma única vez; leitura pertence ao subject.

**Testes:** handler, store, RabbitMQ, SSE e email.

## Fase 7 — Event-Driven Integration

**Objetivo:** comunicação confiável entre contextos.

- [ ] Aprovar envelopes e contratos de evento.
- [ ] Implementar outbox ou registrar decisão de não uso.
- [ ] Implementar inbox/idempotência por contexto.
- [ ] Definir ordering, versionamento e DLQ.

**Aceite:** falha intermediária pode recuperar sem efeito comercial duplicado.

**Testes:** broker indisponível, redelivery, evento antigo e schema novo.

## Fase 8 — CQRS & Event Sourcing

**Objetivo:** laboratório opcional em reserva ou evento.

- [ ] Escolher um bounded context para CQRS.
- [ ] Projetar read model só após padrão de consulta definido.
- [ ] Reconstruir projeção do início.
- [ ] Experimentar streams em contextos confinados.
- [ ] Comparar com persistência relacional.

**Aceite:** leitura reconstruída é equivalente ao estado observado.

**Testes:** replay, snapshot, mismatch, duplicidade.

## Fase 9 — Reliability Engineering

**Objetivo:** recuperar falhas em cenários distribuídos.

- [ ] Retries com backoff e limite.
- [ ] DLQ com inspeção.
- [ ] Saga ou compensações.
- [ ] Reconciliação de pagamento/estoque.

**Aceite:** falhas são visíveis e recuperáveis sem overbooking.

## Fase 10 — Observability

**Objetivo:** diagnóstico distribuído.

- [ ] Logs JSON estruturados.
- [ ] Correlation IDs.
- [ ] Tracing.
- [ ] Métricas de reserva, fila, latência e entrega.
- [ ] Health/dependency checks.

**Aceite:** uma compra pode ser seguida entre serviços pelos identifiers.

## Fase 11 — Performance Engineering

**Objetivo:** obter medidas reais.

- [ ] Modelar carga.
- [ ] Medir contenção e throughput.
- [ ] Comparar cache habilitado/desabilitado.
- [ ] Executar testes com escalonamento.

**Aceite:** relatório inclui setup, amostra, percentis e limitações.

## Fase 12 — Security & Production Readiness

**Objetivo:** hardening proporcional.

- [ ] Rotacionar/remover secrets.
- [ ] Contratos OpenAPI/AsyncAPI.
- [ ] Testes de segurança.
- [ ] Pipeline, SAST, imagens e supply chain.
- [ ] Runbooks.

**Aceite:** nenhuma lacuna crítica sem owner e plano.

## Fase 13 — Advanced Laboratory

**Objetivo:** hipóteses futuras.

- [ ] Entry validation com QR.
- [ ] Transferência e reembolso.
- [ ] Multi-region.
- [ ] EventStoreDB.
- [ ] Busca otimizada com read models.
- [ ] Backpressure e autoscaling.
