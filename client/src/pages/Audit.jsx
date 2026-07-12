import {
  Check,
  ChevronDown,
  ClipboardCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import authClient from "../services/authService";
import "./Audit.css";

const AUDIT_STATUSES = ["All", "Open", "Closed"];
const VERIFY_STATUSES = ["Verified", "Missing", "Damaged"];

const getName = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value.email || value.assetTag || "-";
};

const getAssetLabel = (asset) => {
  if (!asset) return "-";
  if (typeof asset === "string") return asset;
  return `${asset.assetTag || ""} ${asset.name || ""}`.trim();
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function StatusBadge({ status }) {
  const key = String(status || "Open").toLowerCase();
  return <span className={`audit-status audit-status--${key}`}>{status}</span>;
}

function VerifyBadge({ status }) {
  const key = String(status || "Verified").toLowerCase();
  return <span className={`audit-verify audit-verify--${key}`}>{status}</span>;
}

function SelectField({ label, value, onChange, children, required, multiple }) {
  return (
    <label className="audit-field">
      <span>{label}</span>
      <div className={`audit-select ${multiple ? "audit-select--multiple" : ""}`}>
        <select
          multiple={multiple}
          required={required}
          value={value}
          onChange={(event) => {
            if (multiple) {
              onChange(Array.from(event.target.selectedOptions).map((option) => option.value));
            } else {
              onChange(event.target.value);
            }
          }}
        >
          {children}
        </select>
        {!multiple && <ChevronDown size={15} strokeWidth={1.8} />}
      </div>
    </label>
  );
}

export default function Audit() {
  const { user } = useAuth();
  const role = user?.role || "Employee";
  const canCreateAudit = role === "Admin";
  const canCloseAudit = role === "Admin";
  const canViewAudit = role === "Admin" || role === "Asset Manager";
  const canVerifyAudit = role === "Admin" || role === "Asset Manager";

  const [audits, setAudits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [createForm, setCreateForm] = useState({
    department: "",
    location: "",
    auditors: [],
    startDate: "",
    endDate: "",
  });
  const [verifyForm, setVerifyForm] = useState({
    assetId: "",
    status: "Verified",
    remarks: "",
  });

  const filteredAudits = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return audits;

    return audits.filter((audit) =>
      [
        getName(audit.department),
        audit.location,
        audit.status,
        audit.auditors?.map(getName).join(" "),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [audits, search]);

  const discrepancyCount = selectedAudit?.assets?.filter(
    (item) => item.status === "Missing" || item.status === "Damaged"
  ).length || selectedAudit?.discrepancies || 0;

  const openAudits = useMemo(
    () => audits.filter((audit) => audit.status === "Open").length,
    [audits]
  );

  const closedAudits = useMemo(
    () => audits.filter((audit) => audit.status === "Closed").length,
    [audits]
  );

  const loadModule = async () => {
    setLoading(true);

    try {
      const requests = [];

      if (canViewAudit) {
        requests.push(authClient.get("/audits", { params: { status } }));
      }

      if (canCreateAudit) {
        requests.push(
          authClient.get("/departments", { params: { status: "All" } }),
          authClient.get("/employees", { params: { status: "All" } })
        );
      }

      const responses = await Promise.all(requests);

      if (canViewAudit) {
        const nextAudits = responses[0].data.audits || [];
        setAudits(nextAudits);
        setSelectedAudit((current) => {
          if (!current) return nextAudits[0] || null;
          return nextAudits.find((audit) => audit._id === current._id) || nextAudits[0] || null;
        });
      }

      if (canCreateAudit) {
        const offset = canViewAudit ? 1 : 0;
        setDepartments(responses[offset].data.departments || []);
        setEmployees(responses[offset + 1].data.employees || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to load audits");
    } finally {
      setLoading(false);
    }
  };

  const loadAuditById = async (id) => {
    try {
      const { data } = await authClient.get(`/audits/${id}`);
      setSelectedAudit(data.audit);
      setVerifyForm({ assetId: "", status: "Verified", remarks: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    loadModule();
  }, [status, role]);

  const updateCreateForm = (field, value) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
  };

  const updateVerifyForm = (field, value) => {
    setVerifyForm((current) => ({ ...current, [field]: value }));
  };

  const submitAudit = async (event) => {
    event.preventDefault();
    setSubmitting("create");

    try {
      await authClient.post("/audits", {
        department: createForm.department,
        location: createForm.location,
        auditors: createForm.auditors,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
      });
      toast.success("Audit created");
      setCreateForm({ department: "", location: "", auditors: [], startDate: "", endDate: "" });
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const submitVerification = async (event) => {
    event.preventDefault();
    if (!selectedAudit) return;

    setSubmitting("verify");

    try {
      const { data } = await authClient.put(`/audits/verify/${selectedAudit._id}`, verifyForm);
      toast.success("Asset verification updated");
      setSelectedAudit(data.audit);
      setVerifyForm({ assetId: "", status: "Verified", remarks: "" });
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const closeAudit = async () => {
    if (!selectedAudit) return;
    setSubmitting("close");

    try {
      const { data } = await authClient.put(`/audits/close/${selectedAudit._id}`);
      toast.success("Audit closed");
      setSelectedAudit(data.audit);
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  return (
    <main className="audit-page">
      <section className="audit-header">
        <div>
          <p className="audit-eyebrow">Asset verification</p>
          <h1>Audit</h1>
        </div>
        <button className="audit-button audit-button--ghost" type="button" onClick={loadModule}>
          <RefreshCw size={15} strokeWidth={1.8} />
          Refresh
        </button>
      </section>

      <section className="audit-summary">
        <article>
          <span>Total</span>
          <strong>{audits.length}</strong>
        </article>
        <article>
          <span>Open</span>
          <strong>{openAudits}</strong>
        </article>
        <article>
          <span>Closed</span>
          <strong>{closedAudits}</strong>
        </article>
        <article>
          <span>Discrepancies</span>
          <strong>{discrepancyCount}</strong>
        </article>
      </section>

      <section className="audit-layout">
        {canCreateAudit && (
          <form className="audit-panel audit-form" onSubmit={submitAudit}>
            <div className="audit-panel-title">
              <ClipboardCheck size={17} strokeWidth={1.8} />
              <h2>Create Audit</h2>
            </div>

            <SelectField label="Department" value={createForm.department} onChange={(value) => updateCreateForm("department", value)} required>
              <option value="">Select department</option>
              {departments.filter((department) => department.status === "Active").map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </SelectField>

            <label className="audit-field">
              <span>Location</span>
              <input value={createForm.location} onChange={(event) => updateCreateForm("location", event.target.value)} />
            </label>

            <SelectField label="Assign auditors" value={createForm.auditors} onChange={(value) => updateCreateForm("auditors", value)} multiple>
              {employees.filter((employee) => employee.status === "Active").map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} - {employee.email}
                </option>
              ))}
            </SelectField>

            <label className="audit-field">
              <span>Start date</span>
              <input required type="date" value={createForm.startDate} onChange={(event) => updateCreateForm("startDate", event.target.value)} />
            </label>

            <label className="audit-field">
              <span>End date</span>
              <input required type="date" value={createForm.endDate} onChange={(event) => updateCreateForm("endDate", event.target.value)} />
            </label>

            <button className="audit-button audit-button--primary" type="submit" disabled={submitting === "create"}>
              <Check size={15} strokeWidth={1.8} />
              {submitting === "create" ? "Creating" : "Create audit"}
            </button>
          </form>
        )}

        <section className="audit-panel">
          <div className="audit-panel-title">
            <ShieldCheck size={17} strokeWidth={1.8} />
            <h2>Verify Assets</h2>
          </div>

          {!selectedAudit && <div className="audit-empty">Select or create an audit cycle</div>}

          {selectedAudit && (
            <>
              <div className="audit-selected">
                <strong>{getName(selectedAudit.department)}</strong>
                <span>
                  {formatDate(selectedAudit.startDate)} - {formatDate(selectedAudit.endDate)}
                </span>
                <StatusBadge status={selectedAudit.status} />
              </div>

              {canVerifyAudit && selectedAudit.status === "Open" && (
                <form className="audit-form" onSubmit={submitVerification}>
                  <SelectField label="Asset" value={verifyForm.assetId} onChange={(value) => updateVerifyForm("assetId", value)} required>
                    <option value="">Select asset</option>
                    {(selectedAudit.assets || []).map((item) => (
                      <option key={getId(item.asset)} value={getId(item.asset)}>
                        {getAssetLabel(item.asset)}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField label="Verification" value={verifyForm.status} onChange={(value) => updateVerifyForm("status", value)} required>
                    {VERIFY_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </SelectField>

                  <label className="audit-field">
                    <span>Remarks</span>
                    <textarea rows={3} value={verifyForm.remarks} onChange={(event) => updateVerifyForm("remarks", event.target.value)} />
                  </label>

                  <button className="audit-button audit-button--primary" type="submit" disabled={submitting === "verify"}>
                    <Check size={15} strokeWidth={1.8} />
                    {submitting === "verify" ? "Saving" : "Verify asset"}
                  </button>
                </form>
              )}

              {canCloseAudit && selectedAudit.status === "Open" && (
                <button className="audit-button audit-button--danger" type="button" onClick={closeAudit} disabled={submitting === "close"}>
                  <X size={15} strokeWidth={1.8} />
                  {submitting === "close" ? "Closing" : "Close audit"}
                </button>
              )}
            </>
          )}
        </section>
      </section>

      <section className="audit-table-panel">
        <div className="audit-table-header">
          <div>
            <p className="audit-eyebrow">Audit cycles</p>
            <h2>Table</h2>
          </div>
          <div className="audit-filter-bar">
            <div className="audit-search">
              <Search size={15} strokeWidth={1.8} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search audits" />
            </div>
            <div className="audit-select audit-select--small">
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {AUDIT_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {loading && <div className="audit-empty">Loading audits</div>}
        {!loading && !canViewAudit && <div className="audit-empty">Audit cycles are available to Admin and Asset Manager roles.</div>}

        {!loading && canViewAudit && (
          <div className="audit-table-scroll">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Auditors</th>
                  <th>Dates</th>
                  <th>Assets</th>
                  <th>Discrepancies</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.map((audit) => (
                  <tr key={audit._id}>
                    <td>
                      <strong>{getName(audit.department)}</strong>
                      <span>{audit.location || "-"}</span>
                    </td>
                    <td>{audit.auditors?.map(getName).join(", ") || "-"}</td>
                    <td>
                      <span>{formatDate(audit.startDate)}</span>
                      <span>{formatDate(audit.endDate)}</span>
                    </td>
                    <td>{audit.assets?.length || 0}</td>
                    <td>{audit.discrepancies || 0}</td>
                    <td><StatusBadge status={audit.status} /></td>
                    <td>
                      <button className="audit-button audit-button--ghost" type="button" onClick={() => loadAuditById(audit._id)}>
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && canViewAudit && filteredAudits.length === 0 && (
          <div className="audit-empty">No audit records found</div>
        )}
      </section>

      {selectedAudit && (
        <section className="audit-table-panel">
          <div className="audit-table-header">
            <div>
              <p className="audit-eyebrow">Selected audit</p>
              <h2>Asset Verification</h2>
            </div>
            <div className="audit-discrepancy">Discrepancies: {discrepancyCount}</div>
          </div>

          <div className="audit-table-scroll">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(selectedAudit.assets || []).map((item) => (
                  <tr key={getId(item.asset)}>
                    <td><strong>{getAssetLabel(item.asset)}</strong></td>
                    <td><VerifyBadge status={item.status} /></td>
                    <td>{item.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
