# Catálogo de experimentos

Todos os resultados observados começam vazios até serem executados em ambiente
controlado. Não registrar apenas anotações qualitativas: incluir configuração,
sample size, ferramenta e versão.

## EXP-001 — 100 reservas simultâneas

- Hipótese: controle transacional adequado impede overbooking.
- Preparação: evento com 10 assentos, 100 clientes, múltiplas instâncias.
- Cenário: disparar solicitação simultânea.
- Métricas: reservas aprovadas, estoques, latência p50/p95/p99, conflitos.
- Resultado esperado: exatamente 10 reservas ou política equivalente por lote.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: contenção, retry e integridade.

## EXP-002 — callback de pagamento duplicado

- Hipótese: eventId/transactionId impede efeito duplicado.
- Preparação: reserva PENDING e payment tentativa.
- Cenário: entregar `PaymentApproved` duas vezes.
- Métricas: contagens de reservas, pagamentos e tickets.
- Resultado esperado: primeiro aplica; segundo é idempotente.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: inbox e deduplicação.

## EXP-003 — consumidor RabbitMQ indisponível

- Hipótese: persistência local permite recuperação.
- Preparação: eventos publicáveis e broker parado.
- Cenário: publicar, aguardar, reiniciar broker.
- Métricas: eventos entregues, atraso e DLQ.
- Resultado esperado: nenhuma perda após configuração outbox/recovery.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: at-least-once.

## EXP-004 — Redis indisponível

- Hipótese: serviço não usa cache como fonte de verdade.
- Preparação: reserva em execução com Redis parado.
- Cenário: solicitação de reserva e consulta.
- Métricas: disponibilidade, timeout e erro.
- Resultado esperado: falha fechada ou degradação definida, nunca alocação incorreta.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: cache, dependências e fallback.

## EXP-005 — PostgreSQL indisponível

- Hipótese: indisponibilidade evita confirmação econômica incorreta.
- Preparação: banco de origem e replica de carga.
- Cenário: intervir na disponibilidade.
- Métricas: 5xx, retries, integridade pós-recuperação.
- Resultado esperado: sem escrita ambígua ou reconciliação necessária.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: consistência e recuperação.

## EXP-006 — RabbitMQ indisponível

- Hipótese: fallback pode persistir eventos para reenvio.
- Preparação: producer e broker.
- Cenário: broker cai durante aprovação.
- Métricas: eventos pendentes, lag e duplication.
- Resultado esperado: integração recuperável.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: outbox, redelivery.

## EXP-007 — eventos fora de ordem

- Hipótese: máquina de estados rejeita transições impossíveis.
- Preparação: sequence de reserva/pagamento.
- Cenário: CONFIRMED recebido antes de PENDING.
- Métricas: estado final e exceções.
- Resultado esperado: event replay ou espera explícita.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: ordering.

## EXP-008 — reserva expirada durante pagamento

- Hipótese: política vence de forma determinística.
- Preparação: reserva próxima ao expiresAt.
- Cenário: PaymentApproved na mesma janela da expiração.
- Métricas: estado reserva, assentos, pagamento e ticket.
- Resultado esperado: um único resultado final conforme política.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: deadlines e race conditions.

## EXP-009 — reconstrução de projeção

- Hipótese: read model pode ser reconstruído.
- Preparação: conjunto de eventos ou dados de origem.
- Cenário: apagar projeção e reexecutar.
- Métricas: tempo, divergência e ordem.
- Resultado esperado: estado idêntico ou diferença explicável.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: replay e read model.

## EXP-010 — falha na emissão

- Hipótese: retry não duplica tickets.
- Preparação: reserva confirmada.
- Cenário: crash após commit antes da emissão.
- Métricas: tickets emitidos e event deliveries.
- Resultado esperado: um ticket por item.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: idempotência.

## EXP-011 — retry e DLQ

- Hipótese: retries limitados isolam eventos inválidos.
- Preparação: consumidor com falha transiente e inválida.
- Cenário: redeliveries e limiar.
- Métricas: attempts, delay, DLQ and recovery.
- Resultado esperado: transiente reentra; permanente vai à DLQ.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: backoff e operação.

## EXP-012 — cache versus banco

- Hipótese: cache melhora leitura sem alterar fonte de verdade.
- Preparação: dataset representativo.
- Cenário: consultas com cache quente, frio e desatualizado.
- Métricas: latência, throughput, hit ratio, staleness.
- Resultado esperado: benefício medido sem divergência comercial.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: cache e consistência.

## EXP-013 — carga ponta a ponta

- Hipótese: gargalos aparecem em fase conhecida.
- Preparação: fluxo vertical local.
- Cenário: ramp, soak e spike.
- Métricas: p50/p95/p99, errors, filas, CPU, memória e DB pool.
- Resultado esperado: relatório com limites observados.
- Resultado observado: PENDENTE.
- Conclusões: vazias.
- Aprendizado: engenharia de performance.
