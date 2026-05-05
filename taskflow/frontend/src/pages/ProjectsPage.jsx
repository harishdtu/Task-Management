import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getProgressPercent, formatDate } from '../utils/helpers';
import ProjectModal from '../components/ProjectModal';

export default function ProjectsPage() {
  const { user, isAdmin } = useAuth();
  const outletCtx = useOutletContext();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const load = async () => {
  setLoading(true);

  try {
    const res = await api.get('/projects');
    setProjects(res.data.projects || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false); // 🔥 THIS FIXES YOUR ISSUE
  }
};

  useEffect(() => { load(); }, []);

  const handleSaved = () => {
    load();
    outletCtx?.refreshProjects?.();
    setShowModal(false);
    setEditProject(null);
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      load();
      outletCtx?.refreshProjects?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const STATUS_COLORS = { active: 'var(--done)', 'on-hold': 'var(--medium)', completed: 'var(--in-review)', archived: 'var(--text-muted)' };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="text-white max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
  <div>
    <h1 className="text-3xl font-bold">Projects</h1>
    <p className="text-gray-400 text-sm">
      {projects.length} project{projects.length !== 1 ? 's' : ''} you're part of
    </p>
  </div>

  <button
    onClick={() => setShowModal(true)}
    className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-semibold hover:scale-105 transition"
  >
    + New Project
  </button>
</div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 text-center">
  <div className="text-4xl mb-4">🗂️</div>
  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
  <p className="text-gray-400 mb-4">
    Create your first project and invite your team.
  </p>

  <button
    onClick={() => setShowModal(true)}
    className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-semibold"
  >
    Create First Project
  </button>
</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => {
            const pct = getProgressPercent(p.taskCount, p.completedCount);
            const isOwner = p.owner?._id === user?._id;

            return (
              <Link
  key={p._id}
  to={`/projects/${p._id}`}
  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition relative"
>

  {/* Top color strip */}
  <div
    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
    style={{ background: p.color }}
  />

  {/* Header */}
  <div className="flex justify-between items-center mb-3">
    <span className="text-xs px-2 py-1 rounded-full bg-white/20">
      {p.status}
    </span>

    {(isOwner || isAdmin) && (
      <div className="flex gap-2 text-sm">
        <button
          onClick={e => {
            e.preventDefault();
            setEditProject(p);
            setShowModal(true);
          }}
          className="hover:text-indigo-300"
        >
          ✏️
        </button>

        <button
          onClick={e => handleDelete(e, p._id)}
          className="hover:text-red-400"
        >
          🗑
        </button>
      </div>
    )}
  </div>

  {/* Name */}
  <h3 className="font-semibold text-lg mb-1">
    {p.name}
  </h3>

  {/* Desc */}
  <p className="text-sm text-gray-400 mb-4">
    {p.description || "No description"}
  </p>

  {/* Progress */}
  <div className="mb-4">
    <div className="flex justify-between text-xs text-gray-400 mb-1">
      <span>{p.completedCount || 0}/{p.taskCount || 0}</span>
      <span>{pct}%</span>
    </div>

    <div className="w-full h-2 bg-white/20 rounded-full">
      <div
        className="h-2 rounded-full"
        style={{
          width: `${pct}%`,
          background: pct === 100 ? "#22c55e" : p.color
        }}
      />
    </div>
  </div>

  {/* Footer */}
  <div className="flex justify-between items-center text-xs text-gray-400">

    {/* Members */}
    <div className="flex -space-x-2">
      {p.members?.slice(0, 4).map(m => (
        <img
          key={m.user?._id}
          src={m.user?.avatar}
          className="w-6 h-6 rounded-full border border-black"
        />
      ))}
    </div>

    {/* Due */}
    {p.dueDate && (
      <span>📅 {formatDate(p.dueDate)}</span>
    )}
  </div>

</Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}