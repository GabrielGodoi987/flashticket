# 10. Arquitetura de serviços Go

## Comece pelo fluxo

Uma arquitetura serve requisitos e mudanças esperadas. Para cada feature,
desenhe:

`HTTP/Rabbit -> validação -> regra de domínio -> persistência/serviço externo -> resposta/ack`

Identifique invariantes, limites transacionais, estado persistido, retries e
observabilidade antes de escolher camadas.

## Camadas sem excesso

Separação útil no notifications:

- `cmd/notifications`: composição e ciclo de vida;
- `internal/httpapi`: protocolo HTTP e autenticação;
- `internal/notification`: contrato/regra;
- `internal/store`: MongoDB;
- `internal/messaging`: consumo e envelope;
- `internal/email`: Resend;
- `internal/realtime`: subscribers SSE;
- `internal/config`: configuração.

Camadas devem impor limites. Não replique DTO em cada camada sem necessidade;
não deixe dependências de Mongo vazar para regra de domínio.

## Ports and adapters

Regra depende de capacidades (“salvar”, “enviar”), não de detalhes de driver.
Adapters implementam essas capacidades. Mantenha interfaces junto do
consumidor, simples. Não aplique arquitetura hexagonal cerimonial para serviço
pequeno se complicar leitura.

## Configuração e startup

Parse/valide configuração uma vez e falhe cedo para valores obrigatórios. Não
adicione defaults de produção perigosos. Inicie dependências, valide readiness,
suba workers/HTTP e registre shutdown. Segredos vêm de secret manager/env e
nunca entram em logs.

## Estado e compatibilidade

Persistência e eventos sobrevivem deploys. Versione envelope, mantenha
compatibilidade de consumidores durante rollout e planeje migração expand/contract:

1. adicionar campo compatível;
2. publicar/ler ambos quando necessário;
3. migrar dados/clientes;
4. remover campo antigo em release posterior.

## Observabilidade

Logs estruturados devem ter nível, mensagem e campos estáveis (`event_id`,
`trace_id`, `recipient_id` quando seguro). Métricas agregadas não devem incluir
PII como label. Tracing atravessa HTTP e mensageria via trace context.

Defina SLI (disponibilidade/latência) e alertas acionáveis. Healthcheck não
substitui métricas nem alerta.

## Prática

Traceie um evento do publish à notificação SSE/email. Marque onde há
possibilidade de duplicação, perda e falha parcial; escreva mitigação para cada.
