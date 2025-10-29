# Backend Summary - Herbomark E-commerce

## Overview
Node.js + Express backend with MongoDB, JWT authentication, and Razorpay payment integration.

## Technology Stack
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Razorpay** - Payment gateway
- **JWT** - Authentication
- **cors** - Cross-origin requests
- **dotenv** - Environment configuration

## Project Structure

### Routes
- **userRoutes.js** - User authentication (register, login, logout, refresh)
- **productRoutes.js** - Product CRUD operations
- **cartRouter.js** - Cart management
- **addressRouter.js** - Address management
- **paymentRouter.js** - Payment processing

### Models
- **User.js** - User schema with roles
- **Product.js** - Product catalog
- **Cart.js** - Shopping cart
- **Address.js** - Shipping addresses
- **Payment.js** - Order records

### Controllers
- **user.js** - Authentication logic
- **product.js** - Product operations
- **cart.js** - Cart operations
- **payment.js** - Payment processing
- **address.js** - Address CRUD

### Middleware
- **verifyJWT.js** - JWT verification
- **verifyAdmin.js** - Admin role check
- **logger.js** - Request logging
- **errorHandler.js** - Error handling
- **security.js** - Security headers

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login
- `POST /api/users/logout` - Logout
- `GET /api/users/refresh` - Refresh access token
- `GET /api/users/customers` - Get all customers (admin)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/user` - Get user cart
- `DELETE /api/cart/remove/:productId` - Remove item
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/cart/--qty` - Decrease quantity

### Address
- `POST /api/address/add` - Add address
- `GET /api/address/user` - Get user addresses
- `GET /api/address/all` - Get all addresses (admin)
- `PUT /api/address/:id` - Update address
- `DELETE /api/address/:id` - Delete address

### Payments
- `GET /api/payments/key` - Get Razorpay public key
- `POST /api/payments/checkout` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/cod` - Create COD order
- `GET /api/payments/my` - Get user orders
- `GET /api/payments` - Get all orders (admin)

## Payment Flow
1. Frontend sends amount in rupees (e.g., ₹500)
2. Backend converts to paise: `amount × 100` (50000 paise)
3. Backend creates Razorpay order with paise amount
4. Razorpay processes payment
5. Backend verifies signature
6. Backend stores amount in paise in database
7. Frontend retrieves and displays: amount / 100 for ₹

## Security Features
- JWT authentication with refresh tokens
- Role-based access control (admin verification)
- CORS configuration
- Security headers (helmet)
- Request rate limiting
- Input validation
- Secure password hashing

## Environment Variables
```
PORT=3500
MONGO_URI=mongodb://localhost:27017/herbomark
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NODE_ENV=development
```

## Amount Handling
- Database stores amounts in paise (centi-units)
- Razorpay requires integer values in smallest currency unit
- Amount format: `amount × 100` for payments
- Example: ₹500 → 50000 stored in database
- Backend handles conversion automatically

## Logging
- Error logs: `logs/errorLog.log`
- Mongo errors: `logs/mongoErrLog.log`
- Request logs: `logs/reqLog.log`

## Database
- Database name: `herbomark`
- Collections: users, products, carts, addresses, payments
- Indexes on userId, productId, orderId

## Start Server
```bash
npm install
npm start
```

Server runs on http://localhost:3500

