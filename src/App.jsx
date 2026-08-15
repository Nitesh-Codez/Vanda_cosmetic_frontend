import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/Admin/AdminProducts";

function App() {
  return (
    <Routes>
      {/* ROOT REDIRECT TO ADMIN DASHBOARD */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      {/* ADMIN PRODUCTS */}
      <Route
        path="/admin/products"
        element={<AdminProducts />}
      />

      {/* CATCH-ALL REDIRECT */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;