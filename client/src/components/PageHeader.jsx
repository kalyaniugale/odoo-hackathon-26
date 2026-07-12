import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "./PageHeader.css";

const PAGE_META = {
  "/dashboard": {
    title: "Dashboard",
    eyebrow: "Overview",
  },
  "/organization-setup": {
    title: "Organization Setup",
    eyebrow: "Admin",
  },
  "/assets": {
    title: "Assets",
    eyebrow: "Registry",
  },
  "/allocation-transfer": {
    title: "Allocation",
    eyebrow: "Asset movement",
  },
  "/resource-booking": {
    title: "Resource Booking",
    eyebrow: "Shared resources",
  },
  "/maintenance": {
    title: "Maintenance",
    eyebrow: "Service desk",
  },
  "/audit": {
    title: "Audit",
    eyebrow: "Verification",
  },
  "/reports": {
    title: "Reports",
    eyebrow: "Analytics",
  },
  "/notifications": {
    title: "Notifications",
    eyebrow: "Inbox",
  },
  "/activity-logs": {
    title: "Activity Logs",
    eyebrow: "Admin audit trail",
  },
};

const getMeta = (pathname) => {
  if (pathname.startsWith("/assets/")) {
    return { title: "Asset Details", eyebrow: "Registry" };
  }

  return PAGE_META[pathname] || { title: "AssetFlow", eyebrow: "Workspace" };
};

export default function PageHeader({ compact = false }) {
  const location = useLocation();
  const meta = getMeta(location.pathname);
  const parts = location.pathname.split("/").filter(Boolean);

  if (compact) {
    return (
      <nav className="breadcrumb breadcrumb--compact" aria-label="Breadcrumb">
        <Link to="/dashboard">Home</Link>
        {parts.map((part, index) => {
          const path = `/${parts.slice(0, index + 1).join("/")}`;
          const label = index === parts.length - 1 ? meta.title : part.replace(/-/g, " ");
          return (
            <span key={path}>
              <ChevronRight size={13} strokeWidth={1.8} />
              <Link to={path}>{label}</Link>
            </span>
          );
        })}
      </nav>
    );
  }

  return (
    <section className="page-header">
      <div>
        <p>{meta.eyebrow}</p>
        <h1>{meta.title}</h1>
      </div>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/dashboard">Home</Link>
        {parts.map((part, index) => {
          const path = `/${parts.slice(0, index + 1).join("/")}`;
          const label = index === parts.length - 1 ? meta.title : part.replace(/-/g, " ");
          return (
            <span key={path}>
              <ChevronRight size={13} strokeWidth={1.8} />
              <Link to={path}>{label}</Link>
            </span>
          );
        })}
      </nav>
    </section>
  );
}
