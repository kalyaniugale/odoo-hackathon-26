import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <h2 className="logo">
        AssetFlow
      </h2>

      <nav>

        <NavLink to="/dashboard" end>
          Dashboard
        </NavLink>

        <NavLink to="/departments">
          Organization Setup
        </NavLink>

        <NavLink to="/assets">
          Assets
        </NavLink>

        <NavLink to="/allocation">
          Allocation & Transfer
        </NavLink>

        <NavLink to="/booking">
          Resource Booking
        </NavLink>

        <NavLink to="/maintenance">
          Maintenance
        </NavLink>

        <NavLink to="/audit">
          Audit
        </NavLink>

        <NavLink to="/reports">
          Reports
        </NavLink>

        <NavLink to="/notifications">
          Notifications
        </NavLink>

      </nav>

    </aside>
  );
}