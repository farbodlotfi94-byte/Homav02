import { useState } from 'react';
import svgPaths from '../imports/svg-w780ilk0sp';
import type { ProductSpec } from '../types/seller';

interface ProductSpecsPreviewProps {
  specs: ProductSpec[];
  productName?: string;
}

function KeyboardArrowDown({ isOpen }: { isOpen: boolean }) {
  return (
    <div 
      className="relative shrink-0 size-[24px] transition-transform duration-300"
      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
      data-name="keyboard_arrow_down"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="keyboard_arrow_down">
          <path d={svgPaths.p2b1b0180} fill="var(--foreground)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

export function ProductSpecsPreview({ specs, productName }: ProductSpecsPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!specs || specs.length === 0) {
    return null;
  }

  return (
    <div className="bg-card flex flex-col gap-[16px] items-start relative rounded-[24px] w-full border border-border p-4" data-name="ProductSpecsPreview">
      <p className="text-xs text-foreground/60 mb-2" style={{ fontFamily: 'var(--font-family-vazirmatn)' }}>
        👁️ پیش‌نمایش برای کاربر نهایی:
      </p>
      
      {/* Collapsible Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="basis-0 bg-muted grow h-[48px] min-h-px min-w-px relative rounded-[16px] shrink-0 w-full transition-all duration-300 hover:bg-muted/80"
        data-name="Button"
        aria-expanded={isOpen}
        aria-controls="specs-preview-content"
      >
        <div className="flex flex-row items-center justify-center size-full">
          <div className="box-border content-stretch flex gap-[8px] h-[48px] items-center justify-center px-[16px] py-[8px] relative w-full">
            <KeyboardArrowDown isOpen={isOpen} />
            <p className="relative shrink-0 text-foreground text-nowrap whitespace-pre" dir="auto" style={{ fontFamily: 'var(--font-family-vazirmatn)' }}>
              جزئیات محصول
            </p>
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        id="specs-preview-content"
        className="transition-all duration-300 overflow-hidden w-full"
        style={{
          maxHeight: isOpen ? '500px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-[16px] pb-[8px] space-y-2">
          {specs.map((spec, index) => (
            <div key={index} className="flex items-start gap-2 py-1.5" style={{ fontFamily: 'var(--font-family-vazirmatn)' }}>
              <span className="text-foreground/60 min-w-[100px]">{spec.key}:</span>
              <span className="text-foreground flex-1">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
