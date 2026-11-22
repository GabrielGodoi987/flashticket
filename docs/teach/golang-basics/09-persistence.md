# 9. Persistência e MongoDB

## Modelagem documental

MongoDB armazena BSON. Modele em torno de consultas e ciclo de vida: quais
documentos são lidos juntos, quais crescem sem limite, quais precisam de
consistência transacional e quais índices sustentam as consultas. Não copie
tabela relacional automaticamente.

Subdocumento funciona para conjunto pequeno que é acessado/atualizado junto.
Referência é útil quando entidade cresce independentemente, tem lifecycle
próprio ou é compartilhada. Evite arrays sem limite.

## Índices

Índice único de eventId garante deduplicação no nível do banco. Índice
composto deve alinhar filtros e sort, considerando seletividade e ordem das
chaves. Índices aceleram leitura, mas custam escrita e espaço.

Confirme plano com `explain("executionStats")` no Compass/mongosh e teste com
volume representativo. Não adicione índice sem query conhecida.

## Driver e recursos

Reutilize um `mongo.Client` por processo; faça `Ping` readiness e `Disconnect`
no shutdown. Cada operação recebe contexto e timeout. Configure pool conforme
carga medida. Não crie client por request.

Use `bson` tags, schemas/validação quando apropriado, e evite depender de
representação interna do driver. Erros de duplicate key são comportamento de
idempotência possível, não erro genérico.

## Paginação

`skip/limit` degrada em offsets grandes e pode ser instável com inserções
concorrentes. Para volume, use cursor keyset: ordenar por `createdAt` e `_id`,
retornar cursor e filtrar tuplas seguintes. Sempre limite page size e imponha
sort determinístico.

## Consistência e transações

Transações Mongo exigem replica set/sharded cluster. Uma única coleção bem
modelada pode evitar transação. Não trate documento e email remoto como uma
transação atômica: use outbox/estado de entrega e política idempotente.

## Operações

- Backups e restore testado são parte do banco, não detalhe de infra.
- Defina retenção, TTL e requisitos legais antes de apagar dados.
- Use autenticação, rede privada, TLS fora do ambiente local e usuário com
  privilégio mínimo.
- Métricas: latência, pool wait, erros, operações lentas e crescimento.
- Compass é ferramenta de inspeção; migrações e alterações estruturais devem
  ser revisáveis/versionadas, não feitas só manualmente.

## Prática

- Explique cada índice em termos de consulta.
- Faça explain da listagem por destinatário e ordenação temporal.
- Simule duplicidade de `eventId` e valide que não cria segundo documento.
