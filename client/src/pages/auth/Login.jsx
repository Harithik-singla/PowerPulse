import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirectMap = { citizen: '/dashboard', operator: '/operator', admin: '/admin' };
      navigate(redirectMap[user.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-4 py-2">{error}</p>}
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
        <input type="email" required value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors placeholder-gray-700"
          placeholder="you@example.com"/>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
        <input type="password" required value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors placeholder-gray-700"
          placeholder="••••••••"/>
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2">
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-xs text-gray-500 mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-orange-400 hover:text-orange-300">Register here</Link>
      </p>
    </form>
  );
}