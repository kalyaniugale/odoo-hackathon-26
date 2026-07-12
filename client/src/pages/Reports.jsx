import {
  BarChart3,
  Download,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import authClient from "../services/authService";
import "./Reports.css";

const getAssetLabel = (asset) => {
  if (!asset) return "-";
  if (typeof asset === "string") return asset;
  return `${asset.assetTag || ""} ${asset.name || ""}`.trim();
};

const getName = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value.assetTag || "-";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function ReportList({ title, items, renderItem, emptyText }) {
  return (
    <article className="reports-panel">
      <h2>{title}</h2>
      <div className="reports-list">
        {items.length === 0 && <div className="reports-empty">{emptyText}</div>}
        {items.map(renderItem)}
      </div>
    </article>
  );
}

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const summary = report?.summary || {};

  const utilizationData = useMemo(
    () => [
      { name: "Total", value: summary.totalAssets || 0 },
      { name: "Available", value: summary.availableAssets || 0 },
      { name: "Allocated", value: summary.allocatedAssets || 0 },
      { name: "Maintenance", value: summary.maintenanceAssets || 0 },
      { name: "Retired", value: summary.retiredAssets || 0 },
    ],
    [summary]
  );

  const mostUsedData = useMemo(
    () =>
      (report?.mostUsedAssets || []).map((item, index) => ({
        name: item.asset?.assetTag || `Asset ${index + 1}`,
        value: item.totalAllocations || 0,
      })),
    [report]
  );

  const maintenanceFrequencyData = useMemo(
    () =>
      (report?.maintenanceFrequency || []).map((item, index) => ({
        name: item.asset?.assetTag || `Asset ${index + 1}`,
        value: item.maintenanceCount || 0,
      })),
    [report]
  );

  const departmentAllocationData = useMemo(
    () =>
      (report?.departmentSummary || []).map((item, index) => ({
        name: item._id || `Dept ${index + 1}`,
        value: item.totalAllocated || 0,
      })),
    [report]
  );

  const bookingHeatmapData = useMemo(
    () =>
      (report?.bookingHeatmap || []).map((item) => ({
        name: `${item._id?.hour ?? 0}:00`,
        value: item.bookings || 0,
      })),
    [report]
  );

  const loadReports = async () => {
    setLoading(true);

    try {
      const { data } = await authClient.get("/reports/dashboard");
      setReport(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const exportCsv = async () => {
    setExporting(true);

    try {
      const response = await authClient.get("/reports/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "assets-report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV export downloaded");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="reports-page">
      <section className="reports-header">
        <div>
          <p className="reports-eyebrow">Analytics</p>
          <h1>Reports</h1>
        </div>
        <div className="reports-header-actions">
          <button className="reports-button reports-button--ghost" type="button" onClick={loadReports}>
            <RefreshCw size={15} strokeWidth={1.8} />
            Refresh
          </button>
          <button className="reports-button reports-button--primary" type="button" onClick={exportCsv} disabled={exporting}>
            <Download size={15} strokeWidth={1.8} />
            {exporting ? "Exporting" : "CSV Export"}
          </button>
        </div>
      </section>

      <section className="reports-summary">
        <article>
          <span>Total Assets</span>
          <strong>{summary.totalAssets || 0}</strong>
        </article>
        <article>
          <span>Available</span>
          <strong>{summary.availableAssets || 0}</strong>
        </article>
        <article>
          <span>Allocated</span>
          <strong>{summary.allocatedAssets || 0}</strong>
        </article>
        <article>
          <span>Maintenance</span>
          <strong>{summary.maintenanceAssets || 0}</strong>
        </article>
      </section>

      {loading ? (
        <section className="reports-panel">
          <div className="reports-empty">Loading reports</div>
        </section>
      ) : (
        <>
          <section className="reports-chart-grid">
            <article className="reports-panel">
              <div className="reports-panel-title">
                <BarChart3 size={17} strokeWidth={1.8} />
                <h2>Asset Utilization</h2>
              </div>
              <div className="reports-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid stroke="#dddddd" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d71920" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="reports-panel">
              <div className="reports-panel-title">
                <Wrench size={17} strokeWidth={1.8} />
                <h2>Maintenance Frequency</h2>
              </div>
              <div className="reports-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={maintenanceFrequencyData}>
                    <CartesianGrid stroke="#dddddd" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#d71920" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="reports-panel">
              <h2>Department Allocation</h2>
              <div className="reports-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={departmentAllocationData}>
                    <CartesianGrid stroke="#dddddd" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#111111" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="reports-panel">
              <h2>Booking Heatmap</h2>
              <div className="reports-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={bookingHeatmapData}>
                    <CartesianGrid stroke="#dddddd" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d71920" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="reports-chart-grid reports-chart-grid--lists">
            <ReportList
              title="Most Used Assets"
              items={report?.mostUsedAssets || []}
              emptyText="No usage data"
              renderItem={(item) => (
                <div className="reports-list-item" key={item._id || item.asset?._id}>
                  <strong>{getAssetLabel(item.asset)}</strong>
                  <span>{item.totalAllocations || 0} allocations</span>
                </div>
              )}
            />

            <ReportList
              title="Idle Assets"
              items={report?.idleAssets || []}
              emptyText="No idle assets"
              renderItem={(asset) => (
                <div className="reports-list-item" key={asset._id}>
                  <strong>{getAssetLabel(asset)}</strong>
                  <span>Updated {formatDate(asset.updatedAt)}</span>
                </div>
              )}
            />

            <ReportList
              title="Due Maintenance"
              items={report?.dueMaintenance || []}
              emptyText="No due maintenance"
              renderItem={(asset) => (
                <div className="reports-list-item" key={asset._id}>
                  <strong>{getAssetLabel(asset)}</strong>
                  <span>{getName(asset.department)} · {formatDate(asset.nextMaintenanceDate)}</span>
                </div>
              )}
            />

            <ReportList
              title="Nearing Retirement"
              items={report?.nearingRetirement || []}
              emptyText="No assets nearing retirement"
              renderItem={(asset) => (
                <div className="reports-list-item" key={asset._id}>
                  <strong>{getAssetLabel(asset)}</strong>
                  <span>{getName(asset.department)} · {formatDate(asset.retirementDate)}</span>
                </div>
              )}
            />
          </section>
        </>
      )}
    </main>
  );
}
