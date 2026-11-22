# ADR-002: Contrato e confiabilidade dos eventos

- Status: Proposed
- Data: 2026-11-22
- Responsável: PENDENTE
- Regras: NOT-001, NOT-002, RES-015, PAY-004

## Contexto

RabbitMQ já possui consumidor em Notifications. Não há outbox, envelope comum ou
contratos de eventos dos demais contextos.

## Problema

Definir envelope, entrega, versionamento e deduplicação.

## Alternativas

### RabbitMQ com envelope versionado

Eventos publicados por contexto com envelope próprio e consumer por routing key.

Vantagens: baixo acoplamento e evolução incremental.
Desvantagens: depende de outbox/inbox para confiabilidade ponta a ponta.

### Broker mais Outbox/Inbox

Persistir intenção no banco local e processar idempotentemente.

Vantagens: efeito local recuperável.
Desvantagens: mais componentes operacionais.

### RabbitRPC apenas

Mantém chamadas síncronas.

Vantagens: modelo simples.
Desvantagens: acoplamento temporal e sem resiliencia de domínio.

## Decisão

PENDENTE. RabbitMQ pode continuar como transporte, sem prescrever demais padrões
como obrigatórios para o MVP.

## Evidências necessárias

Redelivery duplicado, broker indisponível, evento antigo e schema incompatível.
