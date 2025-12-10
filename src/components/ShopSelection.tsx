import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, RefreshCw, Store, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ShopSearchBar } from "./ShopSearchBar";
import { ShopCard, ShopCardSkeleton } from "./ShopCard";
import { apiGet } from "../services/api";
import { API_CONFIG } from "../config/api";
import { useAnimationPreference } from "../hooks/useAnimationPreference";
import type { Shop, ShopListResponse } from "../types/shop";

interface ShopSelectionProps {
  onShopSelect: (shopUsername: string) => void;
}

/**
 * Shop selection page with 21st.dev-inspired design.
 * Features:
 * - Full page shop grid with search
 * - Responsive grid: 1→2→3→4 columns
 * - Load More button pagination
 * - Debounced search (300ms)
 * - Loading skeletons
 * - Empty state with friendly message
 * - Shops with 0 products show toast on click
 */
export function ShopSelection({ onShopSelect }: ShopSelectionProps) {
  const shouldAnimate = useAnimationPreference();

  // State
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 20;
  const DEBOUNCE_MS = 300;

  // Debounce search
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
      setShops([]);
    }, DEBOUNCE_MS);
  }, []);

  // Fetch shops
  const loadShops = useCallback(
    async (pageNum: number, search: string, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          page_size: PAGE_SIZE.toString(),
        });

        if (search.trim()) {
          params.append("search", search.trim());
        }

        const endpoint = `${API_CONFIG.ENDPOINTS.SHOPS}?${params}`;
        console.log("[ShopSelection] Fetching shops:", endpoint);

        const response = await apiGet<{ data: ShopListResponse }>(endpoint);

        if (response?.data) {
          const { results, count, next } = response.data;

          if (append) {
            setShops((prev) => [...prev, ...results]);
          } else {
            setShops(results);
          }

          setTotalCount(count);
          setHasMore(!!next);

          console.log(
            `[ShopSelection] Loaded ${results.length} shops (total: ${count}, hasMore: ${!!next})`
          );
        }
      } catch (err) {
        console.error("[ShopSelection] Failed to load shops:", err);
        setError("خطا در بارگذاری فروشگاه‌ها. لطفاً دوباره تلاش کنید.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial load and search changes
  useEffect(() => {
    loadShops(1, debouncedSearch, false);
  }, [debouncedSearch, loadShops]);

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadShops(nextPage, debouncedSearch, true);
    }
  };

  // Shop click handler
  const handleShopClick = (shop: Shop) => {
    if (shop.product_count === 0) {
      toast.info("این فروشگاه هنوز محصولی ثبت نکرده است", {
        duration: 3000,
      });
      return;
    }
    onShopSelect(shop.username);
  };

  // Retry handler
  const handleRetry = () => {
    setError(null);
    loadShops(page, debouncedSearch, false);
  };

  // Render skeletons
  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <ShopCardSkeleton key={`skeleton-${i}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
              dir="rtl"
            >
              فروشگاه‌های هوما
            </h1>
            <p className="text-gray-500 text-sm sm:text-base" dir="rtl">
              فروشگاه مورد نظر خود را انتخاب کنید
            </p>
          </div>

          {/* Search bar */}
          <ShopSearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            loading={loading && !shops.length}
            placeholder="جستجوی فروشگاه..."
          />

          {/* Results count - right aligned for RTL */}
          {!loading && totalCount > 0 && (
            <p className="text-right text-sm text-gray-500 mt-4 max-w-2xl mx-auto" dir="rtl">
              {totalCount} فروشگاه یافت شد
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-600 text-center mb-4" dir="rtl">
              {error}
            </p>
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>تلاش مجدد</span>
            </Button>
          </motion.div>
        )}

        {/* Loading state (initial) */}
        {loading && !shops.length && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {renderSkeletons(8)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && shops.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Store className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2" dir="rtl">
              {debouncedSearch ? "نتیجه‌ای یافت نشد" : "هیچ فروشگاهی یافت نشد"}
            </h3>
            <p className="text-gray-500 text-center max-w-sm" dir="rtl">
              {debouncedSearch
                ? "فروشگاهی با این نام پیدا نشد. لطفاً عبارت دیگری را جستجو کنید."
                : "در حال حاضر فروشگاهی در سیستم ثبت نشده است."}
            </p>
            {debouncedSearch && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                }}
                variant="outline"
                className="mt-4"
              >
                پاک کردن جستجو
              </Button>
            )}
          </motion.div>
        )}

        {/* Shop grid */}
        {!error && shops.length > 0 && (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {shops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    onClick={handleShopClick}
                    shouldAnimate={shouldAnimate}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
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

            {/* Loading more skeletons */}
            {loadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-6">
                {renderSkeletons(4)}
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}
