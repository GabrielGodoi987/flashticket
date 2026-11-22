# 13. Tooling, build e deploy

## Formatação e lint

`gofmt` é obrigatório e determinístico. `go vet` detecta erros comuns. Times
podem adicionar `golangci-lint`; mantenha conjunto curto, pinado e alinhado
com a versão de Go. Automatize em CI e não faça formatter editar arquivos
fora do escopo inesperadamente.

## Build reproduzível

```bash
go test ./...
go vet ./...
CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o bin/notifications ./cmd/notifications
```

Multi-stage Docker copia apenas binário/certificados para imagem runtime, roda
como usuário sem privilégio e recebe config por ambiente. Não copie `.env` nem
cache de módulo para runtime.

## CI

Pipeline típica:

1. checkout de commit;
2. instalar versão Go fixada;
3. `go mod download` / verificação de `go mod tidy`;
4. `gofmt -l`, `go vet`, testes unitários, race conforme tempo;
5. integração com serviços efêmeros;
6. build, scan de imagem e dependências;
7. publicar artefato imutável;
8. deploy progressivo e smoke test.

Falha de teste deve mostrar log relevante e versão ambiente. Não dependa de
serviço externo real em unit tests.

## Profiling

Use `pprof` protegido e habilitado apenas sob configuração segura. CPU, heap,
goroutine e block profiles respondem perguntas diferentes. Faça benchmark
representativo antes de otimizar; confirme com perfil depois.

## Migrations e schema

Migrations devem ser revisáveis, compatíveis com deploy rolling e idempotentes
quando aplicável. Para Mongo, index creation/mudança de documento também é
schema operacional. Planeje backfill separado de mudança de leitura/escrita.

## Docker Compose

Compose local facilita dependências, mas não é ambiente de produção. Defina
healthchecks, volumes persistentes, rede de serviço, portas necessárias e
variáveis de exemplo. `docker compose config` valida merge/interpolação;
`docker compose logs -f notifications` ajuda no diagnóstico.

## Prática

- Adicione CI que rode `gofmt`, test, vet e build.
- Faça imagem rodar como não-root.
- Compare tamanho da imagem multi-stage e builder.
