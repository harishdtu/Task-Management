import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">

    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md text-white">

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
        Welcome back
      </h2>
      <p className="text-center text-gray-300 mb-6">
        Sign in to your workspace
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

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
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 text-sm p-3 rounded-xl">
            {errors.general}
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:scale-105 transition flex items-center justify-center"
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

      </form>

      {/* Divider */}
      <div className="text-center text-gray-400 text-sm my-5">or</div>

      {/* Signup */}
      <p className="text-center text-sm text-gray-300">
        Don't have an account?{" "}
        <Link to="/register" className="text-indigo-300 hover:underline">
          Create one free
        </Link>
      </p>

      {/* Demo */}
      <div className="mt-6 p-3 bg-white/10 rounded-xl border border-white/20 text-center">
        <p className="text-xs text-gray-400 uppercase mb-1">Demo</p>
        <p className="text-sm text-gray-300">
          admin@taskflow.dev / admin123
        </p>
      </div>

    </div>
  </div>
);
}