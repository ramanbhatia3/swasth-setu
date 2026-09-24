# Project Structure

This document outlines the folder and file structure for the **Swasth-Setu** project. The project is split into two main parts: a React frontend (`client`) and a Node.js/Express backend (`server`).

## High-Level Architecture

```text
d:\Zackathon\
├── client/              # React frontend application
├── server/              # Node.js + Express backend application
├── docs/                # Project documentation (implied from markdown files)
│   ├── ADMIN_GUIDE.md
│   ├── BACKEND_GUIDE.md
│   ├── FEATURES.md
│   ├── FRONTEND_GUIDE.md
│   ├── PROBLEM_STATEMENT.md
│   └── USER_GUIDE.md
├── README.md            # Main project description
└── STRUCTURE.md         # This file
```

---

## Frontend (`client/`)

The frontend is built using React and Vite. It utilizes various pages and components to deliver the user interface.

```text
client/
├── public/              # Static assets like images and icons
├── src/                 # Main source code for React
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (Header, Footer, Sidebar, etc.)
│   │   ├── MacroInsightsWidget.jsx
│   │   └── ScrollToTop.jsx
│   ├── context/         # React Context providers for global state management
│   ├── pages/           # Application views/routes
│   │   ├── AdminDashboard.jsx  # Admin management interface
│   │   ├── AiReport.jsx        # AI-driven health reports
│   │   ├── CompareHospitals.jsx# Hospital comparison tool
│   │   ├── Feedback.jsx        # User feedback form
│   │   ├── FindServices.jsx    # Search for medical services
│   │   ├── Home.jsx            # Landing page
│   │   ├── HospitalDetails.jsx # Detailed view of a hospital
│   │   ├── Login.jsx           # User login
│   │   ├── Map.jsx             # Interactive map for healthcare facilities
│   │   ├── MedicalRecords.jsx  # Patient medical records view
│   │   ├── Profile.jsx         # User profile management
│   │   ├── Register.jsx        # User registration
│   │   └── Specialists.jsx     # View and search for specialists
│   ├── App.jsx          # Main application component & routing setup
│   ├── main.jsx         # Entry point for React
│   └── i18n.js          # Internationalization setup (i18next)
├── index.html           # Main HTML template
├── index.css            # Global CSS styles
├── package.json         # Frontend dependencies and scripts
└── vite.config.js       # Vite configuration
```

---

## Backend (`server/`)

The backend is built using Node.js, Express, and presumably a database like MongoDB or PostgreSQL (managed via Mongoose or Sequelize). 

```text
server/
├── config/              # Database connection and environment configurations
├── controllers/         # Core business logic for API endpoints
├── middleware/          # Express middleware (e.g., authentication, error handling)
├── models/              # Database schema definitions
├── routes/              # API route definitions
│   ├── adminRoutes.js   # Routes for admin operations
│   ├── aiRoutes.js      # Routes for AI reporting features
│   ├── authRoutes.js    # Routes for login/registration
│   ├── doctorRoutes.js  # Routes for managing doctors/specialists
│   ├── hospitalRoutes.js# Routes for hospital data
│   ├── profileRoutes.js # Routes for user profiles
│   ├── recordRoutes.js  # Routes for medical records
│   ├── reportRoutes.js  # Routes for various reports
│   └── reviewRoutes.js  # Routes for reviews and feedback
├── seeders/             # Scripts to populate the database with initial data
├── uploads/             # Directory for storing user-uploaded files
├── utils/               # Helper functions and utilities
├── app.js               # Express app configuration
├── server.js            # Entry point to start the Node.js server
├── package.json         # Backend dependencies and scripts
└── .env                 # Environment variables (not tracked in Git)
```
