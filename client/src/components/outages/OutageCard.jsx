import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upvoteOutage } from '../../api/outages.api';
import { useAuth } from '../../context/AuthContext';

const statusStyles = {
  reported:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  under_repair: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved:     'bg-green-500/10  text-green-400  border-green-500/20',
};

export default function OutageCard({ outage }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const voted = outage.upvotes?.includes(user?._id);

  const mutation = useMutation({
    mutationFn: () => upvoteOutage(outage._id),
    onSuccess: () => qc.invalidateQueries(['outages']),
  });

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 60)  return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
    return `${Math.floor(mins/1440)}d ago`;
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-medium text-white">{outage.locality}</p>
          <p className="text-xs text-gray-500">{outage.pincode} · {timeAgo(outage.createdAt)}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusStyles[outage.status]}`}>
          {outage.status.replace('_', ' ')}
        </span>
      </div>

      {outage.description && (
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">{outage.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {outage.durationMinutes > 0 && <span>{outage.durationMinutes} min</span>}
          {outage.ert && (
            <span className="text-yellow-400">
              ERT: {new Date(outage.ert).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
            voted
              ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
          }`}
        >
          <svg className="w-3 h-3" fill={voted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
          </svg>
          {outage.upvotes?.length || 0} affected
        </button>
      </div>
    </div>
  );
}