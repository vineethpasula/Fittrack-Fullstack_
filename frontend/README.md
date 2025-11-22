
# FitTrack Fullstack Application

A complete full-stack fitness management system built for **CS 665 – Database Systems** project requirements.  
The system includes **React frontend**, **Flask backend**, **SQLite database**, and full **CRUD operations** across all major entities.

---

## 📌 Features

### **1. User Roles & Access Control**
The system supports 3 roles with restricted access:

| Role     | Capabilities |
|----------|--------------|
| **Admin** | Full access to all modules (Members, Trainers, Classes, Workouts, Payments, Registrations, Dashboard) |
| **Trainer** | Can view members, view workouts assigned to them, and update workouts |
| **Member** | Can only view their own workouts and profile details |

Role-based UI restrictions are enforced in React using `currentRole`.

---

## 📌 2. Technology Stack

### **Frontend**
- React.js
- React Router
- Chart.js
- CSS custom UI

### **Backend**
- Python Flask
- Flask-CORS
- SQLite3 database
- REST API architecture

### **Database**
SQLite with 8 tables:
- Members
- Trainers
- Classes
- Workouts
- Payments
- Registrations
- Memberships
- Dashboard statistics views

---

## 📌 3. CRUD Functionality

Each module includes:
- Create  
- Read  
- Update  
- Delete  

Modules:
- Members  
- Trainers  
- Classes  
- Workouts  
- Registrations  
- Payments  

All tested via React UI and Flask API.

---

## 📌 4. Dashboard

The dashboard displays:
- Total users  
- Total memberships  
- Total classes  
- Total payments  
- Bar chart of membership plans  

Chart.js is used for visualization.

---

## 📌 5. Authentication (Simplified for Project Requirements)

Login page using email + role selection.  
Current user details stored in:

```
localStorage.setItem("currentUser", JSON.stringify(user));
localStorage.setItem("currentRole", user.role);
```

Used throughout the React app for UI restrictions.

---

## 📌 6. How to Run

### **Backend (Flask)**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Runs at:
```
http://localhost:5000
```

---

### **Frontend (React)**

```bash
cd frontend
npm install
npm start
```

Runs at:
```
http://localhost:3000
```

---

## 📌 7. Database Setup

Database is auto-created on first run.

To reset the DB:

```bash
rm fittrack.db
python app.py
```

Tables are created using SQL definitions in the backend.

---

## 📌 8. GitHub Commit Requirements

The project includes **10+ meaningful commits**, such as:
- “Initialized Flask backend”
- “Added CRUD operations for classes”
- “Integrated React with Flask API”
- “Implemented role-based access control”
- “UI update for workouts module”

---

## 📌 9. Project Folder Structure

```
FITTRACK-FULLSTACK/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── fittrack_seed.sql
│   ├── fittrack.db
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── public/
│   ├── node_modules/
│   └── src/
│       ├── api.js
│       ├── App.js
│       ├── App.test.js
│       ├── index.js
│       ├── index.css
│       ├── components/
│       │   └── ClassForm.js
│       └── pages/
│           ├── Login.js
│           ├── Dashboard.js
│           ├── Classes.js
│           ├── Members.js
│           ├── Payments.js
│           ├── Trainers.js
│           ├── Registrations.js
│           ├── Workouts.js
├── package.json
├──package-lock.json
└── README.md

```

---

## 📌 10. Screenshots Included

The project includes UI screenshots:
- Dashboard  
- CRUD pages  
- Role login  
- Restricted access  

---

## 📌 11. Instructor Requirements Covered

✔ Full-stack design  
✔ Database creation  
✔ Inserted data (10 rows per table)  
✔ CRUD  
✔ Frontend–backend integration  
✔ GitHub commits  
✔ Final submission ZIP  

---

## 📌 12. Author

**Vineeth Pasula**  
CS 665 – Database Systems  
Wichita State University  

---

## ✔ End of README
