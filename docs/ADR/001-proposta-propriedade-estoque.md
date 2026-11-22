# ADR-001: Propriedade da capacidade e disponibilidade

- Status: Proposed
- Data: 2026-11-22
- Responsável: PENDENTE
- Regras: EVT-008, EVT-011, RES-001, RES-014

## Contexto

O modelo atual reserva assentos e tipos no PostgreSQL do serviço Reservations.
Redis é provisionado, mas não existe definição de consumidor ou fonte de verdade.

## Problema

Definir quem calcula capacidade, valida disponibilidade e impede overbooking.

## Alternativas

### PostgreSQL transacional

Usar assentos/ticket types no banco transacional e conditional updates.

Vantagens: integridade forte e modelo já iniciado.
Desvantagens: hotspot e contenção sob carga.

### Redis como estoque

Usar Redis para alocação rápida e reconciliar com PostgreSQL.

Vantagens: baixa latência potencial.
Desvantagens: redis como fonte secundária exige durabilidade, recovery e
reconciliação; risco de divergência.

### Autoridade híbrida

Cache em Redis e commit final no PostgreSQL.

Vantagens: leitura rápida e integridade final.
Desvantagens: complexidade, dados stale e dupla fonte operacional.

## Decisão

PENDENTE.

## Evidências necessárias

Experimento de concorrência multi-instância, falha de Redis/Postgres e carga.
