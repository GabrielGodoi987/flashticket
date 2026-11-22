# 4. Pacotes, módulos e desenho de interfaces

## Limites de pacote

Um pacote deve oferecer uma capacidade coesa e esconder decisões internas.
Agrupe por domínio/capacidade, não crie pastas `utils`, `common` ou `helpers`
para qualquer função sem dono claro. Dependências devem apontar para dentro do
domínio e evitar ciclos.

Convenções úteis:

- `cmd/<nome>`: composição do executável; inicializa dependências e ciclo de vida.
- `internal/<capacidade>`: implementação privada ao módulo/repositório.
- pacote pequeno, nome curto, uma responsabilidade compreensível.
- evite arquivos com dezenas de responsabilidades só para reduzir número de pastas.

## Interface no consumidor

Suponha que `notification.Service` usa persistência. A interface geralmente
fica perto de `Service`, porque é ele que define o comportamento requerido:

```go
type Repository interface {
    Save(context.Context, Notification) error
}
```

Não crie interface grande só para poder trocar o banco um dia. Se só há uma
implementação e a dependência concreta é simples, um struct concreto pode ser
mais claro. Testabilidade pode vir de funções puras e de testes de integração.

## Construtores e invariantes

Construtor explícito é útil quando dependências são necessárias:

```go
func NewService(repo Repository, clock Clock) (*Service, error) {
    if repo == nil {
        return nil, errors.New("repository is required")
    }
    return &Service{repo: repo, clock: clock}, nil
}
```

Não retorne objeto parcialmente válido. Se zero value é utilizável, não invente
construtor sem benefício.

## Dependências

Adicione pacote externo apenas quando:

1. a biblioteca resolve necessidade real e reduz risco/complexidade total;
2. está mantida, tem licença compatível e versões suportadas;
3. a API e as dependências transitivas foram revisadas;
4. há estratégia de atualização e testes.

`go mod tidy` sincroniza imports e dependências; revise o diff de `go.mod` e
`go.sum`. Não edite checksums manualmente. `replace` temporário deve ter
justificativa e remoção planejada.

## Ciclos e dependências de inicialização

O `main` é o composition root: constrói cliente Mongo, conexão Rabbit, sender,
repositório, workers e servidor HTTP. Não abra conexões em `init()`. `init()`
esconde efeitos e ordem global; prefira função que retorna erro e permita
shutdown controlado.

## Quando abstrair

- Extraia quando dois comportamentos realmente compartilham regra estável.
- Não extraia para evitar repetir uma linha óbvia.
- Não crie “factory/facade/manager” sem uma responsabilidade concreta.
- Mude interface junto com consumidor e teste; mantenha a superfície mínima.

## Prática

Desenhe dependências do notifications em diagrama. Para cada interface,
responda: quem consome? qual comportamento essencial? existe mais de uma
implementação real? Se não conseguir responder, simplifique.
