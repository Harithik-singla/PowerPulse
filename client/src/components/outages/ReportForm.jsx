import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOutage } from '../../api/outages.api';
import { useAuth } from '../../context/AuthContext';

export default function ReportForm({ userCoords, onSuccess }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    description:     '',
    durationMinutes: '',
    locality:        user?.locality || '',
    pincode:         user?.pincode  || '',
  });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: createOutage,
    onSuccess: () => {
      qc.invalidateQueries(['outages']);
      setForm({ description: '', durationMinutes: '', locality: user?.locality || '', pincode: user?.pincode || '' });
      onSuccess?.();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to submit report'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userCoords) return setError('Location not available yet — please wait');
    setError('');
    mutation.mutate({
      ...form,
      durationMinutes: parseInt(form.durationMinutes) || 0,
      coordinates: [userCoords.lng, userCoords.lat],
    });
  };

  const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors placeholder-gray-600";
  const labelCls = "block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Locality</label>
          <input value={form.locality} onChange={set('locality')} required className={inputCls} placeholder="Sector 17"/>
        </div>
        <div>
          <label className={labelCls}>Pincode</label>
          <input value={form.pincode} onChange={set('pincode')} required className={inputCls} placeholder="141001"/>
        </div>
      </div>

      <div>
        <label className={labelCls}>Duration (minutes)</label>
        <input
          type="number" min="0" value={form.durationMinutes}
          onChange={set('durationMinutes')} className={inputCls} placeholder="e.g. 45"/>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          rows={3} value={form.description}
          onChange={set('description')} className={inputCls + " resize-none"}
          placeholder="Any details — transformer fault, whole street affected, etc."/>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900/50 rounded-lg px-3 py-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${userCoords ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}/>
        {userCoords
          ? `Location detected: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`
          : 'Detecting your location...'}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending || !userCoords}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {mutation.isPending ? 'Submitting...' : 'Report outage'}
      </button>
    </form>
  );
}