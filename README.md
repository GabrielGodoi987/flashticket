# FlashTicket

A ideia do flash ticket é trabalhar e expor um aprendizado complexo, não só dos conceitos primordiais de microserviços, mas também de padrões arquiteturais, desafios de engenharia de software e trade offs de uma aplicação grande. Quero consguir export aqui todo o fluxo de desenvolvimento e todos os aprendizados que tive nessa joranada, do zero até o domínio dessa arquitetura e entender como resolver os problemas.

## Referências

## Indicações

Aqui no projeto, eu vou escrever um mini blog, dentro da pastinha: '/learn'. Dentro dessa pasta, todos os meus pensamentos, desafios que tive no projeto estão expostos

## Arquitetura do projeto

![alt text](image.png)

## Desenvolvimento com Docker

Os serviços de aplicação (`reservations`, `iam` e `payment`) montam suas pastas
locais nos containers e recarregam ao detectar alterações. Para recriar os
containers com essa configuração, execute na raiz:

```bash
docker compose up --build
```

PostgreSQL, Redis, RabbitMQ e Kong continuam usando volumes próprios para seus
dados/configuração; o código-fonte da aplicação não é montado nesses containers.
