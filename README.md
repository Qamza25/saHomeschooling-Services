# SA Homeschooling Services Directory

A full-stack web platform connecting homeschooling families in South Africa with verified tutors, therapists, curriculum providers, educational consultants, and enrichment specialists.

![Screenshot of the platform](frontend/public/Screenshot.png)

## Features

- **Public Directory** — Browse verified service providers
- **Provider Registration** — Multi-step form with plan selection (Community / Trusted / Deluxe)
- **Admin Dashboard** — Approve/reject providers, manage featured slots, moderate reviews
- **Provider Dashboard (Client Dashboard)** — Edit profile, upload documents, manage services & availability
- **Authentication** — Email/password login + role-based access (admin / provider)
- **File Uploads** — Certificates & police clearance documents (PDFs)
- **Responsive Design** — Works on desktop, tablet & mobile
- **LocalStorage Fallback** — Works offline / without real backend

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Context API (Auth & Notification)
- Font Awesome icons
- Custom CSS (no Tailwind / UI libraries)

### Backend
- Node.js + Express
- Prisma ORM (PostgreSQL)
- JWT Authentication
- File uploads (Multer)

### Storage (development)
- LocalStorage (providers, users, auth logs)
- Prisma + database (production / when backend is connected)

## Project Structure
SAHOMESCHOOLING-SERVICES/
├── backend/
│   ├── prisma/                 # Prisma schema & migrations
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── middlewares/        # Auth, validation, etc.
│   │   ├── routes/             # API endpoints
│   │   ├── config.js
│   │   ├── index.js
│   │   └── utils.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── Screenshot.png      # Main platform screenshot
│   ├── src/
│   │   ├── assets/             # Images, fonts, etc.
│   │   ├── components/         # Reusable UI pieces
│   │   ├── contexts/           # AuthContext, NotificationContext
│   │   ├── pages/              # Main views
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ClientDashboard.js
│   │   │   ├── HomePage.jsx
│   │   │   ├── Login.js
│   │   │   ├── Profile.js
│   │   │   ├── Registration.js
│   │   │   └── UserRegister.js
│   │   ├── services/           # API calls
│   │   ├── utils/              # Helpers & constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md
text## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- (Optional) PostgreSQL if using real database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SAHOMESCHOOLING-SERVICES

Install backend dependenciesBashcd backend
npm install
Install frontend dependenciesBashcd ../frontend
npm install
Set up environment variables (backend)Create .env in backend/ folder:envPORT=5000
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sahomeschooling?schema=public"
JWT_SECRET=your-very-long-secret-key-here
Run Prisma migrations (if using real DB)Bashcd backend
npx prisma migrate dev --name init
Start the backendBashnpm run dev→ API should be running at http://localhost:5000
Start the frontend (in another terminal)Bashcd frontend
npm run dev→ App opens at http://localhost:5173 (or similar)

Default Tests

/                 → Home / Directory
/login            → Login page
/register         → Provider registration (multi-step)
/client-dashboard → Provider edit dashboard
/admin-dashboard  → Admin control panel
/profile?id=xxx   → Public provider profile

Screenshots
<img src="frontend/public/Screenshot.png" alt="Platform Screenshot">
Development Notes

Currently using LocalStorage as primary storage for quick development
Backend API integration is prepared (auth, providers, file upload)
Switch to real database + API by uncommenting fetch calls in Registration.js and ClientDashboard.js

License
MIT

Built with for South African homeschooling families
© 2025 SA Homeschooling Services Directory
text### Next steps you may want to do:


   ```markdown
   <image-card alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" ></image-card>
   <image-card alt="Node.js" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" ></image-card>
   <image-card alt="Express" src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" ></image-card>
Let me know if you'd like to add sections like:

Deployment instructions
API documentation
Contributing guide
Roadmap
```

Happy coding! 🚀5.6sFast
