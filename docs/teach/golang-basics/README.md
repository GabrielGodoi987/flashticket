# Go para desenvolvimento profissional

Este roteiro foi pensado para quem já programa e quer ficar produtivo em equipes
Go. Não é uma lista para decorar a linguagem: cada tema deve ser praticado,
testado, revisado e explicado. Use os capítulos na ordem sugerida e aplique os
exercícios no serviço `notifications`.

> Esta pasta é local e está ignorada pelo Git a pedido do projeto. Faça backup
> fora do repositório se quiser preservar o material entre máquinas.

## Rota rápida

1. **Primeiro dia:** [ambiente e fluxo](01-workflow.md), [sintaxe](02-language.md),
   [tipos e coleções](03-types.md), [pacotes e interfaces](04-packages-interfaces.md).
2. **Primeira semana:** [erros e confiabilidade](05-errors.md),
   [concorrência](06-concurrency.md), [HTTP](07-http.md), [testes](08-testing.md).
3. **Prática de serviço:** [persistência](09-persistence.md),
   [arquitetura](10-architecture.md), [mensageria](11-distributed-systems.md),
   [segurança](12-security.md).
4. **Pronto para o time:** [ferramentas](13-tooling.md),
   [hábitos profissionais](14-team-practice.md), [projeto de portfólio](15-capstone.md),
   [referência rápida](cheatsheet.md).

## O que significa “atuar como pleno”

Não é saber todas as bibliotecas. É conseguir:

- entender requisitos e converter incertezas em perguntas e contratos claros;
- propor uma solução simples, explicitar trade-offs e dividir o trabalho;
- seguir o estilo local, construir APIs consistentes e manter compatibilidade;
- tratar erros, concorrência, segurança, dados e operação como parte da feature;
- escrever testes com intenção, diagnosticar falhas e revisar código com respeito;
- observar produção, responder a incidentes e deixar o sistema melhor documentado;
- pedir ajuda cedo quando a evidência aponta para uma decisão de arquitetura.

Use a checklist no capítulo 14 antes de dizer que uma tarefa está pronta.

## Método de estudo (2 a 3 semanas)

- Leia um capítulo e resuma-o com suas próprias palavras.
- Escreva o exemplo sem copiar e rode `gofmt`, `go test ./...` e `go vet ./...`.
- Faça uma pequena alteração no notifications e prove o comportamento com teste.
- Revise o diff como se fosse de outra pessoa: nomes, limites, erros e compatibilidade.
- Registre decisões e dúvidas em notas locais; não grave segredos ou dados de clientes.
- Ao final de cada semana, explique o fluxo da aplicação em cinco minutos.

## Princípios idiomáticos

1. Prefira clareza e tipos pequenos a abstrações genéricas prematuras.
2. Trate erros explicitamente; não os descarte com `_`.
3. Passe `context.Context` como primeiro argumento em operações canceláveis.
4. Faça ownership e ciclo de vida de goroutines/conexões ficarem claros.
5. Interfaces pequenas devem pertencer normalmente a quem as consome.
6. Formate com `gofmt`; não lute contra o formato oficial.
7. Teste os comportamentos e contratos, não detalhes privados da implementação.
8. Não esconda falhas com fallback que parece sucesso.

## Glossário

Veja [cheatsheet.md](cheatsheet.md) para glossário, comandos e padrões de revisão.
