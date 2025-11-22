// src/components/ClassForm.js
import React, { useEffect, useState } from "react";

const emptyClass = {
  title: "",
  description: "",
  trainer_id: "",
  capacity: "",
  start_time: "",
  end_time: "",
  location: "",
};

function ClassForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState(emptyClass);

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm(emptyClass);
  }, [initialData]);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="form-section">
      <h3 style={{ marginBottom: 10 }}>
        {initialData ? "Edit Class" : "Add New Class"}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid-4">
          <div className="form-field">
            <label>Title</label>
            <input value={form.title} onChange={handleChange("title")} required />
          </div>
          <div className="form-field">
            <label>Trainer ID</label>
            <input
              type="number"
              value={form.trainer_id}
              onChange={handleChange("trainer_id")}
              required
            />
          </div>
          <div className="form-field">
            <label>Capacity</label>
            <input
              type="number"
              value={form.capacity}
              onChange={handleChange("capacity")}
              required
            />
          </div>
          <div className="form-field">
            <label>Location</label>
            <input
              value={form.location}
              onChange={handleChange("location")}
              required
            />
          </div>
        </div>

        <div className="form-grid-4">
          <div className="form-field">
            <label>Start Time (YYYY-MM-DD HH:MM)</label>
            <input
              value={form.start_time}
              onChange={handleChange("start_time")}
              required
            />
          </div>
          <div className="form-field">
            <label>End Time (YYYY-MM-DD HH:MM)</label>
            <input
              value={form.end_time}
              onChange={handleChange("end_time")}
              required
            />
          </div>
          <div className="form-field" style={{ gridColumn: "span 2" }}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary">
            {initialData ? "Update Class" : "Create Class"}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ClassForm;
