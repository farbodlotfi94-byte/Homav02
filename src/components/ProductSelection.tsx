import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { apiGet } from "../services/api";
import { API_CONFIG } from "../config/api";
import type { BackendProduct, PaginatedResponse } from "../types/product";
import type { User } from "../types/auth";
import { useAnimationPreference } from "../hooks/useAnimationPreference";

interface ProductSelectionProps {
  onProductSelect: (productId: string, uniqueLink: string, productData?: BackendProduct) => void;
  onBack?: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onAboutClick?: () => void;
  onSellerDashboard?: () => void;
  shopName?: string | null; // Shop display name (used for both display and API - backend accepts shop_name)
}

export function ProductSelection({
  onProductSelect,
  onBack,
  isAuthenticated,
  user,
  onLogin,
  onLogout,
  onAboutClick,
  onSellerDashboard,
  shopName
}: ProductSelectionProps) {
  const shouldAnimate = useAnimationPreference();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const PAGE_SIZE = 20;

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage = currentPage + 1;

      console.log('[ProductSelection] Loading more at page:', nextPage);

      // Build query params - use shopName (display name) for API filtering
      const params: Record<string, number | string> = {
        page: nextPage,
        page_size: PAGE_SIZE
      };
      if (shopName) {
        params.shop = shopName;
      }

      const response = await apiGet<PaginatedResponse<BackendProduct>>(API_CONFIG.ENDPOINTS.PRODUCTS, params);

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<BackendProduct>;
        const nextResults = paginatedData?.results || [];

        setProducts(prev => [...prev, ...nextResults]);
        setCurrentPage(nextPage);
        setHasMore(!!paginatedData?.next);
      }
    } catch (err) {
      console.error('[ProductSelection] Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [shopName, loadingMore, hasMore, currentPage]);

  const loadInitialProducts = useCallback(async (options?: { allowGuestRetry?: boolean }) => {
    const allowGuestRetry = options?.allowGuestRetry ?? true;
    try {
      setLoading(true);
      setError(null);

      console.log('[ProductSelection] Loading initial products from:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS);

      // Build query params - use shopName (display name) for API filtering
      const params: Record<string, number | string> = {
        page: 1,
        page_size: PAGE_SIZE
      };
      if (shopName) {
        params.shop = shopName;
      }

      console.log('[ProductSelection] API params:', { shopName });

      const response = await apiGet<PaginatedResponse<BackendProduct>>(API_CONFIG.ENDPOINTS.PRODUCTS, params);

      if (response.requiresLogin) {
        console.warn('[ProductSelection] Auth expired on public feed, retrying as guest:', {
          allowGuestRetry,
        });

        if (allowGuestRetry) {
          return await loadInitialProducts({ allowGuestRetry: false });
        }

        setError(response.error || 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید');
        return;
      }

      console.log('[ProductSelection] API response (initial):', response);

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<BackendProduct>;
        const productsArray = paginatedData?.results || [];

        console.log('[ProductSelection] Products loaded:', {
          shopName: shopName || 'all',
          total: paginatedData?.count || 0,
          loaded: productsArray.length,
          hasNext: !!paginatedData?.next,
          hasPrevious: !!paginatedData?.previous
        });

        setProducts(productsArray);
        setTotalCount(paginatedData?.count || productsArray.length);
        setHasMore(!!paginatedData?.next);
        setCurrentPage(1);
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
  }, [shopName]);

  // Initial load and reload when shopName changes
  useEffect(() => {
    void loadInitialProducts();
  }, [loadInitialProducts]);

  const handleProductSelect = (product: BackendProduct) => {
    console.log('[ProductSelection] Product selected:', product);
    setSelectedProduct(product.unique_link);
    const productId = `prod_${product.id}`;
    console.log('[ProductSelection] Calling onProductSelect with:', { productId, uniqueLink: product.unique_link });
    onProductSelect(productId, product.unique_link, product);
  };

  const getImageUrl = (imagePath: string) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(imagePath)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">در حال بارگذاری محصولات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-sm mx-auto px-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">خطا در بارگذاری</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => void loadInitialProducts()} className="w-full">
              تلاش مجدد
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-6 pb-6">
        <div className="max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
            transition={shouldAnimate ? { duration: 0.3 } : undefined}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {shopName ? `محصولات ${shopName}` : 'محصول مورد نظر خود را انتخاب کنید'}
            </h1>
            <p className="text-gray-600">
              {shopName
                ? 'عکسی از فضای خود آپلود کنید و ببینید محصولات چطور در خانه‌تان به نظر می‌رسند'
                : 'عکسی از فضای خود آپلود کنید و ببینید محصولات چطور در خانه‌تان به نظر می‌رسند'}
            </p>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={shouldAnimate ? { opacity: 1 } : false}
            transition={shouldAnimate ? { delay: 0.2 } : undefined}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.unique_link}
                  initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                  animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                  transition={shouldAnimate ? { delay: index * 0.05 } : undefined}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow h-full"
                >
                  <button
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-right h-full"
                    disabled={selectedProduct === product.unique_link}
                  >
                    <div className="flex gap-4 p-4 sm:p-5 h-full">
                      {/* Product Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img
                          src={getImageUrl(product.image_path)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          width={112}
                          height={112}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
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

                      {/* Product Info - Fixed height layout */}
                      <div className="flex-1 flex flex-col justify-between text-right min-w-0">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {product.name}
                          </h3>
                          {product.price && (
                            <p className="text-sm font-bold text-gray-900">
                              {product.price.toLocaleString('fa-IR')} ریال
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full truncate max-w-[120px]">
                            {product.category_display || product.category}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load More button */}
          {hasMore && products.length > 0 && (
            <div className="flex justify-center mt-12 pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                variant="outline"
                size="lg"
                className="
                  min-w-[200px]
                  rounded-xl
                  border-gray-300
                  hover:border-gray-400
                  hover:bg-gray-50
                  transition-all
                  duration-300
                "
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    در حال بارگذاری...
                  </>
                ) : (
                  "بارگذاری بیشتر"
                )}
              </Button>
            </div>
          )}

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
