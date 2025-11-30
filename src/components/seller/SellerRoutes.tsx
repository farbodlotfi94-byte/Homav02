/**
 * Seller Routes Component
 *
 * Defines all routes for the seller dashboard
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { SellerLogin } from './auth/SellerLogin';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { SellerLayout } from './SellerLayout';
import { DashboardPage } from './dashboard/DashboardPage';
import { ProductsPageWrapper } from './products/ProductsPageWrapper';
import { ProductForm } from './products/ProductForm';
import { ProductAnalytics } from './products/ProductAnalytics';
import { SettingsPage } from './settings/SettingsPage';

export function SellerRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="login" element={<SellerLogin />} />

      {/* Protected Routes with Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Products */}
        <Route path="products" element={<ProductsPageWrapper />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />

        {/* Analytics */}
        <Route path="analytics" element={<ProductAnalytics />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
