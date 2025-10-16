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

