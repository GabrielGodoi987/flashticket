# 15. Projeto prático: notifications

Implemente evoluções incrementais no serviço deste repositório. Cada etapa deve
ter teste, observabilidade e decisão registrada.

## Etapa A — linguagem e domínio

- validar envelope versionado, tamanho e campos obrigatórios;
- fazer testes de tabela e fuzz para JSON/validação;
- explicar zero values, tags JSON/BSON e ownership de cada campo.

## Etapa B — Mongo

- index único em `eventId`, índice de listagem e política TTL aprovada;
- integração com Mongo efêmero;
- paginação keyset estável e filtro unread;
- cenário de duplicidade e índice sob startup concorrente.

## Etapa C — Rabbit

- publicar contrato de exemplo para os serviços produtores;
- manual ack, retry com backoff/DLX e dead-letter observável;
- reconexão com backoff quando broker reinicia;
- testar evento inválido sem requeue infinito.

## Etapa D — app e auth

- validar JWT via JWKS com rotação, audience/issuer e cache;
- autorização sempre derivada do `sub`;
- SSE com reconexão, cleanup, limites e integração via Kong;
- teste que comprova isolamento entre dois usuários.

## Etapa E — email

- template acessível em texto e HTML escaped;
- respeitar preferências/opt-out e domínio verificado;
- retries com backoff/jitter e rate limit;
- idempotência/duplicidade explícitas, métricas de bounce e supressão.

## Etapa F — operação

- métricas Prometheus e tracing com trace context do Rabbit;
- dashboard de fila antiga, falha Resend, latência de Mongo e conexões SSE;
- CI com testes/race/build/image scan;
- runbook para Mongo/Rabbit/Resend e restore de backup.

## Rubrica de qualidade

Uma solução boa não é “mais tecnologia”. Ela:

- protege identidade e dados;
- deixa falha visível e recuperável;
- tem comportamento determinístico sob retry;
- é observável e explicável;
- possui contrato compatível;
- mantém leitura simples para quem vai operar depois.

Ao concluir uma etapa, peça review de outra pessoa e revise o próprio diff no
dia seguinte.
