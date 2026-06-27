# Full Stack Food Ordering System

A modular food ordering application built with React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, JWT authentication, and MySQL.

## Features

- Customer registration and login
- JWT protected API routes
- Role-based access for admin and customer users
- Default admin account seeded on API startup
- Browse, search, filter, and view food items
- Cart add, update, remove, and checkout flow
- Customer order history with pending order cancellation
- Admin dashboard with order/user metrics
- Admin food item CRUD with AWS S3 image uploads
- User profile image uploads with AWS S3
- Admin order status management

## Project Structure

```text
backend/
  main.py
  database.py
  models/
  schemas/
  routers/
  utils/
  requirements.txt
  .env.example
frontend/
  src/
    components/
    context/
    layouts/
    pages/
    services/
    App.jsx
    main.jsx
  package.json
  .env.example
```

## Backend Setup

1. Create a MySQL database:

```sql
CREATE DATABASE food_ordering_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Create and activate a Python virtual environment:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Copy the environment example:

```bash
copy .env.example .env
```

4. Update `backend/.env` with your MySQL username, password, host, database name, and a strong `SECRET_KEY`.
   Add AWS S3 credentials for food and profile image uploads:

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

5. Start the API:

```bash
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`.

Default admin credentials are created automatically if the admin account does not exist:

```text
Email: sayan@gmail.com
Password: TS200506
```

Public registration always creates customer accounts.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The React app runs at `http://localhost:5173`.

## API Endpoints

### Auth

- `POST /register`
- `POST /login`
- `GET /profile`

### Foods

- `GET /foods`
- `GET /foods/{id}`
- `POST /foods` admin only, multipart form with image file
- `PUT /foods/{id}` admin only, multipart form with optional replacement image file
- `DELETE /foods/{id}` admin only
- `GET /foods/category/{category}`

### Cart

- `POST /cart`
- `GET /cart`
- `PUT /cart/{id}`
- `DELETE /cart/{id}`

### Orders

- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `PUT /orders/{id}`
- `DELETE /orders/{id}`

### Dashboard

- `GET /dashboard` admin only

## Notes

- Tables are created automatically on API startup via `Base.metadata.create_all`.
- Admin accounts can be created from the registration screen by selecting the admin role.
- For production, restrict admin account creation, rotate `SECRET_KEY`, use HTTPS, and run migrations with Alembic instead of auto-create.
