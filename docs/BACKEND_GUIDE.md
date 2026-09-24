# ⚙️ Swasth Setu — Backend Architecture & Working

> A clear, diagram-driven explanation of how the Swasth Setu backend is structured and how requests flow through it — from authentication to hospital search, feedback, and admin management.

<p align="left">
  <img alt="stack" src="https://img.shields.io/badge/backend-Node.js%20%2F%20Express-green" />
  <img alt="db" src="https://img.shields.io/badge/database-MongoDB-brightgreen" />
  <img alt="auth" src="https://img.shields.io/badge/auth-JWT%20(email%20%2F%20password)-blue" />
</p>

> **Note:** Authentication is handled with a standard **email/password + JWT** flow. There is **no Google OAuth** in the current backend.

---

## 📋 Table of Contents

- [Backend Overview](#-backend-overview)
- [High-Level Architecture](#-high-level-architecture)
- [Backend Folder Structure](#-backend-folder-structure)
- [Request Lifecycle](#-request-lifecycle)
- [Authentication Flow (JWT)](#-authentication-flow-jwt)
- [Middleware Pipeline](#-middleware-pipeline)
- [Core Modules](#-core-modules)
  - [Hospital Search & Google Places Integration](#-hospital-search--google-places-integration)
  - [AI Recommendation Flow](#-ai-recommendation-flow)
  - [Feedback & Reviews](#-feedback--reviews)
  - [Admin Module](#-admin-module)
- [Data Models (Overview)](#-data-models-overview)
- [Error Handling](#-error-handling)
- [Security Practices](#-security-practices)

---

## 🧭 Backend Overview

The backend is a **Node.js + Express** application that exposes a REST API consumed by the React client. It is responsible for:

- Authenticating users with **email/password credentials and JWT sessions**
- Handling all business logic for hospital discovery, feedback, and reviews
- Talking to the **Google Places API** to fetch real-world hospital data
- Passing user requirements to the **AI recommendation layer**
- Persisting users, feedback, and reviews in **MongoDB**
- Providing protected admin-only endpoints for platform management

---

## 🏗️ High-Level Architecture

```mermaid
flowchart TD
    CLIENT["💻 Client (React)"] -->|"HTTPS / REST"| ROUTES

    subgraph SERVER[" Backend — Node.js / Express "]
        direction TB
        ROUTES["Routes"] --> MID["Middleware<br/>(auth, validation, error handling)"]
        MID --> CTRL["Controllers"]
        CTRL --> SVC["Services<br/>(business logic)"]
        SVC --> MODEL["Models<br/>(Mongoose schemas)"]
    end

    MODEL <--> DB[("🗄️ MongoDB")]
    SVC -->|"hospital data"| GP["🌐 Google Places API"]
    SVC -->|"requirement text"| AI["🤖 AI Recommendation Layer"]

    CTRL -->|"JWT"| AUTHM["🔑 Auth Middleware"]
    AUTHM --> CTRL

    classDef client fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e;
    classDef server fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef ext fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    classDef db fill:#ede9fe,stroke:#7c3aed,color:#4c1d95;

    class CLIENT client;
    class SERVER,ROUTES,MID,CTRL,SVC,MODEL,AUTHM server;
    class GP,AI ext;
    class DB db;
```

---

## 📁 Backend Folder Structure

```
server/
│
├── src/
│   ├── routes/          # Defines all API endpoints, grouped by feature
│   ├── controllers/     # Receives requests, calls services, sends responses
│   ├── services/        # Core business logic (hospital search, AI calls, feedback rules)
│   ├── models/          # Mongoose schemas (User, Feedback, Review, etc.)
│   ├── middleware/       # Auth (JWT), validation, error handling
│   ├── validators/      # Request payload validation rules
│   ├── utils/            # Helper functions (JWT signing, password hashing, formatting)
│   └── config/           # Environment config, DB connection, API keys
│
└── package.json
```

---

## 🔄 Request Lifecycle

Every API request — whether it's a search, a login, or a feedback submission — follows the same general path through the backend.

```mermaid
sequenceDiagram
    actor User
    participant Client as Client (React)
    participant Route as Route
    participant Mid as Middleware
    participant Ctrl as Controller
    participant Svc as Service
    participant DB as MongoDB

    User->>Client: Performs an action
    Client->>Route: HTTP request (with JWT, if protected)
    Route->>Mid: Pass through middleware
    Mid->>Mid: Validate token / request body
    Mid->>Ctrl: Forward valid request
    Ctrl->>Svc: Call relevant service
    Svc->>DB: Read / write data
    DB-->>Svc: Return result
    Svc-->>Ctrl: Return processed data
    Ctrl-->>Client: JSON response
    Client-->>User: Updated UI
```

---

## 🔑 Authentication Flow (JWT)

Authentication uses a standard **email/password signup and login flow**, backed by hashed passwords and JWT-based sessions — there is no third-party OAuth provider involved.

### Signup

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant API as Auth Controller
    participant Hash as Password Hasher
    participant DB as MongoDB

    User->>Client: Enter name, email, password
    Client->>API: POST /api/auth/signup
    API->>Hash: Hash password (bcrypt)
    Hash-->>API: Hashed password
    API->>DB: Save new user
    DB-->>API: User created
    API-->>Client: Success response
```

### Login

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant API as Auth Controller
    participant DB as MongoDB
    participant JWT as JWT Signer

    User->>Client: Enter email, password
    Client->>API: POST /api/auth/login
    API->>DB: Find user by email
    DB-->>API: User record (hashed password)
    API->>API: Compare password with hash
    API->>JWT: Sign token (user id, role)
    JWT-->>API: Signed JWT
    API-->>Client: Return JWT
    Client->>Client: Store token (e.g. localStorage)
```

### Authenticated Request

```mermaid
flowchart LR
    A["📨 Request with<br/>JWT in header"] --> B["🔑 Auth Middleware"]
    B --> C{"Token valid?"}
    C -->|Yes| D["Attach user to request"]
    D --> E["Continue to Controller"]
    C -->|No| F["❌ 401 Unauthorized"]

    classDef ok fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef bad fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class A,B,D,E ok;
    class C,F bad;
```

| Aspect | Detail |
|---|---|
| Credentials | Email + password |
| Password Storage | Hashed (never stored in plain text) |
| Session | Stateless — JWT sent with each request |
| Protected Routes | Verified via auth middleware before reaching controllers |

---

## 🧩 Middleware Pipeline

Every incoming request passes through a consistent middleware chain before reaching business logic, keeping validation, auth, and error handling centralized.

```mermaid
flowchart LR
    REQ["📨 Incoming Request"] --> V["✅ Body / Query<br/>Validation"]
    V --> AUTH["🔑 JWT Auth Check<br/>(protected routes only)"]
    AUTH --> ROLE["🛡️ Role Check<br/>(admin routes only)"]
    ROLE --> CTRL["🎯 Controller"]
    CTRL --> ERR["⚠️ Error Handler<br/>(on failure)"]
    CTRL --> RES["📤 Response"]
    ERR --> RES

    classDef step fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e;
    classDef err fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class REQ,V,AUTH,ROLE,CTRL,RES step;
    class ERR err;
```

---

## 🧠 Core Modules

### 🏥 Hospital Search & Google Places Integration

All location-based search endpoints (nearby, state, district, name) follow the same pattern: the backend receives search parameters, forwards them to the Google Places API, and normalizes the response before sending it to the client.

```mermaid
flowchart TD
    A["📨 Search Request<br/>(location / state / district / name)"] --> B["🎯 Hospital Controller"]
    B --> C["⚙️ Hospital Service"]
    C --> D["🌐 Google Places API"]
    D --> E["📦 Raw Places Data"]
    E --> F["🧹 Normalize / Format<br/>Response"]
    F --> G["📤 JSON Response<br/>to Client"]

    classDef step fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef ext fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class A,B,C,F,G step;
    class D,E ext;
```

---

### 🤖 AI Recommendation Flow

The AI recommendation endpoint accepts a free-text requirement from the user, passes it to the AI layer along with available hospital context, and returns a ranked shortlist.

```mermaid
flowchart TD
    A["📨 User requirement<br/>(text)"] --> B["🎯 Recommendation<br/>Controller"]
    B --> C["⚙️ Recommendation<br/>Service"]
    C --> D["🤖 AI Layer<br/>(prompt + schema)"]
    D --> E["📋 Ranked hospital<br/>suggestions"]
    E --> F["📤 JSON Response<br/>to Client"]

    classDef step fill:#fef9c3,stroke:#ca8a04,color:#713f12;
    class A,B,C,D,E,F step;
```

---

### ⭐ Feedback & Reviews

Feedback and review submissions are validated, tied to the authenticated user and the selected hospital (identified via its Google Places ID), and persisted to MongoDB.

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant Ctrl as Feedback Controller
    participant Val as Validator
    participant DB as MongoDB

    User->>Client: Submit feedback / review
    Client->>Ctrl: POST /api/feedback (JWT + hospitalId + content)
    Ctrl->>Val: Validate payload
    Val-->>Ctrl: Valid
    Ctrl->>DB: Save feedback linked to user + hospital
    DB-->>Ctrl: Saved record
    Ctrl-->>Client: Confirmation response
```

---

### 🛡️ Admin Module

Admin endpoints are protected by both authentication and a role check, ensuring only admin accounts can access user, feedback, and data-management operations.

```mermaid
flowchart TD
    A["📨 Admin Request"] --> B["🔑 JWT Auth Check"]
    B --> C{"Role == admin?"}
    C -->|Yes| D["🎯 Admin Controller"]
    D --> E["👥 Manage Users"]
    D --> F["⭐ Manage Feedback"]
    D --> G["📊 Manage Healthcare Data"]
    C -->|No| H["❌ 403 Forbidden"]

    classDef ok fill:#ede9fe,stroke:#7c3aed,color:#4c1d95;
    classDef bad fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class A,B,D,E,F,G ok;
    class C,H bad;
```

---

## 🗄️ Data Models (Overview)

```mermaid
erDiagram
    USER {
        string id
        string name
        string email
        string passwordHash
        string role
        date createdAt
    }

    FEEDBACK {
        string id
        string userId
        string hospitalPlaceId
        number rating
        string category
        string comment
        date createdAt
    }

    REVIEW {
        string id
        string userId
        string hospitalPlaceId
        string experienceText
        date createdAt
    }

    USER ||--o{ FEEDBACK : submits
    USER ||--o{ REVIEW : writes
```

| Model | Purpose |
|---|---|
| **User** | Stores account details, hashed password, and role (user / admin) |
| **Feedback** | Structured feedback linked to a user and a Google Places hospital ID |
| **Review** | Free-text experience shared by a user for a specific hospital |

> Hospital records themselves are **not duplicated** in the database — hospital identity is referenced by its Google Places ID, and live details are fetched from the Google Places API on demand.

---

## ⚠️ Error Handling

All errors flow through a centralized error-handling middleware so that clients always receive a consistent response shape.

```mermaid
flowchart LR
    A["⚙️ Error thrown<br/>anywhere in request flow"] --> B["🧯 Central Error<br/>Middleware"]
    B --> C["📋 Format error<br/>(status + message)"]
    C --> D["📤 JSON error<br/>response"]

    classDef step fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class A,B,C,D step;
```

---

## 🔒 Security Practices

| Practice | Description |
|---|---|
| Password Hashing | Passwords hashed (bcrypt) before storage — never stored in plain text |
| JWT Sessions | Stateless tokens signed with a server-side secret |
| Route Protection | Auth middleware guards protected/admin routes |
| Role-Based Access | Admin routes additionally check user role before proceeding |
| Input Validation | Request payloads validated before reaching business logic |
| Centralized Errors | Errors handled consistently, avoiding leaked internals in responses |