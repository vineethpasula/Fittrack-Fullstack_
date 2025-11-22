// src/pages/Trainers.js
import React, { useEffect, useState } from "react";
import {
  fetchTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from "../api";

const emptyTrainer = {
  user_id: "",
  specialty: "",
  experience_years: "",
};

function Trainers({ currentUser }) {
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState(emptyTrainer);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(true);

  const role = currentUser?.role;
  const currentUserId = currentUser?.user_id;

  const isAdmin = role === "admin";
  const isTrainer = role === "trainer";
  const isMember = role === "member";

  const canCreateOrEdit = isAdmin; // only admins create/edit trainers
  const canDelete = isAdmin;

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchTrainers();
      setTrainers(data || []);
    } catch (e) {
      setErr(e.message || "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const resetForm = () => {
    setForm(emptyTrainer);
    setEditingId(null);
    setErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canCreateOrEdit) {
      setErr("Only admins can create or edit trainers.");
      return;
    }

    try {
      if (!form.user_id || !form.specialty) {
        setErr("User ID and Specialty are required.");
        return;
      }

      const userIdNum = Number(form.user_id);
      if (Number.isNaN(userIdNum) || userIdNum <= 0) {
        setErr("User ID must be a positive number.");
        return;
      }

      // Prevent assigning multiple trainer rows to the same user_id
      const duplicate = trainers.some(
        (t) =>
          t.user_id === userIdNum &&
          (editingId == null || t.trainer_id !== editingId)
      );
      if (duplicate) {
        setErr("That user already has a trainer profile.");
        return;
      }

      setErr("");

      const payload = {
        user_id: userIdNum,
        specialty: form.specialty,
        experience_years: Number(form.experience_years || 0),
      };

      try {
        if (editingId) {
          await updateTrainer(editingId, payload);
        } else {
          await createTrainer(payload);
        }
      } catch (apiErr) {
        // Backend might send a 4xx/5xx; surface a nicer message
        const msg =
          apiErr?.message ||
          "Saving trainer failed. Make sure the user exists in the users table and is not already a trainer.";
        setErr(msg);
        return;
      }

      await load();
      resetForm();
    } catch (e) {
      setErr(
        e.message ||
          "Saving trainer failed. Make sure the user exists and is not duplicated."
      );
    }
  };

  const handleEdit = (t) => {
    if (!canCreateOrEdit) return;

    setEditingId(t.trainer_id);
    setShowForm(true);
    setForm({
      user_id: t.user_id ?? "",
      specialty: t.specialty ?? "",
      experience_years:
        t.experience_years !== null && t.experience_years !== undefined
          ? String(t.experience_years)
          : "",
    });
  };

  const handleDelete = async (t) => {
    if (!canDelete) return;
    if (!window.confirm(`Delete trainer #${t.trainer_id}?`)) return;

    try {
      await deleteTrainer(t.trainer_id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete trainer");
    }
  };

  // What rows this user can *see*
  let visibleTrainers = trainers;
  if (isTrainer && currentUserId != null) {
    // trainer: only see their own record(s)
    visibleTrainers = trainers.filter((t) => t.user_id === currentUserId);
  } else if (isMember && currentUserId != null) {
    // member: trainers page isn’t in their nav, but guard just in case
    visibleTrainers = trainers.filter((t) => t.user_id === currentUserId);
  }

  const totalTrainers = visibleTrainers.length;
  const allTrainersCount = trainers.length;

  return (
    <div>
      <h2 className="page-title">Trainers</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          fontSize: "0.9rem",
          color: "#6b7280",
        }}
      >
        <div>
          Total Trainers: <strong>{totalTrainers}</strong>
          {isAdmin && allTrainersCount !== totalTrainers && (
            <span style={{ marginLeft: 8 }}>
              (All in system: {allTrainersCount})
            </span>
          )}
        </div>

        {canCreateOrEdit && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? "Hide Form" : "Add New Trainer"}
          </button>
        )}
      </div>

      {canCreateOrEdit && showForm && (
        <div className="form-section">
          <h3 style={{ marginBottom: 10 }}>
            {editingId ? "Edit Trainer" : "Add New Trainer"}
          </h3>

          {err && (
            <div style={{ color: "#dc2626", marginBottom: 8 }}>{err}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>User ID</label>
                <input
                  type="number"
                  value={form.user_id}
                  onChange={handleChange("user_id")}
                  required
                />
              </div>
              <div className="form-field">
                <label>Specialty</label>
                <input
                  value={form.specialty}
                  onChange={handleChange("specialty")}
                  placeholder="Strength, Yoga, Cardio..."
                  required
                />
              </div>
              <div className="form-field">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={handleChange("experience_years")}
                />
              </div>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>
              Use the <strong>user_id</strong> from the <strong>users</strong>{" "}
              table. Name and email will be pulled automatically from that user.
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Trainer" : "Create Trainer"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading trainers…</div>
      ) : err && !showForm ? (
        <div style={{ color: "#dc2626" }}>{err}</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Trainer_ID</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Specialty</th>
                <th>Experience (Years)</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleTrainers.map((t) => (
                <tr key={t.trainer_id}>
                  <td>{t.trainer_id}</td>
                  <td>{t.user_id}</td>
                  <td>
                    {t.name ||
                      `${t.first_name || ""} ${t.last_name || ""}`.trim()}
                  </td>
                  <td>{t.email || ""}</td>
                  <td>{t.specialty}</td>
                  <td>{t.experience_years}</td>
                  <td>
                    {canCreateOrEdit && (
                      <>
                        <button
                          className="btn btn-warning"
                          style={{ marginRight: 6 }}
                          onClick={() => handleEdit(t)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(t)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {visibleTrainers.length === 0 && (
                <tr>
                  <td colSpan={7}>No trainers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Trainers;
