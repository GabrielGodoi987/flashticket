# 12. Segurança prática

## Threat modeling leve

Para cada endpoint/evento, pergunte:

- quem controla input e pode forjá-lo?
- que identidade autoriza leitura/escrita?
- que dado pessoal/segredo transita ou persiste?
- o que acontece sob replay, volume alto e dependência comprometida?
- como detectar abuso e limitar impacto?

## Autenticação não é autorização

JWT deve ser verificado criptograficamente; decodificar claims não autentica.
Allowlist de algoritmo; valida `iss`, `aud`, expiração, not-before e `sub`.
Proteja chave e JWKS com origem TLS confiável, timeout/cache e rotação. Não
aceite `recipientId` enviado pelo cliente como substituto de `sub`.

Autorização deve restringir query ao usuário autenticado. Não busque por
`_id` isolado em recurso privado; inclua `recipientId` no filtro.

## Segredos e configuração

- nunca versionar `.env`, API keys, certificados ou tokens;
- `.env.example` contém nomes e placeholders, sem segredo válido;
- rotacione credenciais e restrinja permissões;
- não exiba variáveis em logs, mensagens de erro ou endpoints de debug;
- secret scanning no CI ajuda, mas não substitui revisão.

## Entrada, saída e dados

Valide comprimento/tipo/versão, limite request e fila, escape HTML email e
proteja contra injection com queries parametrizadas/driver. Reduza PII coletada
e imponha retenção/expurgo. Trate logs e traces como dados sensíveis.

## Transporte e rede

Compose local pode expor portas para desenvolvimento. Produção deve restringir
Mongo/Rabbit a rede privada, exigir TLS e auth, usar contas com menor privilégio
e não publicar painel administrativo sem controle de acesso.

## Supply chain

Revise versões e licenças de módulos, atualize dependências regularmente,
produza imagens não-root e pequenas, pin de imagens por digest em produção,
gere SBOM e verifique CVEs. Evite baixar dependências durante runtime.

## Abuso operacional

Rate limit, tamanho de evento e concorrência limitada protegem recursos.
Estabeleça quotas de envio, proteção contra spam, listas de supressão e
monitoramento de bounce/complaint antes de produção.

## Prática

Tente acessar notificação de outra pessoa, enviar HTML no evento, forjar
`alg=none`, usar token expirado e inundar payload grande. Cada tentativa deve
ser rejeitada e testada sem revelar dados.
