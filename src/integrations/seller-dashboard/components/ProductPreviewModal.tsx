import { X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { ProductSpec } from '../types/seller';

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: {
    name: string;
    description: string;
    price: string;
    image: string | null;
    specs: ProductSpec[];
  };
}

export function ProductPreviewModal({ isOpen, onClose, productData }: ProductPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-[16px] sm:rounded-[24px] w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e6e6e6] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-[16px] sm:rounded-t-[24px] z-10">
          <h2 className="text-[#1a1a1a] text-right" style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)' }}>
            پیش‌نمایش محصول
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-all duration-300"
            aria-label="بستن"
          >
            <X className="w-5 h-5 text-[#212121]" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Product Image */}
          <div className="relative aspect-square bg-[#f5f5f5] rounded-[16px] sm:rounded-[20px] overflow-hidden">
            {productData.image ? (
              <ImageWithFallback
                src={productData.image}
                alt={productData.name || 'محصول'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#999]">
                <p className="text-right" style={{ fontSize: '14px' }}>بدون تصویر</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-3 sm:space-y-4">
            {/* Name */}
            <div className="text-right">
              <h3 className="text-[#1a1a1a]" style={{ fontSize: '18px', fontWeight: 'var(--font-weight-semibold)' }}>
                {productData.name || 'نام محصول'}
              </h3>
            </div>

            {/* Description */}
            {productData.description && (
              <div className="text-right">
                <p className="text-[#666]" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {productData.description}
                </p>
              </div>
            )}

            {/* Price */}
            {productData.price && (
              <div className="bg-[#f5f5f5] rounded-[12px] p-3 sm:p-4 text-right">
                <p className="text-[#666] mb-1" style={{ fontSize: '12px' }}>قیمت</p>
                <p className="text-[#1a1a1a]" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-semibold)' }}>
                  {parseFloat(productData.price).toLocaleString('fa-IR')} تومان
                </p>
              </div>
            )}

            {/* Specs */}
            {productData.specs && productData.specs.length > 0 && (
              <div className="bg-white border border-[#e6e6e6] rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 space-y-2">
                <h4 className="text-[#1a1a1a] text-right pb-2 border-b border-[#e6e6e6]" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                  مشخصات محصول
                </h4>
                <div className="space-y-2">
                  {productData.specs
                    .filter(spec => spec.key && spec.value)
                    .map((spec, index) => (
                      <div 
                        key={`${spec.key}-${spec.value}-${index}`}
                        className="flex items-center justify-between py-2 border-b border-[#f5f5f5] last:border-0 text-right"
                      >
                        <span className="text-[#666]" style={{ fontSize: '13px' }}>{spec.key}:</span>
                        <span className="text-[#212121]" style={{ fontSize: '13px' }}>{spec.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="bg-[#fff8f0] border border-[#ffeac2] rounded-[12px] p-3 sm:p-4 text-right">
            <p className="text-[#d97706]" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              💡 این پیش‌نمایش محصول شماست. بعد از ایجاد لینک Try، مشتریان می‌توانند محصول را ببینند.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: '#212121',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-medium)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#212121'}
          >
            بستن پیش‌نمایش
          </button>
        </div>
      </div>
    </div>
  );
}
