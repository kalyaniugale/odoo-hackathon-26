import { Bell, LogOut, Menu, PanelLeftClose, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authClient from "../services/authService";
import Breadcrumb from "./PageHeader";
import "./Topbar.css";

export default function Topbar({ onToggleSidebar, onOpenMobile }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadUnreadCount = async () => {
      try {
        const { data } = await authClient.get("/notifications");
        if (!isActive) return;
        setUnreadCount(
          (data.notifications || []).filter((notification) => !notification.isRead)
            .length
        );
      } catch {
        if (isActive) setUnreadCount(0);
      }
    };

    loadUnreadCount();

    return () => {
      isActive = false;
    };
  }, []);

  const initials = useMemo(() => {
    const name = user?.name || "User";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-icon topbar-mobile-menu" type="button" onClick={onOpenMobile} aria-label="Open navigation">
          <Menu size={18} strokeWidth={1.8} />
        </button>
        <button className="topbar-icon topbar-collapse" type="button" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <PanelLeftClose size={18} strokeWidth={1.8} />
        </button>
        <div className="topbar-breadcrumb">
          <Breadcrumb compact />
        </div>
      </div>

      <div className="topbar-actions">
        <Link className="topbar-bell" to="/notifications" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.8} />
          {unreadCount > 0 && <span>{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </Link>

        <div className="topbar-profile">
          <button
            className="topbar-profile-button"
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
          >
            <span className="topbar-avatar">{initials}</span>
            <span className="topbar-profile-text">
              <strong>{user?.name || "User"}</strong>
              <small>{user?.role || "Role"}</small>
            </span>
          </button>

          {isProfileOpen && (
            <div className="topbar-profile-menu">
              <div>
                <UserRound size={16} strokeWidth={1.8} />
                <span>{user?.email || "No email"}</span>
              </div>
              <button type="button" onClick={handleLogout}>
                <LogOut size={16} strokeWidth={1.8} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
