import {
  Check,
  ChevronDown,
  ClipboardList,
  ImagePlus,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import authClient from "../services/authService";
import "./Maintenance.css";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "In Progress", "Resolved"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

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

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function StatusBadge({ status }) {
  const key = String(status || "Pending").toLowerCase().replace(/\s+/g, "-");
  return <span className={`maintenance-status maintenance-status--${key}`}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const key = String(priority || "Medium").toLowerCase();
  return <span className={`maintenance-priority maintenance-priority--${key}`}>{priority}</span>;
}

function SelectField({ label, value, onChange, children, required }) {
  return (
    <label className="maintenance-field">
      <span>{label}</span>
      <div className="maintenance-select">
        <select required={required} value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
        <ChevronDown size={15} strokeWidth={1.8} />
      </div>
    </label>
  );
}

export default function Maintenance() {
  const { user } = useAuth();
  const role = user?.role || "Employee";
  const canViewMaintenance = ["Admin", "Asset Manager", "Department Head"].includes(role);
  const canCreateMaintenance = ["Employee", "Department Head", "Asset Manager"].includes(role);
  const canProcessMaintenance = role === "Asset Manager";

  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [form, setForm] = useState({
    asset: "",
    issue: "",
    priority: "Medium",
    notes: "",
    image: null,
  });
  const [startForm, setStartForm] = useState({ id: "", technician: "" });
  const [resolveForm, setResolveForm] = useState({ id: "", resolution: "", notes: "" });

  const filteredMaintenances = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return maintenances;

    return maintenances.filter((item) =>
      [
        getAssetLabel(item.asset),
        getName(item.raisedBy),
        getName(item.approvedBy),
        item.issue,
        item.priority,
        item.status,
        item.technician,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [maintenances, search]);

  const pendingRequests = useMemo(
    () => maintenances.filter((item) => item.status === "Pending"),
    [maintenances]
  );

  const approvedRequests = useMemo(
    () => maintenances.filter((item) => item.status === "Approved"),
    [maintenances]
  );

  const inProgressRequests = useMemo(
    () => maintenances.filter((item) => item.status === "In Progress"),
    [maintenances]
  );

  const loadModule = async () => {
    setLoading(true);

    try {
      const requests = [authClient.get("/assets")];

      if (canViewMaintenance) {
        requests.push(authClient.get("/maintenances", { params: { status } }));
      }

      const responses = await Promise.all(requests);
      setAssets(responses[0].data.assets || []);

      if (canViewMaintenance) {
        setMaintenances(responses[1].data.maintenances || []);
      } else {
        setMaintenances([]);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load maintenance data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModule();
  }, [status, role]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setSubmitting("create");

    const payload = new FormData();
    payload.append("asset", form.asset);
    payload.append("issue", form.issue.trim());
    payload.append("priority", form.priority);
    payload.append("notes", form.notes.trim());

    if (form.image) {
      payload.append("image", form.image);
    }

    try {
      await authClient.post("/maintenances", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Maintenance request submitted");
      setForm({ asset: "", issue: "", priority: "Medium", notes: "", image: null });
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const processRequest = async (id, action) => {
    setSubmitting(`${action}-${id}`);

    try {
      await authClient.put(`/maintenances/${action}/${id}`);
      toast.success(`Maintenance request ${action}d`);
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const submitStart = async (event) => {
    event.preventDefault();
    setSubmitting("start");

    try {
      await authClient.put(`/maintenances/start/${startForm.id}`, {
        technician: startForm.technician,
      });
      toast.success("Maintenance started");
      setStartForm({ id: "", technician: "" });
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const submitResolve = async (event) => {
    event.preventDefault();
    setSubmitting("resolve");

    try {
      await authClient.put(`/maintenances/resolve/${resolveForm.id}`, {
        resolution: resolveForm.resolution,
        notes: resolveForm.notes,
      });
      toast.success("Maintenance resolved");
      setResolveForm({ id: "", resolution: "", notes: "" });
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  return (
    <main className="maintenance-page">
      <section className="maintenance-header">
        <div>
          <p className="maintenance-eyebrow">Service desk</p>
          <h1>Maintenance</h1>
        </div>
        <button className="maintenance-button maintenance-button--ghost" type="button" onClick={loadModule}>
          <RefreshCw size={15} strokeWidth={1.8} />
          Refresh
        </button>
      </section>

      <section className="maintenance-summary">
        <article>
          <span>Total</span>
          <strong>{maintenances.length}</strong>
        </article>
        <article>
          <span>Pending</span>
          <strong>{pendingRequests.length}</strong>
        </article>
        <article>
          <span>Approved</span>
          <strong>{approvedRequests.length}</strong>
        </article>
        <article>
          <span>In Progress</span>
          <strong>{inProgressRequests.length}</strong>
        </article>
      </section>

      <section className="maintenance-layout">
        {canCreateMaintenance && (
          <form className="maintenance-panel maintenance-form" onSubmit={submitRequest}>
            <div className="maintenance-panel-title">
              <Wrench size={17} strokeWidth={1.8} />
              <h2>Raise Request</h2>
            </div>

            <SelectField label="Asset" value={form.asset} onChange={(value) => updateForm("asset", value)} required>
              <option value="">Select asset</option>
              {assets.map((asset) => (
                <option key={asset._id} value={asset._id}>
                  {asset.assetTag} - {asset.name}
                </option>
              ))}
            </SelectField>

            <label className="maintenance-field">
              <span>Issue</span>
              <textarea required rows={3} value={form.issue} onChange={(event) => updateForm("issue", event.target.value)} />
            </label>

            <SelectField label="Priority" value={form.priority} onChange={(value) => updateForm("priority", value)} required>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </SelectField>

            <label className="maintenance-field">
              <span>Notes</span>
              <textarea rows={3} value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} />
            </label>

            <label className="maintenance-upload">
              <ImagePlus size={17} strokeWidth={1.8} />
              <span>{form.image ? form.image.name : "Upload image"}</span>
              <input accept=".jpg,.jpeg,.png,.webp" type="file" onChange={(event) => updateForm("image", event.target.files?.[0] || null)} />
            </label>

            <button className="maintenance-button maintenance-button--primary" type="submit" disabled={submitting === "create"}>
              <Upload size={15} strokeWidth={1.8} />
              {submitting === "create" ? "Submitting" : "Submit request"}
            </button>
          </form>
        )}

        {canProcessMaintenance && (
          <section className="maintenance-panel maintenance-workflow">
            <div className="maintenance-panel-title">
              <ShieldCheck size={17} strokeWidth={1.8} />
              <h2>Asset Manager Workflow</h2>
            </div>

            <form className="maintenance-form" onSubmit={submitStart}>
              <SelectField label="Approved request" value={startForm.id} onChange={(value) => setStartForm((current) => ({ ...current, id: value }))} required>
                <option value="">Select approved request</option>
                {approvedRequests.map((item) => (
                  <option key={item._id} value={item._id}>
                    {getAssetLabel(item.asset)} - {item.issue}
                  </option>
                ))}
              </SelectField>

              <label className="maintenance-field">
                <span>Technician</span>
                <input required value={startForm.technician} onChange={(event) => setStartForm((current) => ({ ...current, technician: event.target.value }))} />
              </label>

              <button className="maintenance-button maintenance-button--primary" type="submit" disabled={submitting === "start"}>
                <Check size={15} strokeWidth={1.8} />
                {submitting === "start" ? "Starting" : "Assign technician"}
              </button>
            </form>

            <form className="maintenance-form" onSubmit={submitResolve}>
              <SelectField label="In-progress request" value={resolveForm.id} onChange={(value) => setResolveForm((current) => ({ ...current, id: value }))} required>
                <option value="">Select in-progress request</option>
                {inProgressRequests.map((item) => (
                  <option key={item._id} value={item._id}>
                    {getAssetLabel(item.asset)} - {item.issue}
                  </option>
                ))}
              </SelectField>

              <label className="maintenance-field">
                <span>Resolution</span>
                <textarea rows={3} value={resolveForm.resolution} onChange={(event) => setResolveForm((current) => ({ ...current, resolution: event.target.value }))} />
              </label>

              <label className="maintenance-field">
                <span>Notes</span>
                <textarea rows={2} value={resolveForm.notes} onChange={(event) => setResolveForm((current) => ({ ...current, notes: event.target.value }))} />
              </label>

              <button className="maintenance-button maintenance-button--primary" type="submit" disabled={submitting === "resolve"}>
                <Check size={15} strokeWidth={1.8} />
                {submitting === "resolve" ? "Resolving" : "Resolve"}
              </button>
            </form>
          </section>
        )}
      </section>

      <section className="maintenance-table-panel">
        <div className="maintenance-table-header">
          <div>
            <p className="maintenance-eyebrow">Timeline</p>
            <h2>Maintenance Timeline</h2>
          </div>
          <div className="maintenance-filter-bar">
            <div className="maintenance-search">
              <Search size={15} strokeWidth={1.8} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests" />
            </div>
            <div className="maintenance-select maintenance-select--small">
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

        {loading && <div className="maintenance-empty">Loading maintenance requests</div>}
        {!loading && !canViewMaintenance && (
          <div className="maintenance-empty">Maintenance timeline is available to Admin, Asset Manager, and Department Head roles.</div>
        )}

        {!loading && canViewMaintenance && (
          <div className="maintenance-table-scroll">
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Issue</th>
                  <th>Raised By</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenances.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{getAssetLabel(item.asset)}</strong></td>
                    <td>{item.issue}</td>
                    <td>{getName(item.raisedBy)}</td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.technician || "-"}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      {canProcessMaintenance && item.status === "Pending" && (
                        <div className="maintenance-row-actions">
                          <button className="maintenance-icon-button" type="button" onClick={() => processRequest(item._id, "approve")} disabled={submitting === `approve-${item._id}`}>
                            <Check size={15} strokeWidth={1.8} />
                          </button>
                          <button className="maintenance-icon-button maintenance-icon-button--danger" type="button" onClick={() => processRequest(item._id, "reject")} disabled={submitting === `reject-${item._id}`}>
                            <X size={15} strokeWidth={1.8} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && canViewMaintenance && filteredMaintenances.length === 0 && (
          <div className="maintenance-empty">No maintenance records found</div>
        )}
      </section>
    </main>
  );
}
