## Backend (Express API)

Scripts:
- `npm run dev` — start with nodemon (development)
- `npm start` — start with node (production)

Default port: `3500` (or `PORT` from `.env`).

Quick start:
```bash
npm install
npm run dev
```

Health check:
- GET `http://localhost:3500/` → `{ message: "The server is active" }`

API base: `http://localhost:3500/api`

Key routes:
- Users: `/api/users/register`, `/api/users/login`, `/api/users/refresh`, `/api/users/logout`, `/api/users/customers`
- Products: `/api/products`, `/api/products/:id`
- Payments: `/api/payments/*`

Environment:
- Keep `.env` variable names as-is (e.g., `MONGO_URL`, `ACCESS_TOKEN_SECRET`).
## Backend Herbo - Express API

A Node.js (ESM) backend using Express, MongoDB (Mongoose), JWT auth with access and refresh tokens, centralized error handling, structured file logging, and CORS.

For a high-level architecture overview, see [SUMMARY.md](./SUMMARY.md).

### Prerequisites
- Node.js 18+
- MongoDB connection (Atlas or local)

### Quick start
```bash
git clone <repo-url>
cd backend
cp .env.example .env
# edit .env with your values

npm install

# Development
npx nodemon server.js

# Production
node server.js
```

### Environment variables
Create a `.env` in the project root:
```
PORT=3500
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=<32-byte-hex>
REFRESH_TOKEN_SECRET=<32-byte-hex>
# Optional: for local HTTP dev, set cookies to non-secure
# In production leave this unset or set to true
COOKIE_SECURE=false
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Scripts
Add to `package.json` if desired:
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

### API Endpoints
Base URL: `http://localhost:<PORT>`

- Health
  - `GET /` → `{ message: "The server is active" }`

- Auth/User (mounted under `/users` in routes file)
  - `POST /users/register` → create user, sets refresh cookie, returns access token
  - `POST /users/login` → sets refresh cookie, returns access token and roles
  - `GET /users/refresh` → re-issues access token using refresh cookie
  - `POST /users/logout` → clears refresh cookie
  - `GET /users/all-customers` → requires Bearer access token with `Admin` role

Headers and cookies:
- Access token: `Authorization: Bearer <accessToken>`
- Refresh token cookie: name `jwt`, `httpOnly`, `secure`, `sameSite=none`

### Auth model
- Access token: short-lived (1m), signed with `ACCESS_TOKEN_SECRET`
- Refresh token: longer-lived (1–7d), in HTTP-only cookie, signed with `REFRESH_TOKEN_SECRET`
- `verifyJWT` middleware protects endpoints using the access token

### Data model
- `User` fields: `username`, `password` (bcrypt), `roles` (default `Customer`), `active` (default `true`)

### Middleware
- `logger` → logs to `logs/reqLog.log` and ensures `logs/`
- `errorHandler` → JSON errors; Zod errors as 400 with details; logs to files
- `verifyJWT` → validates Bearer token; attaches `req.user` and `req.roles`
- `cors(corsOptions)` → uses `common/allowedOrigins.js`
- `cookie-parser` → reads refresh token cookie `jwt`

### Logging
- Requests: `logs/reqLog.log`
- Validation: `logs/zodErrorLog.log`
- General errors: `logs/errorLog.log`
- Mongo connection: `logs/mongoErrLog.log`

### CORS
Allowed origins are configured in `common/allowedOrigins.js` and applied via `common/corsOption.js`.

### Troubleshooting
- Database not connecting: ensure `MONGO_URL` is set and reachable; check Atlas IP allowlist
- JWT errors: ensure `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set and distinct
- Cookies missing: if testing locally without HTTPS, `secure: true` cookies won’t be sent by browsers
- CORS blocked: add your frontend origin to `allowedOrigins`

### License
ISC (see `package.json`)


