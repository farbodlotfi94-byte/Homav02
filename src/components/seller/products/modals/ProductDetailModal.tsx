import { X, Copy, Check, Eye, ExternalLink, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import type { SellerProduct } from '../types/seller';

interface ProductDetailModalProps {
  product: SellerProduct;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductDetailModal({ 
  product, 
  onClose,
  onEdit,
  onDelete
}: ProductDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(product.tryLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or when Clipboard API is blocked
        const textArea = document.createElement('textarea');
        textArea.value = product.tryLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Try fallback method
      const textArea = document.createElement('textarea');
      textArea.value = product.tryLink;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('All copy methods failed:', fallbackErr);
      } finally {
        textArea.remove();
      }
    }
  };

  const handleOpenLink = () => {
    window.open(product.tryLink, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-[16px] sm:rounded-[24px] w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e6e6e6] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-[16px] sm:rounded-t-[24px] z-10">
          <h2 className="text-[#1a1a1a] text-right">جزئیات محصول</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-all duration-300"
            aria-label="بستن"
          >
            <X className="w-5 h-5 text-[#212121]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Product Image & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {/* Image */}
            <div className="relative aspect-square bg-[#f5f5f5] rounded-[16px] sm:rounded-[20px] md:rounded-[24px] overflow-hidden">
              {product.images[0] ? (
                <ImageWithFallback
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#666]">
                  <span className="text-right">بدون تصویر</span>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                {product.status === 'active' ? (
                  <Badge className="bg-[#4ade80] text-white text-[11px] sm:text-[12px]">فعال</Badge>
                ) : product.status === 'inactive' ? (
                  <Badge className="bg-[#9ca3af] text-white text-[11px] sm:text-[12px]">غیرفعال</Badge>
                ) : null}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-3 sm:space-y-4">
              {/* Name */}
              <div className="text-right">
                <h3 className="text-[#1a1a1a] mb-2 text-right text-[16px] sm:text-[18px]">{product.name}</h3>
                {product.nameEn && (
                  <p className="text-[#666] text-right text-[13px] sm:text-[14px]">{product.nameEn}</p>
                )}
              </div>

              {/* Category */}
              {product.category && (
                <div className="text-right">
                  <p className="text-[#666] text-[12px] sm:text-[14px] mb-1 text-right">دسته‌بندی</p>
                  <p className="text-[#212121] text-right text-[14px] sm:text-[15px]">{product.category}</p>
                </div>
              )}

              {/* SKU */}
              {product.sku && (
                <div className="text-right">
                  <p className="text-[#666] text-[12px] sm:text-[14px] mb-1 text-right">کد محصول</p>
                  <p className="text-[#212121] text-right text-[14px] sm:text-[15px]">{product.sku}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats & Link - Combined Section */}
          <div className="bg-white border border-[#e6e6e6] rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-5">
            {/* Section Title */}
            <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-[#e6e6e6]">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#E31E24]" />
              <h4 className="text-[#1a1a1a] text-right text-[14px] sm:text-[15px]">آمار و لینک اختصاصی</h4>
            </div>

            {/* Stats - Compact for mobile */}
            <div className="bg-[#f5f5f5] rounded-[8px] sm:rounded-[10px] p-3 sm:p-4">
              <div className="flex items-center justify-between text-[13px] sm:text-[14px]">
                <div className="flex items-center gap-1.5 text-[#666]">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-[12px]">بازدید:</span>
                  <span className="text-[#212121]">
                    {product.views !== undefined ? product.views.toLocaleString('fa-IR') : '۰'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#666]">
                  <span className="text-[11px] sm:text-[12px]">نرخ کلیک:</span>
                  <span className="text-[#212121]">
                    {product.views && product.views > 0 
                      ? `${Math.round((product.views * 0.15))}%` 
                      : '۰%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Try Link */}
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[#666] text-[12px] sm:text-[14px] text-right">لینک Try اختصاصی</p>
              <div className="bg-[#f5f5f5] border border-[#e6e6e6] rounded-[8px] sm:rounded-[10px] md:rounded-[12px] p-2.5 sm:p-3 text-right">
                <p className="text-[#212121] text-[11px] sm:text-[12px] md:text-[13px] break-all text-right ltr">
                  {product.tryLink}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-[#212121] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 hover:bg-[#3a3a3a]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-[12px] sm:text-[13px]">کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-[12px] sm:text-[13px]">کپی لینک</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleOpenLink}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#f5f5f5] text-[#212121] rounded-full flex items-center gap-2 transition-all duration-300 hover:bg-[#e6e6e6]"
                  aria-label="باز کردن لینک"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          {product.specs && product.specs.length > 0 && (
            <div className="bg-white border border-[#e6e6e6] rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
              <h4 className="text-[#1a1a1a] text-right pb-2 sm:pb-3 border-b border-[#e6e6e6] text-[14px] sm:text-[15px]">مشخصات محصول</h4>
              {/* Mobile: Flat list | Desktop: Grid */}
              <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3 md:gap-4">
                {product.specs.map((spec, index) => (
                  <div 
                    key={`spec-${product.id}-${index}-${spec.key}`} 
                    className="flex items-center justify-between sm:flex-col sm:items-start sm:bg-[#f5f5f5] sm:rounded-[10px] md:rounded-[12px] sm:p-3 md:p-4 text-right py-2 border-b border-[#e6e6e6] sm:border-0 last:border-0"
                  >
                    <span className="text-[#666] text-[12px] sm:text-[13px] text-right">{spec.key}</span>
                    <span className="text-[#212121] text-[13px] sm:text-[14px] text-right sm:mt-1">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {(product.description || product.fullDescription) && (
            <div className="bg-white border border-[#e6e6e6] rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
              <h4 className="text-[#1a1a1a] text-right pb-2 sm:pb-3 border-b border-[#e6e6e6] text-[14px] sm:text-[15px]">توضیحات محصول</h4>
              <div className="max-w-3xl">
                <p className="text-[#666] text-[13px] sm:text-[14px] leading-relaxed text-right">
                  {product.fullDescription || product.description}
                </p>
              </div>
            </div>
          )}

          {/* Price & Stock */}
          <div className="bg-white border border-[#e6e6e6] rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 md:p-6">
            <h4 className="text-[#1a1a1a] text-right pb-2 sm:pb-3 border-b border-[#e6e6e6] mb-3 sm:mb-4 text-[14px] sm:text-[15px]">قیمت و موجودی</h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
              <div className="text-right">
                <p className="text-[#666] text-[12px] sm:text-[13px] mb-1 text-right">قیمت</p>
                <p className="text-[#212121] text-right text-[14px] sm:text-[15px]">
                  {product.price.toLocaleString('fa-IR')} تومان
                </p>
              </div>
              {product.stock !== undefined && (
                <div className="text-right">
                  <p className="text-[#666] text-[12px] sm:text-[13px] mb-1 text-right">موجودی</p>
                  <p className="text-[#212121] text-right text-[14px] sm:text-[15px]">
                    {product.stock.toLocaleString('fa-IR')} عدد
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-[#f5f5f5] rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onEdit}
              className="flex-1 bg-white text-[#212121] py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#e6e6e6] border border-[#e6e6e6] text-[13px] sm:text-[14px]"
            >
              <span>ویرایش محصول</span>
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={onDelete}
              className="sm:w-auto sm:px-8 py-2.5 sm:py-3 bg-[#fee] text-[#E31E24] rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#fdd] border border-[#fcc] text-[13px] sm:text-[14px]"
            >
              <span>حذف</span>
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Timestamps */}
          <div className="text-[#999] text-[11px] sm:text-[12px] space-y-1 pt-2">
            <p className="text-right">تاریخ ایجاد: {new Date(product.createdAt).toLocaleDateString('fa-IR')}</p>
            <p className="text-right">آخرین بروزرسانی: {new Date(product.updatedAt).toLocaleDateString('fa-IR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}