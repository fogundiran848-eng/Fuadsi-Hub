# FUADSI CBT Platform

**Federal University of Agriculture and Development Studies, Iragbiji** — Computer-Based Test (CBT) System

A production-level, secure, timed, and monitored examination platform built with Node.js, Express, and MongoDB.

---

## Features

### Student Portal
- Secure login with matric number and password
- Department-based course filtering (students only see their department's exams)
- Server-validated exam timer with auto-submit on timeout
- Slide-based question navigation (preserved from original design)
- Real-time answer auto-save every 30 seconds
- View results and download PDF result slips
- Resume interrupted exams

### Admin Dashboard (`/admin`)
- Secure admin login with JWT authentication
- Dashboard overview with student/course/question/result counts
- **Student Management**: Create, edit, delete students; bulk import via JSON
- **Course Management**: Create, edit, delete courses; set status (active/pending/closed); allow retakes
- **Question Management**: Add/edit/delete questions per course; bulk JSON upload
- **Result Management**: View all results; reset results to allow retakes

### Security
- JWT authentication for all API routes
- Passwords hashed with bcrypt (12 rounds)
- Correct answers **never** exposed to frontend
- Server-side exam duration validation with 30-second grace period
- Department-based access control enforced on backend
- Rate limiting on API and login routes
- Input validation on all endpoints
- Helmet security headers

### Anti-Cheat System
- Tab switch detection (auto-submit after 5 switches)
- Right-click disabled during exam
- Copy/paste/cut blocked during exam
- Keyboard shortcuts blocked (Ctrl+C, Ctrl+V, Ctrl+U, F12)
- Suspicious activity logging to database

### Result System
- Server-side scoring (answers checked against DB, never client-side)
- Grade calculation (A/B/C/D/E/F scale)
- Downloadable PDF result slips
- Multiple submission prevention

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **PDF Generation**: PDFKit
- **Security**: Helmet, express-rate-limit, express-validator
- **Frontend**: Vanilla HTML/CSS/JS (no framework dependency)

---

## Project Structure

```
fuadsi-cbt/
├── server.js              # Express server entry point
├── package.json
├── seed.js                # Database seeder with sample data
├── .env.example           # Environment variables template
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # Student/Admin model
│   ├── Course.js          # Course model
│   ├── Question.js        # Question model (q, options, a)
│   ├── ExamSession.js     # Exam session tracking
│   └── Result.js          # Exam results
├── middleware/
│   └── auth.js            # JWT auth + admin guard
├── routes/
│   ├── auth.js            # /api/auth (login, register, me)
│   ├── courses.js         # /api/courses (list, get)
│   ├── exam.js            # /api/exam (start, submit, save, log)
│   ├── results.js         # /api/results (list, get, PDF)
│   └── admin.js           # /api/admin (CRUD for all entities)
├── utils/
│   ├── grading.js         # Grade calculation
│   └── pdfGenerator.js    # PDF result slip generator
└── public/
    ├── index.html         # Student exam portal
    └── admin.html         # Admin dashboard
```

---

## Setup & Installation

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v6 or higher (local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/fogundiran848-eng/fuadsi-cbt.git
cd fuadsi-cbt
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fuadsi-cbt
JWT_SECRET=your_secure_secret_here
JWT_EXPIRES_IN=8h
ADMIN_SETUP_KEY=your_admin_setup_key
```

### 4. Seed the Database

```bash
npm run seed
```

This creates:
- **Admin account**: matric=`admin`, password=`admin123`
- **Sample students** across different departments
- **5 courses** with full question sets (ECO101, ACC101, BUA101, ENT101, GST101)

### 5. Start the Server

```bash
npm start
```

The server runs on `http://localhost:5000`.

---

## Usage

### Student Portal

1. Open `http://localhost:5000`
2. Login with a student matric number and password
3. Only courses for your department will be displayed
4. Click "Start Examination" on an active exam
5. Answer questions using the slide navigation
6. Submit when done or wait for auto-submit on timeout
7. View results and download PDF result slip

### Admin Dashboard

1. Open `http://localhost:5000/admin`
2. Login with admin credentials (matric=`admin`, password=`admin123`)
3. Manage students, courses, questions, and results

### Default Test Credentials

| Role | Matric | Password | Department |
|------|--------|----------|------------|
| Admin | admin | admin123 | — |
| Student | 111 | 111 | Economics |
| Student | 222 | 222 | Accounting |
| Student | 333 | 333 | Business Administration |
| Student | 444 | 444 | Computer Science |
| Student | 2500101 | favour | Economics |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` — Student/Admin login
- `POST /api/auth/register` — Register new user
- `GET /api/auth/me` — Get current user

### Courses
- `GET /api/courses` — List courses (filtered by department for students)
- `GET /api/courses/:courseId` — Get course details

### Exam
- `POST /api/exam/start` — Start exam session
- `POST /api/exam/submit` — Submit exam answers
- `POST /api/exam/save-progress` — Auto-save answers
- `POST /api/exam/log-activity` — Log suspicious activity

### Results
- `GET /api/results` — Student's results
- `GET /api/results/:courseId` — Result for specific course
- `GET /api/results/:courseId/pdf` — Download PDF result slip

### Admin (all require admin JWT)
- `GET/POST /api/admin/students` — List/Create students
- `PUT/DELETE /api/admin/students/:id` — Update/Delete student
- `POST /api/admin/students/bulk` — Bulk import students
- `GET/POST /api/admin/courses` — List/Create courses
- `PUT/DELETE /api/admin/courses/:courseId` — Update/Delete course
- `GET /api/admin/questions/:courseId` — List questions
- `POST /api/admin/questions` — Add question
- `POST /api/admin/questions/bulk` — Bulk import questions
- `PUT/DELETE /api/admin/questions/:id` — Update/Delete question
- `GET /api/admin/results` — All results
- `DELETE /api/admin/results/:id` — Reset result
- `POST /api/admin/results/reset` — Reset by matric + courseId
- `GET /api/admin/stats` — Dashboard statistics

---

## Question Format

Questions follow the original structure:

```json
{
  "q": "What is the capital of Nigeria?",
  "options": ["Lagos", "Abuja", "Kano", "Ibadan"],
  "a": 1
}
```

- `q`: Question text
- `options`: Array of answer options
- `a`: Zero-based index of the correct answer

---

## License

MIT
