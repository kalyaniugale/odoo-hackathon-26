import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CalendarDays,
  LayoutDashboard,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
  },
  {
    label: "Organization",
    to: "/organization-setup",
    icon: Building2,
    roles: ["Admin"],
  },
  {
    label: "Assets",
    to: "/assets",
    icon: Boxes,
    roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
  },
  {
    label: "Allocation",
    to: "/allocation-transfer",
    icon: BookOpen,
    roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
  },
  {
    label: "Booking",
    to: "/resource-booking",
    icon: CalendarDays,
    roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
  },
  {
    label: "Maintenance",
    to: "/maintenance",
    icon: Wrench,
    roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
  },
  {
    label: "Audit",
    to: "/audit",
    icon: ShieldCheck,
    roles: ["Admin", "Asset Manager"],
  },
  {
    label: "Reports",
    to: "/reports",
    icon: BarChart3,
    roles: ["Admin"],
  },
  {
    label: "Notifications",
    to: "/notifications",
    icon: Bell,
    roles: ["Admin", "Asset Manager", "Department Head", "Employee"],
  },
  {
    label: "Activity Logs",
    to: "/activity-logs",
    icon: Activity,
    roles: ["Admin"],
  },
];

export default function Sidebar({ collapsed, onCloseMobile }) {
  const { user } = useAuth();
  const role = user?.role || "Employee";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar-header">
        <NavLink className="sidebar-logo" to="/dashboard" onClick={onCloseMobile}>
          <span>AF</span>
          <strong>AssetFlow</strong>
        </NavLink>
        <button className="sidebar-close" type="button" onClick={onCloseMobile}>
          <X size={17} strokeWidth={1.8} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              className="sidebar-link"
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-meta">
        <span>{role}</span>
      </div>
    </aside>
  );
}
