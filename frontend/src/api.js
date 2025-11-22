// src/api.js
const API_BASE = "http://localhost:5000/api";

// --- AUTH ---
export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}

// --- DASHBOARD ---
export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard-stats`);
  if (!res.ok) throw new Error("Failed to load dashboard stats");
  return res.json();
}

// --- CLASSES ---
export async function fetchClasses() {
  const res = await fetch(`${API_BASE}/classes`);
  if (!res.ok) throw new Error("Failed to load classes");
  return res.json();
}

export async function createClass(data) {
  const res = await fetch(`${API_BASE}/classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create class");
  return res.json();
}

export async function updateClass(id, data) {
  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update class");
  return res.json();
}

export async function deleteClass(id) {
  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete class");
  return res.json();
}

// --- MEMBERS (Users) ---
export async function fetchMembers() {
  const res = await fetch(`${API_BASE}/members`);
  if (!res.ok) throw new Error("Failed to load members");
  return res.json();
}

export async function createMember(data) {
  const res = await fetch(`${API_BASE}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create member");
  return res.json();
}

export async function updateMember(id, data) {
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update member");
  return res.json();
}

export async function deleteMember(id) {
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete member");
  return res.json();
}

// --- PAYMENTS ---
export async function fetchPayments() {
  const res = await fetch(`${API_BASE}/payments`);
  if (!res.ok) throw new Error("Failed to load payments");
  return res.json();
}

export async function createPayment(data) {
  const res = await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create payment");
  return res.json();
}

export async function updatePayment(id, data) {
  const res = await fetch(`${API_BASE}/payments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update payment");
  return res.json();
}

export async function deletePayment(id) {
  const res = await fetch(`${API_BASE}/payments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete payment");
  return res.json();
}

// --- TRAINERS ---
export async function fetchTrainers() {
  const res = await fetch(`${API_BASE}/trainers`);
  if (!res.ok) throw new Error("Failed to load trainers");
  return res.json();
}

export async function createTrainer(data) {
  const res = await fetch(`${API_BASE}/trainers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create trainer");
  return res.json();
}

export async function updateTrainer(id, data) {
  const res = await fetch(`${API_BASE}/trainers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update trainer");
  return res.json();
}

export async function deleteTrainer(id) {
  const res = await fetch(`${API_BASE}/trainers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete trainer");
  return res.json();
}


// --- REGISTRATIONS ---
export async function fetchRegistrations() {
  const res = await fetch(`${API_BASE}/registrations`);
  if (!res.ok) throw new Error("Failed to load registrations");
  return res.json();
}

export async function createRegistration(data) {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create registration");
  return res.json();
}

export async function updateRegistration(id, data) {
  const res = await fetch(`${API_BASE}/registrations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update registration");
  return res.json();
}

export async function deleteRegistration(id) {
  const res = await fetch(`${API_BASE}/registrations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete registration");
  return res.json();
}

// --- WORKOUTS ---
export async function fetchWorkouts() {
  const res = await fetch(`${API_BASE}/workouts`);
  if (!res.ok) throw new Error("Failed to load workouts");
  return res.json();
}

export async function createWorkout(data) {
  const res = await fetch(`${API_BASE}/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create workout");
  return res.json();
}

export async function updateWorkout(id, data) {
  const res = await fetch(`${API_BASE}/workouts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update workout");
  return res.json();
}

export async function deleteWorkout(id) {
  const res = await fetch(`${API_BASE}/workouts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete workout");
  return res.json();
}
