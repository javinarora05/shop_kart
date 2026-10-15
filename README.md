# ShopKart

A full-stack MERN e-commerce application with customer accounts, product discovery, a shopping cart, wishlists, and Razorpay checkout.

## Features

- Customer registration and login with bcrypt password hashing and JWT authentication in HTTP-only cookies.
- Profile access, logout, and password changes for authenticated customers.
- Product catalog with search, category filtering, price sorting, and product detail pages.
- Authenticated wishlist and cart with quantity and stock checks.
- Checkout, Razorpay payment verification, and order history and details.
- Responsive React UI with loading, empty, and error states.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios, Tailwind CSS, Lucide React |
| Backend | Node.js, Express, Mongoose, MongoDB |
| Authentication | JWT, bcrypt, HTTP-only cookies |
| Payments | Razorpay |
| Backend tests | Jest, Supertest, mongodb-memory-server |

## Project structure

```text
shop_kart/
├── backend/
│   ├── config/          # Razorpay configuration
│   ├── controllers/     # Authentication, product, wishlist, cart, and order handlers
│   ├── middlewares/     # JWT authentication middleware
│   ├── models/          # Customer, product, and order schemas
│   ├── routes/          # Express API routes
│   ├── tests/           # Backend tests
│   ├── utils/           # Product seeder and token helper
│   ├── .env.example
│   └── index.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    └── .env.example
```

## Prerequisites

- Node.js 18 or later and npm
- MongoDB running locally or a MongoDB Atlas connection string
- Razorpay test API keys to exercise checkout and payment verification

## Getting started

### 1. Configure the backend

In a terminal:

```bash
cd backend
npm install
```

Create `backend/.env` from the example file:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS / Linux
cp .env.example .env
```

Set the values in `backend/.env`:

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Backend HTTP port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/shopkart` |
| `JWT_SECRET` | Private secret used to sign authentication tokens | Generate a unique, strong value |
| `NODE_ENV` | Runtime environment | `development` |
| `FRONTEND_URL` | Frontend origin allowed by CORS | `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | Your Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | Your Razorpay test key secret |

Do not use the example JWT secret in a real environment. Keep `.env` files and Razorpay secrets private; use Razorpay test credentials for local testing.

### 2. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` from its example using `Copy-Item .env.example .env` in PowerShell or `cp .env.example .env` on macOS/Linux. Set the backend URL if it differs from the default:

```dotenv
VITE_API_URL=http://localhost:5000
```

### 3. Start the app

Start MongoDB first, then run the backend and frontend in separate terminals:

```bash
# Terminal 1
cd backend
npm start
```

```bash
# Terminal 2
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The backend health endpoint is [http://localhost:5000/](http://localhost:5000/).

For backend development with automatic restarts, use `npm run dev` instead of `npm start`.

### Optional: seed sample products

With `backend/.env` configured, run:

```bash
cd backend
npm run seed
```

**Warning:** the seed script deletes all existing product records before inserting its sample catalog. Do not run it against a database whose products you need to keep.

## API overview

All endpoints are served from the backend origin (by default `http://localhost:5000`). Protected endpoints require the authentication cookie issued at login. Requests from the frontend use Axios with credentials enabled.

### Customers

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/customers/register` | Public | Register with `fullName`, `email`, `password`, and `phone` |
| `POST` | `/customers/login` | Public | Log in and issue the authentication cookie |
| `GET` | `/customers/me` | Authenticated | Get the current customer profile |
| `POST` | `/customers/logout` | Authenticated | Log out and clear the cookie |
| `PATCH` | `/customers/change-password` | Authenticated | Change password with `oldPassword` and `newPassword` |

### Products

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | List products; supports `search`, `category`, and `sort` query parameters |
| `GET` | `/products/:id` | Public | Get a product by its MongoDB ID |
| `POST` | `/products` | Public | Create a product |

`sort` accepts `price_asc` or `price_desc`. Example:

```text
GET /products?search=keyboard&category=Electronics&sort=price_asc
```

### Wishlist

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/wishlist` | Authenticated | Get the current customer's wishlist |
| `GET` | `/wishlist/count` | Authenticated | Get the wishlist item count |
| `POST` | `/wishlist/:productId` | Authenticated | Add a product to the wishlist |
| `DELETE` | `/wishlist/:productId` | Authenticated | Remove a product from the wishlist |
| `PATCH` | `/wishlist/:productId/toggle` | Authenticated | Add or remove a product |

### Cart

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/cart` | Authenticated | Get cart items and subtotal |
| `POST` | `/cart/:productId` | Authenticated | Add a product to the cart |
| `PUT` | `/cart/:productId` | Authenticated | Set quantity with a JSON `quantity` value |
| `DELETE` | `/cart/:productId` | Authenticated | Remove a product from the cart |
| `DELETE` | `/cart` | Authenticated | Clear the cart |

### Orders and payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/orders/create-payment-order` | Authenticated | Create a pending order and Razorpay payment order |
| `POST` | `/orders/verify-payment` | Authenticated | Verify the Razorpay payment signature |
| `GET` | `/orders` | Authenticated | List the current customer's orders |
| `GET` | `/orders/:id` | Authenticated | Get an order by ID |

## Tests and build

Run the backend test suite:

```bash
cd backend
npm test
```

Build the frontend for production:

```bash
cd frontend
npm run build
```

## Security notes

- Never commit real `.env` files, JWT secrets, database credentials, or payment credentials.
- Use a unique, strong `JWT_SECRET` outside local development.
- Configure CORS with the intended frontend origin before deployment.
- Product creation is currently exposed through the public `POST /products` endpoint; add authorization before exposing a deployment to untrusted users.
