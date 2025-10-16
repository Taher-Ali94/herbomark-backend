## Backend Overview

This backend is an Express (ESM) server with MongoDB (Mongoose), JWT-based auth, cookie-based refresh tokens, structured logging, and centralized error handling.

### Server & Core
- Express app with middleware: `logger`, `cors(corsOptions)`, `express.json()`, `express.urlencoded()`, and `cookie-parser`.
- Health route: `GET /` → `{ message: "The server is active" }`.
- Mongo connection via `connectDB()` using `MONGO_URL`.
- Mongoose events: logs successful connect; logs connection errors to `logs/mongoErrLog.log`.

### Middleware
- `middleware/logger.js`:
  - Writes request logs to `logs/reqLog.log` with timestamp and UUID.
  - Ensures `logs/` folder exists (ESM-friendly `__dirname`).
- `middleware/errorHandler.js`:
  - Centralized error responses.
  - Zod validation errors → 400 with details; logs to `zodErrorLog.log`.
  - Other errors logged to `errorLog.log`.
- `middleware/verifyJWT.js`:
  - Validates `Authorization: Bearer <token>` using `ACCESS_TOKEN_SECRET`.
  - Populates `req.user` and `req.roles`.
- `common/corsOption.js` + `common/allowedOrigins.js`:
  - Custom CORS allowlist configuration.

### Auth & User Flows (`controllers/user.js`)
- Register `POST /users/register`:
  - Validates input, prevents duplicates, hashes password (bcrypt), sets default role `Customer`.
  - Issues short-lived access token (1m) and sets HTTP-only refresh token cookie (7d).
- Login `POST /users/login`:
  - Validates credentials, checks `active`, compares password.
  - Returns access token (1m), sets refresh token cookie (1d), returns roles.
- Refresh `GET /users/refresh`:
  - Reads `jwt` cookie, verifies with `REFRESH_TOKEN_SECRET`, issues new access token.
- Logout `POST /users/logout`:
  - Clears `jwt` cookie.
- Admin list `GET /users/all-customers`:
  - Requires valid access token and `Admin` role; returns users with role `Customer` without passwords.

### Routes (`routes/userRoutes.js`)
- `POST /users/register` → `register`
- `POST /users/login` → `login`
- `GET /users/refresh` → `refresh`
- `POST /users/logout` → `logout`
- `GET /users/all-customers` → `verifyJWT`, `getAllCustomers`

### Data Model (`database/models/User.js`)
- `User` fields:
  - `username` (String, required)
  - `password` (String, required)
  - `roles` (String[], default `"Customer"`)
  - `active` (Boolean, default `true`)

### Environment Variables
- `MONGO_URL` – MongoDB connection string
- `ACCESS_TOKEN_SECRET` – JWT secret for access tokens
- `REFRESH_TOKEN_SECRET` – JWT secret for refresh tokens
- `PORT` – optional (default 3500)

### Logging
- Requests: `logs/reqLog.log`
- Validation errors (Zod): `logs/zodErrorLog.log`
- General errors: `logs/errorLog.log`
- Mongo connection errors: `logs/mongoErrLog.log`

### Notes
- Refresh tokens are HTTP-only, `secure`, `sameSite: 'none'` (requires HTTPS in production).
- Access tokens are intentionally short-lived to reduce risk; refresh endpoint rotates access tokens.


### Stack and Core Flow (Extended)
- Express (ESM), Mongoose, JWT, cookie-parser, CORS, zod, date-fns, uuid, nodemon.
- Startup: loads env, applies middleware, connects to MongoDB, mounts routers, attaches error handler, listens after DB `open`.

### Environment and Scripts
- Required env: `PORT`, `MONGO_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`.
- Suggested scripts:
  - `dev`: `nodemon server.js`
  - `start`: `node server.js`

### CORS and Logging
- CORS allowlist driven by `common/allowedOrigins.js`; credentials enabled.
- Request logging to `logs/reqLog.log` with timestamp and UUID; auto-creates `logs/`.

### Database Connection
- Uses `MONGO_URL`; throws if missing; connects via `mongoose.connect`.
- Logs mongo errors to `logs/mongoErrLog.log` (via server and logger).

### Auth and Security
- `verifyJWT` expects `Authorization: Bearer <accessToken>`; sets `req.user` and `req.roles`.
- `verifyAdmin` checks roles include `Admin` (case-insensitive).
- Access token TTL: 1m; Refresh token in `jwt` cookie (`httpOnly`, `secure`, `sameSite: 'none'`).

### User Controller Behaviors
- Register: creates user, assigns `Customer`, returns access token (1m), sets refresh cookie (7d).
- Login: validates and returns access token (1m), sets refresh cookie (1d).
- Refresh: verifies refresh cookie and issues new access token.
- Logout: clears `jwt` cookie.
- Get customers: requires Admin; returns users with `Customer` role (no passwords).

### Routes Overview
- `/api/users`: register, login, refresh, logout, customers (Admin).
- `/api/products`: CRUD; entire router protected by JWT + Admin.
- `/api/cart`: add, get user cart, remove, clear, decrease qty; JWT required.
- `/api/address`: add and fetch latest user address; JWT required.

### Controllers Highlights
- Products: standard CRUD; list sorted by `createdAt` desc.
- Cart: stores line-item total in `price`; adjusts totals when quantity changes.
- Address: stores multiple addresses; `GET /user` returns most recent.

### Data Models Snapshot
- User: `username`, `password`, `roles` (default includes `Customer`), `active`.
- Product: `title`, `description`, `price`, `category`, `qty`, `imgSrc`, `createdAt`.
- Cart: `userId`, `items[]` with `productId`, `title`, `price` (line total), `qty`, `imgSrc`.
- Address: `userId`, `fullName`, `address`, `city`, `state`, `country`, `pincode`, `phoneNumber`, `createdAt`.

### Error Handling
- Global handler returns JSON; special formatting for zod validation errors (400 with field details).

### How to Run
- `npm install`
- Development: `npx nodemon server.js` (or `npm run dev` if script added)
- Production: `node server.js` (or `npm start`)

### Operational Notes
- With HTTP (non-HTTPS), browsers won’t send cookies marked `secure: true`; use HTTPS or adjust for local testing.
- Ensure frontend origin is added to `allowedOrigins` to avoid CORS issues.
