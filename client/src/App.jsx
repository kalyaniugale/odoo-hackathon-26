import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import OrganizationSetup from "./pages/OrganizationSetup";
import Assets from "./pages/Assets";
import ResourceBooking from "./pages/ResourceBooking";
import Audit from "./pages/Audit";

import AdminLayout from "./layouts/AdminLayout";

import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Admin Layout */}
        <Route element={<AdminLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/reports"
            element={<Reports />}
          />
          <Route
            path="/organization-setup"
            element={<OrganizationSetup />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;