import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Header } from "./Header";
import { apiGet } from "../services/api";
import { API_CONFIG } from "../config/api";
import type { BackendProduct, BackendProductsResponse } from "../types/product";
import type { User } from "../types/auth";
import { useAnimationPreference } from "../hooks/useAnimationPreference";

interface ProductSelectionProps {
  onProductSelect: (productId: string, uniqueLink: string, productData?: BackendProduct) => void;
  onBack?: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function ProductSelection({
  onProductSelect,
  onBack,
  isAuthenticated,
  user,
  onLogin,
  onLogout
}: ProductSelectionProps) {
  const shouldAnimate = useAnimationPreference();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [windowStartOffset, setWindowStartOffset] = useState<number>(0); // backend offset of first item in products

  const PAGE_SIZE = 20;
  const MAX_CACHE = 50;
  const BOTTOM_THRESHOLD_PX = 300;
  const TOP_THRESHOLD_PX = 200;

  useEffect(() => {
    // Initial load
    (async () => {
      await loadInitialProducts();
    })();
  }, []);

  const loadInitialProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[ProductSelection] Loading products from:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS);

      const response = await apiGet<BackendProductsResponse>(API_CONFIG.ENDPOINTS.PRODUCTS, {
        limit: PAGE_SIZE,
        offset: 0
      });

      console.log('[ProductSelection] API response (initial):', response);

      if (response.success && response.data) {
        const backendResponse = response.data as BackendProductsResponse;
        const paginatedData = backendResponse.data;
        const productsArray = paginatedData?.results || [];

        console.log('[ProductSelection] Products loaded:', {
          total: paginatedData?.count || 0,
          loaded: productsArray.length,
          hasNext: !!paginatedData?.next,
          hasPrevious: !!paginatedData?.previous
        });
        setProducts(productsArray);
        setTotalCount(paginatedData?.count || productsArray.length);
        setHasMore((productsArray.length || 0) < (paginatedData?.count || 0));
        setWindowStartOffset(0);

        // Attach scroll listener
        attachScrollListener();
      } else {
        console.error('[ProductSelection] API error:', response.error);
        setError(response.error || 'خطا در بارگذاری محصولات');
      }
    } catch (err) {
      console.error('[ProductSelection] Error loading products:', err);
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextOffset = windowStartOffset + products.length;
      if (totalCount && nextOffset >= totalCount) {
        setHasMore(false);
        return;
      }

      const response = await apiGet<BackendProductsResponse>(API_CONFIG.ENDPOINTS.PRODUCTS, {
        limit: PAGE_SIZE,
        offset: nextOffset
      });

      if (response.success && response.data) {
        const backendResponse = response.data as BackendProductsResponse;
        const paginatedData = backendResponse.data;
        const nextResults = paginatedData?.results || [];

        let newProducts = [...products, ...nextResults];
        let newWindowStart = windowStartOffset;

        if (newProducts.length > MAX_CACHE) {
          const toDrop = newProducts.length - MAX_CACHE;
          newProducts = newProducts.slice(toDrop);
          newWindowStart = windowStartOffset + toDrop;
        }

        setProducts(newProducts);
        setWindowStartOffset(newWindowStart);
        const loadedSoFar = newWindowStart + newProducts.length;
        setHasMore(loadedSoFar < (paginatedData?.count || totalCount || loadedSoFar));
        if (!totalCount) setTotalCount(paginatedData?.count || loadedSoFar);
      }
    } catch (err) {
      console.error('[ProductSelection] Error loading next page:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadPrevPage = async () => {
    if (isLoadingPrev) return;
    if (windowStartOffset <= 0) return; // nothing earlier
    setIsLoadingPrev(true);
    try {
      const prevOffset = Math.max(0, windowStartOffset - PAGE_SIZE);

      const response = await apiGet<BackendProductsResponse>(API_CONFIG.ENDPOINTS.PRODUCTS, {
        limit: PAGE_SIZE,
        offset: prevOffset
      });

      if (response.success && response.data) {
        const backendResponse = response.data as BackendProductsResponse;
        const paginatedData = backendResponse.data;
        const prevResults = paginatedData?.results || [];

        let newProducts = [...prevResults, ...products];
        let newWindowStart = prevOffset;

        if (newProducts.length > MAX_CACHE) {
          // When prepending, drop from end to keep earlier items visible
          newProducts = newProducts.slice(0, MAX_CACHE);
        }

        setProducts(newProducts);
        setWindowStartOffset(newWindowStart);
      }
    } catch (err) {
      console.error('[ProductSelection] Error loading previous page:', err);
    } finally {
      setIsLoadingPrev(false);
    }
  };

  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const fullHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

    // Near bottom -> load next
    if (fullHeight - (scrollTop + viewportHeight) < BOTTOM_THRESHOLD_PX) {
      void loadNextPage();
    }

    // Near top -> try load previous (if we dropped)
    if (scrollTop < TOP_THRESHOLD_PX) {
      void loadPrevPage();
    }
  };

  const attachScrollListener = () => {
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleProductSelect = (product: BackendProduct) => {
    console.log('[ProductSelection] Product selected:', product);
    setSelectedProduct(product.unique_link);
    // Generate internal productId for URL compatibility
    const productId = `prod_${product.id}`;
    console.log('[ProductSelection] Calling onProductSelect with:', { productId, uniqueLink: product.unique_link });
    // Pass the product data to avoid refetching
    onProductSelect(productId, product.unique_link, product);
  };

  const getImageUrl = (imagePath: string) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(imagePath)}`;
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          showBackButton={!!onBack}
          onBack={onBack}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={onLogin}
          onLogout={onLogout}
        />
        <div className="pt-14 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">در حال بارگذاری محصولات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          showBackButton={!!onBack}
          onBack={onBack}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={onLogin}
          onLogout={onLogout}
        />
        <div className="pt-14 flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-sm mx-auto px-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">خطا در بارگذاری</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadInitialProducts} className="w-full">
              تلاش مجدد
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        showBackButton={!!onBack}
        onBack={onBack}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
      />
      
      <div className="pt-14 pb-6">
        <div className="max-w-lg mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
            transition={shouldAnimate ? { duration: 0.3 } : undefined}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              محصول مورد نظر خود را انتخاب کنید
            </h1>
            <p className="text-gray-600">
              عکسی از فضای خود آپلود کنید و ببینید محصولات چطور در خانه‌تان به نظر می‌رسند
            </p>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={shouldAnimate ? { opacity: 1 } : false}
            transition={shouldAnimate ? { delay: 0.2 } : undefined}
            className="space-y-4"
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.unique_link}
                  initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                  animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                  transition={shouldAnimate ? { delay: index * 0.05 } : undefined}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <button
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-right"
                    disabled={selectedProduct === product.unique_link}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img
                          src={getImageUrl(product.image_path)}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          width={96}
                          height={96}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // Show a placeholder when image fails to load
                            const container = target.parentElement;
                            if (container) {
                              container.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 text-right">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        {product.price && (
                          <p className="text-sm font-semibold text-[#E31E24] mb-2">
                            {product.price.toLocaleString('fa-IR')} ریال
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {product.category_display || product.category}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">هیچ محصولی یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
