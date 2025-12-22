import { Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';

interface LinkPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tryLink: string;
  productName: string;
}

export function LinkPreviewModal({
  isOpen,
  onClose,
  tryLink,
  productName,
}: LinkPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const success = await copyToClipboard(tryLink);
    
    if (success) {
      setCopied(true);
      toast.success('لینک کپی شد! 📋');
      
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('خطا در کپی کردن. لطفاً دستی کپی کنید.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden"
        style={{
          background: '#f8f9fa',
          borderRadius: '32px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
        }}
      >
        <DialogTitle className="sr-only">لینک Try آماده است</DialogTitle>
        <DialogDescription className="sr-only">
          لینک اختصاصی Try برای {productName} ساخته شد
        </DialogDescription>

        <div className="py-10 px-8" dir="rtl">
          {/* Decorative Element - Sparkle Icon Top Right */}
          <div className="absolute top-8 left-8">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z" fill="var(--old-flax)"/>
            </svg>
          </div>

          {/* Success Checkmark - Minimal */}
          <div className="flex justify-center mb-8 mt-6">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--old-flax)',
                border: 'none'
              }}
            >
              <Check className="w-6 h-6 text-black" strokeWidth={3} />
            </div>
          </div>

          {/* Main Title - Large & Simple */}
          <div className="text-center mb-10">
            <h2 
              className="mb-2 text-black leading-tight"
              style={{ 
                fontSize: '24px', 
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              لینک شما آماده است
            </h2>
            <p 
              className="text-gray-600"
              style={{ 
                fontSize: '15px',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              محصول: {productName}
            </p>
          </div>

          {/* Try Link Box */}
          <div
            className="text-center mb-6"
            style={{
              background: '#1a1a1a',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <p
              className="mb-3"
              style={{
                fontSize: '13px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              لینک Try
            </p>
            <code
              className="block break-all ltr text-center"
              style={{
                fontSize: '13px',
                color: '#FFFFFF',
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              {tryLink || 'در حال ایجاد لینک...'}
            </code>
          </div>

          {/* Copy Link Button - Yellow Minimal with Arrow */}
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] mb-8"
            style={{
              height: '48px',
              borderRadius: '24px',
              background: copied ? 'rgba(0, 0, 0, 0.1)' : 'var(--old-flax)',
              color: copied ? '#000000' : '#000000',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-bold)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            <span>{copied ? 'کپی شد!' : 'کپی لینک'}</span>
            {copied ? (
              <Check className="w-4 h-4" strokeWidth={3} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Next Steps - Minimal List */}
          <div
            className="text-right mb-8"
            style={{
              background: 'rgba(0, 0, 0, 0.03)',
              borderRadius: '20px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              padding: '20px'
            }}
          >
            <p
              className="mb-4"
              style={{
                fontSize: '15px',
                fontWeight: 'var(--font-weight-bold)',
                color: '#1a1a1a'
              }}
            >
              گام‌های بعدی
            </p>
            <div className="space-y-3">
              {[
                'لینک را کپی کنید',
                'در بیو یا استوری اینستاگرام قرار دهید',
                'آمار را از پنل مشاهده کنید'
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'var(--old-flax)',
                      fontSize: '11px',
                      fontWeight: 'var(--font-weight-bold)',
                      color: '#000000'
                    }}
                  >
                    {index + 1}
                  </div>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-normal)',
                      lineHeight: '1.5',
                      color: '#333333'
                    }}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Button - Minimal */}
          <div className="flex items-center justify-center w-full">
            <button
              onClick={onClose}
              className="transition-all duration-300 active:scale-[0.96]"
              style={{
                padding: '0 32px',
                height: '44px',
                borderRadius: '22px',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                color: '#000000',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                boxShadow: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              }}
            >
              متوجه شدم
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}