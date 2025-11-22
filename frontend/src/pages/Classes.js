// src/pages/Classes.js
import React, { useEffect, useState } from "react";
import { fetchClasses, createClass, updateClass, deleteClass } from "../api";

const emptyClass = {
  title: "",
  trainer_id: "",
  capacity: "",
  start_time: "",
  end_time: "",
  location: "",
};

function Classes() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyClass);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchClasses();
      setClasses(data);
    } catch (e) {
      setErr(e.message || "Failed to load classes");
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
    setForm(emptyClass);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClass(editingId, form);
      } else {
        await createClass(form);
      }
      await load();
      resetForm();
    } catch (e) {
      alert(e.message || "Failed to save class");
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.class_id);
    setForm({
      title: c.title || "",
      trainer_id: c.trainer_id || "",
      capacity: c.capacity != null ? String(c.capacity) : "",
      start_time: c.start_time || "",
      end_time: c.end_time || "",
      location: c.location || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete class "${c.title}"?`)) return;
    try {
      await deleteClass(c.class_id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete class");
    }
  };

  const totalClasses = classes.length;

  return (
    <div>
      <h2 className="page-title">Classes</h2>

      <div
        style={{
          textAlign: "right",
          marginBottom: 8,
          color: "#6b7280",
          fontSize: "0.9rem",
        }}
      >
        Total Classes: <strong>{totalClasses}</strong>
      </div>

      {/* form card with toggle button */}
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
            {editingId ? "Edit Class" : "Add New Class"}
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
            {showForm || editingId ? "Hide Form" : "Add New Class"}
          </button>
        </div>

        {(showForm || editingId) && (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={handleChange("title")}
                  required
                />
              </div>

              <div className="form-field">
                <label>Trainer ID</label>
                <input
                  value={form.trainer_id}
                  onChange={handleChange("trainer_id")}
                />
              </div>

              <div className="form-field">
                <label>Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={handleChange("capacity")}
                />
              </div>

              <div className="form-field">
                <label>Start Time</label>
                <input
                  type="text"
                  placeholder="e.g. 2025-11-20 10:00"
                  value={form.start_time}
                  onChange={handleChange("start_time")}
                />
              </div>

              <div className="form-field">
                <label>End Time</label>
                <input
                  type="text"
                  placeholder="e.g. 2025-11-20 11:00"
                  value={form.end_time}
                  onChange={handleChange("end_time")}
                />
              </div>

              <div className="form-field">
                <label>Location</label>
                <input
                  value={form.location}
                  onChange={handleChange("location")}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Class" : "Create Class"}
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
        )}
      </div>

      {loading ? (
        <div>Loading classes…</div>
      ) : err ? (
        <div style={{ color: "red" }}>{err}</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Class_ID</th>
                <th>Title</th>
                <th>Trainer</th>
                <th>Capacity</th>
                <th>Start</th>
                <th>End</th>
                <th>Location</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.class_id}>
                  <td>{c.class_id}</td>
                  <td>{c.title}</td>
                  <td>{c.trainer_name || c.trainer_id || "-"}</td>
                  <td>{c.capacity}</td>
                  <td>{c.start_time}</td>
                  <td>{c.end_time}</td>
                  <td>{c.location}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(c)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={8}>No classes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Classes;
