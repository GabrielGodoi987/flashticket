# Requisitos não funcionais

Status são reais ou alvos? Itens marcados como implementados exigem evidência no
repositório; demais são requisitos futuros.

## Segurança

| Área | Requisito | Estado |
|---|---|---|
| Autenticação | tokens ou sessão revogável devem proteger APIs | PARCIAL no Notifications; planejado nos demais |
| Autorização | verificar papel e propriedade do recurso | PLANEJADO |
| Credenciais | secretos fora do código/Compose compartilhado | PENDENTE |
| Entrada | validação de schema, tamanho e formato | IMPLEMENTADO parcialmente por NestJS; implementado parcialmente no Notifications |
| Rate limiting | limitar abusos no Gateway/APIs | PLANEJADO |
| Comunicação | TLS/mTLS ou canal confiável escolhido por ambiente | PLANEJADO |
| Auditoria | registrar mudança de privilégio, cancelamento e emissão | PLANEJADO |

## Consistência

| Área | Requisito | Estado |
|---|---|---|
| Overbooking | nenhuma alocação acima da disponibilidade | PENDENTE |
| Reservas | transições e expiração idempotentes | PENDENTE |
| Pagamentos | callback duplicado sem efeito econômico duplicado | PLANEJADO |
| Eventos | at-least-one exige deduplicação no consumidor | PARCIAL no Notifications |
| Recuperação | estado convergir após falha intermediária | PENDENTE |

## Escalabilidade

- múltiplas instâncias devem compartilhar as mesmas garantias;
- backpressure deve proteger consumidores e bancos;
- hotspots de assentos/eventos precisam ser medidos;
- leituras devem ser separadas somente quando o padrão de acesso justificar;
- cache não muda fonte de verdade sem ADR;
- carga deve publicar setup, volume, duração e percentis.

Estado atual: PostgreSQL/Redis/MongoDB e Compose existem, mas não há teste de
escalabilidade horizontal publicado.

## Observabilidade

| Área | Requisito | Estado |
|---|---|---|
| Logs | JSON estruturado em todos os serviços | PARCIAL |
| Correlation ID | mesmo identificador de ponta a ponta | PENDENTE |
| Trace | tracing distribuído entre HTTP/mensagem | PENDENTE |
| Métricas | latência, erro, saturação e fila | PENDENTE |
| Health | dependências e degradação explícitas | PARCIAL |
| Consumer | lag, retries, ack/nack e DLQ | PENDENTE |

## Qualidade

- unitários: aprovados em IAM, Reservations e Notifications.
- integração: proposta e parcialmente coberta em Notifications.
- E2E: esqueleto IAM, sem fluxo completo.
- contrato: pendente entre HTTP e eventos.
- concorrência: pendente.
- carga: pendente.
- recovery/resiliência: pendente.
- Payment: testes bloqueados pelo JDK no ambiente atual.

## Critérios gerais

- todos os critérios são reproduzíveis por comando ou pipeline;
- mudanças em contratos exigem compatibilidade definida;
- falha de dependência não retorna sucesso commercialmente incorreto;
- nenhuma métrica é publicada sem unidade e condição de amostra;
- nenhuma declaração de produção é feita sem evidência de segurança,
  recuperação, backup e operação.
