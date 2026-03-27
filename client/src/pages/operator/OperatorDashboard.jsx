import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout  from '../../components/DashboardLayout';
import { fetchOutages, updateStatus } from '../../api/outages.api';
import { useSocket } from '../../context/SocketContext';

const statusStyles = {
  reported:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  under_repair: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved:     'bg-green-500/10  text-green-400  border-green-500/20',
};

function StatusModal({ outage, onClose, onSave }) {
  const [status, setStatus] = useState(outage.status);
  const [ert,    setErt]    = useState('');
  const mutation = useMutation({
    mutationFn: () => updateStatus(outage._id, { status, ert: ert || undefined }),
    onSuccess:  () => { onSave(); onClose(); }
  });

  return (
    <div style={{ background: 'rgba(0,0,0,0.6)' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-sm font-semibold text-white mb-1">Update outage status</h3>
        <p className="text-xs text-gray-500 mb-5">{outage.locality} · {outage.pincode}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
            <div className="flex gap-2">
              {['reported','under_repair','resolved'].map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`flex-1 text-xs py-2 rounded-lg border capitalize transition-colors ${
                    status === s ? statusStyles[s] : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600'
                  }`}>
                  {s.replace('_',' ')}
                </button>
              ))}
            </div>
          </div>

          {status !== 'resolved' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                Estimated restoration time (optional)
              </label>
              <input type="datetime-local" value={ert} onChange={e => setErt(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"/>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 text-sm py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="flex-1 text-sm py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold transition-colors">
            {mutation.isPending ? 'Saving...' : 'Save update'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OperatorDashboard() {
  const qc = useQueryClient();
  const { on, off, connected } = useSocket();
  const [selected,  setSelected]  = useState(null);
  const [filterPin, setFilterPin] = useState('');
  const [filterSt,  setFilterSt]  = useState('all');
  const [toast,     setToast]     = useState(null);

  const { data: outages = [], isLoading } = useQuery({
    queryKey: ['outages-ops'],
    queryFn:  () => fetchOutages({}),
    refetchInterval: 60000,
  });

  useEffect(() => {
    const refresh = (o) => {
      qc.invalidateQueries(['outages-ops']);
      setToast(o.locality);
      setTimeout(() => setToast(null), 3500);
    };
    on('outage:new',     refresh);
    on('outage:updated', refresh);
    return () => { off('outage:new', refresh); off('outage:updated', refresh); };
  }, [on, off, qc]);

  const filtered = outages
    .filter(o => filterSt === 'all' || o.status === filterSt)
    .filter(o => !filterPin || o.pincode.includes(filterPin));

  const stats = {
    reported:     outages.filter(o => o.status === 'reported').length,
    under_repair: outages.filter(o => o.status === 'under_repair').length,
    resolved:     outages.filter(o => o.status === 'resolved').length,
  };

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 60)   return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
    return `${Math.floor(mins/1440)}d ago`;
  };

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border bg-orange-950/90 border-orange-800 text-orange-300 text-sm font-medium shadow-lg">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"/>
          New activity: {toast}
        </div>
      )}

      {selected && (
        <StatusModal
          outage={selected}
          onClose={() => setSelected(null)}
          onSave={() => qc.invalidateQueries(['outages-ops'])}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total reports', value: outages.length,       color: 'text-white'        },
            { label: 'Reported',      value: stats.reported,        color: 'text-orange-400'   },
            { label: 'Under repair',  value: stats.under_repair,    color: 'text-yellow-400'   },
            { label: 'Resolved',      value: stats.resolved,        color: 'text-green-400'    },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
            connected ? 'bg-green-950/40 border-green-900/50 text-green-400' : 'bg-gray-900 border-gray-800 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}/>
            {connected ? 'Live' : 'Offline'}
          </div>

          <input value={filterPin} onChange={e => setFilterPin(e.target.value)}
            placeholder="Filter by pincode..."
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none w-44 transition-colors"/>

          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
            {['all','reported','under_repair','resolved'].map(f => (
              <button key={f} onClick={() => setFilterSt(f)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${
                  filterSt === f ? 'bg-orange-500 text-white font-medium' : 'text-gray-400 hover:text-white'
                }`}>
                {f === 'all' ? 'All' : f === 'under_repair' ? 'Repair' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Outage table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span className="col-span-3">Locality</span>
            <span className="col-span-2">Pincode</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Reported</span>
            <span className="col-span-1">Upvotes</span>
            <span className="col-span-2 text-right">Action</span>
          </div>

          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-800/50 animate-pulse">
                <div className="col-span-3 h-3 bg-gray-800 rounded"/>
                <div className="col-span-2 h-3 bg-gray-800 rounded"/>
                <div className="col-span-2 h-3 bg-gray-800 rounded w-2/3"/>
                <div className="col-span-2 h-3 bg-gray-800 rounded"/>
                <div className="col-span-1 h-3 bg-gray-800 rounded w-1/2"/>
                <div className="col-span-2 h-3 bg-gray-800 rounded ml-auto w-1/2"/>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">No outages match your filter</div>
          ) : (
            filtered.map(o => (
              <div key={o._id}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors items-center">
                <div className="col-span-3">
                  <p className="text-sm text-white font-medium truncate">{o.locality}</p>
                  {o.description && <p className="text-xs text-gray-500 truncate mt-0.5">{o.description}</p>}
                </div>
                <span className="col-span-2 text-sm text-gray-400">{o.pincode}</span>
                <span className={`col-span-2 text-xs font-medium px-2 py-1 rounded-full border w-fit capitalize ${statusStyles[o.status]}`}>
                  {o.status.replace('_',' ')}
                </span>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">{timeAgo(o.createdAt)}</p>
                  {o.ert && (
                    <p className="text-xs text-yellow-400 mt-0.5">
                      ERT: {new Date(o.ert).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                    </p>
                  )}
                </div>
                <span className="col-span-1 text-sm text-gray-400">{o.upvotes?.length || 0}</span>
                <div className="col-span-2 flex justify-end">
                  <button onClick={() => setSelected(o)}
                    className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors">
                    Update
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}