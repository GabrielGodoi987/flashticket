# 5. Erros, recursos e confiabilidade

## Erro é valor

```go
record, err := repository.Find(ctx, id)
if err != nil {
    return fmt.Errorf("find notification %q: %w", id, err)
}
```

Use `%w` quando o chamador deve inspecionar causa; use `%v` para contexto que
não deve fazer parte da árvore de erros. `errors.Is` encontra sentinelas e
`errors.As` encontra tipos. Compare mensagens apenas na borda de apresentação,
nunca para lógica.

Erros de domínio (`ErrNotFound`, `ErrInvalidEvent`) diferem de erros
operacionais (timeout, indisponibilidade, conflito). Mapeie-os para HTTP,
mensageria ou log no limite apropriado.

## Não engula erros

`_ = resource.Close()` pode ser adequado em cleanup secundário, mas avalie se o
erro importa. Em produção, registre falhas de persistência, confirmação de
mensagem, shutdown e envio. Não retorne 200 com estado incompleto.

`defer` em fechamento que pode falhar:

```go
defer func() {
    if err := file.Close(); err != nil {
        logger.Error("close file", "error", err)
    }
}()
```

## Contexto, timeout e cancelamento

`context.Context` carrega deadline/cancelamento e metadados transitórios; não
use para opções obrigatórias da função. Passe como primeiro parâmetro. Crie
timeout em chamadas de rede/banco e sempre execute `cancel`.

```go
ctx, cancel := context.WithTimeout(parent, 3*time.Second)
defer cancel()
result, err := client.Query(ctx)
```

Propague cancelamento em shutdown. Não use `context.Background()` em cada camada
para escapar do cancelamento recebido.

## Retry

Retry só ajuda em falha transitória e precisa de:

- limite de tentativas ou janela temporal;
- backoff exponencial com jitter;
- classificação de erro;
- idempotência ou deduplicação;
- observabilidade e política para falha final.

Não repita validação inválida ou resposta permanente. Evite retry em cada camada
ao mesmo tempo, que multiplica tentativas.

## Circuit breaker, bulkhead, timeout

Timeout limita quanto uma chamada ocupa recursos. Bulkhead limita concorrência
por dependência. Circuit breaker interrompe chamadas após falha sustentada e
permite sondas posteriores. São ferramentas, não padrão obrigatório; comece
com timeout, limites e métricas antes de adicionar estado complexo.

## Shutdown gracioso

Ao receber SIGTERM, pare de aceitar requests, cancele workers, pare de consumir
novas mensagens, finalize trabalho em andamento dentro de prazo e feche
conexões. O tempo de shutdown deve ser menor que o `stop_grace_period` do
orquestrador.

## Prática

- Injete timeout no fake do repositório e confira cancelamento.
- Simule falha persistente no email e observe retries sem perder a notificação.
- Faça fechamento retornar erro e decida como registrar sem mascarar a falha
  original.
