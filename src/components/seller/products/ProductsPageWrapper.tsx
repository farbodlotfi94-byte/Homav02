/**
 * Products Page Wrapper Component
 *
 * Wraps the ProductsPage with API integration and navigation
 */

import { useNavigate } from 'react-router-dom';
import { ProductsPage } from './components/ProductsPage';

export function ProductsPageWrapper() {
  const navigate = useNavigate();

  const handleEditProduct = (productId: number) => {
    navigate(`/seller/products/${productId}/edit`);
  };

  const handleAddProduct = () => {
    navigate('/seller/products/new');
  };

  const handleViewAnalytics = () => {
    navigate('/seller/analytics');
  };

  return (
    <ProductsPage
      onEditProduct={handleEditProduct}
      onAddProduct={handleAddProduct}
      onViewAnalytics={handleViewAnalytics}
    />
  );
}
