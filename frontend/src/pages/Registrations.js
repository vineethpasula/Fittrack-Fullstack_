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

function Registrations({ currentUser }) {
  const [registrations, setRegistrations] = useState([]);
  const [form, setForm] = useState(emptyRegistration);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  const isMember = currentUser?.role === "member";

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
    setForm((prev) => ({
      ...emptyRegistration,
      // for members, always fix their own user_id
      user_id: isMember ? currentUser?.user_id || "" : "",
    }));
    setEditingId(null);
    setShowForm(false);
  };

  useEffect(() => {
    // initialize user_id for member
    if (isMember) {
      setForm((f) => ({ ...f, user_id: currentUser?.user_id || "" }));
    }
  }, [isMember, currentUser]);

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
    setForm({
      class_id: r.class_id ?? "",
      user_id: r.user_id ?? "",
      registered_at: r.registered_at || "",
      status: r.status || "registered",
    });
    setShowForm(true);
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

  // members only see their own registrations
  const visibleRegistrations = isMember
    ? registrations.filter((r) => r.user_id === currentUser?.user_id)
    : registrations;

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
        Total Registrations: <strong>{visibleRegistrations.length}</strong>{" "}
        {isMember ? null : (
          <span style={{ marginLeft: 6, fontSize: "0.8rem" }}>
            (All in system: {totalRegistrations})
          </span>
        )}
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
            {editingId ? "Edit Registration" : "Add New Registration"}
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
            {showForm || editingId ? "Hide Form" : "Add New Registration"}
          </button>
        </div>

        {(showForm || editingId) && (
          <>
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
                    disabled={isMember}
                  />
                  {isMember && (
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      (Your ID is fixed when registering for a class)
                    </div>
                  )}
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
              {visibleRegistrations.map((r) => (
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
              {visibleRegistrations.length === 0 && (
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
