import * as amqp from 'amqplib';
import 'dotenv/config';

export class Publisher {
    private channel: amqp.Channel;
    private exchange: string = 'order_status_exchange'; // Changed to match the consumer setup

    async createChannel() {
        const connection = await amqp.connect(process.env.AMQP_URL);
        this.channel = await connection.createChannel();
        await this.channel.assertExchange(this.exchange, 'topic', { durable: true }); // Changed to 'topic' and made durable
    }

    async publishOrderUpdate(orderId: string, status: string,eventId: string, ticketCategoryId: string, quantity: number) {
        if (!this.channel) {
            await this.createChannel();
        }

        // Construct a routing key based on the order status. This allows the message to be routed appropriately in the topic exchange.
        const routingKey = `order.${status.toLowerCase()}`; // Example routing keys: "order.paid", "order.refunded"
        const message = JSON.stringify({ orderId, status , eventId , ticketCategoryId , quantity });

        // Publish the message with the routing key
        this.channel.publish(this.exchange, routingKey, Buffer.from(message));
        console.log(`[Order Service] Published ${status} status for order ${orderId} with routing key ${routingKey}`);
    }
}
