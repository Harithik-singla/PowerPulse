import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [coords, setCoords] = useState(null);   // { lat, lng }
  const [error,  setError]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        // Fallback to a default location (Ludhiana)
        setCoords({ lat: 30.9010, lng: 75.8573 });
        setError(err.message);
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  return { coords, error, loading };
}