import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Pencil,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import authClient from "../services/authService";
import "./Booking.css";

const STATUS_OPTIONS = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

const getAssetLabel = (asset) => {
  if (!asset) return "-";
  if (typeof asset === "string") return asset;
  return `${asset.assetTag || ""} ${asset.name || ""}`.trim();
};

const getName = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value.email || "-";
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function StatusBadge({ status }) {
  const key = String(status || "Upcoming").toLowerCase();
  return <span className={`booking-status booking-status--${key}`}>{status}</span>;
}

function BookingModal({ booking, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    startTime: toDateTimeLocal(booking.startTime),
    endTime: toDateTimeLocal(booking.endTime),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
    });
  };

  return (
    <div className="booking-modal-backdrop" role="presentation">
      <section className="booking-modal" role="dialog" aria-modal="true">
        <div className="booking-modal-header">
          <div>
            <p className="booking-eyebrow">Reschedule</p>
            <h2>{getAssetLabel(booking.asset)}</h2>
          </div>
          <button className="booking-icon-button" type="button" onClick={onClose}>
            <X size={17} strokeWidth={1.8} />
          </button>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <label>
            <span>Start time</span>
            <input
              required
              type="datetime-local"
              value={form.startTime}
              onChange={(event) =>
                setForm((current) => ({ ...current, startTime: event.target.value }))
              }
            />
          </label>

          <label>
            <span>End time</span>
            <input
              required
              type="datetime-local"
              value={form.endTime}
              onChange={(event) =>
                setForm((current) => ({ ...current, endTime: event.target.value }))
              }
            />
          </label>

          <div className="booking-modal-actions">
            <button
              className="booking-button booking-button--ghost"
              type="button"
              disabled={submitting}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="booking-button booking-button--primary"
              type="submit"
              disabled={submitting}
            >
              <Check size={15} strokeWidth={1.8} />
              {submitting ? "Saving" : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Booking() {
  const { user } = useAuth();
  const canManageBookings =
    user?.role === "Department Head" || user?.role === "Employee";

  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [form, setForm] = useState({
    asset: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  const sharedAssets = useMemo(
    () => assets.filter((asset) => asset.shared && asset.status !== "Disposed"),
    [assets]
  );

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;

    return bookings.filter((booking) =>
      [
        getAssetLabel(booking.asset),
        getName(booking.bookedBy),
        booking.purpose,
        booking.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [bookings, search]);

  const timelineBookings = useMemo(() => {
    return [...filteredBookings]
      .sort((first, second) => new Date(first.startTime) - new Date(second.startTime))
      .slice(0, 8);
  }, [filteredBookings]);

  const loadBookings = async () => {
    setLoading(true);

    try {
      const [bookingResponse, assetResponse] = await Promise.all([
        authClient.get("/bookings", { params: { status } }),
        authClient.get("/assets"),
      ]);

      setBookings(bookingResponse.data.bookings || []);
      setAssets(assetResponse.data.assets || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [status]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setSubmitting("create");

    try {
      await authClient.post("/bookings", {
        asset: form.asset,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        purpose: form.purpose,
      });
      toast.success("Booking created successfully");
      setForm({ asset: "", startTime: "", endTime: "", purpose: "" });
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const cancelBooking = async (booking) => {
    setSubmitting(`cancel-${booking._id}`);

    try {
      await authClient.put(`/bookings/cancel/${booking._id}`);
      toast.success("Booking cancelled");
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const rescheduleBooking = async (payload) => {
    setSubmitting("reschedule");

    try {
      await authClient.put(`/bookings/reschedule/${rescheduleTarget._id}`, payload);
      toast.success("Booking rescheduled");
      setRescheduleTarget(null);
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  return (
    <main className="booking-page">
      <section className="booking-header">
        <div>
          <p className="booking-eyebrow">Shared resources</p>
          <h1>Resource Booking</h1>
        </div>
        <button className="booking-button booking-button--ghost" type="button" onClick={loadBookings}>
          <RefreshCw size={15} strokeWidth={1.8} />
          Refresh
        </button>
      </section>

      <section className="booking-layout">
        {canManageBookings && (
          <form className="booking-panel booking-form" onSubmit={submitBooking}>
            <div className="booking-panel-title">
              <CalendarDays size={17} strokeWidth={1.8} />
              <h2>Booking Form</h2>
            </div>

            <label>
              <span>Resource</span>
              <div className="booking-select">
                <select
                  required
                  value={form.asset}
                  onChange={(event) => updateForm("asset", event.target.value)}
                >
                  <option value="">Select shared asset</option>
                  {sharedAssets.map((asset) => (
                    <option key={asset._id} value={asset._id}>
                      {asset.assetTag} - {asset.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} strokeWidth={1.8} />
              </div>
            </label>

            <label>
              <span>Start time</span>
              <input
                required
                type="datetime-local"
                value={form.startTime}
                onChange={(event) => updateForm("startTime", event.target.value)}
              />
            </label>

            <label>
              <span>End time</span>
              <input
                required
                type="datetime-local"
                value={form.endTime}
                onChange={(event) => updateForm("endTime", event.target.value)}
              />
            </label>

            <label>
              <span>Purpose</span>
              <textarea
                rows={3}
                value={form.purpose}
                onChange={(event) => updateForm("purpose", event.target.value)}
              />
            </label>

            <button className="booking-button booking-button--primary" type="submit" disabled={submitting === "create"}>
              <Check size={15} strokeWidth={1.8} />
              {submitting === "create" ? "Booking" : "Book resource"}
            </button>
          </form>
        )}

        <section className="booking-panel">
          <div className="booking-panel-title">
            <Clock size={17} strokeWidth={1.8} />
            <h2>Calendar List</h2>
          </div>

          <div className="booking-timeline">
            {loading && <div className="booking-empty">Loading bookings</div>}
            {!loading && timelineBookings.length === 0 && (
              <div className="booking-empty">No bookings found</div>
            )}
            {!loading &&
              timelineBookings.map((booking) => (
                <article className="booking-slot" key={booking._id}>
                  <time>{formatDateTime(booking.startTime)}</time>
                  <div>
                    <strong>{getAssetLabel(booking.asset)}</strong>
                    <span>
                      {formatDateTime(booking.startTime)} -{" "}
                      {formatDateTime(booking.endTime)}
                    </span>
                  </div>
                  <StatusBadge status={booking.status} />
                </article>
              ))}
          </div>
        </section>
      </section>

      <section className="booking-table-panel">
        <div className="booking-table-header">
          <div>
            <p className="booking-eyebrow">Bookings</p>
            <h2>List</h2>
          </div>
          <div className="booking-filter-bar">
            <div className="booking-search">
              <Search size={15} strokeWidth={1.8} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bookings"
              />
            </div>
            <div className="booking-select booking-select--small">
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="booking-table-scroll">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Booked By</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <strong>{getAssetLabel(booking.asset)}</strong>
                  </td>
                  <td>{getName(booking.bookedBy)}</td>
                  <td>
                    <span>{formatDateTime(booking.startTime)}</span>
                    <span>{formatDateTime(booking.endTime)}</span>
                  </td>
                  <td>{booking.purpose || "-"}</td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                  <td>
                    <div className="booking-row-actions">
                      {canManageBookings && booking.status !== "Cancelled" && (
                        <>
                          <button
                            className="booking-icon-button"
                            type="button"
                            onClick={() => setRescheduleTarget(booking)}
                            title="Reschedule"
                          >
                            <Pencil size={15} strokeWidth={1.8} />
                          </button>
                          <button
                            className="booking-icon-button booking-icon-button--danger"
                            type="button"
                            onClick={() => cancelBooking(booking)}
                            disabled={submitting === `cancel-${booking._id}`}
                            title="Cancel"
                          >
                            <X size={15} strokeWidth={1.8} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredBookings.length === 0 && (
          <div className="booking-empty">No booking records match the filters</div>
        )}
      </section>

      {rescheduleTarget && (
        <BookingModal
          booking={rescheduleTarget}
          submitting={submitting === "reschedule"}
          onClose={() => {
            if (submitting !== "reschedule") setRescheduleTarget(null);
          }}
          onSubmit={rescheduleBooking}
        />
      )}
    </main>
  );
}
