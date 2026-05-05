import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser, isAdmin } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch('/auth/me', { name: form.name.trim() });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

 return (
  <div className="max-w-3xl mx-auto text-white">

    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="text-gray-400 text-sm">
        Manage your account settings
      </p>
    </div>

    {/* Profile Card */}
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex items-center gap-6 mb-6">

      <img
        src={user?.avatar}
        alt=""
        className="w-20 h-20 rounded-full border-2 border-indigo-400 object-cover"
      />

      <div>
        <h2 className="text-xl font-semibold">{user?.name}</h2>
        <p className="text-gray-300 text-sm">{user?.email}</p>

        <div className="flex gap-3 mt-3 items-center">
          <span className={`px-3 py-1 text-xs rounded-full ${
            isAdmin ? "bg-purple-500/40" : "bg-gray-500/40"
          }`}>
            {isAdmin ? "⚡ Admin" : "👤 Member"}
          </span>

          <span className="text-xs text-gray-400">
            Joined {formatDate(user?.createdAt)}
          </span>
        </div>
      </div>
    </div>

    {/* Edit Profile */}
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6">

      <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

      <form onSubmit={handleSave} className="flex flex-col gap-4">

        {/* Name */}
        <div>
          <label className="text-sm text-gray-300">Display Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full mt-1 p-3 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-300">Email</label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="w-full mt-1 p-3 rounded-xl bg-white/10 border border-white/20 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={saving}
          className="bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </form>
    </div>

    {/* Account Info */}
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">

      <h3 className="text-lg font-semibold mb-4">Account Info</h3>

      <div className="grid grid-cols-2 gap-4">

        {[
          { label: "Account ID", value: user?._id?.slice(-8)?.toUpperCase() },
          { label: "Role", value: user?.role },
          { label: "Joined", value: formatDate(user?.createdAt) },
          { label: "Last Updated", value: formatDate(user?.updatedAt) },
        ].map(item => (
          <div key={item.label} className="bg-white/10 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 mb-1 uppercase">
              {item.label}
            </p>
            <p className="text-sm font-semibold">
              {item.value || "—"}
            </p>
          </div>
        ))}

      </div>
    </div>

  </div>
);
}