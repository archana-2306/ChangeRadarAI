import { useState } from "react";

export default function AddStoryForm({ reloadStories }) {
  const [form, setForm] = useState({
    story_number: "",
    story_type: "",
    description: "",
    acceptance_criteria: "",
    impacted_csi: ""
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:8000/stories/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Error adding story");
        return;
      }

      setMessage("Story added successfully");
      if (reloadStories) reloadStories();
      setForm({
        story_number: "",
        story_type: "",
        description: "",
        acceptance_criteria: "",
        impacted_csi: ""
      });
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        width: "100%",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "1rem",
          color: "#4f46e5"
        }}
      >
        Add New Story
      </h2>

      {message && (
        <div
          style={{
            background: "#d1fae5",
            color: "#065f46",
            padding: "0.5rem",
            marginBottom: "0.75rem",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "0.5rem",
            marginBottom: "0.75rem",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

        <input
          name="story_number"
          value={form.story_number}
          onChange={handleChange}
          placeholder="Story Number (e.g., US-110)"
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        />

        <input
          name="story_type"
          value={form.story_type}
          onChange={handleChange}
          placeholder="Story Type (Feature, Bug, Enhancement)"
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            minHeight: "70px"
          }}
        />

        <textarea
          name="acceptance_criteria"
          value={form.acceptance_criteria}
          onChange={handleChange}
          placeholder="Acceptance Criteria"
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            minHeight: "70px"
          }}
        />

        <input
          name="impacted_csi"
          value={form.impacted_csi}
          onChange={handleChange}
          placeholder="Impacted CSI (Security, Payment, User Management)"
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        />

        <button
          type="submit"
          style={{
            background: "#4f46e5",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            marginTop: "4px",
            transition: "0.2s"
          }}
          onMouseEnter={(e) => (e.target.style.background = "#4338ca")}
          onMouseLeave={(e) => (e.target.style.background = "#4f46e5")}
        >
          Add Story
        </button>
      </form>
    </div>
  );
}
