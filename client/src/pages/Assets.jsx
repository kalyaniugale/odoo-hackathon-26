import { useState } from "react";
import "./Assets.css";
import Sidebar from "../components/Sidebar";

export default function Assets() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");

  const assets = [
    {
      id: 1,
      assetTag: "AF-001",
      name: "Dell Latitude 5420",
      category: "Laptop",
      status: "Available",
      location: "IT Department",
      department: "IT",
    },
    {
      id: 2,
      assetTag: "AF-002",
      name: "HP LaserJet Pro",
      category: "Printer",
      status: "Allocated",
      location: "Admin Office",
      department: "Administration",
    },
    {
      id: 3,
      assetTag: "AF-003",
      name: "Epson Projector",
      category: "Projector",
      status: "Maintenance",
      location: "Conference Hall",
      department: "Training",
    },
    {
      id: 4,
      assetTag: "AF-004",
      name: "MacBook Air",
      category: "Laptop",
      status: "Available",
      location: "Development",
      department: "Engineering",
    },
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      asset.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "" || asset.category === category;

    const matchesStatus =
      status === "" || asset.status === status;

    const matchesDepartment =
      department === "" || asset.department === department;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesDepartment
    );
  });

  return (
    <div className="assets-page">

      <div className="assets-header">

        <h1>Assets</h1>

        <div className="header-right">

          <input
            type="text"
            placeholder="Search Asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="success-btn">
            + Register Asset
          </button>

        </div>

      </div>

      <div className="filters">

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Category</option>

          {[...new Set(assets.map((a) => a.category))].map((cat) => (
            <option key={cat}>{cat}</option>
          ))}

        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option>Available</option>
          <option>Allocated</option>
          <option>Maintenance</option>
        </select>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">Department</option>

          {[...new Set(assets.map((a) => a.department))].map((dept) => (
            <option key={dept}>{dept}</option>
          ))}

        </select>

      </div>

      <div className="table-container">

        <table>

          <thead>

            <tr>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Location</th>
            </tr>

          </thead>

          <tbody>

            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty">
                  No Assets Found
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset.id}>

                  <td>{asset.assetTag}</td>

                  <td>{asset.name}</td>

                  <td>{asset.category}</td>

                  <td>
                    <span
                      className={`status ${asset.status.toLowerCase()}`}
                    >
                      {asset.status}
                    </span>
                  </td>

                  <td>{asset.location}</td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}