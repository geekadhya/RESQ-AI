
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DEFAULT_CENTER = [28.6139, 77.209];
const DEFAULT_ZOOM = 5;
const MAX_FIT_ZOOM = 14;

const SEVERITY_COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

function createSeverityIcon(color) {
  return L.divIcon({
    className: "custom-incident-marker",
    html: `
      <svg
        width="32"
        height="42"
        viewBox="0 0 32 42"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16 1C7.72 1 1 7.72 1 16
             C1 26 16 41 16 41
             C16 41 31 26 31 16
             C31 7.72 24.28 1 16 1Z"
          fill="${color}"
          stroke="#ffffff"
          stroke-width="1.5"
        />
        <circle
          cx="16"
          cy="16"
          r="5"
          fill="#ffffff"
        />
      </svg>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 41],
    popupAnchor: [0, -36],
  });
}

const SEVERITY_ICONS = {
  Critical: createSeverityIcon(SEVERITY_COLORS.Critical),
  High: createSeverityIcon(SEVERITY_COLORS.High),
  Medium: createSeverityIcon(SEVERITY_COLORS.Medium),
  Low: createSeverityIcon(SEVERITY_COLORS.Low),
};

function getSeverityIcon(severity) {
  return SEVERITY_ICONS[severity] || SEVERITY_ICONS.Medium;
}

function hasValidCoordinates(incident) {
  if (
    incident.latitude === null ||
    incident.latitude === undefined ||
    incident.latitude === "" ||
    incident.longitude === null ||
    incident.longitude === undefined ||
    incident.longitude === ""
  ) {
    return false;
  }

  const latitude = Number(incident.latitude);
  const longitude = Number(incident.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function FitIncidentsToMap({ incidents }) {
  const map = useMap();

  useEffect(() => {
    if (incidents.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      incidents.map((incident) => [
        Number(incident.latitude),
        Number(incident.longitude),
      ])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: MAX_FIT_ZOOM,
        animate: true,
      });
    }
  }, [incidents, map]);

  return null;
}

function SeverityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
        <div
          key={severity}
          className="flex items-center gap-2"
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-slate-300">
            {severity}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function IncidentDashboardMap({
  incidents = [],
}) {
  const mappedIncidents = useMemo(
    () => incidents.filter(hasValidCoordinates),
    [incidents]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      {/* Map header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4 py-4">
        <div>
          <h3 className="font-semibold text-white">
            Incident Location Map
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Geographic view of reported incidents by severity
          </p>
        </div>

        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
          {mappedIncidents.length} mapped{" "}
          {mappedIncidents.length === 1
            ? "incident"
            : "incidents"}
        </div>
      </div>

      {/* Severity legend */}
      <div className="border-b border-white/10 bg-slate-900 px-4 py-3">
        <SeverityLegend />
      </div>

      {/* Interactive map */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{
          height: "420px",
          width: "100%",
          background: "#0f172a",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitIncidentsToMap incidents={mappedIncidents} />

        {mappedIncidents.map((incident, index) => {
          const severity = SEVERITY_COLORS[incident.severity]
            ? incident.severity
            : "Medium";

          return (
            <Marker
              key={
                incident._id ||
                incident.id ||
                `incident-${index}`
              }
              position={[
                Number(incident.latitude),
                Number(incident.longitude),
              ]}
              icon={getSeverityIcon(incident.severity)}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <strong>
                    {incident.type || "Incident"}
                  </strong>

                  <br />

                  <span>
                    Location: {incident.location || "Unknown"}
                  </span>

                  <br />

                  <span>
                    Severity: {severity}
                  </span>

                  <br />

                  <span>
                    Status: {incident.status || "Reported"}
                  </span>

                  <br />

                  <span>
                    Latitude:{" "}
                    {Number(incident.latitude).toFixed(6)}
                  </span>

                  <br />

                  <span>
                    Longitude:{" "}
                    {Number(incident.longitude).toFixed(6)}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map footer */}
      <div className="border-t border-white/10 bg-slate-950 px-4 py-3">
        {mappedIncidents.length === 0 ? (
          <p className="text-sm text-slate-400">
            No incidents with valid coordinates yet. Report an
            incident and select its location on the map to display
            a marker.
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            The map automatically adjusts to show incidents with
            valid coordinates. Select any marker to view its
            details. Marker colors indicate incident severity.
          </p>
        )}
      </div>
    </div>
  );
}
