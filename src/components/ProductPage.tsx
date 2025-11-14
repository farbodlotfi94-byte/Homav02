/**
 * ProductPage Component
 * Wrapper component that handles path-based routing for products
 * Uses unique_link from URL path parameter
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ProductPageProps {
  onProductLoad: (uniqueLink: string) => void;
  onProductNotFound: () => void;
}

export function ProductPage({ onProductLoad, onProductNotFound }: ProductPageProps) {
  const { uniqueLink } = useParams<{ uniqueLink: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[ProductPage] Mounted with uniqueLink:', uniqueLink);

    if (!uniqueLink) {
      console.log('[ProductPage] No uniqueLink in path, redirecting to home');
      navigate('/', { replace: true });
      return;
    }

    // Validate uniqueLink format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uniqueLink)) {
      console.log('[ProductPage] Invalid uniqueLink format:', uniqueLink);
      onProductNotFound();
      return;
    }

    // Load product by unique_link
    onProductLoad(uniqueLink);
  }, [uniqueLink, navigate, onProductLoad, onProductNotFound]);

  // This component just handles routing logic, rendering is done by parent
  return null;
}
