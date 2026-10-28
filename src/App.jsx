import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bell,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Siren,
  X,
} from "lucide-react";

const initialIncidents = [
  {
    id: "RQ-1001",
    type: "Road Accident",
    location: "NH-24, Rural Highway",
    severity: "Critical",
    status: "Responding",
    time: "5 min ago",
  },
  {
    id: "RQ-1002",
    type: "Medical Emergency",
    location: "Village Rampur",
    severity: "High",
    status: "Dispatched",
    time: "12 min ago",
  },
  {
    id: "RQ-1003",
    type: "Vehicle Collision",
    location: "Near Primary School",
    severity: "Medium",
    status: "Reported",
    time: "18 min ago",
  },
  {
    id: "RQ-1004",
    type: "Fire Emergency",
    location: "Village Moradabad",
    severity: "Critical",
    status: "Responding",
    time: "22 min ago",
  },
  {
    id: "RQ-1005",
    type: "Medical Emergency",
    location: "Community Health Center",
    severity: "Low",
    status: "Resolved",
    time: "35 min ago",
  },
];

const severityStyles = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const statusStyles = {
  Reported: "bg-slate-500/15 text-slate-300",
  Dispatched: "bg-blue-500/15 text-blue-400",
  Responding: "bg-orange-500/15 text-orange-400",
  Resolved: "bg-emerald-500/15 text-emerald-400",
};

const statCards = [
  {
    title: "Total Incidents",
    key: "total",
    icon: Activity,
    color: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    title: "Critical Incidents",
    key: "critical",
    icon: AlertTriangle,
    color: "text-red-400",
    iconBg: "bg-red-500/10",
  },
  {
    title: "Active Responses",
    key: "active",
    icon: Ambulance,
    color: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  {
    title: "Resolved Incidents",
    key: "resolved",
    icon: CheckCircle2,
    color: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
];

export default function App() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");

  const [newType, setNewType] = useState("Road Accident");
  const [newLocation, setNewLocation] = useState("");
  const [newSeverity, setNewSeverity] = useState("High");

  // Calculate dashboard statistics from current incident data.
  const stats = {
    total: incidents.length,
    critical: incidents.filter(
      (incident) => incident.severity === "Critical"
    ).length,
    active: incidents.filter((incident) =>
      ["Responding", "Dispatched"].includes(incident.status)
    ).length,
    resolved: incidents.filter(
      (incident) => incident.status === "Resolved"
    ).length,
  };

  // Search by incident ID, type, or location.
  const filteredIncidents = incidents.filter((incident) => {
    const query = search.toLowerCase();

    const matchesSearch = [
      incident.id,
      incident.type,
      incident.location,
    ].some((value) => value.toLowerCase().includes(query));

    const matchesSeverity =
      severityFilter === "All" ||
      incident.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  function addIncident(event) {
    event.preventDefault();

    if (!newLocation.trim()) {
      setNotice("Please enter the incident location.");
      return;
    }

    // Generate the next ID from the highest existing ID.
    const nextId =
      incidents.reduce((max, incident) => {
        const number = Number(incident.id.split("-")[1]);
        return Math.max(max, number || 0);
      }, 1000) + 1;

    const incident = {
      id: `RQ-${nextId}`,
      type: newType,
      location: newLocation.trim(),
      severity: newSeverity,
      status: "Reported",
      time: "Just now",
    };

    setIncidents((current) => [incident, ...current]);
    setNewLocation("");
    setNewType("Road Accident");
    setNewSeverity("High");
    setShowForm(false);
    setNotice(`${incident.id} created successfully.`);
  }

  function toggleResolved(id) {
    const incidentToUpdate = incidents.find(
      (incident) => incident.id === id
    );

    if (!incidentToUpdate) return;

    const willResolve = incidentToUpdate.status !== "Resolved";

    setIncidents((current) =>
      current.map((incident) => {
        if (incident.id !== id) return incident;

        return {
          ...incident,
          status: willResolve ? "Resolved" : "Reported",
        };
      })
    );

    setNotice(
      willResolve
        ? `${id} marked as resolved.`
        : `${id} reopened and marked as reported.`
    );
  }

  function dismissNotice() {
    setNotice("");
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100">
      {/* Mobile navigation overlay */}
      {showMobileMenu && (
        <button
          aria-label="Close navigation"
          onClick={() => setShowMobileMenu(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0c1322] transition-transform duration-200 md:translate-x-0 ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <ShieldCheck size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                RESQ <span className="text-blue-400">AI</span>
              </h1>
              <p className="text-xs text-slate-500">
                Emergency Response
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowMobileMenu(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-3 text-blue-400">
            <LayoutDashboard size={19} />
            <span className="text-sm font-medium">
              Command Dashboard
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-slate-400">
            <MapPin size={19} />
            <span className="text-sm">Incident Locations</span>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-slate-400">
            <Ambulance size={19} />
            <span className="text-sm">Response Units</span>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-slate-400">
            <Activity size={19} />
            <span className="text-sm">Activity Monitor</span>
          </div>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-sm font-medium">
                System Operational
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Demo dashboard. Live emergency service connections are
              not configured.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-white/10 bg-[#080d18]/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="rounded-lg border border-white/10 p-2 text-slate-300 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold md:text-xl">
                Command Center
              </h2>
              <p className="hidden text-xs text-slate-500 sm:block">
                Emergency monitoring and incident management
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                Demo Mode
              </span>
            </div>

            <button
              onClick={() =>
                setNotice("You have no new dashboard notifications.")
              }
              className="relative rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/5"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-300">
              R
            </div>
          </div>
        </header>

        <div className="space-y-7 p-4 md:p-8">
          {/* Page heading */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-blue-400">
                <Activity size={15} />
                Live Operations Overview
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Emergency Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Monitor incidents and coordinate response activity.
              </p>
            </div>

            <button
              onClick={() => {
                setNotice("");
                setShowForm(true);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400"
            >
              <Plus size={18} />
              Report Incident
            </button>
          </section>

          {/* Notification */}
          {notice && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200"
            >
              <span>{notice}</span>
              <button
                onClick={dismissNotice}
                aria-label="Dismiss notification"
                className="shrink-0 rounded p-1 hover:bg-white/10"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.key}
                  className="rounded-2xl border border-white/10 bg-[#0c1322] p-5 transition hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">
                        {card.title}
                      </p>
                      <p className="mt-3 text-3xl font-bold tabular-nums">
                        {stats[card.key]}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} ${card.color}`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    Updated from current incident records
                  </p>
                </div>
              );
            })}
          </section>

          {/* Incidents table */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1322]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  Incident Management
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Review reports and update their resolution status.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#080d18] px-3">
                  <Search size={17} className="shrink-0 text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search incidents..."
                    aria-label="Search incidents"
                    className="min-w-0 bg-transparent py-3 text-sm outline-none placeholder:text-slate-600 sm:w-48"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="text-slate-500 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <select
                  value={severityFilter}
                  onChange={(event) =>
                    setSeverityFilter(event.target.value)
                  }
                  aria-label="Filter by severity"
                  className="rounded-xl border border-white/10 bg-[#080d18] px-3 py-3 text-sm text-slate-300 outline-none"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4 font-medium">Incident</th>
                    <th className="px-5 py-4 font-medium">Location</th>
                    <th className="px-5 py-4 font-medium">Severity</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Reported</th>
                    <th className="px-5 py-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-200">
                          {incident.type}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {incident.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <MapPin
                            size={15}
                            className="shrink-0 text-slate-500"
                          />
                          {incident.location}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            severityStyles[incident.severity] ||
                            severityStyles.Low
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusStyles[incident.status] ||
                            statusStyles.Reported
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {incident.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-400">
                          <Clock3 size={15} />
                          {incident.time}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleResolved(incident.id)}
                          className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition ${
                            incident.status === "Resolved"
                              ? "border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                              : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {incident.status === "Resolved"
                            ? "Reopen"
                            : "Resolve"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredIncidents.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-14 text-center"
                      >
                        <Search
                          size={30}
                          className="mx-auto text-slate-600"
                        />
                        <p className="mt-3 text-sm font-medium text-slate-300">
                          No incidents found
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Try another search or severity filter.
                        </p>
                        <button
                          onClick={() => {
                            setSearch("");
                            setSeverityFilter("All");
                          }}
                          className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredIncidents.length} of {incidents.length} incidents
              </span>
              <span>RESQ AI · Prototype Dashboard</span>
            </div>
          </section>

          {/* Map placeholder */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1322]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5">
              <div>
                <h3 className="font-semibold">Response Coverage</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Planned area for incident mapping
                </p>
              </div>
              <MapPin size={20} className="text-blue-400" />
            </div>

            <div className="relative flex min-h-56 items-center justify-center overflow-hidden bg-[#0a1220] p-6">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(100,150,200,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(100,150,200,.25) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />

              <div className="relative max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <MapPin size={27} />
                </div>
                <h4 className="mt-4 font-semibold">
                  Incident Map Coming Next
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This placeholder can later be connected to a real map
                  with incident coordinates, ambulance locations, and
                  response routes.
                </p>
              </div>
            </div>
          </section>

          <footer className="pb-4 text-center text-xs text-slate-600">
            RESQ AI Prototype · Built for emergency response coordination
          </footer>
        </div>
      </main>

      {/* Add incident modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1322] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Siren size={20} />
                  <h3 className="text-lg font-semibold text-white">
                    Report an Incident
                  </h3>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the details of the reported emergency.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addIncident} className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="incidentType"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Incident Type
                </label>
                <select
                  id="incidentType"
                  value={newType}
                  onChange={(event) => setNewType(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option>Road Accident</option>
                  <option>Medical Emergency</option>
                  <option>Vehicle Collision</option>
                  <option>Fire Emergency</option>
                  <option>Other Emergency</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="incidentLocation"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Incident Location
                </label>
                <input
                  id="incidentLocation"
                  value={newLocation}
                  onChange={(event) => setNewLocation(event.target.value)}
                  placeholder="e.g. NH-24, near Village Rampur"
                  required
                  maxLength={150}
                  className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="incidentSeverity"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Severity
                </label>
                <select
                  id="incidentSeverity"
                  value={newSeverity}
                  onChange={(event) => setNewSeverity(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200/80">
                Prototype only: this form does not contact emergency
                services or dispatch an ambulance.
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400"
                >
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}