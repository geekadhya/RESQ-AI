
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000/api";

const INCIDENT_TYPES = [
  "Road Accident",
  "Medical Emergency",
  "Fire",
  "Crime",
  "Natural Disaster",
  "Other",
];

const SEVERITIES = ["Critical", "High", "Medium", "Low"];

const STATUSES = ["Reported", "Dispatched", "Responding", "Resolved"];

const severityStyles = {
  Critical: "border-red-500/30 bg-red-500/10 text-red-300",
  High: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  Medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

const statusStyles = {
  Reported: "border-red-500/30 bg-red-500/10 text-red-300",
  Dispatched: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  Responding: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

function getErrorMessage(error, fallback) {
  if (error instanceof TypeError) {
    return "Unable to connect to the backend. Make sure your server is running on port 5000.";
  }

  return error?.message || fallback;
}

function normalizeIncident(incident) {
  return {
    ...incident,
    id: incident._id || incident.id,
    type: incident.type || "Other",
    location: incident.location || "Unknown location",
    severity: incident.severity || "Medium",
    status: incident.status || "Reported",
    createdAt: incident.createdAt || incident.updatedAt || null,
  };
}

function formatTime(dateValue) {
  if (!dateValue) return "Just now";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        `Request failed with status ${response.status}`
    );
  }

  return result;
}

function extractIncidents(result) {
  const incidents = Array.isArray(result) ? result : result?.data;

  if (!Array.isArray(incidents)) {
    throw new Error("Unexpected response from the server.");
  }

  return incidents.map(normalizeIncident);
}

function StatCard({ title, value, description, icon, accent }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${accent}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function EmptyState({ loading, error, onRetry, onReport }) {
  if (loading) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-400">
          Loading incidents from the database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-3xl">⚠️</p>
        <p className="mt-3 font-medium text-white">
          Could not load incidents
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 text-center">
      <p className="text-4xl">🛡️</p>
      <p className="mt-3 font-medium text-white">No incidents found</p>
      <p className="mt-2 text-sm text-slate-400">
        Report an incident or change your search filters.
      </p>
      <button
        type="button"
        onClick={onReport}
        className="mt-5 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
      >
        + Report incident
      </button>
    </div>
  );
}

function ReportModal({ onClose, onSubmit, submitting }) {
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("High");
  const [formError, setFormError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!location.trim()) {
      setFormError("Please enter the incident location.");
      return;
    }

    try {
      await onSubmit({
        type,
        location: location.trim(),
        severity,
      });
    } catch (error) {
      setFormError(error.message || "Could not report the incident.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Emergency management
            </p>
            <h2
              id="report-modal-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              Report an incident
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter the incident details below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="rounded-lg px-3 py-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="incident-type"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Incident type
            </label>
            <select
              id="incident-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              {INCIDENT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="incident-location"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Incident location
            </label>
            <input
              id="incident-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Village, road, landmark or address"
              maxLength={250}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="incident-severity"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Severity
            </label>
            <select
              id="incident-severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              {SEVERITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initial load: the loading state already starts as true.
  // This avoids a synchronous setState call inside useEffect.
  useEffect(() => {
    let cancelled = false;

    async function loadInitialIncidents() {
      try {
        const response = await fetch(`${API_BASE}/incidents`);
        const result = await readResponse(response);
        const data = extractIncidents(result);

        if (!cancelled) {
          setIncidents(data);
          setApiError("");
        }
      } catch (error) {
        if (!cancelled) {
          setApiError(
            getErrorMessage(
              error,
              "Could not load incidents. Check your backend connection."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialIncidents();

    return () => {
      cancelled = true;
    };
  }, []);

  // Used by the refresh and retry buttons.
  async function fetchIncidents() {
    setRefreshing(true);

    try {
      const response = await fetch(`${API_BASE}/incidents`);
      const result = await readResponse(response);
      const data = extractIncidents(result);

      setIncidents(data);
      setApiError("");
    } catch (error) {
      setApiError(
        getErrorMessage(error, "Could not refresh incidents.")
      );
    } finally {
      setRefreshing(false);
    }
  }

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        incident.type.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query) ||
        incident.severity.toLowerCase().includes(query) ||
        incident.status.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "All" ||
        incident.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" ||
        incident.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, search, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: incidents.length,
      critical: incidents.filter(
        (incident) => incident.severity === "Critical"
      ).length,
      active: incidents.filter(
        (incident) => incident.status !== "Resolved"
      ).length,
      resolved: incidents.filter(
        (incident) => incident.status === "Resolved"
      ).length,
    };
  }, [incidents]);

  const priorityIncidents = useMemo(() => {
    return incidents
      .filter(
        (incident) =>
          incident.status !== "Resolved" &&
          ["Critical", "High"].includes(incident.severity)
      )
      .sort((a, b) => {
        const severityOrder = { Critical: 0, High: 1 };
        return (
          severityOrder[a.severity] - severityOrder[b.severity]
        );
      })
      .slice(0, 5);
  }, [incidents]);

  async function addIncident(formData) {
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await readResponse(response);
      const savedIncident = normalizeIncident(result.data || result);

      setIncidents((current) => [
        savedIncident,
        ...current.filter(
          (incident) => incident.id !== savedIncident.id
        ),
      ]);

      setApiError("");
      setShowForm(false);
      setNotice("Incident saved successfully.");
    } catch (error) {
  const message = getErrorMessage(
    error,
    "Could not save the incident."
  );

  setNotice("");
  throw new Error(message, { cause: error });
} finally {
      setSubmitting(false);
    }
  }

  async function updateIncidentStatus(incident) {
    if (!incident.id) {
      setNotice("This incident does not have a valid database ID.");
      return;
    }

    const nextStatus =
      incident.status === "Resolved" ? "Reported" : "Resolved";

    setUpdatingId(incident.id);
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/incidents/${incident.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const result = await readResponse(response);
      const updatedIncident = normalizeIncident(
        result.data || result
      );

      setIncidents((current) =>
        current.map((item) =>
          item.id === incident.id ? updatedIncident : item
        )
      );

      setNotice(`Incident marked ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      setNotice(
        getErrorMessage(error, "Could not update incident status.")
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function openReportForm() {
    setNotice("");
    setShowForm(true);
    setShowMobileMenu(false);
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.08] bg-[#0b1120] transition-transform duration-200 lg:static lg:translate-x-0 ${
            showMobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center gap-3 border-b border-white/[0.08] px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-2xl shadow-lg shadow-blue-500/20">
              🛡️
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide text-white">
                RESQ <span className="text-blue-400">AI</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Emergency response
              </p>
            </div>
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Workspace
            </p>

            <nav className="mt-3 space-y-1">
              <a
                href="#overview"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 rounded-xl border border-blue-400/15 bg-blue-500/10 px-3 py-3 text-sm font-medium text-blue-300"
              >
                <span>▦</span>
                Dashboard
              </a>

              <a
                href="#incidents"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <span>◉</span>
                Incidents
                <span className="ml-auto rounded-md bg-white/5 px-2 py-0.5 text-xs">
                  {stats.active}
                </span>
              </a>

              <a
                href="#priority"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <span>⚡</span>
                Priority monitoring
              </a>
            </nav>

            <p className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Operations
            </p>

            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500">
                <span>⌖</span>
                Live map
                <span className="ml-auto rounded-md border border-white/10 px-2 py-0.5 text-[10px]">
                  Planned
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500">
                <span>🚑</span>
                Response units
                <span className="ml-auto rounded-md border border-white/10 px-2 py-0.5 text-[10px]">
                  Planned
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] p-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-xs font-medium text-slate-300">
                  Dashboard status
                </p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {apiError
                  ? "Backend connection needs attention."
                  : "Incident dashboard is available."}
              </p>
            </div>
            <p className="mt-4 text-center text-[10px] text-slate-600">
              RESQ AI · Development build
            </p>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {showMobileMenu && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          />
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Top navigation */}
          <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-white/[0.08] bg-[#080d18]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobileMenu((value) => !value)}
                aria-label="Toggle navigation"
                className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 lg:hidden"
              >
                ☰
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-500">
                  Workspace / Overview
                </p>
                <h2 className="mt-1 truncate text-lg font-semibold text-white">
                  Emergency dashboard
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={fetchIncidents}
                disabled={refreshing}
                className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50 sm:px-4"
              >
                <span className="sm:hidden">
                  {refreshing ? "..." : "↻"}
                </span>
                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "↻ Refresh"}
                </span>
              </button>

              <button
                type="button"
                onClick={openReportForm}
                className="rounded-xl bg-blue-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition hover:bg-blue-400 sm:px-4"
              >
                <span className="sm:hidden">+ Report</span>
                <span className="hidden sm:inline">
                  + Report incident
                </span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">
            {/* Welcome section */}
            <section
              id="overview"
              className="relative overflow-hidden rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/10 via-[#10192b] to-[#10192b] p-6 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <Badge className="border-blue-400/20 bg-blue-400/10 text-blue-300">
                    Emergency operations center
                  </Badge>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Every second matters.
                    <br />
                    <span className="text-blue-400">
                      Every response counts.
                    </span>
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                    Monitor reported incidents, track their status, and
                    keep emergency information organized in one place.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                    🛰️
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      Incident database
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {apiError ? "Connection issue" : "Connected view"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {loading
                        ? "Loading records..."
                        : `${incidents.length} records loaded`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Notice */}
            {notice && (
              <div
                role="status"
                className="flex items-start justify-between gap-3 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200"
              >
                <span>{notice}</span>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss message"
                  className="text-blue-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Error banner */}
            {apiError && (
              <div
                role="alert"
                className="flex flex-col justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-red-300">
                    Backend connection issue
                  </p>
                  <p className="mt-1 text-sm text-red-200/80">
                    {apiError}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchIncidents}
                  disabled={refreshing}
                  className="shrink-0 rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-200 hover:bg-red-400/10 disabled:opacity-50"
                >
                  {refreshing ? "Retrying..." : "Retry connection"}
                </button>
              </div>
            )}

            {/* Statistics */}
            <section aria-label="Incident statistics">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Situation overview
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Summary of incidents stored in the database
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total incidents"
                  value={loading ? "—" : stats.total}
                  description="All recorded incidents"
                  icon="◉"
                  accent="bg-blue-500/10 text-blue-300"
                />
                <StatCard
                  title="Active incidents"
                  value={loading ? "—" : stats.active}
                  description="Incidents not yet resolved"
                  icon="⚡"
                  accent="bg-orange-500/10 text-orange-300"
                />
                <StatCard
                  title="Critical incidents"
                  value={loading ? "—" : stats.critical}
                  description="Records marked critical"
                  icon="!"
                  accent="bg-red-500/10 text-red-300"
                />
                <StatCard
                  title="Resolved incidents"
                  value={loading ? "—" : stats.resolved}
                  description="Incidents marked resolved"
                  icon="✓"
                  accent="bg-emerald-500/10 text-emerald-300"
                />
              </div>
            </section>

            {/* Incidents table */}
            <section
              id="incidents"
              className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6 xl:flex-row xl:items-center">
                <div>
                  <h3 className="font-semibold text-white">
                    Incident management
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Search, filter, and update incident records.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 sm:w-56">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      ⌕
                    </span>
                    <input
                      type="search"
                      aria-label="Search incidents"
                      placeholder="Search incidents..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0b1120] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  <select
                    aria-label="Filter by severity"
                    value={severityFilter}
                    onChange={(event) =>
                      setSeverityFilter(event.target.value)
                    }
                    className="rounded-xl border border-white/10 bg-[#0b1120] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="All">All severities</option>
                    {SEVERITIES.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="rounded-xl border border-white/10 bg-[#0b1120] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-blue-500"
                  >
                    <option value="All">All statuses</option>
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Incident
                      </th>
                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Location
                      </th>
                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Severity
                      </th>
                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Reported
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.06]">
                    {!loading &&
                    !apiError &&
                    filteredIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <EmptyState
                            loading={false}
                            onRetry={fetchIncidents}
                            onReport={openReportForm}
                          />
                        </td>
                      </tr>
                    ) : loading || apiError ? (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <EmptyState
                            loading={loading}
                            error={apiError}
                            onRetry={fetchIncidents}
                            onReport={openReportForm}
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredIncidents.map((incident) => (
                        <tr
                          key={incident.id}
                          className="transition hover:bg-white/[0.025]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-lg">
                                {incident.type === "Road Accident"
                                  ? "🚗"
                                  : incident.type === "Medical Emergency"
                                    ? "🚑"
                                    : incident.type === "Fire"
                                      ? "🔥"
                                      : incident.type === "Crime"
                                        ? "🚨"
                                        : incident.type === "Natural Disaster"
                                          ? "🌪️"
                                          : "⚠️"}
                              </div>
                              <div>
                                <p className="font-medium text-slate-200">
                                  {incident.type}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  ID:{" "}
                                  {incident.id
                                    ? String(incident.id).slice(-8)
                                    : "Unavailable"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="max-w-56 px-6 py-4">
                            <p
                              title={incident.location}
                              className="truncate text-sm text-slate-300"
                            >
                              {incident.location}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <Badge
                              className={
                                severityStyles[incident.severity] ||
                                severityStyles.Medium
                              }
                            >
                              {incident.severity}
                            </Badge>
                          </td>

                          <td className="px-6 py-4">
                            <Badge
                              className={
                                statusStyles[incident.status] ||
                                statusStyles.Reported
                              }
                            >
                              {incident.status}
                            </Badge>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                            {formatTime(incident.createdAt)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                updateIncidentStatus(incident)
                              }
                              disabled={updatingId === incident.id}
                              className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                incident.status === "Resolved"
                                  ? "border-white/10 text-slate-300 hover:bg-white/5"
                                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                              }`}
                            >
                              {updatingId === incident.id
                                ? "Updating..."
                                : incident.status === "Resolved"
                                  ? "Reopen"
                                  : "Resolve"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col justify-between gap-2 border-t border-white/[0.08] px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
                <p>
                  Showing {filteredIncidents.length} of {incidents.length}{" "}
                  incidents
                </p>
                <p>Changes are saved through the backend API.</p>
              </div>
            </section>

            {/* Bottom dashboard panels */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section
                id="priority"
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      Priority monitoring
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Unresolved critical and high-severity incidents
                    </p>
                  </div>
                  <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300">
                    {priorityIncidents.length}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {priorityIncidents.length === 0 ? (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-8 text-center">
                      <span className="text-2xl">✓</span>
                      <p className="mt-2 text-sm text-slate-300">
                        No high-priority active incidents
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        New critical and high-severity incidents will
                        appear here.
                      </p>
                    </div>
                  ) : (
                    priorityIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-300">
                          !
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-slate-200">
                              {incident.type}
                            </p>
                            <Badge
                              className={
                                severityStyles[incident.severity]
                              }
                            >
                              {incident.severity}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            ⌖ {incident.location}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-slate-500">
                          {formatTime(incident.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
                <div>
                  <h3 className="font-semibold text-white">
                    Response overview
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Current incident status distribution
                  </p>
                </div>

                <div className="mt-6 space-y-5">
                  {STATUSES.map((status) => {
                    const count = incidents.filter(
                      (incident) => incident.status === status
                    ).length;

                    const percentage =
                      incidents.length === 0
                        ? 0
                        : (count / incidents.length) * 100;

                    const barColors = {
                      Reported: "bg-red-400",
                      Dispatched: "bg-blue-400",
                      Responding: "bg-amber-400",
                      Resolved: "bg-emerald-400",
                    };

                    return (
                      <div key={status}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${barColors[status]}`}
                            />
                            <span className="text-sm text-slate-300">
                              {status}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {loading ? "—" : count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColors[status]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 rounded-xl border border-blue-400/10 bg-blue-500/[0.05] p-4">
                  <p className="text-sm font-medium text-blue-200">
                    About these metrics
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    These figures reflect saved incident records. They
                    do not represent verified ambulance dispatches or
                    real-world response times.
                  </p>
                </div>
              </section>
            </div>

            <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.06] py-5 text-xs text-slate-600 sm:flex-row sm:items-center">
              <p>RESQ AI · Emergency response dashboard</p>
              <p>Prototype · For development and testing</p>
            </footer>
          </div>
        </main>
      </div>

      {showForm && (
        <ReportModal
          onClose={() => setShowForm(false)}
          onSubmit={addIncident}
          submitting={submitting}
        />
      )}
    </div>
  );
}
