# 2. Linguagem essencial

## Estrutura mínima

```go
package main

import "fmt"

func main() {
    name := "Go"
    fmt.Println("Olá,", name)
}
```

Uma pasta normalmente é um pacote. O nome declarado em `package` não precisa
ser igual ao nome da pasta, embora manter nomes curtos e previsíveis ajude.
`main` em `package main` é o ponto executável. Código compilado em outro pacote
é importado pelo caminho do módulo.

## Declarações e escopo

```go
const maxAttempts = 3
var startedAt time.Time
count := 0 // declaração curta: apenas dentro de função
```

O escopo é lexical. Uma declaração curta pode reutilizar variáveis já
declaradas no mesmo escopo se pelo menos uma variável for nova; isso às vezes
surpreende. Prefira atribuição clara ao reaproveitamento confuso.

Exportação depende da primeira letra: `ParseEvent` é exportado; `parseEvent`
é privado ao pacote. Isso também se aplica a campos e métodos.

## Funções e múltiplos retornos

```go
func parsePort(raw string) (int, error) {
    port, err := strconv.Atoi(raw)
    if err != nil {
        return 0, fmt.Errorf("parse port %q: %w", raw, err)
    }
    if port < 1 || port > 65535 {
        return 0, fmt.Errorf("port out of range: %d", port)
    }
    return port, nil
}
```

O padrão `valor, err := ...` é deliberado: a falha faz parte da assinatura.
Não use `panic` para erros esperados de entrada, rede ou banco.

## Controle de fluxo

Go tem `if`, `for` e `switch`; não existe `while` separado. `defer` agenda a
execução ao sair da função e é ótimo para fechar recursos:

```go
file, err := os.Open(path)
if err != nil {
    return err
}
defer file.Close()
```

`defer` executa em ordem LIFO e captura argumentos no momento da declaração.
Não o use em loops longos para acumular recursos; feche dentro de uma função
por iteração.

## Ponteiros, zero values e inicialização

Variáveis começam com o zero value do tipo: `0`, `false`, `""`, ponteiro/mapa/
slice nulo. O zero value pode ser uma API válida, mas mapas nulos não aceitam
atribuição. Inicialize mapas com `make` ou literal.

Ponteiros permitem compartilhar/modificar valores e representar ausência
(`nil`). Não existe aritmética de ponteiro idiomática. Não use ponteiro só
porque veio de outra linguagem; considere cópia, imutabilidade e tamanho.

## Defer, panic e recover

`panic` é para estado irrecuperável/programmer error ou invariantes impossíveis,
não para controlar fluxo normal. `recover` só funciona em `defer` na mesma
goroutine; middleware de servidor pode recuperar panic para evitar derrubar o
processo, registrar stack trace e responder 500, sem fingir sucesso.

## Prática

- Escreva parser que retorna `(valor, error)` e cobre entradas inválidas.
- Reescreva um loop de outra linguagem em Go sem `while` inventado.
- Compare um struct por valor com um ponteiro e explique quando a cópia importa.
