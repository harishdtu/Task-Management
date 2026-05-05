import { useState, useEffect } from "react";
import api from "../utils/api";
import TaskModal from "../components/TaskModal";
import TaskBoard from "../components/TaskBoard";

export default function ProjectDetail({ project }) {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = async () => {
    const res = await api.get(`/tasks?project=${project._id}`);
    setTasks(res.data.tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [project._id]);

  return (
    <div>

      <button
        onClick={() => setShowModal(true)}
        className="mb-4 bg-white text-black px-4 py-2 rounded"
      >
        + Create Task
      </button>

      <TaskBoard tasks={tasks} onUpdated={fetchTasks} />

      {showModal && (
        <TaskModal
          projectId={project._id}
          members={project.members}
          onClose={() => setShowModal(false)}
          onCreated={fetchTasks}
        />
      )}

    </div>
  );
}