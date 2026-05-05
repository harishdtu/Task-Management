import { useState, useEffect } from "react";
import api from "../utils/api";

export default function ProjectModal({ project, onClose, onSaved }) {
  const isEdit = !!project;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);

  // Prefill if editing
  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setColor(project.color || "#6366f1");
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT CLICKED 🔥");

    if (!name.trim()) {
      alert("Project name required");
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await api.patch(`/projects/${project._id}`, {
          name,
          description,
          color,
        });
      } else {
        await api.post("/projects", {
          name,
          description,
          color,
        });
      }

      console.log("SUCCESS ✅");

      onSaved(); // 🔥 CRITICAL

    }catch (err) {
  console.error(err.response?.data);

  if (err.response?.status === 400) {
    alert("Invalid data");
  } else if (err.response?.status === 401) {
    alert("Login expired");
  } else {
    alert("Failed to create project");
  }
} finally {
  setLoading(false);
}
};

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white p-6 rounded-xl w-full max-w-md">

        <h2 className="text-lg font-bold mb-4">
          {isEdit ? "Edit Project" : "Create Project"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
  type="text"
  placeholder="Project name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full border p-2 rounded text-black"
/>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />

        <div className="flex gap-2">
  {["#6366f1", "#ef4444", "#10b981", "#f59e0b"].map((c) => (
    <button
      key={c}
      type="button"
      onClick={() => setColor(c)}
      className="w-8 h-8 rounded-full border"
      style={{ backgroundColor: c }}
    />
  ))}
</div>    <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>

        </form>
      </div>
    </div>
  );
}
