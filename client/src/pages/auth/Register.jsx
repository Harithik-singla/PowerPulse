import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'citizen', pincode:'', locality:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors placeholder-gray-700";
  const labelClass = "block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-4 py-2">{error}</p>}
      <div><label className={labelClass}>Full name</label>
        <input required value={form.name} onChange={set('name')} className={inputClass} placeholder="Arjun Singh"/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Pincode</label>
          <input required value={form.pincode} onChange={set('pincode')} className={inputClass} placeholder="141001"/></div>
        <div><label className={labelClass}>Role</label>
          <select value={form.role} onChange={set('role')} className={inputClass + " cursor-pointer"}>
            <option value="citizen">Citizen</option>
            <option value="operator">Operator</option>
          </select></div>
      </div>
      <div><label className={labelClass}>Locality</label>
        <input required value={form.locality} onChange={set('locality')} className={inputClass} placeholder="Sector 17, Ludhiana"/></div>
      <div><label className={labelClass}>Email</label>
        <input type="email" required value={form.email} onChange={set('email')} className={inputClass} placeholder="you@example.com"/></div>
      <div><label className={labelClass}>Password</label>
        <input type="password" required minLength={6} value={form.password} onChange={set('password')} className={inputClass} placeholder="Min 6 characters"/></div>
      <button type="submit" disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-1">
        {loading ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-400 hover:text-orange-300">Sign in</Link>
      </p>
    </form>
  );
}