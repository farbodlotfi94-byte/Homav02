/**
 * Products Page Component - Simplified version with API integration
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { sellerApiService } from '../../../../services/sellerApiService';
import { sellerAuthService } from '../../../../services/sellerAuthService';
import { SellerProfileCard } from '../../dashboard/components/SellerProfileCard';
import type { Seller } from '../../../../integrations/seller-dashboard/types/seller';
import type { ProductListItem } from '../../../../types/seller-api';

interface ProductsPageProps {
  onEditProduct: (productId: number) => void;
  onAddProduct: () => void;
  onViewAnalytics: () => void;
}

export function ProductsPage({
  onEditProduct,
  onAddProduct,
  onViewAnalytics,
}: ProductsPageProps) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const apiSeller = sellerAuthService.getShop();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await sellerApiService.getProductsList();

      if (result.success && result.data) {
        setProducts(result.data.results);
      } else {
        toast.error(result.error || 'خطا در دریافت لیست محصولات');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const seller: Seller | null = apiSeller ? {
    id: apiSeller.id.toString(),
    name: apiSeller.username,
    shopName: apiSeller.shop_name,
    email: apiSeller.phone_number,
    createdAt: apiSeller.created_at,
  } : null;

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EEFF41] mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seller Profile Card */}
      <SellerProfileCard seller={seller} />

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">محصولات</h1>
          <button
            onClick={onViewAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            آمار
          </button>
        </div>

        <button
          onClick={onAddProduct}
          className="flex items-center gap-2 bg-[#EEFF41] text-black px-4 py-2 rounded-lg hover:bg-[#D9E838] transition-colors"
        >
          <Plus className="w-4 h-4" />
          افزودن محصول
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="جستجو در محصولات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EEFF41] focus:border-transparent"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EEFF41] mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری محصولات...</p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'محصولی یافت نشد' : 'هنوز محصولی اضافه نکرده‌اید'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'با تغییر عبارت جستجو دوباره امتحان کنید' : 'اولین محصول خود را اضافه کنید'}
          </p>
          {!searchQuery && (
            <button
              onClick={onAddProduct}
              className="bg-[#EEFF41] text-black px-6 py-3 rounded-lg hover:bg-[#D9E838] transition-colors"
            >
              افزودن محصول جدید
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.image_url}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onEditProduct(parseInt(product.image_url.split('/').pop() || '0'))} // Temporary solution
            >
              {/* Product Image */}
              <div className="aspect-square overflow-hidden">
                <ImageWithFallback
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>بازدید: {product.total_views.toLocaleString('fa-IR')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-gray-900">
                    {product.price.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}