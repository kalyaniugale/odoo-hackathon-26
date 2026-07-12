import { CalendarDays, ChevronDown, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import authClient from "../services/authService";
import "./ActivityLogs.css";

const MODULES = [
  "All",
  "Authentication",
  "Department",
  "Category",
  "Employee",
  "Asset",
  "Allocation",
  "Booking",
  "Maintenance",
  "Audit",
];

const getUser = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;
  return user.name || user.email || "-";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ModuleBadge({ module }) {
  return <span className="logs-module-badge">{module}</span>;
}

export default function ActivityLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "Admin";

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesModule =
        moduleFilter === "All" || log.module === moduleFilter;

      const matchesDate =
        !dateFilter ||
        new Date(log.createdAt).toISOString().slice(0, 10) === dateFilter;

      const matchesSearch =
        !query ||
        [
          getUser(log.user),
          log.user?.email,
          log.action,
          log.module,
          log.description,
          log.ipAddress,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesModule && matchesDate && matchesSearch;
    });
  }, [logs, search, moduleFilter, dateFilter]);

  const loadLogs = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data } = await authClient.get("/activity-logs");
      setLogs(data.logs || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load activity logs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [isAdmin]);

  return (
    <main className="logs-page">
      <section className="logs-header">
        <div>
          <p className="logs-eyebrow">Admin audit trail</p>
          <h1>Activity Logs</h1>
        </div>
        <button className="logs-button logs-button--ghost" type="button" onClick={loadLogs}>
          <RefreshCw size={15} strokeWidth={1.8} />
          Refresh
        </button>
      </section>

      <section className="logs-summary">
        <article>
          <span>Total Logs</span>
          <strong>{logs.length}</strong>
        </article>
        <article>
          <span>Filtered</span>
          <strong>{filteredLogs.length}</strong>
        </article>
        <article>
          <span>Modules</span>
          <strong>{new Set(logs.map((log) => log.module)).size}</strong>
        </article>
      </section>

      <section className="logs-toolbar">
        <div className="logs-search">
          <Search size={15} strokeWidth={1.8} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user, action, module, description"
          />
        </div>

        <div className="logs-select">
          <select
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
          >
            {MODULES.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          <ChevronDown size={15} strokeWidth={1.8} />
        </div>

        <label className="logs-date">
          <CalendarDays size={15} strokeWidth={1.8} />
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </label>
      </section>

      <section className="logs-table-panel">
        {!isAdmin && (
          <div className="logs-empty">Activity logs are available to Admin users only.</div>
        )}

        {isAdmin && loading && <div className="logs-empty">Loading activity logs</div>}

        {isAdmin && !loading && (
          <div className="logs-table-scroll">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>
                      <strong>{getUser(log.user)}</strong>
                      <span>{log.user?.email || "-"}</span>
                    </td>
                    <td>{log.action}</td>
                    <td>
                      <ModuleBadge module={log.module} />
                    </td>
                    <td>{log.description || "-"}</td>
                    <td>{log.ipAddress || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAdmin && !loading && filteredLogs.length === 0 && (
          <div className="logs-empty">No activity logs match the filters</div>
        )}
      </section>
    </main>
  );
}
