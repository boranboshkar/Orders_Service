# Orders_ServiceOrders Service 📦

A microservice responsible for managing ticket orders, including order creation, payment processing, and refund handling. This service ensures secure and efficient management of user transactions.

Features

Order Creation: Handles order initiation and links tickets to users.
Payment Integration: Processes payments using a mock payment provider (HammerHeadPayments API).
Refunds: Supports refunds for orders where the event has not yet occurred.
Event-driven Communication: Publishes order-related messages to RabbitMQ for other services.
Tech Stack

Node.js: Backend framework
MongoDB: Database for order storage
RabbitMQ: Message broker for asynchronous communication
JWT: Authentication and authorization
API Endpoints

Method	Endpoint	Description
POST	/orders	Create a new order
POST	/orders/refund	Process a refund
GET	/orders/:orderId	Get details of a specific order
Environment Variables

MONGO_URI: MongoDB connection string
JWT_SECRET: Secret key for token validation
RABBITMQ_URL: RabbitMQ connection string