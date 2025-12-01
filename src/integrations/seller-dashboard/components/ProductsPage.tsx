import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { SellerProductImage } from './SellerProductImage';
import type { SellerProduct, Seller } from '../types/seller';
import { SellerProfileCard } from './SellerProfileCard';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductsPageProps {
  products: SellerProduct[];
  seller: Seller;
  isLoadingProducts: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  onEditProduct: (product: SellerProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

export function ProductsPage({
  products,
  seller,
  isLoadingProducts,
  searchQuery,
  onSearchChange,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductsPageProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div 
      className="space-y-5 sm:space-y-6 md:space-y-7 pb-20 md:pb-6"
      style={{ minHeight: '100vh' }}
    >
      {/* Seller Profile Card */}
      <SellerProfileCard seller={seller} />

      {/* Header with Sparkle */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-5 relative">
        {/* Decorative Sparkle - Top Left */}
        <div className="absolute -top-2 left-0 hidden sm:block">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z" fill="var(--old-flax)"/>
          </svg>
        </div>

        <div className="text-right">
          <h1 
            className="text-black mb-2"
            style={{
              fontSize: '24px',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: '1.3'
            }}
          >
            مدیریت محصولات
          </h1>
          <p 
            className="text-black/60"
            style={{
              fontSize: '15px',
              fontWeight: 'var(--font-weight-normal)'
            }}
          >
            مشاهده، ویرایش و مدیریت اطلاعات محصولات فروشگاه
          </p>
        </div>
        <button
          onClick={onAddProduct}
          className="flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] self-start"
          style={{
            paddingLeft: '24px',
            paddingRight: '24px',
            height: '48px',
            borderRadius: '24px',
            backgroundColor: 'var(--old-flax)',
            color: '#000000',
            fontSize: '14px',
            fontWeight: 'var(--font-weight-bold)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>افزودن محصول جدید</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Toolbar - Always visible when there are products or during search */}
      {(products.length > 0 || searchQuery || isLoadingProducts) && (
        <div
          className="rounded-[24px] p-5"
          style={{
            background: 'var(--jet-black)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'rgba(255, 255, 255, 0.3)' }}
              />
              <input
                type="text"
                placeholder="جستجوی نام محصول..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full border transition-all duration-200"
                dir="rtl"
                style={{
                  height: '46px',
                  borderRadius: '16px',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-normal)',
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  outline: 'none',
                  paddingRight: '40px',
                  paddingLeft: '16px',
                  textAlign: 'right'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--old-flax)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                }}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="border transition-all duration-200"
                style={{
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  height: '46px',
                  borderRadius: '16px',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '14px',
                  fontWeight: 'var(--font-weight-normal)',
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--old-flax)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                }}
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>

              {categories.length > 0 && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border transition-all duration-200"
                  style={{
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    height: '46px',
                    borderRadius: '16px',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-normal)',
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--old-flax)';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                  }}
                >
                  <option value="all">همه دسته‌بندی‌ها</option>
                  {categories.map((cat, idx) => (
                    <option key={`category-${cat}-${idx}`} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div
          className="rounded-[28px] p-14 text-center"
          style={{
            background: 'var(--jet-black)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h3
            className="text-white mb-3"
            style={{
              fontSize: '16px',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            در حال بارگذاری محصولات...
          </h3>
        </div>
      ) : products.length === 0 && !searchQuery ? (
        <div
          className="rounded-[28px] p-14 text-center space-y-5"
          style={{
            background: 'var(--jet-black)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <Plus className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3
              className="mb-3 text-white"
              style={{
                fontSize: '20px',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              محصولی وجود ندارد
            </h3>
            <p
              className="text-white/70 mb-7"
              style={{
                fontSize: '15px',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              اولین محصول خود را اضافه کنید و شروع به فروش کنید
            </p>
            <button
              onClick={onAddProduct}
              className="flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] mx-auto"
              style={{
                paddingLeft: '28px',
                paddingRight: '28px',
                height: '50px',
                borderRadius: '25px',
                backgroundColor: 'var(--old-flax)',
                color: '#000000',
                fontSize: '15px',
                fontWeight: 'var(--font-weight-bold)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <span>افزودن اولین محصول</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-5">
          {/* Products Cards Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="rounded-[20px] overflow-hidden transition-all duration-300 cursor-pointer"
                    style={{
                      background: 'var(--jet-black)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Product Image */}
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <SellerProductImage
                        imageUrl={product.images[0] || null}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        fallbackIcon={
                          <div className="w-full h-full flex items-center justify-center text-black/30">
                            <Plus className="w-14 h-14" strokeWidth={1.5} />
                          </div>
                        }
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {product.status === 'active' ? (
                          <div 
                            className="px-3 py-1 rounded-full"
                            style={{
                              background: 'var(--old-flax)',
                              color: '#000000',
                              fontSize: '12px',
                              fontWeight: 'var(--font-weight-bold)',
                              border: 'none'
                            }}
                          >
                            فعال
                          </div>
                        ) : product.status === 'inactive' ? (
                          <div 
                            className="px-3 py-1 rounded-full"
                            style={{
                              background: 'rgba(0, 0, 0, 0.7)',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 'var(--font-weight-bold)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            غیرفعال
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      {/* Name & Category */}
                      <div className="text-right">
                        <h3
                          className="mb-1 line-clamp-2 text-white leading-tight"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'var(--font-weight-bold)'
                          }}
                        >
                          {product.name}
                        </h3>
                        {product.category && (
                          <p
                            className="text-white/70 leading-tight mt-1"
                            style={{
                              fontSize: '13px',
                              fontWeight: 'var(--font-weight-normal)'
                            }}
                          >
                            {product.category}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div 
                        className="flex items-center justify-between py-2 px-3 rounded-[12px]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13px',
                          fontWeight: 'var(--font-weight-medium)'
                        }}
                      >
                        <div className="flex items-center gap-1.5 text-white/70">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{product.views !== undefined ? product.views.toLocaleString('fa-IR') : '۰'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/70">
                          <span style={{ fontSize: '12px' }}>نرخ کلیک</span>
                          <span>
                            {product.views && product.views > 0 
                              ? `${Math.round((product.views * 0.15))}%` 
                              : '۰%'}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-1">
                        <p
                          className="text-white text-right"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'var(--font-weight-bold)'
                          }}
                        >
                          {product.price.toLocaleString('fa-IR')} تومان
                        </p>
                        {product.stock !== undefined && (
                          <p
                            className="text-white/70 text-right mt-1"
                            style={{
                              fontSize: '12px',
                              fontWeight: 'var(--font-weight-normal)'
                            }}
                          >
                            موجودی: {product.stock.toLocaleString('fa-IR')} عدد
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProduct(product);
                          }}
                          className="flex-1 border rounded-full flex items-center justify-center gap-1.5 transition-all duration-200"
                          style={{
                            height: '40px',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 'var(--font-weight-medium)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProduct(product.id);
                          }}
                          className="border rounded-full flex items-center gap-1.5 transition-all duration-200"
                          aria-label="حذف"
                          style={{
                            paddingLeft: '14px',
                            paddingRight: '14px',
                            height: '40px',
                            borderColor: 'rgba(227, 30, 36, 0.4)',
                            background: 'rgba(227, 30, 36, 0.1)',
                            color: '#FF383C',
                            fontSize: '13px',
                            fontWeight: 'var(--font-weight-medium)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(227, 30, 36, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(227, 30, 36, 0.1)';
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div 
                className="rounded-[20px] p-5 flex items-center justify-between"
                style={{
                  background: 'var(--jet-black)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div className="text-right">
                  <p
                    className="text-white"
                    style={{
                      fontSize: '15px',
                      fontWeight: 'var(--font-weight-bold)'
                    }}
                  >
                    {products.length.toLocaleString('fa-IR')} محصول
                  </p>
                  {searchQuery && (
                    <p
                      className="text-white/70 mt-1"
                      style={{
                        fontSize: '13px',
                        fontWeight: 'var(--font-weight-normal)'
                      }}
                    >
                      نتایج جستجو برای "{searchQuery}"
                    </p>
                  )}
                </div>
                {searchQuery && (
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setFilterStatus('all');
                      setFilterCategory('all');
                    }}
                    className="transition-colors duration-200"
                    style={{
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--old-flax)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    نمایش همه
                  </button>
                )}
              </div>
            </>
          ) : (
            <div 
              className="rounded-[24px] p-12 text-center"
              style={{
                background: 'var(--jet-black)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <p
                className="text-white/70"
                style={{
                  fontSize: '15px',
                  fontWeight: 'var(--font-weight-normal)'
                }}
              >
                محصولی با این فیلترها یافت نشد
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-[24px] p-12 text-center"
          style={{
            background: 'var(--jet-black)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <p
            className="text-white/70"
            style={{
              fontSize: '15px',
              fontWeight: 'var(--font-weight-normal)'
            }}
          >
            محصولی با این جستجو یافت نشد
          </p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => {
            setSelectedProduct(null);
            onEditProduct(selectedProduct);
          }}
          onDelete={() => {
            setSelectedProduct(null);
            onDeleteProduct(selectedProduct.id);
          }}
        />
      )}
    </div>
  );
}