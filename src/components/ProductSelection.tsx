import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Header } from "./Header";
import { apiGet } from "../services/api";
import { API_CONFIG } from "../config/api";
import type { BackendProduct, BackendProductsResponse } from "../types/product";

interface ProductSelectionProps {
  onProductSelect: (productId: string, uniqueLink: string) => void;
  onBack?: () => void;
}

export function ProductSelection({ onProductSelect, onBack }: ProductSelectionProps) {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[ProductSelection] Loading products from:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS);
      
      const response = await apiGet<BackendProductsResponse>(API_CONFIG.ENDPOINTS.PRODUCTS);
      
      console.log('[ProductSelection] API response:', response);
      
      if (response.success && response.data) {
        console.log('[ProductSelection] Products loaded:', response.data.products.length);
        setProducts(response.data.products);
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

  const handleProductSelect = (product: BackendProduct) => {
    console.log('[ProductSelection] Product selected:', product);
    setSelectedProduct(product.unique_link);
    // Generate internal productId for URL compatibility
    const productId = `prod_${product.id}`;
    console.log('[ProductSelection] Calling onProductSelect with:', { productId, uniqueLink: product.unique_link });
    onProductSelect(productId, product.unique_link);
  };

  const getImageUrl = (imagePath: string) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(imagePath)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header showBackButton={!!onBack} onBack={onBack} />
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
        <Header showBackButton={!!onBack} onBack={onBack} />
        <div className="pt-14 flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-sm mx-auto px-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">خطا در بارگذاری</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadProducts} className="w-full">
              تلاش مجدد
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showBackButton={!!onBack} onBack={onBack} />
      
      <div className="pt-14 pb-6">
        <div className="max-w-lg mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.unique_link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <button
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-right"
                    disabled={selectedProduct === product.unique_link}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(product.image_path)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
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
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {product.category}
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
