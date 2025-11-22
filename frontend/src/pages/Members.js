// src/pages/Members.js
import React, { useEffect, useState } from "react";
import {
  fetchMembers,
  createMember,
  updateMember,
  deleteMember,
} from "../api";

const emptyMember = {
  first_name: "",
  last_name: "",
  email: "",
  role: "member",
};

function Members() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null); // user_id
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchMembers();
      setMembers(data);
    } catch (e) {
      setErr(e.message || "Failed to load members");
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
    setForm(emptyMember);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMember(editingId, form);
      } else {
        await createMember(form);
      }
      await load();
      resetForm();
    } catch (e) {
      alert(e.message || "Failed to save member");
    }
  };

  const handleEdit = (m) => {
    setEditingId(m.user_id);
    setForm({
      first_name: m.first_name,
      last_name: m.last_name,
      email: m.email,
      role: m.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Delete member "${m.first_name} ${m.last_name}"?`))
      return;
    try {
      await deleteMember(m.user_id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete member");
    }
  };

  const totalMembers = members.length;

  return (
    <div>
      <h2 className="page-title">Members</h2>

      <div
        style={{
          textAlign: "right",
          marginBottom: 8,
          color: "#6b7280",
          fontSize: "0.9rem",
        }}
      >
        Total Members: <strong>{totalMembers}</strong>
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
            {editingId ? "Edit Member" : "Add New Member"}
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
            {showForm || editingId ? "Hide Form" : "Add New Member"}
          </button>
        </div>

        {(showForm || editingId) && (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>First Name</label>
                <input
                  value={form.first_name}
                  onChange={handleChange("first_name")}
                  required
                />
              </div>
              <div className="form-field">
                <label>Last Name</label>
                <input
                  value={form.last_name}
                  onChange={handleChange("last_name")}
                  required
                />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                />
              </div>
              <div className="form-field">
                <label>Role</label>
                <select value={form.role} onChange={handleChange("role")}>
                  <option value="admin">admin</option>
                  <option value="member">member</option>
                  <option value="trainer">trainer</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Member" : "Create Member"}
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
        <div>Loading members…</div>
      ) : err ? (
        <div style={{ color: "red" }}>{err}</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User_ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.user_id}>
                  <td>{m.user_id}</td>
                  <td>
                    {m.first_name} {m.last_name}
                  </td>
                  <td>{m.email}</td>
                  <td>{m.role}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(m)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5}>No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Members;
