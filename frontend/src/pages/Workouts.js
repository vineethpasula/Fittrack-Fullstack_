// src/pages/Workouts.js
import React, { useEffect, useState } from "react";
import {
  fetchWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "../api";

const emptyWorkout = {
  user_id: "",
  workout_date: "",
  workout_type: "",
  duration_minutes: "",
  calories_burned: "",
  notes: "",
};

function Workouts({ currentUser }) {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(emptyWorkout);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer";
  const isMember = currentUser?.role === "member";

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchWorkouts();
      setWorkouts(data);
    } catch (e) {
      setErr(e.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // keep member's own ID pre-filled in the form
  const resetForm = () => {
    setForm({
      ...emptyWorkout,
      user_id: isMember ? currentUser.user_id : "",
    });
    setEditingId(null);
    setErr("");
  };

  // ensure member user_id is always fixed
  useEffect(() => {
    if (isMember) {
      setForm((prev) => ({
        ...prev,
        user_id: currentUser.user_id,
      }));
    }
  }, [isMember, currentUser]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!form.user_id || !form.workout_date || !form.workout_type) {
        setErr("User ID, date and workout type are required");
        return;
      }

      // members can only create/update their own logs
      if (isMember && Number(form.user_id) !== currentUser.user_id) {
        setErr("You can only create or edit your own workout logs.");
        return;
      }

      setErr("");

      const payload = {
        user_id: Number(form.user_id),
        workout_date: form.workout_date,
        workout_type: form.workout_type,
        duration_minutes: Number(form.duration_minutes || 0),
        calories_burned: Number(form.calories_burned || 0),
        notes: form.notes,
      };

      if (editingId) {
        await updateWorkout(editingId, payload);
      } else {
        await createWorkout(payload);
      }

      await load();
      resetForm(); // leave showForm as-is so they can add another
    } catch (e) {
      setErr(e.message || "Failed to save workout");
    }
  };

  const handleEdit = (w) => {
    // members cannot edit others' logs
    if (isMember && w.user_id !== currentUser.user_id) {
      setErr("You can only edit your own workout logs.");
      return;
    }

    setEditingId(w.log_id);
    setShowForm(true);

    setForm({
      user_id: w.user_id ?? "",
      workout_date: w.workout_date || "",
      workout_type: w.workout_type || "",
      duration_minutes:
        w.duration_minutes !== null && w.duration_minutes !== undefined
          ? String(w.duration_minutes)
          : "",
      calories_burned:
        w.calories_burned !== null && w.calories_burned !== undefined
          ? String(w.calories_burned)
          : "",
      notes: w.notes || "",
    });
  };

  const handleDelete = async (w) => {
    if (!window.confirm(`Delete workout log #${w.log_id}?`)) return;

    if (isMember && w.user_id !== currentUser.user_id) {
      alert("You can only delete your own workout logs.");
      return;
    }

    try {
      await deleteWorkout(w.log_id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete workout");
    }
  };

  // Admin & trainer: see all; Member: only own workouts
  const filteredWorkouts = workouts.filter((w) => {
    if (isAdmin || isTrainer) return true;
    if (isMember) return w.user_id === currentUser.user_id;
    return false;
  });

  const totalWorkouts = filteredWorkouts.length;

  return (
    <div>
      <h2 className="page-title">Workout Logs</h2>

      <div
        style={{
          textAlign: "right",
          marginBottom: 8,
          color: "#6b7280",
          fontSize: "0.9rem",
        }}
      >
        Total Workout Logs: <strong>{totalWorkouts}</strong>
      </div>

      {/* Button to show/hide the form */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            if (!showForm) {
              // opening fresh: clean form
              resetForm();
            }
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Hide Form" : "Add Workout Log"}
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <h3 style={{ marginBottom: 10 }}>
            {editingId ? "Edit Workout Log" : "Add New Workout Log"}
          </h3>
          {err && <div style={{ color: "red", marginBottom: 8 }}>{err}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>User ID</label>
                <input
                  type="number"
                  value={form.user_id}
                  onChange={handleChange("user_id")}
                  required
                  disabled={isMember}
                />
              </div>
              <div className="form-field">
                <label>Workout Date</label>
                <input
                  type="text"
                  value={form.workout_date}
                  onChange={handleChange("workout_date")}
                  placeholder="2024-06-20"
                  required
                />
              </div>
              <div className="form-field">
                <label>Workout Type</label>
                <input
                  type="text"
                  value={form.workout_type}
                  onChange={handleChange("workout_type")}
                  placeholder="Treadmill, Yoga..."
                  required
                />
              </div>
              <div className="form-field">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  onChange={handleChange("duration_minutes")}
                />
              </div>
              <div className="form-field">
                <label>Calories Burned</label>
                <input
                  type="number"
                  value={form.calories_burned}
                  onChange={handleChange("calories_burned")}
                />
              </div>
              <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                <label>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={handleChange("notes")}
                  rows={2}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Workout" : "Create Workout"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading workouts…</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Log_ID</th>
                <th>User ID</th>
                <th>Date</th>
                <th>Type</th>
                <th>Duration (min)</th>
                <th>Calories</th>
                <th>Notes</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkouts.map((w) => (
                <tr key={w.log_id}>
                  <td>{w.log_id}</td>
                  <td>{w.user_id}</td>
                  <td>{w.workout_date}</td>
                  <td>{w.workout_type}</td>
                  <td>{w.duration_minutes}</td>
                  <td>{w.calories_burned}</td>
                  <td>{w.notes}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(w)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(w)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWorkouts.length === 0 && (
                <tr>
                  <td colSpan={8}>No workout logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Workouts;
