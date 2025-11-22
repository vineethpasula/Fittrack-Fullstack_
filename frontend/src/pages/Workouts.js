// src/pages/Workouts.js
import React, { useEffect, useState } from "react";
import {
  fetchWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "../api";

const baseEmptyWorkout = {
  user_id: "",
  workout_date: "",
  workout_type: "",
  duration_minutes: "",
  calories_burned: "",
  notes: "",
};

function Workouts({ currentUser }) {
  const role = currentUser?.role || "member";
  const isAdmin = role === "admin";
  const isTrainer = role === "trainer";
  const isMember = role === "member";

  // helper so members always default to their own ID
  const makeEmptyWorkout = () => ({
    ...baseEmptyWorkout,
    user_id:
      isMember && currentUser?.user_id
        ? String(currentUser.user_id)
        : "",
  });

  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(makeEmptyWorkout);
  const [editingId, setEditingId] = useState(null); // log_id when editing
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchWorkouts();
      setWorkouts(data || []);
    } catch (e) {
      setErr(e.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if user/role changes (shouldn’t normally), reset form defaults
  useEffect(() => {
    setForm(makeEmptyWorkout());
    setEditingId(null);
  }, [currentUser?.user_id, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(makeEmptyWorkout());
    setShowForm(true);
    setErr("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(makeEmptyWorkout());
    setShowForm(false);
    setErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // basic required fields
      if (!form.workout_date || !form.workout_type) {
        setErr("Workout date and type are required.");
        return;
      }

      // user_id rules:
      // - member: always their own id, ignore whatever is in form.user_id
      // - admin/trainer: must provide a user id
      let userIdForPayload;
      if (isMember) {
        if (!currentUser?.user_id) {
          setErr("Your user account is missing an ID.");
          return;
        }
        userIdForPayload = Number(currentUser.user_id);
      } else {
        if (!form.user_id) {
          setErr("User ID is required.");
          return;
        }
        userIdForPayload = Number(form.user_id);
      }

      const payload = {
        user_id: userIdForPayload,
        workout_date: form.workout_date,
        workout_type: form.workout_type,
        duration_minutes: Number(form.duration_minutes || 0),
        calories_burned: Number(form.calories_burned || 0),
        notes: form.notes || "",
      };

      if (editingId) {
        await updateWorkout(editingId, payload);
      } else {
        await createWorkout(payload);
      }

      await load();
      handleCancel(); // resets + hides form
    } catch (e) {
      setErr(e.message || "Failed to save workout");
    }
  };

  const handleEdit = (w) => {
    // safety: members should not be able to edit someone else’s row
    if (isMember && String(w.user_id) !== String(currentUser?.user_id)) {
      return;
    }

    setEditingId(w.log_id);
    setShowForm(true);
    setErr("");

    setForm({
      user_id: String(w.user_id ?? ""),
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
    // safety: members should not delete someone else’s log
    if (isMember && String(w.user_id) !== String(currentUser?.user_id)) {
      return;
    }

    if (!window.confirm(`Delete workout log #${w.log_id}?`)) return;
    try {
      await deleteWorkout(w.log_id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete workout");
    }
  };

  // What each role can see
  const visibleWorkouts = isMember
    ? workouts.filter(
        (w) => String(w.user_id) === String(currentUser?.user_id)
      )
    : workouts;

  const visibleCount = visibleWorkouts.length;
  const totalCount = workouts.length;
  const showAllHint = isMember && totalCount !== visibleCount;

  return (
    <div>
      <h2 className="page-title">Workout Logs</h2>

      {/* Top summary row + button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          color: "#6b7280",
          fontSize: "0.9rem",
        }}
      >
        <div>
          Total Workout Logs: <strong>{visibleCount}</strong>
          {showAllHint && (
            <span style={{ marginLeft: 8, fontSize: "0.8rem" }}>
              (All in system: {totalCount})
            </span>
          )}
        </div>
        <button className="btn btn-primary" onClick={startCreate}>
          {editingId ? "Edit Workout Log" : "Add Workout Log"}
        </button>
      </div>

      {/* Form card – only when user clicks the button */}
      {showForm && (
        <div className="form-section">
          <h3 style={{ marginBottom: 10 }}>
            {editingId ? "Edit Workout Log" : "Add New Workout Log"}
          </h3>
          {err && (
            <div style={{ color: "red", marginBottom: 8 }}>{err}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>User ID</label>
                <input
                  type="number"
                  value={
                    isMember && currentUser?.user_id
                      ? String(currentUser.user_id)
                      : form.user_id
                  }
                  onChange={
                    isMember ? undefined : handleChange("user_id")
                  }
                  disabled={isMember}
                  placeholder={
                    isMember
                      ? "Your ID is fixed for your workout logs"
                      : "Enter member user ID"
                  }
                  required
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
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
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
              {visibleWorkouts.map((w) => (
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
              {visibleWorkouts.length === 0 && (
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
