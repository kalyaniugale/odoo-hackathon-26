import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Maintenance from "./pages/Maintenance";
import Dashboard from "./pages/Dashboard";
import OrganizationSetup from "./pages/OrganizationSetup";
import Assets from "./pages/Assets";
import AssetDetails from "./pages/AssetDetails";
import Allocation from "./pages/Allocation";
import Booking from "./pages/Booking";
import Audit from "./pages/Audit";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import AdminLayout from "./layouts/AdminLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: {
              border: "1px solid #111111",
              borderRadius: 0,
              color: "#0a0a0a",
              boxShadow: "none",
              fontWeight: 700,
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/maintenance" element={<Maintenance />} />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/organization-setup" element={<OrganizationSetup />} />

              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/:id" element={<AssetDetails />} />

              <Route
                path="/allocation-transfer"
                element={<Allocation />}
              />

              <Route path="/resource-booking" element={<Booking />} />

              <Route path="/audit" element={<Audit />} />

              <Route path="/reports" element={<Reports />} />

              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
