import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient }          from '@tanstack/react-query';
import { useSocket }                          from '../../context/SocketContext';
import DashboardLayout from '../../components/DashboardLayout';
import OutageMap from '../../components/map/OutageMap';
import ReportForm from '../../components/outages/ReportForm';
import OutageCard from '../../components/outages/OutageCard';
import useGeolocation from '../../hooks/useGeolocation';
import { fetchOutages } from '../../api/outages.api';

export default function CitizenDashboard() {
  const { coords, loading: geoLoading } = useGeolocation();
  const [selectedOutage, setSelectedOutage]  = useState(null);
  const [showForm, setShowForm]              = useState(false);
  const [filter, setFilter]                  = useState('all');
  const [toast, setToast]                    = useState(null);   // ← new
  const { on, off, connected }               = useSocket();      // ← new
  const qc = useQueryClient();

  const { data: outages = [], isLoading } = useQuery({
    queryKey: ['outages', coords],
    queryFn:  () => coords
      ? fetchOutages({ lat: coords.lat, lng: coords.lng, radius: 10000 })
      : fetchOutages({}),
    refetchInterval: 60000, // fallback poll, socket handles live updates
  });

  // Show a toast notification
  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Socket listeners
  useEffect(() => {
    const handleNew = (outage) => {
      qc.invalidateQueries(['outages']);
      showToast(`New outage reported in ${outage.locality}`, 'new');
    };
    const handleUpdated = (outage) => {
      qc.invalidateQueries(['outages']);
      const label = outage.status === 'under_repair' ? 'Under repair' : 'Resolved';
      showToast(`${outage.locality} — ${label}`, outage.status === 'resolved' ? 'success' : 'update');
    };
    const handleUpvoted = () => {
      qc.invalidateQueries(['outages']);
    };

    on('outage:new',     handleNew);
    on('outage:updated', handleUpdated);
    on('outage:upvoted', handleUpvoted);

    return () => {
      off('outage:new',     handleNew);
      off('outage:updated', handleUpdated);
      off('outage:upvoted', handleUpvoted);
    };
  }, [on, off, qc, showToast]);

  const filtered = filter === 'all'
    ? outages
    : outages.filter(o => o.status === filter);

  return (
    <DashboardLayout>
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-950/90 border-green-800 text-green-300' :
          toast.type === 'new'     ? 'bg-orange-950/90 border-orange-800 text-orange-300' :
                                     'bg-blue-950/90 border-blue-800 text-blue-300'
        }`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse"/>
          {toast.msg}
        </div>
      )}

      <div className="flex gap-4 h-[calc(100vh-120px)]">
        {/* Left panel — same as before, just add connected indicator to the top */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">

          {/* Connection status */}
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
            connected
              ? 'bg-green-950/40 border-green-900/50 text-green-400'
              : 'bg-gray-900 border-gray-800 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}/>
            {connected ? 'Live updates active' : 'Connecting...'}
          </div>

          {/* Everything else stays identical from Phase 2 */}
          <button onClick={() => setShowForm(v => !v)}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Report outage
          </button>

          {showForm && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">New outage report</h3>
              <ReportForm userCoords={coords} onSuccess={() => setShowForm(false)}/>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Active',   count: outages.filter(o => o.status === 'reported').length,     color: 'text-orange-400' },
              { label: 'Repair',   count: outages.filter(o => o.status === 'under_repair').length, color: 'text-yellow-400' },
              { label: 'Resolved', count: outages.filter(o => o.status === 'resolved').length,     color: 'text-green-400'  },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-2 text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
            {['all','reported','under_repair','resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                  filter === f ? 'bg-orange-500 text-white font-medium' : 'text-gray-400 hover:text-white'
                }`}>
                {f === 'all' ? 'All' : f === 'under_repair' ? 'Repair' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-gray-800 rounded w-2/3 mb-2"/>
                  <div className="h-2 bg-gray-800 rounded w-1/3"/>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No outages found in your area</div>
            ) : (
              filtered.map(o => (
                <div key={o._id} onClick={() => setSelectedOutage(o)}
                  className={`cursor-pointer transition-all ${selectedOutage?._id === o._id ? 'ring-1 ring-orange-500/50 rounded-xl' : ''}`}>
                  <OutageCard outage={o}/>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map — identical to Phase 2 */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {geoLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                <p className="text-sm text-gray-400">Detecting location...</p>
              </div>
            </div>
          ) : (
            <OutageMap outages={outages} userCoords={coords} onMarkerClick={setSelectedOutage}/>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}