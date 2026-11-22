# 14. Trabalho em equipe e nível pleno

## Antes de codar

- Reescreva a necessidade em resultado verificável.
- Identifique usuário, cenário, dados, volume, latência e falha aceitável.
- Pergunte por contratos, auth, compatibilidade e rollout ainda indefinidos.
- Liste dependências e proponha fatias pequenas.
- Registre decisões com alternativas e consequências; não transforme toda
  preferência em ADR.

## Durante a implementação

- Respeite padrões e limites do repositório.
- Mantenha commits/diffs coesos.
- Faça erros explícitos e logs úteis sem PII/segredos.
- Escreva testes perto da regra e atualize documentação/config de exemplo.
- Consulte outra pessoa se trade-off afeta vários times ou contrato público.

## Code review

Revise nesta ordem:

1. correto para cenário feliz e bordas?
2. autenticação/autorização e dados seguros?
3. erros, concorrência, retry e idempotência?
4. compatibilidade e operação/deploy?
5. clareza e testes?

Comentários devem focar risco concreto e pergunta respeitosa. Diferencie bloqueio
de preferência. Autor deve responder contexto e corrigir ou justificar; review
não é prova de autoridade.

## Comunicação e estimativas

Divida tarefa por resultados, não por arquivos. Exponha risco e dependência cedo.
Estimativa é previsão com incerteza: explique o que está incluído e atualize
quando surgir evidência. Ao pedir ajuda, inclua objetivo, tentativas, erro
completo relevante e hipótese.

## Incidente

- priorize mitigar impacto e preservar evidência;
- comunique status em intervalos previsíveis;
- use rollback/feature flag quando seguro;
- não culpe indivíduos; encontre condições sistêmicas;
- escreva postmortem com impacto, timeline, causa, detecção e ações verificáveis.

## Definition of Done

- critério de aceite demonstrado por teste ou evidência;
- validação unitária/integrada e checks CI;
- autenticação, autorização e dados revistos;
- métricas/logs/alertas e comportamento de falha considerados;
- compatibilidade, config e rollout documentados;
- revisão aprovada, worktree/diff limpo e plano de rollback conhecido.

## Autoavaliação

Você consegue explicar para outra pessoa:

- por que esta solução é a mais simples que atende aos requisitos?
- qual parte pode falhar e como o sistema se recupera?
- que métricas dirão se funciona em produção?
- quais dados pertencem a quem e como são protegidos?
- que mudança seria incompatível e como implantá-la sem downtime?

Se não, isso indica próxima pergunta de estudo, não fracasso pessoal.
