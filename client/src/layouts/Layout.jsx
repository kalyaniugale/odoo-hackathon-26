import { useState } from "react";
import { Outlet } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./Layout.css";

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div
      className={`app-layout ${
        isSidebarCollapsed ? "is-sidebar-collapsed" : ""
      } ${isMobileOpen ? "is-mobile-open" : ""}`}
    >
      <Sidebar
        collapsed={isSidebarCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="app-shell">
        <Topbar
          onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        <main className="app-content">
          <PageHeader />
          <Outlet />
        </main>
      </div>

      {isMobileOpen && (
        <button
          className="layout-mobile-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
