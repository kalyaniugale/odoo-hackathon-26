import { useEffect, useState } from "react";
import axios from "axios";
import "./Assets.css";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAssets();
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

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.assetTag?.toLowerCase().includes(search.toLowerCase()) ||
      asset.name?.toLowerCase().includes(search.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "" || asset.category?.name === category;

    const matchesStatus =
      status === "" || asset.status === status;

    const matchesDepartment =
      department === "" ||
      asset.department?.name === department;

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
            placeholder="Search by Tag, Model or QR"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="register-btn">
            Register Asset
          </button>

        </div>

      </div>

      <div className="filters">

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Category</option>

          {[...new Set(assets.map(a => a.category?.name))]
            .filter(Boolean)
            .map((cat) => (
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

          {[...new Set(assets.map(a => a.department?.name))]
            .filter(Boolean)
            .map((dept) => (
              <option key={dept}>{dept}</option>
            ))}

        </select>

      </div>

      <div className="table-container">

        <table>

          <thead>

            <tr>
              <th>Tag</th>
              <th>Brand</th>
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

                <tr key={asset._id}>

                  <td>{asset.assetTag}</td>

                  <td>{asset.name}</td>

                  <td>{asset.category?.name}</td>

                  <td>

                    <span className={`status ${asset.status.toLowerCase()}`}>
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