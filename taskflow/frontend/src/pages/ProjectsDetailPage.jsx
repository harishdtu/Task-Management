import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue } from '../utils/helpers';
import TaskModal from '../components/TaskModal';
import MembersModal from '../components/MembersModal';

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'in-review', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

const PRIORITY_COLORS = {
  low: '#27c97a',
  medium: '#e8a020',
  high: '#ef5b5b',
  critical: '#ff2d55'
};

/* ---------------- TASK CARD ---------------- */
function TaskCard({ task, onClick, updateStatus }) {
  const overdue = isOverdue(task.dueDate, task.status);

  const priorityColor = PRIORITY_COLORS[task.priority] || '#888';

  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white/10 p-3 rounded cursor-pointer"
    >
      <div className="flex gap-2 mb-2">
        <div
          className="w-1 h-4"
          style={{ background: priorityColor }}
        />
        <span className="text-xs capitalize">{task.priority || 'unknown'}</span>
      </div>

      <p className="text-sm font-semibold truncate">
        {task.title || 'Untitled Task'}
      </p>

      <div className="flex justify-between text-xs">
        <span>{task.assignee?.name || "Unassigned"}</span>

        {task.dueDate && (
          <span className={overdue ? "text-red-400" : ""}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* STATUS BUTTONS */}
      <div className="flex gap-2 mt-2">

        {task.status !== 'in-progress' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateStatus(task._id, 'in-progress');
            }}
            className="text-xs bg-yellow-500 px-2 py-1 rounded"
          >
            Start
          </button>
        )}

        {task.status !== 'done' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateStatus(task._id, 'done');
            }}
            className="text-xs bg-green-500 px-2 py-1 rounded"
          >
            Done
          </button>
        )}

      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  /* -------- LOAD PROJECT -------- */
  const loadProject = async () => {
    const res = await api.get(`/projects/${id}`);
    setProject(res.data?.project || null);
  };

  /* -------- LOAD TASKS -------- */
  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?project=${id}`);
      setTasks(res.data?.tasks || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    }
  };

  /* -------- UPDATE STATUS -------- */
  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });

      // optimistic update (faster UI)
      setTasks(prev =>
        prev.map(t =>
          t._id === taskId ? { ...t, status } : t
        )
      );

      toast.success("Task updated");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update task");
    }
  };

  /* -------- INITIAL LOAD -------- */
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadProject(), fetchTasks()]);
      } catch (err) {
        setError(true);
        toast.error("Project not found");
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  /* -------- AFTER TASK SAVE -------- */
  const handleTaskSaved = () => {
    fetchTasks();
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  /* -------- STATES -------- */
  if (loading) return <div>Loading...</div>;

  if (error || !project) {
    return (
      <div className="text-red-400 text-sm">
        Failed to load project
      </div>
    );
  }

  return (
    <div className="p-6">

      <h2 className="text-xl font-bold mb-4">
        {project.name || 'Untitled Project'}
      </h2>

     <div className="flex gap-3 mb-6">

  <button
    onClick={() => setShowMembersModal(true)}
    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition"
  >
    👥 Members
  </button>

  <button
    onClick={() => setShowTaskModal(true)}
    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition"
  >
    + Task
  </button>

</div>
      {/* TASK BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.id);

          return (
            <div key={col.id}>
              <h4 className="mb-2">{col.label}</h4>

              {columnTasks.length === 0 ? (
                <p className="text-xs text-gray-400">No tasks</p>
              ) : (
                columnTasks.map(task => (
                  <TaskCard
                    key={task._id || task.title}
                    task={task}
                    onClick={(t) => {
                      setSelectedTask(t);
                      setShowTaskModal(true);
                    }}
                    updateStatus={updateStatus}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* TASK MODAL */}
      {showTaskModal && (
        <TaskModal
          projectId={project._id}
          members={project.members || []}
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onCreated={handleTaskSaved}
        />
      )}

      {/* MEMBERS MODAL */}
      {showMembersModal && (
        <MembersModal
          project={project}
          isProjectAdmin={isAdmin}
          onClose={() => setShowMembersModal(false)}
          onUpdated={loadProject}
        />
      )}

    </div>
  );
}