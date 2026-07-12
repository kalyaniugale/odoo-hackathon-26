import {
  Check,
  ChevronDown,
  ClipboardList,
  CornerDownLeft,
  History,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import authClient from "../services/authService";
import "./Allocation.css";

const STATUS_OPTIONS = [
  "All",
  "Allocated",
  "Transfer Requested",
  "Transferred",
  "Returned",
];

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

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function StatusBadge({ status }) {
  const key = String(status || "Allocated").toLowerCase().replace(/\s+/g, "-");
  return <span className={`allocation-status allocation-status--${key}`}>{status}</span>;
}

function SelectField({ label, value, onChange, children, required }) {
  return (
    <label className="allocation-field">
      <span>{label}</span>
      <div className="allocation-select">
        <select required={required} value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
        <ChevronDown size={15} strokeWidth={1.8} />
      </div>
    </label>
  );
}

export default function Allocation() {
  const { user } = useAuth();
  const role = user?.role || "Employee";
  const canViewAllocations = role === "Admin" || role === "Asset Manager";
  const canAllocate = role === "Asset Manager";
  const canReturn = role === "Asset Manager";
  const canApprove = role === "Asset Manager" || role === "Department Head";
  const canRequestTransfer = role === "Employee";

  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [loadError, setLoadError] = useState("");

  const [allocateForm, setAllocateForm] = useState({
    asset: "",
    allocatedTo: "",
    expectedReturnDate: "",
    notes: "",
  });

  const [returnForm, setReturnForm] = useState({
    allocationId: "",
    returnCondition: "",
    notes: "",
  });

  const [transferForm, setTransferForm] = useState({
    allocationId: "",
    transferTo: "",
  });

  const [approvalId, setApprovalId] = useState("");

  const availableAssets = useMemo(
    () => assets.filter((asset) => asset.status === "Available"),
    [assets]
  );

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "Active"),
    [employees]
  );

  const transferRequestedAllocations = useMemo(
    () => allocations.filter((allocation) => allocation.status === "Transfer Requested"),
    [allocations]
  );

  const activeAllocations = useMemo(
    () => allocations.filter((allocation) => allocation.status !== "Returned"),
    [allocations]
  );

  const filteredAllocations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allocations;

    return allocations.filter((allocation) =>
      [
        getAssetLabel(allocation.asset),
        getName(allocation.allocatedTo),
        getName(allocation.allocatedBy),
        getName(allocation.transferTo),
        allocation.status,
        allocation.notes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [allocations, search]);

  const loadModule = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const requests = [authClient.get("/assets")];

      if (canViewAllocations) {
        requests.push(
          authClient.get("/allocations", {
            params: { status: status || "All" },
          })
        );
      }

      if (canAllocate || canRequestTransfer) {
        requests.push(authClient.get("/employees", { params: { status: "All" } }));
      }

      const responses = await Promise.allSettled(requests);
      const assetResponse = responses[0];

      if (assetResponse.status === "fulfilled") {
        setAssets(assetResponse.value.data.assets || []);
      } else {
        throw assetResponse.reason;
      }

      if (canViewAllocations) {
        const allocationResponse = responses[1];
        if (allocationResponse.status === "fulfilled") {
          setAllocations(allocationResponse.value.data.allocations || []);
        } else {
          throw allocationResponse.reason;
        }
      } else {
        setAllocations([]);
      }

      const employeeResponse = responses[canViewAllocations ? 2 : 1];
      if (employeeResponse?.status === "fulfilled") {
        setEmployees(employeeResponse.value.data.employees || []);
      } else if (employeeResponse?.status === "rejected") {
        setEmployees([]);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to load allocation data";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModule();
  }, [status, role]);

  const updateAllocateForm = (field, value) => {
    setAllocateForm((current) => ({ ...current, [field]: value }));
  };

  const updateReturnForm = (field, value) => {
    setReturnForm((current) => ({ ...current, [field]: value }));
  };

  const updateTransferForm = (field, value) => {
    setTransferForm((current) => ({ ...current, [field]: value }));
  };

  const submitAllocation = async (event) => {
    event.preventDefault();
    setSubmitting("allocate");

    try {
      await authClient.post("/allocations", {
        asset: allocateForm.asset,
        allocatedTo: allocateForm.allocatedTo,
        expectedReturnDate: allocateForm.expectedReturnDate || undefined,
        notes: allocateForm.notes,
      });
      toast.success("Asset allocated successfully");
      setAllocateForm({ asset: "", allocatedTo: "", expectedReturnDate: "", notes: "" });
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const submitReturn = async (event) => {
    event.preventDefault();
    setSubmitting("return");

    try {
      await authClient.put(`/allocations/return/${returnForm.allocationId}`, {
        returnCondition: returnForm.returnCondition,
        notes: returnForm.notes,
      });
      toast.success("Asset returned successfully");
      setReturnForm({ allocationId: "", returnCondition: "", notes: "" });
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const submitTransferRequest = async (event) => {
    event.preventDefault();
    setSubmitting("transfer");

    try {
      await authClient.put(`/allocations/request-transfer/${transferForm.allocationId}`, {
        transferTo: transferForm.transferTo,
      });
      toast.success("Transfer request submitted");
      setTransferForm({ allocationId: "", transferTo: "" });
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  const submitApproval = async (event) => {
    event.preventDefault();
    setSubmitting("approve");

    try {
      await authClient.put(`/allocations/approve-transfer/${approvalId}`);
      toast.success("Transfer approved");
      setApprovalId("");
      await loadModule();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting("");
    }
  };

  return (
    <main className="allocation-page">
      <section className="allocation-header">
        <div>
          <p className="allocation-eyebrow">Asset movement</p>
          <h1>Allocation</h1>
        </div>
        <button className="allocation-button allocation-button--ghost" type="button" onClick={loadModule}>
          <RefreshCw size={15} strokeWidth={1.8} />
          Refresh
        </button>
      </section>

      <section className="allocation-summary">
        <article>
          <span>Total</span>
          <strong>{allocations.length}</strong>
        </article>
        <article>
          <span>Active</span>
          <strong>{activeAllocations.length}</strong>
        </article>
        <article>
          <span>Transfer Requests</span>
          <strong>{transferRequestedAllocations.length}</strong>
        </article>
        <article>
          <span>Available Assets</span>
          <strong>{availableAssets.length}</strong>
        </article>
      </section>

      <section className="allocation-actions-grid">
        {canAllocate && (
          <form className="allocation-panel" onSubmit={submitAllocation}>
            <div className="allocation-panel-title">
              <ClipboardList size={17} strokeWidth={1.8} />
              <h2>Allocate Asset</h2>
            </div>

            <SelectField label="Available asset" value={allocateForm.asset} onChange={(value) => updateAllocateForm("asset", value)} required>
              <option value="">Select asset</option>
              {availableAssets.map((asset) => (
                <option key={asset._id} value={asset._id}>
                  {asset.assetTag} - {asset.name}
                </option>
              ))}
            </SelectField>

            <SelectField label="Employee" value={allocateForm.allocatedTo} onChange={(value) => updateAllocateForm("allocatedTo", value)} required>
              <option value="">Select employee</option>
              {activeEmployees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} - {employee.email}
                </option>
              ))}
            </SelectField>

            <label className="allocation-field">
              <span>Expected return</span>
              <input type="date" value={allocateForm.expectedReturnDate} onChange={(event) => updateAllocateForm("expectedReturnDate", event.target.value)} />
            </label>

            <label className="allocation-field">
              <span>Notes</span>
              <textarea rows={3} value={allocateForm.notes} onChange={(event) => updateAllocateForm("notes", event.target.value)} />
            </label>

            <button className="allocation-button allocation-button--primary" type="submit" disabled={submitting === "allocate"}>
              <Check size={15} strokeWidth={1.8} />
              {submitting === "allocate" ? "Allocating" : "Allocate"}
            </button>
          </form>
        )}

        {canReturn && (
          <form className="allocation-panel" onSubmit={submitReturn}>
            <div className="allocation-panel-title">
              <RotateCcw size={17} strokeWidth={1.8} />
              <h2>Return Asset</h2>
            </div>

            <SelectField label="Allocation" value={returnForm.allocationId} onChange={(value) => updateReturnForm("allocationId", value)} required>
              <option value="">Select allocation</option>
              {activeAllocations.map((allocation) => (
                <option key={allocation._id} value={allocation._id}>
                  {getAssetLabel(allocation.asset)} - {getName(allocation.allocatedTo)}
                </option>
              ))}
            </SelectField>

            <label className="allocation-field">
              <span>Return condition</span>
              <input value={returnForm.returnCondition} onChange={(event) => updateReturnForm("returnCondition", event.target.value)} />
            </label>

            <label className="allocation-field">
              <span>Notes</span>
              <textarea rows={3} value={returnForm.notes} onChange={(event) => updateReturnForm("notes", event.target.value)} />
            </label>

            <button className="allocation-button allocation-button--primary" type="submit" disabled={submitting === "return"}>
              <CornerDownLeft size={15} strokeWidth={1.8} />
              {submitting === "return" ? "Returning" : "Return"}
            </button>
          </form>
        )}

        {canRequestTransfer && (
          <form className="allocation-panel" onSubmit={submitTransferRequest}>
            <div className="allocation-panel-title">
              <Send size={17} strokeWidth={1.8} />
              <h2>Transfer Request</h2>
            </div>

            <label className="allocation-field">
              <span>Allocation ID</span>
              <input required value={transferForm.allocationId} onChange={(event) => updateTransferForm("allocationId", event.target.value)} />
            </label>

            <SelectField label="Transfer to" value={transferForm.transferTo} onChange={(value) => updateTransferForm("transferTo", value)} required>
              <option value="">Select employee</option>
              {activeEmployees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} - {employee.email}
                </option>
              ))}
            </SelectField>

            <button className="allocation-button allocation-button--primary" type="submit" disabled={submitting === "transfer"}>
              <Send size={15} strokeWidth={1.8} />
              {submitting === "transfer" ? "Submitting" : "Submit request"}
            </button>
          </form>
        )}

        {canApprove && (
          <form className="allocation-panel" onSubmit={submitApproval}>
            <div className="allocation-panel-title">
              <Check size={17} strokeWidth={1.8} />
              <h2>Transfer Approval</h2>
            </div>

            {canViewAllocations ? (
              <SelectField label="Transfer request" value={approvalId} onChange={setApprovalId} required>
                <option value="">Select request</option>
                {transferRequestedAllocations.map((allocation) => (
                  <option key={allocation._id} value={allocation._id}>
                    {getAssetLabel(allocation.asset)} - {getName(allocation.transferTo)}
                  </option>
                ))}
              </SelectField>
            ) : (
              <label className="allocation-field">
                <span>Allocation ID</span>
                <input required value={approvalId} onChange={(event) => setApprovalId(event.target.value)} />
              </label>
            )}

            <button className="allocation-button allocation-button--primary" type="submit" disabled={submitting === "approve"}>
              <Check size={15} strokeWidth={1.8} />
              {submitting === "approve" ? "Approving" : "Approve"}
            </button>
          </form>
        )}
      </section>

      <section className="allocation-history-panel">
        <div className="allocation-history-header">
          <div>
            <p className="allocation-eyebrow">History</p>
            <h2>Allocation History</h2>
          </div>
          <div className="allocation-filter-bar">
            <div className="allocation-search">
              <Search size={15} strokeWidth={1.8} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search history" />
            </div>
            <div className="allocation-select allocation-select--small">
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

        {loading && <div className="allocation-empty">Loading allocation data</div>}
        {!loading && loadError && <div className="allocation-empty">{loadError}</div>}
        {!loading && !loadError && !canViewAllocations && (
          <div className="allocation-empty">Allocation history is available to Admin and Asset Manager roles.</div>
        )}

        {!loading && !loadError && canViewAllocations && (
          <div className="allocation-table-scroll">
            <table className="allocation-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Allocated To</th>
                  <th>Allocated By</th>
                  <th>Transfer To</th>
                  <th>Expected Return</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.map((allocation) => (
                  <tr key={allocation._id}>
                    <td>
                      <strong>{getAssetLabel(allocation.asset)}</strong>
                      <span>{allocation._id}</span>
                    </td>
                    <td>{getName(allocation.allocatedTo)}</td>
                    <td>{getName(allocation.allocatedBy)}</td>
                    <td>{getName(allocation.transferTo)}</td>
                    <td>{formatDate(allocation.expectedReturnDate)}</td>
                    <td><StatusBadge status={allocation.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !loadError && canViewAllocations && filteredAllocations.length === 0 && (
          <div className="allocation-empty">No allocation records found</div>
        )}
      </section>
    </main>
  );
}
