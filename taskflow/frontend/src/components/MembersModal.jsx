import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function MembersModal({ project, isProjectAdmin, onClose, onUpdated }) {
  const { user } = useAuth();

  // ✅ ALWAYS declare hooks first
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);

  // ✅ Safe fallback AFTER hooks
  if (!project) {
    return null;
  }

  const members = project.members || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    console.log("ADD MEMBER CLICKED 🔥");

    if (!email.trim()) return;

    setAdding(true);
    try {
      await api.post(`/projects/${project._id}/members`, {
        email: email.trim(),
        role
      });

      toast.success('Member added!');
      setEmail('');
      onUpdated();

    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName}?`)) return;

    setRemoving(memberId);
    try {
      await api.delete(`/projects/${project._id}/members/${memberId}`);

      toast.success(`${memberName} removed`);
      onUpdated();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl w-full max-w-lg p-6 text-white">

        {/* Header */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">👥 Members</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Members list */}
        <div className="mb-6">
          <p className="text-xs mb-3">{members.length} members</p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map(m => {
              const isOwner = project.owner?._id === m.user?._id;
              const isMe = m.user?._id === user?._id;
              const canRemove = isProjectAdmin && !isOwner && !isMe;

              return (
                <div key={m.user?._id} className="flex items-center gap-3 bg-white/10 p-3 rounded">

                  <img src={m.user?.avatar} className="w-8 h-8 rounded-full" />

                  <div className="flex-1">
                    <p>{m.user?.name}</p>
                    <p className="text-xs text-gray-300">{m.user?.email}</p>
                  </div>

                  <span className="text-xs">
                    {isOwner ? "Owner" : m.role}
                  </span>

                  {canRemove && (
                    <button onClick={() => handleRemove(m.user?._id, m.user?.name)}>
                      ❌
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add member */}
        {isProjectAdmin && (
          <form onSubmit={handleAdd} className="flex gap-2 mt-4">
  <input
    type="email"
    placeholder="Enter email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="flex-1 p-2 rounded bg-white/20"
  />

  <button type="submit" className="bg-white text-black px-3 rounded">
    Add
  </button>
</form>
        )}
      </div>
    </div>
  );
}