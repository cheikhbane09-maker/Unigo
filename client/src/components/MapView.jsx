import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

/**
 * Carte interactive basée sur OpenStreetMap (aucune clé d'API nécessaire).
 * Réutilisable par le module Transport pour situer campus, gares et arrêts.
 *
 * points = [{ id, lat, lng, title, subtitle }]
 */
export default function MapView({ points = [], zoom = 12, height = 320 }) {
  const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length === 0) return null;

  const center = [valid[0].lat, valid[0].lng];

  // Marqueur en SVG inline : évite les problèmes d'images par défaut de Leaflet avec Vite.
  const icon = L.divIcon({
    className: '',
    html: `<div style="transform:translate(-50%,-100%)">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#0f6c5a" stroke="white" stroke-width="1.5">
          <path d="M12 22s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11Z"/>
          <circle cx="12" cy="11" r="2.5" fill="white" stroke="none"/>
        </svg>
      </div>`,
    iconSize: [30, 30],
  });

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-ink-100" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {valid.map((p) => (
          <Marker key={p.id ?? `${p.lat}-${p.lng}`} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <strong>{p.title}</strong>
              {p.subtitle && <><br />{p.subtitle}</>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
