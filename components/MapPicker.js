"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet";

// Change this to the coordinates of your own town
const DEFAULT_CENTER = [30.3753, 69.3451];
const DEFAULT_ZOOM = 5;

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  if (position) map.flyTo([position.lat, position.lng], 17);
  return null;
}

export default function MapPicker({ position, onPick }) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: "320px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <FlyTo position={position} />
      {position && (
        <CircleMarker
          center={[position.lat, position.lng]}
          radius={10}
          pathOptions={{ color: "#dc2626", fillOpacity: 0.7 }}
        />
      )}
    </MapContainer>
  );
}