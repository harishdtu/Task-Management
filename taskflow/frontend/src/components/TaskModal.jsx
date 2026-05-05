import { useState } from "react";
import api from "../utils/api";

export default function TaskModal({
  projectId,
  members = [],
  onClose,
  onCreated,
  task = null // optional (for edit support later)
}) {
  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignee, setAssignee] = useState(task?.assignee?._id || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.split("T")[0] : ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title,
        description,
        project: projectId,
        priority,
      };

      // ✅ only add if exists (prevents backend 500)
      if (assignee) payload.assignee = assignee;
      if (dueDate) payload.dueDate = dueDate;

      if (isEdit) {
        await api.patch(`/tasks/${task._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      onCreated();
      onClose();

    } catch (err) {
      console.error("TASK ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Failed to save task");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl w-full max-w-md text-white">

        <h2 className="text-lg font-bold mb-4">
          {isEdit ? "Edit Task" : "Create Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Title */}
          <input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-white/20"
            required
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-white/20"
          />

          {/* Assign user */}
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full p-2 rounded bg-white/20"
          >
            <option value="">Unassigned</option>

            {(members || []).map((m) => (
              <option key={m.user?._id} value={m.user?._id}>
                {m.user?.name}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2 rounded bg-white/20"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Due date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 rounded bg-white/20"
          />

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-white text-black py-2 rounded font-semibold"
            >
              {isEdit ? "Update Task" : "Create Task"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-red-500 rounded"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}