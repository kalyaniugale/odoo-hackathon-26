import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">

      <Sidebar />

      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
}