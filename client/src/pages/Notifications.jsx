import {
  Bell,
  Check,
  ChevronDown,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import authClient from "../services/authService";
import "./Notifications.css";

const FILTERS = ["All", "Unread", "Read"];
const TYPES = ["All", "Allocation", "Transfer", "Booking", "Maintenance", "Audit", "Reminder"];

const formatTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ReadBadge({ isRead }) {
  return (
    <span className={`notification-read-badge ${isRead ? "is-read" : "is-unread"}`}>
      {isRead ? "Read" : "Unread"}
    </span>
  );
}

function TypeBadge({ type }) {
  const key = String(type || "Reminder").toLowerCase();
  return <span className={`notification-type notification-type--${key}`}>{type}</span>;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [readFilter, setReadFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesRead =
        readFilter === "All" ||
        (readFilter === "Unread" && !notification.isRead) ||
        (readFilter === "Read" && notification.isRead);

      const matchesType = typeFilter === "All" || notification.type === typeFilter;

      const matchesSearch =
        !query ||
        [notification.title, notification.message, notification.type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesRead && matchesType && matchesSearch;
    });
  }, [notifications, readFilter, typeFilter, search]);

  const loadNotifications = async () => {
    setLoading(true);

    try {
      const { data } = await authClient.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (notification) => {
    setSubmitting(`read-${notification._id}`);

    try {
      await authClient.put(`/notifications/${notification._id}/read`);
      toast.success("Notification marked as read");
      await loadNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const deleteNotification = async (notification) => {
    setSubmitting(`delete-${notification._id}`);

    try {
      await authClient.delete(`/notifications/${notification._id}`);
      toast.success("Notification deleted");
      await loadNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  return (
    <main className="notifications-page">
      <section className="notifications-header">
        <div>
          <p className="notifications-eyebrow">Inbox</p>
          <h1>Notifications</h1>
        </div>
        <button className="notifications-button notifications-button--ghost" type="button" onClick={loadNotifications}>
          <RefreshCw size={15} strokeWidth={1.8} />
          Refresh
        </button>
      </section>

      <section className="notifications-summary">
        <article>
          <span>Total</span>
          <strong>{notifications.length}</strong>
        </article>
        <article>
          <span>Unread</span>
          <strong>{unreadCount}</strong>
        </article>
        <article>
          <span>Read</span>
          <strong>{notifications.length - unreadCount}</strong>
        </article>
      </section>

      <section className="notifications-toolbar">
        <div className="notifications-tabs">
          {FILTERS.map((filter) => (
            <button
              className={`notifications-tab ${readFilter === filter ? "is-active" : ""}`}
              key={filter}
              type="button"
              onClick={() => setReadFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="notifications-search">
          <Search size={15} strokeWidth={1.8} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notifications"
          />
        </div>

        <div className="notifications-select">
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown size={15} strokeWidth={1.8} />
        </div>
      </section>

      <section className="notifications-panel">
        <div className="notifications-panel-header">
          <div>
            <p className="notifications-eyebrow">Activity</p>
            <h2>Notification List</h2>
          </div>
          <Bell size={18} strokeWidth={1.8} />
        </div>

        {loading && <div className="notifications-empty">Loading notifications</div>}

        {!loading && filteredNotifications.length === 0 && (
          <div className="notifications-empty">No notifications match the filters</div>
        )}

        {!loading && filteredNotifications.length > 0 && (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <article
                className={`notification-item ${notification.isRead ? "is-read" : "is-unread"}`}
                key={notification._id}
              >
                <div className="notification-main">
                  <div className="notification-title-row">
                    <strong>{notification.title}</strong>
                    <ReadBadge isRead={notification.isRead} />
                  </div>
                  <p>{notification.message}</p>
                  <div className="notification-meta">
                    <TypeBadge type={notification.type} />
                    <time>{formatTime(notification.createdAt)}</time>
                  </div>
                </div>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="notifications-icon-button"
                      type="button"
                      onClick={() => markAsRead(notification)}
                      disabled={submitting === `read-${notification._id}`}
                      title="Mark as read"
                    >
                      <Check size={15} strokeWidth={1.8} />
                    </button>
                  )}
                  <button
                    className="notifications-icon-button notifications-icon-button--danger"
                    type="button"
                    onClick={() => deleteNotification(notification)}
                    disabled={submitting === `delete-${notification._id}`}
                    title="Delete notification"
                  >
                    <Trash2 size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
