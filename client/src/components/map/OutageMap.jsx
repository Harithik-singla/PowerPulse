import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const statusColors = {
  reported:     '#f97316',
  under_repair: '#eab308',
  resolved:     '#22c55e',
};

const makeIcon = (status) => L.divIcon({
  className: '',
  html: `
    <div style="
      width:14px;height:14px;
      background:${statusColors[status] || '#f97316'};
      border:2px solid rgba(255,255,255,0.8);
      border-radius:50%;
      box-shadow:0 0 8px ${statusColors[status]}99;
    "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Recenter map when user location loads
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], 13);
  }, [coords, map]);
  return null;
}

export default function OutageMap({ outages = [], userCoords, onMarkerClick }) {
  const center = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [30.9010, 75.8573];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
      />

      {userCoords && (
        <Marker
          position={[userCoords.lat, userCoords.lng]}
          icon={L.divIcon({
            className: '',
            html: `<div style="width:12px;height:12px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 0 10px #3b82f6aa;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          })}
        >
          <Popup>Your location</Popup>
        </Marker>
      )}

      {outages.map((o) => (
        <Marker
          key={o._id}
          position={[o.location.coordinates[1], o.location.coordinates[0]]}
          icon={makeIcon(o.status)}
          eventHandlers={{ click: () => onMarkerClick?.(o) }}
        >
          <Popup>
            <div style={{ fontFamily: 'sans-serif', minWidth: 160 }}>
              <strong style={{ fontSize: 13 }}>{o.locality}</strong>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Status: <span style={{ color: statusColors[o.status], fontWeight: 600 }}>
                  {o.status.replace('_', ' ')}
                </span>
              </div>
              {o.durationMinutes > 0 &&
                <div style={{ fontSize: 12, color: '#888' }}>
                  Duration: {o.durationMinutes} min
                </div>}
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                {o.upvotes?.length || 0} affected • reported by {o.reportedBy?.name}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      <RecenterMap coords={userCoords} />
    </MapContainer>
  );
}