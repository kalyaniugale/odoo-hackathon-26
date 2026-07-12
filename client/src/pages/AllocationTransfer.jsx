import { useEffect, useState } from "react";
import axios from "axios";
import "./AllocationTransfer.css";

export default function AllocationTransfer() {
  const token = localStorage.getItem("token");

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    asset: "",
    transferType: "",
    employee: "",
    reason: "",
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/assets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssets(data.assets || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmployees(data.users || []);
    } catch (err) {
      console.log(err);
    }
  };

  const selectedAsset = assets.find(
    (a) => a._id === form.asset
  );

  const submitTransfer = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/allocations",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(data.message);

      setHistory((prev) => [data.allocation, ...prev]);

      setForm({
        asset: "",
        transferType: "",
        employee: "",
        reason: "",
      });
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="allocation-page">

      <h1>Asset Allocation & Transfer</h1>

      <form onSubmit={submitTransfer}>

        <label>Asset</label>

        <select
          value={form.asset}
          onChange={(e) =>
            setForm({ ...form, asset: e.target.value })
          }
        >
          <option value="">Select Asset</option>

          {assets.map((asset) => (
            <option key={asset._id} value={asset._id}>
              {asset.assetTag} - {asset.name}
            </option>
          ))}
        </select>

        {selectedAsset?.status === "Allocated" && (
          <div className="warning">
            Asset already allocated. Transfer request required.
          </div>
        )}

        <label>Transfer Request</label>

        <select
          value={form.transferType}
          onChange={(e) =>
            setForm({
              ...form,
              transferType: e.target.value,
            })
          }
        >
          <option value="">Select Request</option>
          <option value="New Allocation">
            New Allocation
          </option>
          <option value="Transfer">
            Transfer
          </option>
        </select>

        <label>Employee</label>

        <select
          value={form.employee}
          onChange={(e) =>
            setForm({
              ...form,
              employee: e.target.value,
            })
          }
        >
          <option value="">Select Employee</option>

          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name}
            </option>
          ))}
        </select>

        <label>Reason</label>

        <textarea
          rows="5"
          placeholder="Reason"
          value={form.reason}
          onChange={(e) =>
            setForm({
              ...form,
              reason: e.target.value,
            })
          }
        />

        <button>Submit Request</button>

      </form>

      <div className="history">

        <h2>Allocation History</h2>

        {history.length === 0 ? (
          <p>No History</p>
        ) : (
          history.map((item, index) => (
            <div key={index} className="history-card">
              <strong>{item.assetTag}</strong>

              <p>{item.employeeName}</p>

              <span>{item.date}</span>
            </div>
          ))
        )}

      </div>

    </div>
  );
}