// src/pages/Payments.js
import React, { useEffect, useState } from "react";
import {
  fetchPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "../api";

const emptyPayment = {
  payment_id: "",
  membership_id: "",
  amount: "",
  payment_date: "",
  method: "card",
  status: "paid",
};

function Payments() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState(emptyPayment);
  const [editingId, setEditingId] = useState(null); // will hold payment_id
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false); // NEW: toggle for form

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchPayments();
      setPayments(data);
    } catch (e) {
      setErr(e.message || "Failed to load payments");
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
    setForm(emptyPayment);
    setEditingId(null);
    // keep showForm as user chooses with the button
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        membership_id: Number(form.membership_id),
        amount: Number(form.amount),
        payment_date: form.payment_date,
        method: form.method,
        status: form.status,
      };

      if (editingId) {
        await updatePayment(editingId, payload);
      } else {
        await createPayment(payload);
      }

      await load();
      resetForm();
    } catch (e) {
      alert(e.message || "Failed to save payment");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.payment_id);
    setShowForm(true); // NEW: open form when editing
    setForm({
      payment_id: p.payment_id,
      membership_id: p.membership_id,
      amount: p.amount,
      payment_date: p.payment_date,
      method: p.method,
      status: p.status,
    });
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete payment #${p.payment_id}?`)) return;
    try {
      await deletePayment(p.payment_id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete payment");
    }
  };

  const totalPayments = payments.length;
  const sum = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <div>
      <h2 className="page-title">Payments</h2>

      <div
        style={{
          textAlign: "right",
          marginBottom: 8,
          fontSize: "0.9rem",
          color: "#6b7280",
        }}
      >
        Total Payments: <strong>{totalPayments}</strong> | Sum:{" "}
        <strong>${sum.toFixed(2)}</strong>
      </div>

      {/* Toggle button for form */}
      <button
        className="btn btn-primary"
        style={{ marginBottom: 16 }}
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? "Hide Payment Form" : "Add New Payment"}
      </button>

      {/* Form shown only when toggled on */}
      {showForm && (
        <div className="form-section">
          <h3 style={{ marginBottom: 10 }}>
            {editingId ? "Edit Payment" : "Add New Payment"}
          </h3>
          {err && <div style={{ color: "red", marginBottom: 8 }}>{err}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid-4">
              <div className="form-field">
                <label>Payment ID</label>
                {/* read-only; shown only when editing */}
                <input
                  type="number"
                  value={form.payment_id}
                  disabled
                  placeholder="Auto-generated"
                />
              </div>
              <div className="form-field">
                <label>Membership ID</label>
                <input
                  type="number"
                  value={form.membership_id}
                  onChange={handleChange("membership_id")}
                  required
                />
              </div>
              <div className="form-field">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange("amount")}
                  required
                />
              </div>
              <div className="form-field">
                <label>Payment Date (YYYY-MM-DD)</label>
                <input
                  value={form.payment_date}
                  onChange={handleChange("payment_date")}
                  required
                />
              </div>
              <div className="form-field">
                <label>Method</label>
                <select value={form.method} onChange={handleChange("method")}>
                  <option value="card">card</option>
                  <option value="cash">cash</option>
                  <option value="transfer">transfer</option>
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={handleChange("status")}>
                  <option value="paid">paid</option>
                  <option value="pending">pending</option>
                  <option value="failed">failed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Payment" : "Create Payment"}
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
        <div>Loading payments…</div>
      ) : err ? (
        <div style={{ color: "red" }}>{err}</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Membership ID</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.payment_id}>
                  <td>{p.payment_id}</td>
                  <td>{p.membership_id}</td>
                  <td>${Number(p.amount).toFixed(2)}</td>
                  <td>{p.payment_date}</td>
                  <td>{p.method}</td>
                  <td>{p.status}</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(p)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7}>No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Payments;
