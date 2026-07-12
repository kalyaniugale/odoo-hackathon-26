import {
  ChevronDown,
  Eye,
  FilePlus2,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authClient from "../services/authService";
import "./Assets.css";

const ASSET_STATUSES = [
  "Available",
  "Allocated",
  "Reserved",
  "Under Maintenance",
  "Lost",
  "Retired",
  "Disposed",
];

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor", "Damaged"];

const getName = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value.assetTag || "-";
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

function AssetStatusBadge({ status }) {
  const key = String(status || "Available").toLowerCase().replace(/\s+/g, "-");
  return <span className={`asset-badge asset-badge--${key}`}>{status}</span>;
}

function AssetModal({
  mode,
  asset,
  categories,
  departments,
  onClose,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState({
    name: asset?.name || "",
    category: getId(asset?.category),
    serialNumber: asset?.serialNumber || "",
    department: getId(asset?.department),
    location: asset?.location || "",
    acquisitionDate: asset?.acquisitionDate
      ? asset.acquisitionDate.slice(0, 10)
      : "",
    acquisitionCost: asset?.acquisitionCost ?? 0,
    condition: asset?.condition || "Good",
    shared: Boolean(asset?.shared),
    image: null,
    documents: [],
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("category", form.category);
    payload.append("location", form.location.trim());
    payload.append("condition", form.condition);
    payload.append("shared", String(form.shared));
    payload.append("acquisitionCost", String(Number(form.acquisitionCost || 0)));

    if (form.serialNumber.trim()) payload.append("serialNumber", form.serialNumber.trim());
    if (form.department) payload.append("department", form.department);
    if (form.acquisitionDate) payload.append("acquisitionDate", form.acquisitionDate);
    if (form.image) payload.append("image", form.image);

    Array.from(form.documents).forEach((document) => {
      payload.append("documents", document);
    });

    onSubmit(payload);
  };

  return (
    <div className="asset-modal-backdrop" role="presentation">
      <section className="asset-modal" role="dialog" aria-modal="true">
        <div className="asset-modal__header">
          <div>
            <p className="asset-eyebrow">Asset registry</p>
            <h2>{mode === "create" ? "Register asset" : "Edit asset"}</h2>
          </div>
          <button className="asset-icon-button" type="button" onClick={onClose}>
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <form className="asset-form" onSubmit={handleSubmit}>
          <div className="asset-form-grid">
            <label>
              <span>Name</span>
              <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </label>

            <label>
              <span>Category</span>
              <div className="asset-select-wrap">
                <select required value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                  <option value="">Select category</option>
                  {categories.filter((category) => category.status === "Active").map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} strokeWidth={1.8} />
              </div>
            </label>

            <label>
              <span>Serial number</span>
              <input value={form.serialNumber} onChange={(event) => updateField("serialNumber", event.target.value)} />
            </label>

            <label>
              <span>Department</span>
              <div className="asset-select-wrap">
                <select value={form.department} onChange={(event) => updateField("department", event.target.value)}>
                  <option value="">No department</option>
                  {departments.filter((department) => department.status === "Active").map((department) => (
                    <option key={department._id} value={department._id}>{department.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} strokeWidth={1.8} />
              </div>
            </label>

            <label>
              <span>Location</span>
              <input required value={form.location} onChange={(event) => updateField("location", event.target.value)} />
            </label>

            <label>
              <span>Acquisition date</span>
              <input type="date" value={form.acquisitionDate} onChange={(event) => updateField("acquisitionDate", event.target.value)} />
            </label>

            <label>
              <span>Acquisition cost</span>
              <input min="0" type="number" value={form.acquisitionCost} onChange={(event) => updateField("acquisitionCost", event.target.value)} />
            </label>

            <label>
              <span>Condition</span>
              <div className="asset-select-wrap">
                <select value={form.condition} onChange={(event) => updateField("condition", event.target.value)}>
                  {CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
                <ChevronDown size={16} strokeWidth={1.8} />
              </div>
            </label>
          </div>

          <label className="asset-checkbox">
            <input type="checkbox" checked={form.shared} onChange={(event) => updateField("shared", event.target.checked)} />
            <span>Shared asset available for booking</span>
          </label>

          <div className="asset-upload-grid">
            <label className="asset-upload">
              <ImagePlus size={18} strokeWidth={1.8} />
              <span>{form.image ? form.image.name : "Upload image"}</span>
              <input accept=".jpg,.jpeg,.png,.webp" type="file" onChange={(event) => updateField("image", event.target.files?.[0] || null)} />
            </label>

            <label className="asset-upload">
              <FilePlus2 size={18} strokeWidth={1.8} />
              <span>{form.documents.length ? `${form.documents.length} document(s)` : "Upload documents"}</span>
              <input multiple accept=".pdf,.doc,.docx" type="file" onChange={(event) => updateField("documents", event.target.files || [])} />
            </label>
          </div>

          <div className="asset-modal-actions">
            <button className="asset-button asset-button--ghost" type="button" onClick={onClose} disabled={submitting}>Cancel</button>
            <button className="asset-button asset-button--primary" type="submit" disabled={submitting}>
              <Upload size={16} strokeWidth={1.8} />
              {submitting ? "Saving" : "Save asset"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DisposeModal({ asset, onCancel, onConfirm, submitting }) {
  if (!asset) return null;

  return (
    <div className="asset-modal-backdrop" role="presentation">
      <section className="asset-confirm-modal" role="dialog" aria-modal="true">
        <p className="asset-eyebrow">Dispose asset</p>
        <h2>{asset.assetTag}</h2>
        <p>{asset.name} will be marked as Disposed.</p>
        <div className="asset-modal-actions">
          <button className="asset-button asset-button--ghost" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
          <button className="asset-button asset-button--danger" type="button" onClick={onConfirm} disabled={submitting}>
            <Trash2 size={16} strokeWidth={1.8} />
            {submitting ? "Disposing" : "Dispose"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Assets() {
  const { user } = useAuth();
  const canManageAssets = user?.role === "Asset Manager";
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", category: "", department: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState(null);
  const [disposeTarget, setDisposeTarget] = useState(null);

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets;

    return assets.filter((asset) =>
      [asset.assetTag, asset.name, asset.serialNumber, asset.location, getName(asset.category), getName(asset.department)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [assets, search]);

  const counts = useMemo(() => ({
    total: assets.length,
    available: assets.filter((asset) => asset.status === "Available").length,
    allocated: assets.filter((asset) => asset.status === "Allocated").length,
    maintenance: assets.filter((asset) => asset.status === "Under Maintenance").length,
  }), [assets]);

  const loadAssets = async () => {
    setLoading(true);

    try {
      const [assetResponse, categoryResponse, departmentResponse] = await Promise.all([
        authClient.get("/assets", {
          params: {
            status: filters.status || undefined,
            category: filters.category || undefined,
            department: filters.department || undefined,
          },
        }),
        authClient.get("/categories", { params: { status: "All" } }),
        authClient.get("/departments", { params: { status: "All" } }),
      ]);

      setAssets(assetResponse.data.assets || []);
      setCategories(categoryResponse.data.categories || []);
      setDepartments(departmentResponse.data.departments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [filters.status, filters.category, filters.department]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleSaveAsset = async (payload) => {
    setSubmitting(true);

    try {
      if (modal.mode === "create") {
        await authClient.post("/assets", payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Asset registered");
      } else {
        await authClient.put(`/assets/${modal.asset._id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Asset updated");
      }

      setModal(null);
      await loadAssets();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDispose = async () => {
    setSubmitting(true);

    try {
      await authClient.delete(`/assets/${disposeTarget._id}`);
      toast.success("Asset disposed");
      setDisposeTarget(null);
      await loadAssets();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="assets-page">
      <section className="assets-header">
        <div>
          <p className="asset-eyebrow">Asset registry</p>
          <h1>Assets</h1>
        </div>
        {canManageAssets && (
          <button className="asset-button asset-button--primary" type="button" onClick={() => setModal({ mode: "create", asset: null })}>
            <Plus size={16} strokeWidth={1.8} />
            Register Asset
          </button>
        )}
      </section>

      <section className="asset-summary-grid">
        <article><span>Total</span><strong>{counts.total}</strong></article>
        <article><span>Available</span><strong>{counts.available}</strong></article>
        <article><span>Allocated</span><strong>{counts.allocated}</strong></article>
        <article><span>Maintenance</span><strong>{counts.maintenance}</strong></article>
      </section>

      <section className="asset-toolbar">
        <div className="asset-search">
          <Search size={17} strokeWidth={1.8} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assets" />
        </div>

        <div className="asset-select-wrap">
          <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="">All statuses</option>
            {ASSET_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <ChevronDown size={16} strokeWidth={1.8} />
        </div>

        <div className="asset-select-wrap">
          <select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          <ChevronDown size={16} strokeWidth={1.8} />
        </div>

        <div className="asset-select-wrap">
          <select value={filters.department} onChange={(event) => updateFilter("department", event.target.value)}>
            <option value="">All departments</option>
            {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
          </select>
          <ChevronDown size={16} strokeWidth={1.8} />
        </div>
      </section>

      <section className="asset-card-grid" aria-label="Asset cards">
        {filteredAssets.slice(0, 6).map((asset) => (
          <article className="asset-card" key={asset._id}>
            <div className="asset-card__icon"><Package size={18} strokeWidth={1.8} /></div>
            <div><strong>{asset.assetTag}</strong><span>{asset.name}</span></div>
            <AssetStatusBadge status={asset.status} />
          </article>
        ))}
      </section>

      <section className="asset-table-panel">
        <div className="asset-table-meta">
          <span>{filteredAssets.length} assets</span>
          <span>{canManageAssets ? "Asset manager access" : "View only"}</span>
        </div>

        {loading ? (
          <div className="asset-empty">Loading assets</div>
        ) : (
          <div className="asset-table-scroll">
            <table className="asset-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset._id}>
                    <td><strong>{asset.assetTag}</strong><span>{asset.name}</span></td>
                    <td>{getName(asset.category)}</td>
                    <td>{getName(asset.department)}</td>
                    <td>{asset.location}</td>
                    <td>{asset.condition}</td>
                    <td><AssetStatusBadge status={asset.status} /></td>
                    <td>
                      <div className="asset-row-actions">
                        <Link className="asset-icon-button" to={`/assets/${asset._id}`} title="View asset"><Eye size={16} strokeWidth={1.8} /></Link>
                        {canManageAssets && (
                          <>
                            <button className="asset-icon-button" type="button" onClick={() => setModal({ mode: "edit", asset })} title="Edit asset"><Pencil size={16} strokeWidth={1.8} /></button>
                            <button className="asset-icon-button asset-icon-button--danger" type="button" onClick={() => setDisposeTarget(asset)} title="Dispose asset"><Trash2 size={16} strokeWidth={1.8} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredAssets.length === 0 && <div className="asset-empty">No assets match the current filters</div>}
      </section>

      {modal && (
        <AssetModal
          mode={modal.mode}
          asset={modal.asset}
          categories={categories}
          departments={departments}
          submitting={submitting}
          onClose={() => { if (!submitting) setModal(null); }}
          onSubmit={handleSaveAsset}
        />
      )}

      <DisposeModal
        asset={disposeTarget}
        submitting={submitting}
        onCancel={() => { if (!submitting) setDisposeTarget(null); }}
        onConfirm={confirmDispose}
      />
    </main>
  );
}
