# Checklist operacional

Status permitido: não iniciado, concluído e verificado. Uma tarefa só é marcada
quando há evidência no repositório ou resultado reproduzível.

## Fase 0 — Foundation

- [ ] F0-001 — Alinhar toolchain Java 25 ao ambiente de build.
  - Regra: NFR ambiente.
  - Aceite: `./mvnw test` executa com JDK suportado.
  - Evidência: resultado do Maven em CI/local.
  - Dependências: versão aprovada.
- [ ] F0-002 — Criar CI por serviço.
  - Regra: NFR qualidade.
  - Aceite: build/test de IAM, reservations, notifications e payment.
  - Evidência: pipeline versionado.
  - Dependências: toolchains declaradas.
- [ ] F0-003 — Parametrizar credenciais de desenvolvimento.
  - Regra: segurança.
  - Aceite: Compose não usa valores estáticos compartilhados fora do `.env.example`.
  - Evidência: scan do repositório.
- [x] F0-004 — Verificar testes existentes de IAM.
  - Evidência: 2 suites e 4 testes aprovados em análise local.
- [x] F0-005 — Verificar testes existentes de Reservations.
  - Evidência: 5 suites e 46 testes aprovados em análise local.
- [x] F0-006 — Verificar testes existentes de Notifications.
  - Evidência: `go test ./...` passou para os pacotes existentes.

## Fase 1 — IAM

- [ ] IAM-001 — Implementar modelo de conta e identificador único.
  - Regra: IAM-001/IAM-002.
  - Aceite: duplicidade é recusada.
- [ ] IAM-002 — Implementar autenticação e JWKS público.
  - Regra: IAM-003/IAM-007.
  - Aceite: token válido aceita; inválido rejeita.
- [ ] IAM-003 — Implementar atualização do próprio perfil.
  - Regra: IAM-004.
  - Aceite: subject do token identifica o usuário.
- [ ] IAM-004 — Implementar papéis e associação de organizer.
  - Regra: IAM-008/IAM-009.
  - Aceite: cliente não executa operação organizacional.
- [ ] IAM-005 — Implementar desativação e auditoria.
  - Regra: IAM-006/IAM-010.
  - Aceite: conta desativada não autentica; ação fica registrada.

## Fase 2 — Events

- [ ] EVT-001 — Expor criação e consulta de ShowCategory.
  - Regra: EVT-005.
  - Aceite: nome único e idade não negativa.
  - Evidência: testes HTTP.
- [ ] EVT-002 — Implementar criação de Show em DRAFT.
  - Regra: EVT-001/EVT-003.
  - Aceite: apenas organizer autorizado cria; período válido.
- [ ] EVT-003 — Implementar publicação.
  - Regra: EVT-002.
  - Aceite: dados mínimos e inventário obrigatórios são validados.
- [ ] EVT-004 — Implementar setor e assentos.
  - Regra: EVT-009.
  - Aceite: linhas/números únicos por sector.
- [ ] EVT-005 — Implementar TicketType e lote comercial.
  - Regra: EVT-009/EVT-011.
  - Aceite: preço não negativo e quota consistente.
- [ ] EVT-006 — Definir estados SALES_OPEN/SALES_CLOSED/FINISHED.
  - Regra: lifecycle.
  - Aceite: transições válidas documentadas e testadas.

## Fase 3 — Reservations

- [ ] RES-001 — Implementar solicitação de reserva.
  - Regra: RES-001/RES-002.
  - Aceite: valida disponibilidade e limite.
  - Evidência: teste HTTP reproduzível.
- [ ] RES-002 — Implementar hold atomico de assentos.
  - Regra: RES-006/RES-014.
  - Aceite: rollback impede qualquer hold parcial.
- [ ] RES-003 — Implementar reserva tudo-ou-nada com múltiplos itens.
  - Regra: RES-002/RES-005/RES-006.
  - Aceite: assento pertence ao sector do ticket type.
- [ ] RES-004 — Congelar preço e modalidade no item.
  - Regra: RES-004/EVT-012.
  - Aceite: alteração posterior não muda o item.
- [ ] RES-005 — Implementar expiração 10 minutos.
  - Regra: RES-003/RES-009/RES-011.
  - Aceite: repetição não altera estoque duas vezes.
- [ ] RES-006 — Implementar confirmação PENDING -> CONFIRMED.
  - Regra: RES-008/RES-013.
  - Aceite: antes da expiração; assentos passam SOLD.
- [ ] RES-007 — Implementar cancelamento PENDING -> CANCELLED.
  - Regra: RES-010.
  - Aceite: assentos disponíveis e cota reduzida.
- [ ] RES-008 — Testar 100 reservas concorrentes com estoque limitado.
  - Regra: RES-014.
  - Aceite: sucesso <= quantidade e zero overbooking.
- [ ] RES-009 — Implementar reconciliação de hold.
  - Regra: RES-015.
  - Aceite: falha processada é recuperada sem duplicidade.

## Fase 4 — Payments

- [ ] PAY-001 — Criar entidade/tabela de tentativa.
  - Regra: PAY-001/PAY-009.
- [ ] PAY-002 — Associar payment à reserva elegível.
  - Regra: PAY-001.
- [ ] PAY-003 — Criar processamento simulador aprovado/rejeitado.
  - Regra: PAY-003/PAY-005/PAY-008.
- [ ] PAY-004 — Deduplicar por transaction ID/event ID.
  - Regra: PAY-002/PAY-003/PAY-004.
- [ ] PAY-005 — Definir pagamento após expiração.
  - Regra: PAY-006.
- [ ] PAY-006 — Implementar reconciliação de timeout.
  - Regra: PAY-005/PAY-009.

## Fase 5 — Ticket Issuance

- [ ] TKT-001 — Emitir ingressos após confirmação.
  - Regra: TKT-001/TKT-004.
- [ ] TKT-002 — Garantir código único por ingresso.
  - Regra: TKT-002/TKT-003.
- [ ] TKT-003 — Implementar consulta por comprador.
  - Regra: TKT-001.
- [ ] TKT-004 — Implementar estados VALID/USED/CANCELLED.
  - Regra: TKT-005/TKT-006.
- [ ] TKT-005 — Implementar proteção contra uso repetido.
  - Regra: TKT-007.

## Fase 6 — Notifications

- [x] NOT-001 — Consumir evento RabbitMQ válido.
  - Evidência: testes de processor/model.
- [x] NOT-002 — Deduplicar eventId no MongoDB.
  - Evidência: índice único e testes.
- [x] NOT-003 — Validar recipient pelo JWT em REST/SSE.
  - Evidência: testes handler/JWKS.
- [ ] NOT-004 — Definir retenção e paginação por cursor.
  - Regra: NOT-009.
- [ ] NOT-005 — Definir política completa de retry/DLQ de email.
  - Regra: NOT-005/NOT-007/NOT-009.
- [ ] NOT-006 — Produzir notificação para os demais contextos.
  - Regra: NOT-001.

## Fases 7–13

- [ ] EVT-INF-001 — Aprovar contrato RabbitMQ versionado.
- [ ] EVT-INF-002 — Implementar Transactional Outbox em contexto escolhido.
- [ ] EVT-INF-003 — Implementar Inbox/Deduplicação por evento.
- [ ] EVT-INF-004 — Implementar reconciliação de reserva/pagamento.
- [ ] OBS-001 — Adicionar correlation IDs.
- [ ] OBS-002 — Adicionar métricas de fila/consumidor.
- [ ] PERF-001 — Executar benchmark concorrente com setup publicado.
- [ ] SEC-001 — Resolver configuração de secrets.
- [ ] SEC-002 — Publicar pipeline com lint/test/build.

## Próximas cinco tarefas concretas

1. F0-001 — alinhar JDK 25 ao ambiente para quitar o bloqueio de Payment.
2. IAM-001 — decidir e implementar a identidade mínima para autorizar operações.
3. EVT-002 — implementar criação de Show em DRAFT no serviço Reservations.
4. EVT-003 — implementar publicação com dados mínimos.
5. RES-001 — implementar solicitação de reserva sobre o modelo já criado.
