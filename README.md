# Decadis Full-Stack Applicant Task

A full-stack **User Management** application built as a production-quality monorepo. Users can be created, viewed, edited, and deleted, and each user can be assigned a set of actions they are authorized to perform.

---

## 🏗️ Stack

| Layer             | Technology                                          |
| ----------------- | --------------------------------------------------- |
| **Monorepo**      | npm workspaces                                      |
| **Backend**       | Node.js, Express 5, TypeScript, Zod, better-sqlite3 |
| **Frontend**      | React 19, Vite, TypeScript, Tailwind CSS            |
| **Data Fetching** | TanStack Query                                      |
| **Routing**       | React Router v7                                     |
| **Forms**         | React Hook Form + Zod resolver                      |
| **Testing**       | Vitest, Supertest, Testing Library, Playwright      |
| **Tooling**       | ESLint, Prettier                                    |

---

## 📁 Project Structure

```
/
├── apps/
│   ├── api/             # Express REST API
│   │   ├── src/
│   │   │   ├── __tests__/       # API integration tests
│   │   │   ├── database/        # SQLite connection & schema
│   │   │   ├── middleware/      # Validation & error handling
│   │   │   ├── repositories/   # Data access layer
│   │   │   ├── routes/          # Express route handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── app.ts           # Express app setup
│   │   │   ├── config.ts        # Environment config
│   │   │   └── server.ts        # Entry point
│   │   └── data/                # SQLite database file (auto-created)
│   └── web/             # React SPA
│       ├── src/
│       │   ├── __tests__/       # Component tests
│       │   ├── components/      # Reusable UI components
│       │   ├── hooks/           # React Query hooks
│       │   ├── lib/             # API client
│       │   ├── pages/           # Route pages
│       │   └── test/            # Test setup
│       └── e2e/                 # Playwright end-to-end tests
├── packages/
│   └── shared/          # Shared types, Zod schemas, constants
├── .github/
│   └── workflows/ci.yml # GitHub Actions pipeline
├── package.json         # Root workspace config
└── README.md
```

---

## 🏛️ Architecture Notes

### Backend (apps/api)

The API follows a **repository → service → controller** architecture:

- **Repository layer** (`repositories/`): Direct database access via better-sqlite3. Handles SQL queries and row-to-entity mapping.
- **Service layer** (`services/`): Business logic including validation rules (unique email, action authorization). Throws typed errors.
- **Route handlers** (`routes/`): Express routes that delegate to services. Thin controllers.
- **Middleware**: Zod validation middleware applied to request bodies, plus a global error handler that maps custom errors to appropriate HTTP status codes.
- **Persistence**: SQLite database via better-sqlite3. Data survives server restarts. WAL mode enabled for performance.

### Frontend (apps/web)

- **Pages** map directly to routes (`/users`, `/users/new`, `/users/:id`, `/users/:id/edit`).
- **TanStack Query** manages server state with automatic cache invalidation on mutations.
- **React Hook Form + Zod** provides type-safe validated forms.
- **Toast notifications** for all mutation results (create, update, delete, action execution).
- **Confirmation dialogs** before destructive actions (delete).

### Shared Package (packages/shared)

Contains Zod schemas and TypeScript types used by both apps:

- `createUserSchema`, `updateUserSchema`, `executeActionSchema` for validation
- `User`, `Action`, `ApiError`, `ActionResponse` types
- `AVAILABLE_ACTIONS` constant

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 9

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd Decadis-Full-Stack-Applicant-Task

# Install all dependencies
npm install

# Copy environment files (optional — defaults work out of the box)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Run Development Servers

```bash
# Start both API and Web in separate terminals:

# Terminal 1 — API on http://localhost:3001
npm run dev:api

# Terminal 2 — Web on http://localhost:5173
npm run dev:web
```

Visit **http://localhost:5173** in your browser.

---

## ⚙️ Environment Variables

### Backend (`apps/api/.env`)

| Variable        | Default                 | Description          |
| --------------- | ----------------------- | -------------------- |
| `PORT`          | `3001`                  | API server port      |
| `DATABASE_PATH` | `./data/database.db`    | SQLite database path |
| `CORS_ORIGIN`   | `http://localhost:5173` | Allowed CORS origin  |
| `NODE_ENV`      | `development`           | Environment mode     |

### Frontend (`apps/web/.env`)

| Variable       | Default                 | Description |
| -------------- | ----------------------- | ----------- |
| `VITE_API_URL` | `http://localhost:3001` | Backend URL |

---

## 📜 Available Scripts

### Root (run from project root)

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev:api`   | Start API dev server with hot reload |
| `npm run dev:web`   | Start Vite dev server                |
| `npm run build`     | Build all workspaces                 |
| `npm run lint`      | Lint all workspaces                  |
| `npm run format`    | Format all files with Prettier       |
| `npm run typecheck` | Type-check all workspaces            |
| `npm test`          | Run all tests                        |
| `npm run test:api`  | Run API tests only                   |
| `npm run test:web`  | Run web component tests only         |
| `npm run test:e2e`  | Run Playwright end-to-end tests      |

---

## 🧪 Running Tests

```bash
# All unit/integration tests
npm test

# API tests only (28 tests)
npm run test:api

# Web component tests only (6 tests)
npm run test:web

# End-to-end tests (starts servers automatically)
npm run test:e2e
```

### Test Coverage

- **Backend (28 tests)**: Full endpoint coverage — CRUD, action authorization, validation errors, email normalization, edge cases
- **Frontend (6 tests)**: App routing, form rendering, form validation, form submission
- **E2E (1 test)**: Complete CRUD flow including create → view → execute action → edit → delete

---

## 📡 API Overview

Base URL: `http://localhost:3001`

### Health Check

```
GET /health → { status: "ok", timestamp: "..." }
```

### User CRUD

```
POST   /user          → Create a user (201)
GET    /user          → List all users (200)
GET    /user/:id      → Get single user (200 | 404)
PUT    /user/:id      → Update a user (200 | 404 | 409)
DELETE /user/:id      → Delete a user (204 | 404)
```

**Create/Update body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "actions": ["create-item", "view-item"]
}
```

### Action Execution

```
POST /action → Execute an action (200 | 403 | 404)
```

**Request body:**

```json
{
  "userId": "uuid-here",
  "action": "create-item"
}
```

**Available actions:** `create-item`, `delete-item`, `view-item`, `move-item`

### Error Responses

All errors follow this format:

```json
{
  "error": "Description of what went wrong",
  "details": []
}
```

| Status | Meaning                        |
| ------ | ------------------------------ |
| 400    | Validation error               |
| 403    | User not authorized for action |
| 404    | Resource not found             |
| 409    | Conflict (duplicate email)     |
| 500    | Internal server error          |

---

## 💡 Tradeoffs & Assumptions

1. **SQLite over PostgreSQL**: Chosen for zero-config setup. No external database server needed. Data persists across restarts. For production, swap to PostgreSQL with minimal repository changes.

2. **better-sqlite3 over Prisma**: Prisma adds a code generation step and binary dependency. better-sqlite3 is synchronous, fast, and keeps the setup minimal. The repository pattern abstracts the database so switching ORMs is straightforward.

3. **Express 5**: Used the latest Express version. Some type quirks with `req.params` in v5 required explicit casting.

4. **No authentication**: The task focuses on user management and action authorization, not user login/auth. Actions are checked against the user’s allowed actions list. Unauthorized actions return **403 Forbidden** (not 401, since the user is identified by ID).

5. **Email normalization**: Emails are lowercased and trimmed on input to prevent case-sensitive duplicates (e.g., `John@Example.com` and `john@example.com` are treated as the same).

6. **Monorepo with npm workspaces**: Simpler than Turborepo/Nx for a two-app project. No build caching needed at this scale.

7. **Tailwind CSS v3**: Stable and well-supported. v4 is available but v3 has better ecosystem support for PostCSS plugins.

8. **E2E tests use Playwright’s webServer**: Both servers are auto-started and stopped by Playwright, no manual setup needed.

9. **Shared package consumed as TypeScript**: No build step for the shared package — both apps import directly from source. Works well with Vite and tsx.
