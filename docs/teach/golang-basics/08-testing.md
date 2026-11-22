# 8. Testes

## Pirâmide útil

- **Unitário:** função/regra sem rede real; rápido, cobre bordas e erros.
- **Integração:** Mongo/Rabbit/serviço real ou container; valida queries e
  protocolo.
- **Contrato:** produtor e consumidor concordam em envelope e versão.
- **E2E:** poucas jornadas críticas através de múltiplas camadas.

Não busque cobertura alta sem valor; teste decisões, invariantes e falhas
prováveis. Testes devem ser determinísticos, isolados e rápidos.

## Table-driven tests

```go
func TestValidateEvent(t *testing.T) {
    tests := []struct {
        name string
        event Event
        wantErr bool
    }{
        {name: "valid", event: validEvent()},
        {name: "missing id", event: Event{}, wantErr: true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.event.Validate()
            if (err != nil) != tt.wantErr {
                t.Fatalf("Validate() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

Go moderno cria escopo por iteração com `range`, mas closures e versões de
`go.mod` ainda merecem atenção em código legado. Capture variável quando
necessário.

## Fakes e mocks

Escreva fake pequeno que implementa a interface do consumidor. Fakes permitem
verificar resultado e erro sem acoplar teste a chamadas internas. Mock excessivo
transforma teste em espelho da implementação e quebra em refactor seguro.

## Testes HTTP

`httptest` testa status, headers e body. Para teste com servidor TCP real,
`httptest.NewServer` fornece URL e fecha em `defer`. Inclua:

- caminho feliz;
- entrada inválida e body grande;
- falta/invalidade de token;
- usuário tentando acessar documento de outra pessoa;
- Mongo indisponível;
- cliente SSE cancelado.

## Testes de concorrência e propriedade

Use `go test -race`. Faça asserts sobre resultados observáveis, não sobre
ordem de goroutines. Teste idempotência com evento repetido. Fuzz testing
(`FuzzX`) é valioso para parsers; benchmarks devem orientar otimização medida.

## Integração com dependências

Containers descartáveis (por exemplo Testcontainers) facilitam integração com
Mongo e Rabbit. Evite depender de banco compartilhado local com estado acumulado.
Tests devem criar dados isolados e limpar recursos; nenhum teste deve usar
segredos ou dados reais.

## Bons diagnósticos

Mensagem deve dizer cenário, entrada sanitizada e esperado/observado. Não
imprima segredo ou payload pessoal. Use `t.Helper()` em helpers e `t.Cleanup`
para teardown.

## Prática

- Crie testes para evento inválido, evento duplicado e erro no Mongo.
- Rode `go test -count=20 ./...` em testes potencialmente flaky.
- Use `-race` e uma falha simulada de Resend.
