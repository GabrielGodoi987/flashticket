# ADR-003: Adoção independente de CQRS e Event Sourcing

- Status: Proposed
- Data: 2026-11-22
- Responsável: PENDENTE
- Regras: relacionadas a consistência, replay e read models

## Contexto

O repositório possui modelos relacionais e uma projeção MongoDB em Notifications.
Não há Event Store nem streams funcionais.

## Problema

Avaliar onde usar CQRS e se algum contexto deve usar Event Sourcing.

## Alternativas

### Relacional CRUD sem CQRS

Manter escrita/leitura no mesmo modelo.

Vantagens: menor complexidade.
Desvantagens: pode limitar padrões de leitura sem justificativa real.

### CQRS com read model

Separar escrita e projeção em outro banco.

Vantagens: consultas otimizadas e experimentos de eventual consistency.
Desvantagens: consistência eventual e rebuild.

### CQRS + Event Sourcing

Persistir eventos e reconstituir aggregate.

Vantagens: auditoria e replay.
Desvantagens: schema evolution, snapshots, armazenamento e complexidade.

## Decisão

PENDENTE. CQRS não é obrigatório para todos os contextos e Event Sourcing não é
exigido pelo uso de RabbitMQ.

## Evidências necessárias

Projeção reconstruída, divergência detectada e teste de replay/deduplicação.
