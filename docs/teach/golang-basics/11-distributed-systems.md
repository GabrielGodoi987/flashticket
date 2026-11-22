# 11. Mensageria e sistemas distribuídos

## RabbitMQ

Exchange recebe publicação e roteia por binding para filas. Publisher e
consumer precisam concordar em exchange, tipo, routing key e envelope.
Mensagens duráveis + fila durable ajudam a sobreviver restart, mas publisher
confirms, replication e política de disco também importam.

Use manual ack: confirmar depois de persistência/efeito durável. Nack/requeue
indefinido pode criar hot loop; prefira retry controlado, delayed retry/DLX e
dead-letter queue com alerta. Mensagem inválida não deve ser descartada sem
registro/política.

## Entrega pelo menos uma vez

Redelivery é normal: consumer pode completar trabalho e cair antes do ACK.
Todo handler de evento precisa considerar idempotência. `eventId` e índice único
ajudam, mas não tornam efeitos externos exatamente uma vez.

Para email:

1. persistir evento e delivery status;
2. reivindicar tentativa atomicamente;
3. enviar;
4. marcar resultado;
5. retomar estados pendentes após falha.

Há uma janela entre provedor aceitar email e banco marcar enviado; sem idempotency
key do provedor, pode haver duplicidade. Documente o trade-off.

## Outbox e consistência

Se serviço grava estado de negócio e publica evento, gravar um e publicar outro
não é atômico. Outbox escreve evento na mesma transação; relay publica e marca
envio. Consumidor ainda deve ser idempotente. CDC pode ser alternativa.

## Backpressure

Fila desacopla ritmos, não cria capacidade infinita. Monitore profundidade,
idade mais antiga, taxa de entrada/saída, redelivery e DLQ. Defina limites e
backpressure no produtor quando necessário.

## Contratos de evento

Envelope contém identificador estável, tipo, versão, instante UTC, destinatário
e payload necessário. Evite nomes ambíguos, dados sensíveis desnecessários e
dependência de representação interna. Adicione campos opcionais compatíveis;
mudanças incompatíveis exigem estratégia de versão.

## Resend e email

API key deve ser segredo. `From` exige domínio/remetente verificado para envio
real. Configure timeout, trate rate limit/5xx, persista estado e faça retry
com backoff e jitter. Valide opt-in, preferências e regras legais antes de
enviar mensagens de produção. Logs registram ID da mensagem do provedor, nunca
token ou corpo privado.

## Prática

- Desenhe exchange `topic`, queue e routing key do notifications.
- Desligue Mongo durante consumo e verifique comportamento de ack.
- Publique duas vezes o mesmo eventId.
- Simule rate limit do Resend e acompanhe retry.
