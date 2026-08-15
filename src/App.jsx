import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <Routes>
      {/* USER HOME PAGE */}
      <Route path="/" element={<HomePage />} />

      {/* SINGLE PRODUCT DETAIL PAGE */}
      <Route path="/product/:id" element={<ProductDetail />} />

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;