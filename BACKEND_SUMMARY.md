# Backend Summary - Herbomark E-commerce Platform

## Overview
The backend is a Node.js/Express.js RESTful API server that provides authentication, product management, cart operations, order processing, and payment integration for the Herbomark e-commerce platform.

## Technology Stack
- **Node.js** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MongoDB 8.19.1** - NoSQL database
- **Mongoose 8.19.1** - MongoDB object modeling
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **Bcrypt 6.0.0** - Password hashing
- **Razorpay 2.9.6** - Payment gateway integration
- **Zod 4.1.12** - Schema validation
- **CORS 2.8.5** - Cross-origin resource sharing

## Project Structure

### Core Files
- **server.js** - Main server entry point with middleware setup
- **package.json** - Dependencies and scripts configuration

### Controllers
- **user.js** - User authentication and management
- **product.js** - Product CRUD operations
- **cart.js** - Shopping cart management
- **payment.js** - Order and payment processing
- **address.js** - User address management

### Models (MongoDB Schemas)
- **User.js** - User model with roles and authentication
- **Product.js** - Product catalog with categories and pricing
- **Cart.js** - Shopping cart with items and quantities
- **Payment.js** - Order and payment records
- **Address.js** - User shipping addresses

### Routes
- **userRoutes.js** - Authentication endpoints
- **productRoutes.js** - Product management endpoints
- **cartRouter.js** - Cart operations endpoints
- **paymentRouter.js** - Payment and order endpoints
- **addressRouter.js** - Address management endpoints

### Middleware
- **verifyJWT.js** - JWT token validation
- **verifyAdmin.js** - Admin role verification
- **errorHandler.js** - Global error handling
- **logger.js** - Request and error logging
- **security.js** - Security headers and rate limiting

### Database
- **connectDB.js** - MongoDB connection setup
- **models/** - Mongoose schema definitions

### Configuration
- **corsOption.js** - CORS configuration
- **allowedOrigins.js** - Allowed origins for CORS

## API Endpoints

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login with JWT tokens
- `POST /api/users/logout` - User logout and token cleanup
- `GET /api/users/refresh` - Refresh access token
- `GET /api/users/customers` - Get all customers (Admin only)

### Product Endpoints
- `GET /api/products` - Get all products (Public)
- `GET /api/products/:id` - Get product by ID (Public)
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart Endpoints
- `GET /api/cart/user` - Get user cart (Authenticated)
- `POST /api/cart/add` - Add item to cart (Authenticated)
- `DELETE /api/cart/remove/:productId` - Remove item from cart (Authenticated)
- `DELETE /api/cart/clear` - Clear entire cart (Authenticated)
- `POST /api/cart/--qty` - Decrease item quantity (Authenticated)

### Address Endpoints
- `GET /api/address/user` - Get user addresses (Authenticated)
- `POST /api/address/add` - Add new address (Authenticated)
- `PUT /api/address/:id` - Update address (Authenticated)
- `DELETE /api/address/:id` - Delete address (Authenticated)

### Payment Endpoints
- `GET /api/payments/key` - Get Razorpay public key (Public)
- `POST /api/payments/checkout` - Create payment order (Authenticated)
- `POST /api/payments/verify` - Verify payment (Authenticated)
- `POST /api/payments/cod` - Cash on delivery order (Authenticated)
- `GET /api/payments/my` - Get user orders (Authenticated)
- `GET /api/payments` - Get all orders (Admin only)

## Authentication System

### JWT Implementation
- **Access Tokens**: Short-lived (1 minute) for API requests
- **Refresh Tokens**: Long-lived (1-7 days) stored in HTTP-only cookies
- **Token Refresh**: Automatic refresh on expired access tokens
- **Role-based Access**: Admin and Customer roles

### Security Features
- Password hashing with bcrypt
- JWT token validation
- Role-based authorization
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Security headers (XSS, CSRF protection)

## Database Models

### User Model
```javascript
{
  username: String (required, unique)
  password: String (required, hashed)
  roles: [String] (default: ["Customer"])
  active: Boolean (default: true)
}
```

### Product Model
```javascript
{
  title: String (required)
  description: String (required)
  price: Number (required)
  category: String (required)
  qty: Number (required)
  imgSrc: String (required)
  createdAt: Date (default: now)
}
```

### Cart Model
```javascript
{
  userId: String (required)
  items: [{
    productId: ObjectId (ref: Product)
    title: String
    price: Number
    qty: Number
    imgSrc: String
  }]
}
```

### Payment Model
```javascript
{
  orderId: String (required, unique)
  paymentId: String (optional)
  signature: String (optional)
  amount: Number (required)
  orderItems: [ProductItem]
  userId: String (required)
  userShipping: Address
  orderDate: Date (default: now)
  payStatus: String (enum: created, paid, failed, refunded, cod)
}
```

### Address Model
```javascript
{
  userId: String (required)
  fullName: String (required)
  address: String (required)
  city: String (required)
  state: String (required)
  country: String (required)
  pincode: String (required)
  phoneNumber: String (required)
  createdAt: Date (default: now)
}
```

## Payment Integration

### Razorpay Integration
- **Order Creation**: Generate Razorpay orders for payments
- **Payment Verification**: Verify payment signatures
- **Webhook Support**: Handle payment status updates
- **COD Support**: Cash on delivery orders

### Payment Flow
1. User initiates checkout
2. Create Razorpay order with amount
3. User completes payment on Razorpay
4. Verify payment signature
5. Create order record in database
6. Clear user cart

## Error Handling

### Global Error Handler
- Centralized error processing
- Consistent error response format
- Error logging to files
- Development vs production error details

### Error Types
- **Validation Errors**: Input validation failures
- **Authentication Errors**: Invalid tokens or credentials
- **Authorization Errors**: Insufficient permissions
- **Database Errors**: MongoDB connection issues
- **Payment Errors**: Razorpay integration failures

## Logging System

### Log Files
- **reqLog.log**: Request logging
- **errorLog.log**: Error logging
- **mongoErrLog.log**: Database error logging

### Logging Features
- Request/response logging
- Error tracking and debugging
- Performance monitoring
- Security event logging

## Security Implementation

### Authentication Security
- JWT token validation
- Password hashing with bcrypt
- Session management
- Token refresh mechanism

### API Security
- CORS configuration
- Rate limiting
- Security headers
- Input validation
- SQL injection prevention

### Data Protection
- Sensitive data encryption
- Secure cookie handling
- Environment variable protection
- Database connection security

## Performance Optimizations

### Database Optimizations
- Indexed fields for faster queries
- Efficient schema design
- Connection pooling
- Query optimization

### API Optimizations
- Response compression
- Caching strategies
- Async operations
- Error handling efficiency

## Environment Configuration

### Required Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/herbomark
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
PORT=3500
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Production Configuration
- Secure JWT secrets
- Production MongoDB instance
- Proper CORS origins
- Environment-specific settings

## API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... },
  "success": true
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Detailed error information",
  "success": false
}
```

## Middleware Stack

### Request Processing Order
1. Security headers
2. Rate limiting
3. Request logging
4. CORS handling
5. JSON parsing
6. Cookie parsing
7. Route handling
8. Error handling

### Authentication Middleware
- JWT token extraction
- Token validation
- User context injection
- Role verification

## Database Operations

### CRUD Operations
- **Create**: Product, User, Cart, Payment, Address
- **Read**: Product listing, User profiles, Cart contents
- **Update**: Product updates, Cart modifications
- **Delete**: Product removal, Cart clearing

### Data Relationships
- User → Cart (One-to-One)
- User → Addresses (One-to-Many)
- User → Payments (One-to-Many)
- Product → Cart Items (One-to-Many)

## Scalability Considerations

### Database Scaling
- MongoDB sharding support
- Index optimization
- Connection pooling
- Query performance

### API Scaling
- Stateless design
- Load balancer compatibility
- Caching strategies
- Rate limiting

## Monitoring and Maintenance

### Health Checks
- Database connection status
- API endpoint availability
- Error rate monitoring
- Performance metrics

### Maintenance Tasks
- Log file rotation
- Database cleanup
- Performance optimization
- Security updates

## Deployment Requirements

### Server Requirements
- Node.js 16+ runtime
- MongoDB 4.4+ database
- SSL certificate for HTTPS
- Environment variable configuration

### Production Checklist
- Secure environment variables
- Database backup strategy
- Error monitoring setup
- Performance monitoring
- Security audit
- Load testing
- SSL/TLS configuration
- CORS policy review
