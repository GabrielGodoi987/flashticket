# Domínio do FlashTicket

Este documento é a referência central das regras de negócio. Identificadores
estáveis permitem rastreio entre regra, tarefa, implementação, teste e evidência.
Os estados definidos abaixo não devem ser interpretados como serviço já existente.

## Glossário

| Termo | Definição |
|---|---|
| Event/Show | Agenda pública, com local, período e vendas |
| Organizer/Producer | Pessoa ou organização responsável por um evento |
| Sector | Área física ou virtual dentro de um evento |
| Seat | Assento endereçável em um setor |
| Ticket Type | Tipo comercial associado a um setor |
| Batch | Lote comercial com preço e período; o modelo atual usa `TicketType.quantity`/preço, mas não possui lote temporal separado |
| Reservation | Hold temporário de itens/assentos |
| Ticket | Documento emitido após compra válida |
| Payment Attempt | Tentativa comercial ou técnica vinculada a uma reserva |
| Notification | Registro destinado a um usuário |

## Bounded contexts propostos

- **IAM**: identidade e autorização.
- **Events**: ciclo de vida comercial do evento e catálogo.
- **Reservations**: alocação e liberação de estoque.
- **Payments**: tentativa e resultado de pagamento.
- **Tickets**: emissão e validação.
- **Notifications**: entrega persistente e real-time.

Estado atual: IAM, Payments e Notifications possuem bases independentes;
Events e Reservations compartilham o serviço/banco NestJS.

## Entidades e aggregates candidatos

| Aggregate candidato | Raiz | Estado atual |
|---|---|---|
| Event | Show | Entidade + migrations, sem casos de uso |
| TicketOffer | TicketType | Entidade + reserva de cota, sem API |
| Reservation | Reservation | Entidade + itens, sem fluxo |
| Payment | Não existe | Planejado |
| Ticket | Ticket | Entidade e unicidades, sem emissão |
| Notification | Notification | Implementado no serviço Go |

## Value objects candidatos

- endereço de local ou referência online;
- período de evento;
- período comercial;
- preço em centavos;
- modalidade de preço;
- titular do ingresso;
- identificador externo de pagamento;
- event envelope e envelope de integração.

## Regras — IAM

| ID | Regra | Status |
|---|---|---|
| IAM-001 | Usuário pode criar conta | PLANEJADO |
| IAM-002 | Identificadores únicos devem impedir cadastro duplicado | PLANEJADO |
| IAM-003 | Usuário cadastrado pode autenticar | PLANEJADO |
| IAM-004 | Usuário autenticado só pode consultar/alterar campos permitidos do próprio perfil | PLANEJADO |
| IAM-005 | Deve existir recuperação segura de acesso | PLANEJADO |
| IAM-006 | Conta pode ser desativada sem apagar todo o histórico | PENDENTE |
| IAM-007 | Autenticação e autorização são responsabilidades separadas | PLANEJADO |
| IAM-008 | Operações críticas exigem papel e, quando aplicável, associação ao recurso | PLANEJADO |
| IAM-009 | Organizador só modifica evento da organização para a qual tem permissão | PLANEJADO |
| IAM-010 | Alteração de privilégio exige autorização administrativa auditada | PLANEJADO |
| IAM-011 | Credenciais não podem ser publicadas em eventos | PENDENTE |
| IAM-012 | Serviço não autoriza operação apenas por confiar em um `userId` livre | PENDENTE |

Papéis candidatos: `CUSTOMER`, `ORGANIZER`, `ADMIN`. A associação de ORGANIZER
com organização é preferível a um papel global até existir justificativa
contrária. A decisão está pendente.

## Regras — Events

| ID | Regra | Status |
|---|---|---|
| EVT-001 | Criar evento requer organizador autorizado | PLANEJADO |
| EVT-002 | Publicação exige dados mínimos e período válido | PLANEJADO |
| EVT-003 | Evento não deve terminar antes de iniciar | IMPLEMENTADO no banco: check de período |
| EVT-004 | Evento e categoria usam identificador UUID | IMPLEMENTADO |
| EVT-005 | Categoria deve ter nome único e idade mínima não negativa | IMPLEMENTADO |
| EVT-006 | Show possui estados DRAFT/PUBLISHED/CANCELLED | IMPLEMENTADO no enum |
| EVT-007 | Máximo de ingressos por reserva deve ser positivo | IMPLEMENTADO no banco |
| EVT-008 | Capacidade derivada de assentos, não duplicada em `Show.capacity` | IMPLEMENTADO no modelo |
| EVT-009 | Sector, assento e nome de ticket type devem respeitar unicidades | IMPLEMENTADO no banco |
| EVT-010 | Cancelamento impede nova reserva | PLANEJADO |
| EVT-011 | Redução crítica de capacidade não pode invalidar reserva/venda existente | PENDENTE |
| EVT-012 | Mudança de preço não altera o preço congelado da reserva | PENDENTE |

Ciclo efetivo atual: `DRAFT -> PUBLISHED -> CANCELLED`. O modelo sugere estados
comerciais adicionais, mas não há prova de implementação para SALES_OPEN,
SALES_CLOSED ou FINISHED.

## Regras — Reservations

| ID | Regra | Status |
|---|---|---|
| RES-001 | Reserva só aceita show elegível e assentos disponíveis | PARCIAL: entidade existe, casos de uso não |
| RES-002 | Reserva contém de 1 até limite do show | PENDENTE |
| RES-003 | Reserva expira em 10 minutos por default | PLANEJADO |
| RES-004 | Condições comerciais são congeladas no item | PARCIAL: preço armazenado por item |
| RES-005 | Assento só pode pertencer ao sector do ticket type escolhido | PENDENTE |
| RES-006 | Reserva tudo-ou-nada: nenhum hold parcial | PENDENTE |
| RES-007 | Estado inicial PENDING | IMPLEMENTADO no enum |
| RES-008 | PENDING -> CONFIRMED antes da expiração | PLANEJADO |
| RES-009 | PENDING -> EXPIRED ao atingir o prazo | PLANEJADO |
| RES-010 | PENDING -> CANCELLED por cancelamento elegível | PLANEJADO |
| RES-011 | Expiração repetida é idempotente | PENDENTE |
| RES-012 | Payment callback tardio não confirma reserva expirada | PENDENTE |
| RES-013 | Reserva confirmado libera/segue assento SOLD | PENDENTE |
| RES-014 | Concorrência não pode gerar overbooking | PENDENTE |
| RES-015 | Operação deve ser compensável após falha parcial | PENDENTE |

Transições inválidas candidatas: `CONFIRMED -> PENDING/EXPIRED`, `EXPIRED ->
CONFIRMED`, `CANCELLED -> CONFIRMED`, salvo política reversa explícita.

## Regras — Payments

| ID | Regra | Status |
|---|---|---|
| PAY-001 | Tentativa deve apontar reserva elegível | PLANEJADO |
| PAY-002 | Transação externa possui identificador e deduplicação | PLANEJADO |
| PAY-003 | Aprovação não pode criar aprovação duplicada | PLANEJADO |
| PAY-004 | Callback duplicado não altera efeitos comerciais duas vezes | PLANEJADO |
| PAY-005 | Falha técnica difere de rejeição comercial | PLANEJADO |
| PAY-006 | Aprovação após expiração exige política/estorno | PENDENTE |
| PAY-007 | Notificação não participa da confirmação econômica | PENDENTE |
| PAY-008 | Rejeição não confirma reserva | PENDENTE |
| PAY-009 | Tentativas são preservadas em histórico | PLANEJADO |

## Regras — Tickets

| ID | Regra | Status |
|---|---|---|
| TKT-001 | Ingresso pertence a compra/reserva confirmada | PENDENTE |
| TKT-002 | Um ingresso por reservation item, garantido por unicidade | IMPLEMENTADO no banco |
| TKT-003 | Código do ingresso é único | IMPLEMENTADO no banco |
| TKT-004 | Emissão é idempotente | PENDENTE |
| TKT-005 | Estados válidos: VALID, USED, CANCELLED | IMPLEMENTADO no enum |
| TKT-006 | Ingresso usado registra usedAt | PARCIAL: campo existe |
| TKT-007 | Uso repetido exige regra de entrada | PENDENTE |
| TKT-008 | Transferência, reembolso e invalidação são políticas futuras | PLANEJADO |

## Regras — Notifications

| ID | Regra | Status |
|---|---|---|
| NOT-001 | Evento de integração exige eventId único | IMPLEMENTADO |
| NOT-002 | eventId duplicado não cria notificação duplicada | IMPLEMENTADO |
| NOT-003 | Destinatário é derivado do subject do JWT em endpoints REST | IMPLEMENTADO |
| NOT-004 | Usuário só marca como lidas suas próprias notificações | IMPLEMENTADO |
| NOT-005 | Falhas persistentes não confirmam a mensagem RabbitMQ | IMPLEMENTADO |
| NOT-006 | Eventos inválidos vão para DLQ | IMPLEMENTADO |
| NOT-007 | Email pendente possui tentativa persistida | IMPLEMENTADO |
| NOT-008 | API não revela recipientId na resposta | IMPLEMENTADO |
| NOT-009 | Retenção, paginação por cursor e políticas de reenvio têm requisitos operacionais pendentes | PENDENTE |

## Invariantes atuais

- Show startAt/endAt são validados no banco.
- Category name é único.
- Sector name é único por show.
- Seat row/number é único por sector.
- TicketType name é único por show.
- ReservedCount é não negativo e não excede quantity.
- Preço inteiro não negativo em centavos.
- Total e desconto de reservation não negativos.
- Assento não pode ficar repetido em reservation items da mesma reserva.
- Ticket possui um reservation item e código únicos.

Essas são evidências estruturais de banco, não prova de casos de uso completos.

## Cenários excepcionais

- concorrência acima da disponibilidade;
- expiração durante confirmação de pagamento;
- callback de pagamento duplicado ou fora de ordem;
- indisponibilidade de RabbitMQ;
- indisponibilidade de PostgreSQL;
- indisponibilidade de Redis;
- Redis com dado desatualizado;
- consumidor indisponível;
- evento repetido;
- evento malformado;
- projeção atrasada;
- falha entre reserva e pagamento;
- falha entre pagamento e emissão.

## Questões em aberto

1. JWT, refresh, revogação e duração das sessões.
2. Autorização no Kong versus dentro de cada serviço.
3. Organizador global ou associação por organização/evento.
4. Propriedade da capacidade: Events ou Reservations.
5. Disponibilidade efetiva: banco transacional, cache ou ambos.
6. Redis como cache derivado ou estado temporário.
7. Política de 10 minutos configurável.
8. Quem publica eventos de integração.
9. Quem é owner da emissão.
10. Retenção de dados pessoais e exclusão de conta.
