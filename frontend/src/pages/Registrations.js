// src/pages/Registrations.js
import React, { useEffect, useState } from "react";
import {
  fetchRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
} from "../api";

const emptyRegistration = {
  class_id: "",
  user_id: "",
  registered_at: "",
  status: "registered",
};

function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [form, setForm] = useState(emptyRegistration);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false); // NEW: toggle for form

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchRegistrations();
      setRegistrations(data);
    } catch (e) {
      setErr(e.message || "Failed to load registrations");
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
    setForm(emptyRegistration);
    setEditingId(null);
    // leave showForm as user controls it from the button
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.class_id || !form.user_id) {
        setErr("Class ID and User ID are required");
        return;
      }
      setErr("");

      const payload = {
        class_id: Number(form.class_id),
        user_id: Number(form.user_id),
        registered_at: form.registered_at,
        status: form.status,
      };

      if (editingId) {
        await updateRegistration(editingId, payload);
      } else {
        await createRegistration(payload);
      }
      await load();
      resetForm();
    } catch (e) {
      setErr(e.message || "Failed to save registration");
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.registration_id);
    setShowForm(true); // NEW: open form when editing
    setForm({
      class_id: r.class_id ?? "",
      user_id: r.user_id ?? "",
      registered_at: r.registered_at || "",
      status: r.status || "registered",
    });
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete registration #${r.registration_id}?`)) return;
    try {
      await deleteRegistration(r.registration_id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete registration");
    }
  };

  const totalRegistrations = registrations.length;

  return (
    <div>
      <h2 className="page-title">Class Registrations</h2>

      <div
        style={{
          textAlign: "right",
          marginBottom: 8,
          color: "#6b7280",
          fontSize: "0.9rem",
        }}
      >
        Total Registrations: <strong>{totalRegistrations}</strong>
      </div>

      {/* Toggle button for form */}
      <button
        className="btn btn-primary"
        style={{ marginBottom: 16 }}
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? "Hide Registration Form" : "Add New Registration"}
      </button>

      {/* Conditionally render form */}
      {showForm && (
        <div className="form-section">
          <h3 style={{ marginBottom: 10 }}>
            {editingId ? "Edit Registration" : "Add New Registration"}
          </h3>
          {err && <div style={{ color: "red", marginBottom: 8 }}>{err}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Class ID</label>
                <input
                  type="number"
                  value={form.class_id}
                  onChange={handleChange("class_id")}
                  required
                />
              </div>
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
                <label>Registered At</label>
                <input
                  type="text"
                  value={form.registered_at}
                  onChange={handleChange("registered_at")}
                  placeholder="2024-07-01 09:00"
                />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={handleChange("status")}
                >
                  <option value="registered">registered</option>
                  <option value="attended">attended</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Registration" : "Create Registration"}
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
        <div>Loading registrations…</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Class ID</th>
                <th>User ID</th>
                <th>Registered At</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.registration_id}>
                  <td>{r.registration_id}</td>
                  <td>{r.class_id}</td>
                  <td>{r.user_id}</td>
                  <td>{r.registered_at}</td>
                  <td>{r.status}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(r)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={6}>No registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Registrations;
