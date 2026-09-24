# 🛡️ Swasth Setu — Admin Interaction Guide

> A quick look at how an admin moves through Swasth Setu, from login to managing the platform.

---

## 🔄 Admin Flow

```mermaid
flowchart TD
    A(["🛡️ Admin"]) --> B["🔐 Login<br/>(email + password)"]
    B --> C{"Role == admin?"}
    C -->|No| X(["❌ Access Denied"])
    C -->|Yes| D["🛡️ Admin Dashboard"]

    D --> E["👥 Monitor<br/>Registered Users"]
    D --> F["⭐ Review & Manage<br/>Feedback / Reviews"]
    D --> G["📊 Manage Healthcare<br/>Data"]
    D --> H["📈 Review Platform<br/>Activity"]

    E & F & G & H --> I(["✅ Platform Kept<br/>Up to Date"])

    classDef entry fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e;
    classDef admin fill:#ede9fe,stroke:#7c3aed,color:#4c1d95;
    classDef deny fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    classDef result fill:#fef9c3,stroke:#ca8a04,color:#713f12;

    class A,B entry;
    class C,D,E,F,G,H admin;
    class X deny;
    class I result;
```

---

## 🧭 Step-by-Step

| Step | What the Admin Does | What Happens |
|---|---|---|
| 1️⃣ | Logs in with email & password | Identity verified via JWT |
| 2️⃣ | Role is checked on login | Only `admin` accounts reach the dashboard |
| 3️⃣ | Opens the Admin Dashboard | Centralized view of the platform |
| 4️⃣ | Monitors registered users | Visibility into who's using the platform |
| 5️⃣ | Reviews feedback & reviews | Can moderate or act on user submissions |
| 6️⃣ | Manages healthcare data | Keeps hospital-related data organized |
| 7️⃣ | Reviews platform activity | Overall oversight of what's happening |

---

## 🔑 Admin vs. Regular User Access

```mermaid
flowchart LR
    U(["👤 Regular User"]) --> UA["Search • View • Give Feedback"]
    AD(["🛡️ Admin"]) --> ADA["Everything a User Can Do<br/>+ Monitor & Manage the Platform"]

    classDef user fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e;
    classDef admin fill:#ede9fe,stroke:#7c3aed,color:#4c1d95;
    class U,UA user;
    class AD,ADA admin;
```

Admin access is gated by a **role check after login** — the same authentication flow as regular users, with an extra permission layer before reaching admin-only routes.