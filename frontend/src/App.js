// src/App.js
import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Members from "./pages/Members";
import Payments from "./pages/Payments";
import Trainers from "./pages/Trainers";
import Registrations from "./pages/Registrations";
import Workouts from "./pages/Workouts";
import Login from "./pages/Login";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage("login");
  };

  const renderPage = () => {
    if (!user) {
      return <Login onLogin={handleLogin} />;
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "classes":
        return <Classes />;
      case "members":
        return <Members />;
      case "payments":
        return <Payments />;
      case "trainers":
        return <Trainers />;
      case "registrations":
        return <Registrations />;
      case "workouts":
        return <Workouts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-root">
      {user && (
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="app-title">FitTrack Admin</h1>
            <span className="user-pill">(admin)</span>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </header>
      )}

      {user && (
        <nav className="nav-tabs">
          <button
            className={activePage === "dashboard" ? "tab active-tab" : "tab"}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activePage === "classes" ? "tab active-tab" : "tab"}
            onClick={() => setActivePage("classes")}
          >
            Classes
          </button>
          <button
            className={activePage === "members" ? "tab active-tab" : "tab"}
            onClick={() => setActivePage("members")}
          >
            Members
          </button>
          <button
            className={activePage === "payments" ? "tab active-tab" : "tab"}
            onClick={() => setActivePage("payments")}
          >
            Payments
          </button>
          <button
            className={activePage === "trainers" ? "tab active-tab" : "tab"}
            onClick={() => setActivePage("trainers")}
          >
            Trainers
          </button>
          <button
            className={
              activePage === "registrations" ? "tab active-tab" : "tab"
            }
            onClick={() => setActivePage("registrations")}
          >
            Registrations
          </button>
          <button
            className={activePage === "workouts" ? "tab active-tab" : "tab"}
            onClick={() => setActivePage("workouts")}
          >
            Workouts
          </button>
        </nav>
      )}

      <main className="page-container">{renderPage()}</main>
    </div>
  );
}

export default App;
