
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const incidentMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Default map center: New Delhi, India.
// Users can select their actual incident location or use GPS.
const DEFAULT_POSITION = {
  lat: 28.6139,
  lng: 77.209,
};

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapRecenter({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView([position.lat, position.lng], map.getZoom());
  }, [map, position.lat, position.lng]);

  return null;
}

export default function IncidentLocationPicker({
  initialPosition = null,
  onConfirm,
  onCancel,
}) {
  const [position, setPosition] = useState(
    initialPosition ?? DEFAULT_POSITION
  );
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState("");

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setError("Your browser does not support device location.");
      return;
    }

    setGpsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          lat: coords.latitude,
          lng: coords.longitude,
        });
        setGpsLoading(false);
      },
      (gpsError) => {
        const messages = {
          1: "Location permission was denied. Select a point manually.",
          2: "Your device location is unavailable. Select a point manually.",
          3: "The location request timed out. Please try again.",
        };

        setError(
          messages[gpsError.code] ??
            "Could not obtain your location. Select a point manually."
        );
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  }

  function confirmLocation() {
    if (typeof onConfirm === "function") {
      onConfirm({
        lat: position.lat,
        lng: position.lng,
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Select incident location
          </h3>
          <p className="text-sm text-slate-400">
            Click the map to place the marker, or use your device GPS.
          </p>
        </div>

        <button
          type="button"
          onClick={useDeviceLocation}
          disabled={gpsLoading}
          className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/20 disabled:opacity-50"
        >
          {gpsLoading ? "Finding location..." : "Use my location"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={12}
          scrollWheelZoom
          style={{ height: "350px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={setPosition} />
          <MapRecenter position={position} />

          <Marker
            position={[position.lat, position.lng]}
            icon={incidentMarkerIcon}
          />
        </MapContainer>
      </div>

      <div className="rounded-lg bg-white/5 p-3 text-sm text-slate-300">
        <p>
          <span className="text-slate-400">Latitude:</span>{" "}
          {position.lat.toFixed(6)}
        </p>
        <p>
          <span className="text-slate-400">Longitude:</span>{" "}
          {position.lng.toFixed(6)}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={confirmLocation}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Confirm location
        </button>
      </div>
    </div>
  );
}
