# Project 2: The Nervous System (Full-Stack Portfolio REST API)

> **"The Biological API Framework for Modern Web Platforms"**

The **Nervous System API** serves as the stateless, secure, and event-driven backend core ("the life") connecting to **Project 1 ("The Skin")**. Designed around biological nervous system principles, every HTTP request flows through a strict two-layer **Blood-Brain Barrier (Validation)**, communicates using **JSON Neurotransmitters**, and enforces strict role-based access control.

---

## 🏛️ Biological Architecture Philosophy

1. **Input-Process-Output Pathways**: Sensor inputs (HTTP Requests) are filtered, processed by domain logic, and emitted as motor responses (JSON Neurotransmitters).
2. **Blood-Brain Barrier**:
   - **Syntactic Layer (Zod)**: Edge format, type, and range validation. Rejects malformed requests with `400 Bad Request`.
   - **Semantic Layer (Service Domain)**: Business logic, ownership checks, resource existence, and status constraints.
3. **Stateless Synapses**: Zero server-side session memory. Stateless JWT authentication (`Authorization: Bearer <token>`).
4. **Strict HTTP Vocabulary**: Noun-based REST resources with standardized HTTP status codes (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `429`, `500`).

---

## 📐 Architecture & Data Flow Diagram

```
       [ Client / Project 1 Frontend ]
                      │
                      ▼
 ┌─────────────────────────────────────────┐
 │        API GATEWAY / APP STEM           │
 │  Helmet → CORS → Rate Limit → Parser    │
 └────────────────────┬────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────┐
 │          BLOOD-BRAIN BARRIER            │
 │  Syntactic Validation (Zod Schemas)     │
 └────────────────────┬────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────┐
 │      AUTHENTICATION & AUTHORIZATION     │
 │  Stateless JWT Bearer & RequireRole     │
 └────────────────────┬────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────┐
 │         CONTROLLERS & SERVICES          │
 │  Semantic Validation & Domain Logic     │
 └────────────────────┬────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────┐
 │           DATABASE ORM LAYER            │
 │   Prisma ORM (SQLite / PostgreSQL)      │
 └─────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & Dependencies

- **Runtime & Framework**: Node.js, Express, TypeScript (Strict Mode)
- **Database & ORM**: Prisma ORM with SQLite for zero-config dev (PostgreSQL ready)
- **Validation**: Zod (Syntactic Schema Validation)
- **Authentication**: `jsonwebtoken` (JWT Bearer Auth), `bcryptjs` (Password Hashing - 12 salt rounds)
- **Security & Infrastructure**: `helmet`, `cors`, `express-rate-limit`, `morgan`, `winston`
- **Documentation**: Swagger UI Express (`/api/v1/docs`)

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation & Initialization

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

3. **Initialize Database & Seed Data**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Build Production Bundle**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Default Seed Credentials

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@nervous.system` | `AdminPass123!` | System administrator with full access to stats and content |
| **USER** | `user1@nervous.system` | `UserPass123!` | Regular user account (Synapse One) |
| **USER** | `user2@nervous.system` | `UserPass123!` | Regular user account (Dendrite Two) |

---

## 📑 Interactive API Documentation (Swagger)

Interactive OpenAPI 3.0 documentation is accessible at:
👉 **`http://localhost:3000/api/v1/docs`**

---

## 📡 RESTful Endpoints Reference

### 🏥 System Integrity
- `GET /api/v1/health` → `200 OK` (Health status, timestamp, uptime)

### 🔐 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` → `201 Created` (Register new user profile)
- `POST /api/v1/auth/login` → `200 OK` (Authenticate & return JWT token)
- `GET /api/v1/auth/me` → `200 OK` (Get current user from JWT)

### 👤 User Management (`/api/v1/users`)
- `GET /api/v1/users` → `200 OK` (Paginated user list with published post counts)
- `GET /api/v1/users/:id` → `200 OK` (User details with profile and posts)
- `PUT /api/v1/users/:id` → `200 OK` (Update user profile; Owner or ADMIN)
- `DELETE /api/v1/users/:id` → `204 No Content` (Delete user account; Owner or ADMIN)

### 📝 Posts (`/api/v1/posts`)
- `GET /api/v1/posts` → `200 OK` (List published posts; `?mine=true` shows user's drafts)
- `POST /api/v1/posts` → `201 Created` (Create post; Authenticated)
- `GET /api/v1/posts/:id` → `200 OK` (Get post by ID; Drafts require Owner or ADMIN)
- `PUT /api/v1/posts/:id` → `200 OK` (Update post; Author or ADMIN)
- `DELETE /api/v1/posts/:id` → `204 No Content` (Delete post; Author or ADMIN)
- `GET /api/v1/users/:id/posts` → `200 OK` (List posts filtered by user)

### 💬 Comments (`/api/v1/comments` & `/api/v1/posts/:id/comments`)
- `GET /api/v1/posts/:id/comments` → `200 OK` (Get comments for a post)
- `POST /api/v1/posts/:id/comments` → `201 Created` (Add comment; Post must be `PUBLISHED`)
- `DELETE /api/v1/comments/:id` → `204 No Content` (Delete comment; Author or ADMIN)

### 📊 Admin (`/api/v1/admin`)
- `GET /api/v1/admin/stats` → `200 OK` (System metric counts; ADMIN role required)
