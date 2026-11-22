# 1. Ambiente e fluxo diário

## Instalação e módulos

O Go usa módulos. `go.mod` define o módulo e suas dependências diretas;
`go.sum` registra checksums para builds reproduzíveis. Ambos devem ser
versionados. O cache de módulos fica fora do repositório. `vendor/` é opcional,
não é equivalente obrigatório de `node_modules`.

```bash
go version
go env GOMOD GOPATH GOTOOLCHAIN
go mod init example.com/org/project
go get example.com/library
go mod tidy
```

Escolha a versão mínima compatível com CI e Docker. A diretiva `go` em
`go.mod`, o toolchain local, a imagem de build e os runners devem concordar.
Atualizar dependências exige testes e revisão do changelog, não apenas trocar
versões.

## Comandos que você usará muito

```bash
gofmt -w .
go test ./...
go test -race ./...
go test -cover ./...
go vet ./...
go test ./internal/service -run TestCreate -count=1
go test -bench=. -benchmem ./internal/...
go list -m all
go mod tidy
```

Execute os comandos na raiz do módulo. `go test ./...` percorre pacotes abaixo
do módulo. O race detector encontra data races em código executado pelos testes;
não prova ausência de toda corrida.

## Fluxo de uma tarefa

1. Reproduza o requisito como comportamento observável.
2. Encontre o ponto de entrada, a dependência e os testes existentes.
3. Escreva teste para o caso feliz e os limites relevantes.
4. Implemente a menor solução coesa.
5. Rode testes focalizados, depois `go test ./...`, `go vet ./...` e, quando
   aplicável, `go test -race ./...`.
6. Inspecione `git diff`, documente configuração e risco de deploy.

## Ler código desconhecido

Comece por `go.mod`, `cmd/`, `internal/`, README e testes. Depois busque
construtores, interfaces consumidoras e referências aos símbolos. Siga uma
requisição do handler à persistência e volte pelo caminho do erro. Não comece
por ler cada arquivo em ordem alfabética.

Use `go doc pacote.Tipo`, `go doc pacote.Tipo.Metodo` e `go list -deps` para
entender APIs. Leia primeiro a documentação da versão instalada; exemplos da
internet podem usar outra versão.

## Ambiente e segredos

Configure valores externos via ambiente ou secret manager. Mantenha
`.env.example` sem valores reais e ignore `.env`. Nunca copie tokens, dumps
reais ou credenciais para exemplos, issues ou logs.
