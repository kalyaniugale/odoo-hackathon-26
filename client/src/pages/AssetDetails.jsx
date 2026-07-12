import {
  ArrowLeft,
  CalendarDays,
  FileText,
  History,
  Package,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import authClient from "../services/authService";
import "./Assets.css";

const getName = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value.email || value.assetTag || "-";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function AssetStatusBadge({ status }) {
  const key = String(status || "Available").toLowerCase().replace(/\s+/g, "-");
  return <span className={`asset-badge asset-badge--${key}`}>{status}</span>;
}

function DetailRow({ label, value }) {
  return (
    <div className="asset-detail-row">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

export default function AssetDetails() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [allocationHistory, setAllocationHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadAsset = async () => {
      setLoading(true);

      try {
        const { data } = await authClient.get(`/assets/${id}`);

        if (!isActive) return;

        setAsset(data.asset);
        setAllocationHistory(data.allocationHistory || []);
        setMaintenanceHistory(data.maintenanceHistory || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to load asset details"
        );
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadAsset();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="asset-details-page">
        <section className="asset-details-header">
          <div>
            <p className="asset-eyebrow">Asset details</p>
            <h1>Loading asset</h1>
          </div>
        </section>
      </main>
    );
  }

  if (!asset) {
    return (
      <main className="asset-details-page">
        <section className="asset-details-header">
          <div>
            <p className="asset-eyebrow">Asset details</p>
            <h1>Asset unavailable</h1>
          </div>
          <Link className="asset-button asset-button--ghost" to="/assets">
            <ArrowLeft size={16} strokeWidth={1.8} />
            Back
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="asset-details-page">
      <section className="asset-details-header">
        <div>
          <p className="asset-eyebrow">Asset details</p>
          <h1>{asset.assetTag}</h1>
        </div>
        <Link className="asset-button asset-button--ghost" to="/assets">
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to assets
        </Link>
      </section>

      <section className="asset-details-grid">
        <article className="asset-detail-panel">
          <div className="asset-detail-title">
            <Package size={18} strokeWidth={1.8} />
            <div>
              <h2>{asset.name}</h2>
              <AssetStatusBadge status={asset.status} />
            </div>
          </div>

          <div className="asset-detail-list">
            <DetailRow label="Category" value={getName(asset.category)} />
            <DetailRow label="Department" value={getName(asset.department)} />
            <DetailRow label="Location" value={asset.location} />
            <DetailRow label="Serial number" value={asset.serialNumber} />
            <DetailRow label="Condition" value={asset.condition} />
            <DetailRow label="Acquisition date" value={formatDate(asset.acquisitionDate)} />
            <DetailRow label="Acquisition cost" value={`₹${Number(asset.acquisitionCost || 0).toLocaleString("en-IN")}`} />
            <DetailRow label="Shared" value={asset.shared ? "Yes" : "No"} />
          </div>
        </article>

        <article className="asset-detail-panel">
          <div className="asset-detail-title">
            <FileText size={18} strokeWidth={1.8} />
            <h2>Files</h2>
          </div>

          <div className="asset-file-list">
            <div>
              <span>Image</span>
              <strong>{asset.image || "-"}</strong>
            </div>
            <div>
              <span>Documents</span>
              <strong>{asset.documents?.length ? asset.documents.join(", ") : "-"}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="asset-history-grid">
        <article className="asset-history-panel">
          <div className="asset-history-title">
            <History size={18} strokeWidth={1.8} />
            <h2>Allocation History</h2>
          </div>
          <div className="asset-history-list">
            {allocationHistory.length === 0 && <div className="asset-empty">No allocation history</div>}
            {allocationHistory.map((allocation) => (
              <div className="asset-history-item" key={allocation._id}>
                <div>
                  <strong>{getName(allocation.allocatedTo)}</strong>
                  <span>By {getName(allocation.allocatedBy)} · Expected return {formatDate(allocation.expectedReturnDate)}</span>
                </div>
                <AssetStatusBadge status={allocation.status} />
              </div>
            ))}
          </div>
        </article>

        <article className="asset-history-panel">
          <div className="asset-history-title">
            <Wrench size={18} strokeWidth={1.8} />
            <h2>Maintenance History</h2>
          </div>
          <div className="asset-history-list">
            {maintenanceHistory.length === 0 && <div className="asset-empty">No maintenance history</div>}
            {maintenanceHistory.map((maintenance) => (
              <div className="asset-history-item" key={maintenance._id}>
                <div>
                  <strong>{maintenance.issue}</strong>
                  <span>Raised by {getName(maintenance.raisedBy)} · {formatDate(maintenance.createdAt)}</span>
                </div>
                <AssetStatusBadge status={maintenance.status} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="asset-history-panel">
        <div className="asset-history-title">
          <CalendarDays size={18} strokeWidth={1.8} />
          <h2>Lifecycle Dates</h2>
        </div>
        <div className="asset-detail-list asset-detail-list--compact">
          <DetailRow label="Next maintenance" value={formatDate(asset.nextMaintenanceDate)} />
          <DetailRow label="Retirement" value={formatDate(asset.retirementDate)} />
          <DetailRow label="Created" value={formatDate(asset.createdAt)} />
          <DetailRow label="Updated" value={formatDate(asset.updatedAt)} />
        </div>
      </section>
    </main>
  );
}
