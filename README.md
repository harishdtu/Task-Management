# ⚡ TaskFlow — Team Task Manager

A full-stack project & task management app with role-based access control, built with **React + Vite** and **Node.js + Express + MongoDB**.

---

## 🚀 Live Demo

- **Frontend:** `[https://taskflow-frontend.up.railway.ap](https://task-management-jade-five.vercel.app/)p`
- **Backend API:** `[https://taskflow-backend.up.railway.app](https://task-management-v0s3.onrender.com/)`

**Demo Credentials:**
```
Admin:  admin@taskflow.dev / admin123
Member: member@taskflow.dev / member123
```

---

## ✨ Features

### Authentication & Users
- JWT-based signup/login with bcrypt password hashing
- Role-based access: **Admin** (full control) vs **Member** (collaborate)
- Persistent sessions with token auto-refresh
- Profile management with auto-generated avatars

### Projects
- Create, edit, archive, and delete projects
- Custom color-coded project cards with progress tracking
- Invite team members by email with role assignment (Admin/Member)
- Remove members and auto-unassign their tasks

### Tasks & Kanban Board
- Full task CRUD: title, description, assignee, priority, due date, tags
- **4-column Kanban board**: To Do → In Progress → In Review → Done
- **List view** with inline status change dropdowns
- Priority levels: Low / Medium / High / Critical (color-coded)
- Overdue detection with visual warnings
- Threaded comments per task

### Dashboard
- Stats: projects, my tasks, total tasks, overdue count
- Task progress chart by status
- Open tasks breakdown by priority
- Recent activity feed across all projects

### Access Control
- System Admin: manage all projects, users, and roles
- Project Admin: manage members, tasks, and project settings
- Member: create & update tasks, add comments

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router v6, Axios |
| Styling | Pure CSS (custom design system, dark mode) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose ODM |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Deployment | Railway (both services) |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema + password hashing
│   │   ├── Project.js       # Project schema with members
│   │   └── Task.js          # Task schema with comments
│   ├── routes/
│   │   ├── auth.js          # Register, login, /me
│   │   ├── projects.js      # CRUD + member management
│   │   ├── tasks.js         # CRUD + comments + dashboard
│   │   └── users.js         # User search + role management
│   ├── middleware/
│   │   ├── auth.js          # JWT verification + role guards
│   │   └── validate.js      # Request validation rules
│   └── server.js            # Entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout.jsx       # Sidebar navigation
        │   ├── TaskModal.jsx    # Create/edit task + comments
        │   ├── ProjectModal.jsx # Create/edit project
        │   └── MembersModal.jsx # Team management
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── ProjectsPage.jsx
        │   ├── ProjectDetailPage.jsx  # Kanban + list
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── ProfilePage.jsx
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        └── utils/
            ├── api.js           # Axios instance + interceptors
            └── helpers.js       # Date formatting, utilities
```

---

## 🔧 Local Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/taskflow.git

# Backend
cd taskflow/backend
npm install
cp .env.example .env    # Fill in your values

# Frontend
cd ../frontend
npm install
cp .env.example .env    # Set VITE_API_URL
```

### 2. Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskflow
JWT_SECRET=your_secret_min_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

App runs at `http://localhost:5173`

---

## 🌐 Deploy to Railway

### Step 1: Push to GitHub
```bash
git init && git add . && git commit -m "init: taskflow full-stack"
git remote add origin https://github.com/you/taskflow.git
git push -u origin main
```

### Step 2: Deploy Backend
1. Go to https://render.com/ → New Project → GitHub repo
2. Select the **backend** folder as root
3. Add env vars:
   - `MONGODB_URI` (from MongoDB Atlas)
   - `JWT_SECRET` (generate: `openssl rand -base64 32`)
   - `FRONTEND_URL` (your Railway frontend URL, add after frontend deploy)
   - `NODE_ENV=production`
4. Copy the generated backend URL

### Step 3: Deploy Frontend
1. New Service → same repo, **frontend** folder as root
2. Add env var: `VITE_API_URL=https://your-backend.up.railway.app/api`
3. Build command: `npm install && npm run build`
4. Start command: `npx serve dist -p $PORT`

### Step 4: Update CORS
Set `FRONTEND_URL` in backend env vars to your frontend Railway URL.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project + tasks |
| POST | `/api/projects/:id/members` | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?project=id` | List tasks (with filters) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task with comments |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| GET | `/api/tasks/dashboard/summary` | Dashboard stats |

---

## 🔐 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire in 7 days
- All sensitive routes protected by auth middleware
- Role checks: system admin, project admin, and member levels
- Input validation on all POST/PATCH routes
- MongoDB injection protection via Mongoose

---

## 📄 License

MIT — free to use and modify.
