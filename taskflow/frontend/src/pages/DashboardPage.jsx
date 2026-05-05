import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, getStatusLabel } from '../utils/helpers';
import StatCard from '../components/StatCard';

/* ---------------- STATUS BAR ---------------- */
const StatusBar = ({ byStatus }) => {
  const statuses = ['todo', 'in-progress', 'in-review', 'done'];

  const colors = {
    todo: '#4a4a6a',
    'in-progress': '#e8a020',
    'in-review': '#5b8def',
    done: '#27c97a'
  };

  const total = byStatus.reduce((a, b) => a + (b.count || 0), 0);

  return (
    <div style={{ margin: '12px 0' }}>
      {/* Visual Bar */}
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2 }}>
        {statuses.map(s => {
          const item = byStatus.find(b => b._id === s);
          const pct = total > 0 ? ((item?.count || 0) / total) * 100 : 0;

          if (pct === 0) return null;

          return (
            <div
              key={s}
              style={{
                width: `${pct}%`,
                background: colors[s]
              }}
            />
          );
        })}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        {statuses.map(s => {
          const item = byStatus.find(b => b._id === s);

          return (
            <div
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: colors[s]
                }}
              />
              <span>{getStatusLabel(s)}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {item?.count || 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- DASHBOARD ---------------- */
export default function DashboardPage() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/tasks/dashboard/summary')
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  /* -------- STATES -------- */
  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Loading dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        {error}
      </div>
    );
  }

  /* -------- SAFE DATA -------- */
  const {
    stats = { projects: 0, myTasks: 0, allTasks: 0, overdueTasks: 0 },
    byStatus = [],
    byPriority = [],
    recentTasks = []
  } = data || {};

  /* -------- GREETING -------- */
  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  const statusColors = {
    todo: '#4a4a6a',
    'in-progress': '#e8a020',
    'in-review': '#5b8def',
    done: '#27c97a'
  };

  return (
    <div className="min-h-screen text-white">

      {/* Header */}
      <div className="mb-10">
        <p className="text-sm text-gray-300 mb-1">
          {greeting} 👋
        </p>
        <h1 className="text-3xl font-bold">
          {user?.name?.split(' ')[0] || 'User'}'s Dashboard
        </h1>
        <p className="text-gray-400 text-sm">
          Here's what's happening with your projects today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Projects" value={stats.projects ?? 0} icon="📁" />
        <StatCard title="My Tasks" value={stats.myTasks ?? 0} icon="✅" />
        <StatCard title="Total Tasks" value={stats.allTasks ?? 0} icon="📊" />
        <StatCard title="Overdue" value={stats.overdueTasks ?? 0} icon="⚠️" />
      </div>

      {/* Middle */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        {/* Status */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
          <h3 className="font-semibold mb-2">Task Progress</h3>
          <p className="text-sm text-gray-400 mb-4">Across all projects</p>

          <StatusBar byStatus={byStatus} />

          <div className="flex flex-col gap-2 mt-4">
            {byStatus.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks yet</p>
            ) : (
              byStatus.map(s => (
                <div key={s._id} className="flex justify-between text-sm">
                  <span>{getStatusLabel(s._id)}</span>
                  <span>{s.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
          <h3 className="font-semibold mb-2">Priority Breakdown</h3>
          <p className="text-sm text-gray-400 mb-4">Open tasks</p>

          {['critical', 'high', 'medium', 'low'].map(p => {
            const item = byPriority.find(b => b._id === p);

            return (
              <div key={p} className="flex justify-between text-sm mb-2">
                <span className="capitalize">{p}</span>
                <span>{item?.count || 0}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Recent Activity</h2>
          <Link to="/projects" className="text-sm text-indigo-300 hover:underline">
            View All →
          </Link>
        </div>

        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity</p>
          ) : (
            recentTasks.map(task => (
              <Link
                key={task._id || task.title}
                to={task.project?._id ? `/projects/${task.project._id}` : '#'}
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition"
              >
                {/* Status dot */}
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: statusColors[task.status] || '#888'
                  }}
                />

                {/* Title */}
                <div className="flex-1">
                  <p className="text-sm font-medium truncate max-w-xs">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {task.project?.name || 'No Project'}
                  </p>
                </div>

                {/* Due */}
                {task.dueDate && (
                  <span
                    className={`text-xs ${
                      isOverdue(task.dueDate, task.status)
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  );
}