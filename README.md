# Campus Store Online
 
A cloud native ecommerce application built with a microservices architecture, deployed on AWS.
 
## Live URL
 
http://store-balancer-771966180.us-east-2.elb.amazonaws.com


## API Endpoints
 
### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /products | No | Get all products |
| GET | /products/:id | No | Get a single product |
| POST | /products | API Key | Create a product |
| DELETE | /products/:id | API Key | Delete a product |
 
### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /orders | No | Get all orders |
| POST | /orders | API Key | Place an order |
| DELETE | /orders/:id | API Key | Delete an order |
 
## Authentication
 
POST and DELETE requests require an `x-api-key` header. GET requests are public.

## Tech Stack
 
- **Runtime:** Node.js with Express
- **Database:** PostgreSQL on AWS RDS
- **Containerization:** Docker
- **Cloud:** AWS (EC2, RDS, ALB, Lambda, VPC)
- **CI/CD:** GitHub Actions
- **Frontend:** HTML, CSS, JavaScript

## Running Locally
 
1. Clone the repo
2. Create `.env` files in both service directories:
```
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_NAME=postgres
DB_USER=your-username
DB_PASSWORD=your-password
API_KEY=your-api-key
```
3. For the order service, also add:
```
PRODUCT_SERVICE_URL=http://localhost:3000
LAMBDA_URL=your-lambda-url
```
4. Run each service:
```
cd product-service && npm install && npm start
cd order-service && npm install && npm start
```
 
## Docker Deployment
 
```
cd product-service
docker build -t product-service .
docker run -d -p 3000:3000 --env-file .env product-service
 
cd order-service
docker build -t order-service .
docker run -d -p 3002:3002 --env-file .env order-service
```
 
