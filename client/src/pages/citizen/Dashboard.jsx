import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import OutageMap from '../../components/map/OutageMap';
import ReportForm from '../../components/outages/ReportForm';
import OutageCard from '../../components/outages/OutageCard';
import useGeolocation from '../../hooks/useGeolocation';
import { fetchOutages } from '../../api/outages.api';

export default function CitizenDashboard() {
  const { coords, loading: geoLoading } = useGeolocation();
  const [selectedOutage, setSelectedOutage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const { data: outages = [], isLoading } = useQuery({
    queryKey: ['outages', coords],
    queryFn: () => coords
      ? fetchOutages({ lat: coords.lat, lng: coords.lng, radius: 10000 })
      : fetchOutages({}),
    refetchInterval: 30000, // poll every 30s (Socket.io replaces this in Phase 3)
  });

  const filtered = filter === 'all'
    ? outages
    : outages.filter(o => o.status === filter);

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-[calc(100vh-120px)]">

        {/* Left panel */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">

          {/* Report button */}
          <button
            onClick={() => setShowForm(v => !v)}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Report outage
          </button>

          {/* Report form */}
          {showForm && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">New outage report</h3>
              <ReportForm userCoords={coords} onSuccess={() => setShowForm(false)}/>
            </div>
          )}

          {/* Stats row */}
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

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
            {['all','reported','under_repair','resolved'].map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors capitalize ${
                  filter === f ? 'bg-orange-500 text-white font-medium' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'under_repair' ? 'Repair' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Outage list */}
          <div className="flex flex-col gap-2">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-gray-800 rounded w-2/3 mb-2"/>
                  <div className="h-2 bg-gray-800 rounded w-1/3"/>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No outages found in your area
              </div>
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

        {/* Map */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {geoLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                <p className="text-sm text-gray-400">Detecting location...</p>
              </div>
            </div>
          ) : (
            <OutageMap
              outages={outages}
              userCoords={coords}
              onMarkerClick={setSelectedOutage}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}