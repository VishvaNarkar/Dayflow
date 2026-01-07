
# 🚀 Dayflow — Simple Attendance & Leave Management System

Dayflow is a lightweight **HR attendance & leave management system** built during a hackathon using **Node.js, Express, SQLite, and Vanilla JavaScript**.  
It demonstrates a **secure, role-based HR workflow** with JWT authentication and real-time approvals.

---

## 🎯 Key Features

### 👤 Employee
- Secure login & registration
- Daily **Check-In / Check-Out**
- View personal attendance history
- Apply for leave & track status

### 🧑‍💼 HR / Admin
- Secure HR login
- View employee attendance by date
- Approve or deny leave requests
- Role-based access control

---

## 🧱 Tech Stack

- **Frontend:** HTML, CSS, Bootstrap, JavaScript
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Token)

---

## 📂 Project Folder Structure

````

DAYFLOW/
│
├── node_modules/              # Installed dependencies
│
├── public/                    # Frontend (static files)
│   ├── css/
│   │   ├── login.css
│   │   └── signup.css
│   │
│   ├── js/
│   │   ├── auth.js            # Login & signup logic
│   │   ├── dashboard.js       # Employee dashboard logic
│   │   ├── admin.js           # HR dashboard logic
│   │   └── leaves.js          # Leave management logic
│   │
│   ├── login.html             # Login page
│   ├── signup.html            # Signup page
│   ├── dashboard.html         # Employee dashboard
│   ├── admin.html             # HR dashboard
│   └── leaves.html            # Leave application page
│
├── server/                    # Backend (Express API)
│   ├── routes/
│   │   ├── auth.js             # Auth routes (login/register)
│   │   ├── attendance.js       # Attendance APIs
│   │   └── leaves.js           # Leave APIs
│   │
│   ├── auth.js                 # JWT verification middleware
│   ├── db.js                   # SQLite DB connection
│   └── server.js               # Express app entry point
│
├── database.sqlite             # SQLite database file
├── package.json                # Project metadata & scripts
├── package-lock.json
├── .gitignore
└── README.md                   # Project documentation

````

---

## ⚙️ Installation & Running the Project

### 1. Clone the repo:

```bash
git clone https://github.com/VishvaNarkar/Dayflow.git
cd Dayflow
```

### 2️. Install dependencies:

```bash
npm install
```

### 3. Start the server:

```bash
npm start
```

The application runs at:

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

* Users log in using email & password
* Server returns a **JWT token**
* Token is stored in `localStorage`
* Token is sent in the `Authorization` header for protected APIs

> ⚠️ Current implementation expects the raw token (no `Bearer` prefix).

---

## 🌐 API Endpoints Overview

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/users` *(HR only)*

### Attendance

* `POST /api/attendance/checkin`
* `POST /api/attendance/checkout`
* `GET /api/attendance/my`
* `GET /api/attendance/list?date=YYYY-MM-DD` *(HR only)*

### Leave

* `POST /api/leave/apply`
* `GET /api/leave/my`
* `GET /api/leave/pending` *(HR only)*
* `POST /api/leave/decision/:id` *(HR only)*


---

## 🏆 Hackathon Focus

This project prioritizes:

* ✅ End-to-end working flow
* ✅ Clean architecture
* ✅ Role-based access control
* ✅ Real database usage
* ✅ Secure authentication

---

## 🚧 Future Improvements

* Use `Authorization: Bearer <token>` format
* Add charts & analytics dashboard
* Improve UI & validation
* Add automated tests

---

## 👨‍💻 Authors

Built with ❤️ during a hackathon by **Team Dayflow**

**Vishva Narkar** 

**Om Prajapati**

**Vishal Mali**

---
