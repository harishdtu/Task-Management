import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.projects || []))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ RETURN MUST BE INSIDE FUNCTION
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col justify-between">

        {/* Logo */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-white/20 rounded-lg p-2">⚡</div>
            <span className="text-lg font-bold">TaskFlow</span>
          </div>

          {/* Nav */}
          <nav className="space-y-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`
              }
            >
              ⊞ Dashboard
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`
              }
            >
              <span>◫ Projects</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                {projects.length}
              </span>
            </NavLink>
          </nav>

          {/* Projects list */}
          {projects.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-gray-400 mb-2">Your Projects</p>
              {projects.slice(0, 6).map(p => (
                <NavLink
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: p.color }}
                  />
                  {p.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={user?.avatar} className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400"
          >
            ⎋ Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

    </div>
  );
}