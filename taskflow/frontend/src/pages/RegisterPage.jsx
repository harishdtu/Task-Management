import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };
return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">

    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md text-white">

      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-bold">
          ⚡
        </div>
        <h1 className="text-xl font-bold">
          Task<span className="text-pink-300">Flow</span>
        </h1>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-center mb-1">
        Create your account
      </h2>
      <p className="text-center text-gray-300 mb-6">
        Start managing your team's work
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Name */}
        <div>
          <input
            name="name"
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            name="password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none"
          >
            <option value="member" className="text-black">
              Member — Join & collaborate
            </option>
            <option value="admin" className="text-black">
              Admin — Manage projects
            </option>
          </select>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:scale-105 transition flex items-center justify-center"
        >
          {loading ? "Creating account..." : "Create Account →"}
        </button>

      </form>

      {/* Divider */}
      <div className="text-center text-gray-400 text-sm my-5">or</div>

      {/* Login */}
      <p className="text-center text-sm text-gray-300">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-300 hover:underline">
          Sign in
        </Link>
      </p>

    </div>
  </div>
);
}