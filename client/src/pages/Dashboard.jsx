import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  FileText,
  PackageCheck,
  Plus,
  Repeat2,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import authClient from "../services/authService";
import "./Dashboard.css";

const KPI_META = {
  availableAssets: {
    label: "Available Assets",
    icon: PackageCheck,
    tone: "red",
  },
  allocatedAssets: {
    label: "Allocated Assets",
    icon: Boxes,
    tone: "black",
  },
  maintenanceToday: {
    label: "Maintenance Today",
    icon: Wrench,
    tone: "red",
  },
  activeBookings: {
    label: "Active Bookings",
    icon: CalendarDays,
    tone: "black",
  },
  pendingTransfers: {
    label: "Pending Transfers",
    icon: Repeat2,
    tone: "red",
  },
  upcomingReturns: {
    label: "Upcoming Returns",
    icon: Clock,
    tone: "black",
  },
  overdueReturns: {
    label: "Overdue Returns",
    icon: Activity,
    tone: "red",
  },
  departments: {
    label: "Departments",
    icon: Building2,
    tone: "black",
  },
  employees: {
    label: "Employees",
    icon: Users,
    tone: "black",
  },
  categories: {
    label: "Categories",
    icon: ClipboardCheck,
    tone: "black",
  },
  openAudits: {
    label: "Open Audits",
    icon: ShieldCheck,
    tone: "red",
  },
  maintenanceRequests: {
    label: "Maintenance Requests",
    icon: Wrench,
    tone: "red",
  },
  assetsUnderMaintenance: {
    label: "Assets Under Maintenance",
    icon: Wrench,
    tone: "red",
  },
  departmentAssets: {
    label: "Department Assets",
    icon: Boxes,
    tone: "black",
  },
  departmentEmployees: {
    label: "Department Employees",
    icon: Users,
    tone: "black",
  },
  departmentBookings: {
    label: "Department Bookings",
    icon: CalendarDays,
    tone: "black",
  },
  allocatedAssetsEmployee: {
    label: "My Allocated Assets",
    icon: Boxes,
    tone: "black",
  },
  myBookings: {
    label: "My Bookings",
    icon: CalendarDays,
    tone: "black",
  },
  myMaintenanceRequests: {
    label: "My Maintenance Requests",
    icon: Wrench,
    tone: "red",
  },
};

const ROLE_ACTIONS = {
  Admin: [
    {
      label: "Manage employees",
      to: "/organization-setup",
      icon: Users,
    },
    {
      label: "Open reports",
      to: "/reports",
      icon: BarChart3,
    },
    {
      label: "Review audits",
      to: "/audit",
      icon: ShieldCheck,
    },
  ],
  "Asset Manager": [
    {
      label: "Register asset",
      to: "/assets",
      icon: Plus,
    },
    {
      label: "Manage allocations",
      to: "/allocation-transfer",
      icon: Repeat2,
    },
    {
      label: "Maintenance queue",
      to: "/maintenance",
      icon: Wrench,
    },
  ],
  "Department Head": [
    {
      label: "Book resource",
      to: "/resource-booking",
      icon: CalendarDays,
    },
    {
      label: "Review transfers",
      to: "/allocation-transfer",
      icon: Repeat2,
    },
    {
      label: "Maintenance requests",
      to: "/maintenance",
      icon: Wrench,
    },
  ],
  Employee: [
    {
      label: "Book resource",
      to: "/resource-booking",
      icon: CalendarDays,
    },
    {
      label: "Raise maintenance",
      to: "/maintenance",
      icon: Wrench,
    },
    {
      label: "Request transfer",
      to: "/allocation-transfer",
      icon: Repeat2,
    },
  ],
};

const formatMetricLabel = (key, role) => {
  if (role === "Employee" && key === "allocatedAssets") {
    return KPI_META.allocatedAssetsEmployee.label;
  }

  if (KPI_META[key]) {
    return KPI_META[key].label;
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
};

const getMetricMeta = (key, role) => {
  if (role === "Employee" && key === "allocatedAssets") {
    return KPI_META.allocatedAssetsEmployee;
  }

  return KPI_META[key] || { icon: Activity, tone: "black" };
};

function KpiCard({ label, value, icon: Icon, tone }) {
  return (
    <article className={`dashboard-kpi dashboard-kpi--${tone}`}>
      <div className="dashboard-kpi__top">
        <span>{label}</span>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <strong>{Number(value || 0).toLocaleString("en-IN")}</strong>
    </article>
  );
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [error, setError] = useState("");

  const role = dashboardData?.role || "Employee";
  const metrics = dashboardData?.dashboard || {};

  const kpiCards = useMemo(() => {
    return Object.entries(metrics).map(([key, value]) => {
      const meta = getMetricMeta(key, role);

      return {
        key,
        label: formatMetricLabel(key, role),
        value,
        icon: meta.icon,
        tone: meta.tone,
      };
    });
  }, [metrics, role]);

  const quickActions = ROLE_ACTIONS[role] || ROLE_ACTIONS.Employee;
  const overdueReturns = Number(metrics.overdueReturns || 0);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await authClient.get("/dashboard");

        if (!isActive) return;

        setDashboardData(data);
      } catch (requestError) {
        if (!isActive) return;

        const message =
          requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load dashboard";

        setError(message);
        toast.error(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!dashboardData?.role) return;

    let isActive = true;

    const loadRecentItems = async () => {
      setRecentLoading(true);

      try {
        const endpoint =
          dashboardData.role === "Admin" ? "/activity-logs" : "/notifications";
        const { data } = await authClient.get(endpoint);

        if (!isActive) return;

        const items =
          dashboardData.role === "Admin"
            ? (data.logs || []).map((log) => ({
                id: log._id,
                title: log.action,
                description: log.description || log.module,
                timestamp: log.createdAt,
                type: log.module,
              }))
            : (data.notifications || []).map((notification) => ({
                id: notification._id,
                title: notification.title,
                description: notification.message,
                timestamp: notification.createdAt,
                type: notification.type,
              }));

        setRecentItems(items.slice(0, 5));
      } catch {
        if (isActive) {
          setRecentItems([]);
        }
      } finally {
        if (isActive) {
          setRecentLoading(false);
        }
      }
    };

    loadRecentItems();

    return () => {
      isActive = false;
    };
  }, [dashboardData?.role]);

  if (loading) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-hero dashboard-hero--loading">
          <p className="dashboard-eyebrow">AssetFlow</p>
          <h1>Loading dashboard</h1>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-error-panel">
          <p className="dashboard-eyebrow">Dashboard unavailable</p>
          <h1>{error}</h1>
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Today&apos;s Overview</p>
          <h1>{role} Dashboard</h1>
        </div>
        <div className="dashboard-role-badge">
          <ShieldCheck size={18} strokeWidth={1.8} />
          <span>{role}</span>
        </div>
      </section>

      <section className="dashboard-kpi-grid" aria-label="Dashboard metrics">
        {kpiCards.map((card) => (
          <KpiCard
            key={card.key}
            label={card.label}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </section>

      {Object.prototype.hasOwnProperty.call(metrics, "overdueReturns") && (
        <section
          className={`dashboard-alert ${
            overdueReturns > 0 ? "dashboard-alert--active" : ""
          }`}
        >
          <Activity size={20} strokeWidth={1.8} />
          <span>
            {overdueReturns > 0
              ? `${overdueReturns} return${overdueReturns === 1 ? "" : "s"} overdue`
              : "No overdue returns"}
          </span>
        </section>
      )}

      <section className="dashboard-content-grid">
        <article className="dashboard-panel dashboard-actions-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-eyebrow">Workflow</p>
              <h2>Quick actions</h2>
            </div>
          </div>

          <div className="dashboard-actions">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link className="dashboard-action" key={action.label} to={action.to}>
                  <Icon size={20} strokeWidth={1.8} />
                  <span>{action.label}</span>
                  <ArrowRight size={18} strokeWidth={1.8} />
                </Link>
              );
            })}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-eyebrow">Live feed</p>
              <h2>Recent activity</h2>
            </div>
            {role === "Admin" ? (
              <FileText size={22} strokeWidth={1.8} />
            ) : (
              <Bell size={22} strokeWidth={1.8} />
            )}
          </div>

          <div className="dashboard-activity-list">
            {recentLoading && (
              <div className="dashboard-empty">Loading recent activity</div>
            )}

            {!recentLoading && recentItems.length === 0 && (
              <div className="dashboard-empty">No recent activity available</div>
            )}

            {!recentLoading &&
              recentItems.map((item) => (
                <div className="dashboard-activity-item" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                  <time>
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : item.type}
                  </time>
                </div>
              ))}
          </div>
        </article>
      </section>
    </main>
  );
}
