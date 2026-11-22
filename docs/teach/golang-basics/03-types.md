# 3. Tipos, coleções e generics

## Tipos compostos

Structs agrupam dados com significado:

```go
type Event struct {
    ID        string
    OccurredAt time.Time
    Attempts  int
}
```

Use nomes de domínio, tags apenas para integração necessária (`json`, `bson`),
e construtores quando há invariantes. Não exponha campos mutáveis sem motivo.
O `encoding/json` só serializa campos exportados; tags definem o contrato wire.

## Arrays, slices e mapas

Array tem tamanho parte do tipo. Slice é uma visão sobre um array subjacente,
com ponteiro, comprimento e capacidade:

```go
items := make([]string, 0, 8)
items = append(items, "a")
```

Slices podem compartilhar memória. `append` pode alocar um array novo quando a
capacidade acaba. Se uma função precisa de cópia independente, use `slices.Clone`
ou `append([]T(nil), input...)`.

Maps não são seguros para acesso concorrente sem sincronização. O zero value é
`nil` e permite leitura, mas não gravação. Map iteration order é indefinida;
nunca dependa dela para resposta ou teste.

## Métodos e receivers

```go
type Counter struct{ value int }

func (counter *Counter) Add(delta int) { counter.value += delta }
func (counter Counter) Value() int     { return counter.value }
```

Use receiver ponteiro para mutar, evitar cópia grande ou manter conjunto
consistente de métodos. Use receiver valor para tipos pequenos, imutáveis e com
semântica de valor. Não misture receivers sem razão.

## Interfaces

Uma interface descreve comportamento; implementação é implícita:

```go
type EmailSender interface {
    Send(context.Context, Email) error
}
```

Prefira interfaces pequenas, definidas pelo pacote consumidor. Receba
comportamento necessário em vez de uma interface universal. Não crie interface
para cada struct por padrão; mocks não justificam abstração sem uso real.

## Generics

Generics ajudam em algoritmos/containers que operam de modo idêntico em tipos
diferentes:

```go
func Map[T, U any](values []T, convert func(T) U) []U {
    result := make([]U, len(values))
    for i, value := range values {
        result[i] = convert(value)
    }
    return result
}
```

Use quando elimina duplicação real sem ocultar o domínio. Não transforme
serviços de negócio em framework genérico prematuro. Restrições (`constraints`)
devem expressar operações realmente usadas.

## `any`, type assertion e enums

`any` é alias de `interface{}`; é útil em fronteiras dinâmicas, mas reduz
garantias estáticas. Prefira tipo concreto ou interface pequena. Type switch é
mais seguro do que assertion sem checagem.

Go não possui enums nativos. Constantes tipadas e validação explícita são um
padrão:

```go
type Status string
const (
    StatusPending Status = "pending"
    StatusSent    Status = "sent"
)
```

## Prática

- Modele evento e notificação com JSON tags.
- Escreva validação tipada que rejeite versão não suportada.
- Demonstre em teste se uma função copia ou compartilha slice.
