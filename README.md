# Team Task Manager

A complete production-ready web application for managing team projects and tasks.

##  Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Lucide React, Axios, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, Bcryptjs
- **Deployment:** Ready for Railway

## Features

- **Authentication:** Secure Signup/Login with JWT and password hashing.
- **Roles:** Admin and Member roles.
- **Project Management:** Admins can create projects and add members via email.
- **Task Management:** 
  - Admins can create and assign tasks within projects.
  - Members can view their assigned tasks and update status (To Do, In Progress, Done).
  - Filtering by project and status.
- **Dashboard:** Real-time stats for total, completed, in-progress, and overdue tasks.

##  Project Structure

```
team-task-manager/
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth state management
│   │   ├── pages/      # Application pages
│   │   └── services/   # API communication
├── server/             # Node.js backend
│   ├── config/         # Database connection
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth & Role checks
│   ├── models/         # Mongoose schemas
│   └── routes/         # API endpoints
└── README.md
```

##  Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` and add your MongoDB URI and JWT Secret.
4. Start the server: `npm start` (or `npm run dev` for development)

### Frontend Setup
1. Navigate to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Start the React app: `npm run dev`

## 🌐 Deployment (Railway)

### Backend
1. Push the code to GitHub.
2. Link your repository to Railway.
3. Add the environment variables (`MONGO_URI`, `JWT_SECRET`, etc.) in the Railway dashboard.
4. Railway will automatically detect the `start` script and deploy.

### Frontend
1. You can deploy the frontend on Vercel, Netlify, or Railway.
2. Ensure the `API_URL` in `src/services/api.js` points to your deployed backend.

## 📝 License
ISC
