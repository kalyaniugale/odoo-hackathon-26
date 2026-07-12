import "../pages/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">

      <h2 className="dashboard-title">
        Today's Overview
      </h2>

      <div className="stats-grid">

        <div className="card">
          <h4>Available Assets</h4>
          <h2>128</h2>
        </div>

        <div className="card">
          <h4>Allocated Assets</h4>
          <h2>76</h2>
        </div>

        <div className="card">
          <h4>Maintenance Today</h4>
          <h2>4</h2>
        </div>

        <div className="card">
          <h4>Active Bookings</h4>
          <h2>9</h2>
        </div>

        <div className="card">
          <h4>Pending Transfers</h4>
          <h2>3</h2>
        </div>

        <div className="card">
          <h4>Upcoming Returns</h4>
          <h2>12</h2>
        </div>

      </div>

      <div className="alert-box">
        ⚠ 3 Assets overdue for return
      </div>

      <div className="action-buttons">

        <button className="success-btn">
          + Register Asset
        </button>

        <button className="outline-btn">
          Book Resource
        </button>

        <button className="outline-btn">
          Raise Request
        </button>

      </div>

      <div className="activity">

        <h2>Recent Activity</h2>

        <ul>
          <li>Laptop AF-011 allocated</li>
          <li>Room booking confirmed</li>
          <li>Projector maintenance completed</li>
        </ul>

      </div>

    </div>
  );
}