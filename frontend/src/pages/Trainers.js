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

function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState(emptyTrainer);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchTrainers();
      setTrainers(data);
    } catch (e) {
      setErr(e.message || "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const resetForm = () => {
    setForm(emptyTrainer);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.user_id || !form.specialty) {
        setErr("User ID and Specialty are required");
        return;
      }
      setErr("");

      const payload = {
        user_id: Number(form.user_id),
        specialty: form.specialty,
        experience_years: Number(form.experience_years || 0),
      };

      if (editingId) {
        await updateTrainer(editingId, payload);
      } else {
        await createTrainer(payload);
      }
      await load();
      resetForm();
    } catch (e) {
      setErr(e.message || "Failed to save trainer");
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.trainer_id);
    setForm({
      user_id: t.user_id ?? "",
      specialty: t.specialty ?? "",
      experience_years:
        t.experience_years !== null && t.experience_years !== undefined
          ? String(t.experience_years)
          : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete trainer #${t.trainer_id}?`)) return;
    try {
      await deleteTrainer(t.trainer_id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete trainer");
    }
  };

  const totalTrainers = trainers.length;

  return (
    <div>
      <h2 className="page-title">Trainers</h2>

      <div
        style={{
          textAlign: "right",
          marginBottom: 8,
          color: "#6b7280",
          fontSize: "0.9rem",
        }}
      >
        Total Trainers: <strong>{totalTrainers}</strong>
      </div>

      <div className="form-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>
            {editingId ? "Edit Trainer" : "Add New Trainer"}
          </h3>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (showForm || editingId) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm || editingId ? "Hide Form" : "Add New Trainer"}
          </button>
        </div>

        {(showForm || editingId) && (
          <>
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

              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Trainer" : "Create Trainer"}
                </button>
                {(editingId || showForm) && (
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
          </>
        )}
      </div>

      {loading ? (
        <div>Loading trainers…</div>
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
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t) => (
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
                  </td>
                </tr>
              ))}
              {trainers.length === 0 && (
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
