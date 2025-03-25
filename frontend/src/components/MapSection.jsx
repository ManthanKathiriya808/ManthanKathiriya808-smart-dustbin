import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function MapSection() {
  const [position, setPosition] = useState([28.61, 77.23]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => console.log('Location access denied.')
      );
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-card p-4">
      <h2 className="text-xl font-bold mb-2 text-green-700 dark:text-green-400">🗺️ Live Bin Location</h2>
      <MapContainer center={position} zoom={16} style={{ height: '350px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>Current Bin Position (Browser-based)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
