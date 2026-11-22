package messaging

import (
	"context"
	"fmt"

	"github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
	Connection *amqp091.Connection
	Channel    *amqp091.Channel
	Deliveries <-chan amqp091.Delivery
}

func Connect(ctx context.Context, url, exchangeName, deadLetterExchange, deadLetterQueue, queueName, routingKey string) (*Consumer, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	connection, err := amqp091.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("dial RabbitMQ: %w", err)
	}
	channel, err := connection.Channel()
	if err != nil {
		connection.Close()
		return nil, fmt.Errorf("open RabbitMQ channel: %w", err)
	}
	if err := channel.ExchangeDeclare(exchangeName, "topic", true, false, false, false, nil); err != nil {
		channel.Close()
		connection.Close()
		return nil, fmt.Errorf("declare notification exchange: %w", err)
	}
	if err := channel.ExchangeDeclare(deadLetterExchange, "topic", true, false, false, false, nil); err != nil {
		channel.Close()
		connection.Close()
		return nil, fmt.Errorf("declare dead-letter exchange: %w", err)
	}
	deadQueue, err := channel.QueueDeclare(deadLetterQueue, true, false, false, false, nil)
	if err != nil {
		channel.Close()
		connection.Close()
		return nil, fmt.Errorf("declare dead-letter queue: %w", err)
	}
	if err := channel.QueueBind(deadQueue.Name, "#", deadLetterExchange, false, nil); err != nil {
		channel.Close()
		connection.Close()
		return nil, fmt.Errorf("bind dead-letter queue: %w", err)
	}
	queue, err := channel.QueueDeclare(queueName, true, false, false, false, amqp091.Table{
		"x-dead-letter-exchange": deadLetterExchange,
	})
	if err != nil {
		channel.Close()
		connection.Close()
		return nil, fmt.Errorf("declare notification queue: %w", err)
	}
	if err := channel.QueueBind(queue.Name, routingKey, exchangeName, false, nil); err != nil {
		channel.Close()
		connection.Close()
		return nil, fmt.Errorf("bind notification queue: %w", err)
	}
	if err := channel.Qos(10, 0, false); err != nil {
		channel.Close()
		connection.Close()
		return nil, fmt.Errorf("configure RabbitMQ consumer: %w", err)
	}
	deliveries, err := channel.Consume(queue.Name, "notifications-service", false, false, false, false, nil)
	if err != nil {
		channel.Close()
		connection.Close()
		return nil, fmt.Errorf("start RabbitMQ consumer: %w", err)
	}
	return &Consumer{Connection: connection, Channel: channel, Deliveries: deliveries}, nil
}

func (consumer *Consumer) Close() {
	if consumer.Channel != nil {
		_ = consumer.Channel.Close()
	}
	if consumer.Connection != nil {
		_ = consumer.Connection.Close()
	}
}
