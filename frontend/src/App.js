// src/App.js
import React, { useState } from "react";
import "./index.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Members from "./pages/Members";
import Payments from "./pages/Payments";
import Trainers from "./pages/Trainers";
import Registrations from "./pages/Registrations";
import Workouts from "./pages/Workouts";

const ALL_TABS = [
  { id: "dashboard", label: "Dashboard", roles: ["admin", "trainer", "member"] },
  { id: "classes", label: "Classes", roles: ["admin", "trainer", "member"] },
  { id: "members", label: "Members", roles: ["admin"] },
  { id: "payments", label: "Payments", roles: ["admin"] },
  { id: "trainers", label: "Trainers", roles: ["admin"] },
  { id: "registrations", label: "Registrations", roles: ["admin", "trainer", "member"] },
  { id: "workouts", label: "Workouts", roles: ["admin", "trainer", "member"] },
];

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem("fittrack_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("fittrack_user", JSON.stringify(user));
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("fittrack_user");
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const role = currentUser.role || "member";
  const visibleTabs = ALL_TABS.filter((t) => t.roles.includes(role));

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard currentUser={currentUser} />;
      case "classes":
        return <Classes currentUser={currentUser} />;
      case "members":
        return <Members currentUser={currentUser} />;
      case "payments":
        return <Payments currentUser={currentUser} />;
      case "trainers":
        return <Trainers currentUser={currentUser} />;
      case "registrations":
        return <Registrations currentUser={currentUser} />;
      case "workouts":
        return <Workouts currentUser={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="app-title">FitTrack Admin</div>
          <span className="user-pill">
            ({currentUser.role}) • ID: {currentUser.user_id}
          </span>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </header>

      <nav className="nav-tabs">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active-tab" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="page-container">{renderContent()}</main>
    </div>
  );
}

export default App;
