# 6. Concorrência

## Goroutines

`go f()` inicia execução concorrente. Goroutine não deve ser criada sem plano
para encerrá-la, limitar concorrência e observar erros. A função dona precisa
controlar seu ciclo de vida.

```go
go func() {
    if err := worker.Run(ctx); err != nil && ctx.Err() == nil {
        logger.Error("worker failed", "error", err)
    }
}()
```

## Channels

Channels transferem valores e sincronizam goroutines. Um sender que possui o
channel costuma fechá-lo. Fechar um channel duas vezes ou enviar após fechar
gera panic. Não feche channel para sinalizar cancelamento quando `context`
resolve o caso.

```go
select {
case job := <-jobs:
    process(job)
case <-ctx.Done():
    return ctx.Err()
}
```

Channel sem buffer fornece rendezvous; buffer absorve uma quantidade limitada,
não elimina backpressure. Ao criar buffer, explique o que acontece quando enche.

## Mutex e estado compartilhado

Use `sync.Mutex` para invariantes compostas, `sync.RWMutex` quando leituras
concorrentes justificam, `sync/atomic` para estados simples. Mantenha a região
crítica pequena e não chame código externo sob lock.

Data race é acesso concorrente com ao menos uma escrita sem sincronização. Rode
`go test -race`; garanta que testes exercitem o caminho concorrente.

## WaitGroup, errgroup e worker pools

`sync.WaitGroup` espera tarefas, mas não transporta erro/cancelamento. Em
trabalho que pode falhar, considere `golang.org/x/sync/errgroup` com limite de
concorrência. Worker pool limita recursos quando há muitas tarefas; implemente
somente se paralelismo e backpressure forem requisitos.

## Deadlocks e leaks

Pergunte para cada goroutine:

- quem a inicia e quem a cancela?
- ela pode bloquear em channel/rede indefinidamente?
- o processo espera que ela termine?
- existe limite de número/tempo?
- erros são observados?

Um produtor que envia a channel sem consumidor vaza goroutine. Um `select`
com `default` pode descartar dado; faça isso apenas com política explícita.

## Concorrência no serviço de notificações

- Mongo client é compartilhado e deve ser fechado no shutdown.
- Cada request tem contexto e deadline.
- SSE mantém conexão longa e precisa sair quando cliente desconecta.
- Rabbit entrega mensagens manualmente confirmadas.
- O hub deve isolar usuários e não bloquear o consumidor por cliente lento.
- Emails pendentes precisam ser reivindicados atomicamente para evitar duas
  goroutines enviarem o mesmo email simultaneamente.

## Prática

- Faça um teste concorrente para o hub e rode `go test -race ./...`.
- Desconecte cliente SSE e confira que subscriber foi removido.
- Compare `Mutex` com um channel; escolha a forma que deixa o ownership mais
  explícito, não a mais “Go-like” por estética.
