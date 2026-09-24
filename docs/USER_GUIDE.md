# 🧑‍💻 Swasth Setu — User Interaction Guide

> A quick look at how a user moves through Swasth Setu, from signing up to sharing feedback.

---

## 🔄 User Flow

```mermaid
flowchart TD
    A(["👤 New / Returning User"]) --> B["🔐 Sign Up / Login<br/>(email + password)"]
    B --> C["🏠 Healthcare Dashboard"]

    C --> D["🤖 Ask AI for a<br/>Recommendation"]
    C --> E["📍 Browse Nearby<br/>Hospitals"]
    C --> F["🗺️ Search by<br/>State / District"]
    C --> G["🔎 Search by<br/>Hospital Name"]

    D --> H["🏥 View Hospital<br/>Details"]
    E --> H
    F --> H
    G --> H

    H --> I["⭐ Submit Feedback<br/>/ Write a Review"]
    I --> J(["✅ Experience Shared"])

    classDef entry fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e;
    classDef action fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef result fill:#fef9c3,stroke:#ca8a04,color:#713f12;

    class A,B,C entry;
    class D,E,F,G,H,I action;
    class J result;
```

---

## 🧭 Step-by-Step

| Step | What the User Does | What They Get |
|---|---|---|
| 1️⃣ | Signs up or logs in with email & password | A secure, personal session |
| 2️⃣ | Lands on the Healthcare Dashboard | Access to all discovery options |
| 3️⃣ | Picks a way to search — AI recommendation, nearby, state/district, or name | A relevant list of hospitals |
| 4️⃣ | Opens a hospital's details page | Location, contact, ratings, and past feedback |
| 5️⃣ | Submits feedback or a review | Their experience saved and linked to that hospital |

---

## 👥 Two Types of Users

```mermaid
flowchart LR
    U(["👤 Regular User"]) --> UA["Search • View • Give Feedback"]
    AD(["🛡️ Admin"]) --> ADA["Monitor Users • Manage Feedback • Manage Data"]

    classDef user fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e;
    classDef admin fill:#ede9fe,stroke:#7c3aed,color:#4c1d95;
    class U,UA user;
    class AD,ADA admin;
```

A **regular user** discovers hospitals and shares feedback. An **admin** oversees the platform — users, feedback, and healthcare data — through a separate dashboard.