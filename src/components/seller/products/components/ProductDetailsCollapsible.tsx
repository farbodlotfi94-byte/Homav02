import { useState } from 'react';
import svgPaths from '../imports/svg-0dkvqyt6k5';
import { ProductSpecsInput } from './ProductSpecsInput';
import { ProductSpecsPreview } from './ProductSpecsPreview';
import type { ProductSpec } from '../types/seller';

interface ProductDetailsCollapsibleProps {
  value: ProductSpec[];
  onChange: (value: ProductSpec[]) => void;
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

export function ProductDetailsCollapsible({ value, onChange }: ProductDetailsCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-card flex flex-col gap-[16px] items-start relative rounded-[24px] w-full" data-name="ProductDetails">
        {/* Collapsible Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="basis-0 bg-muted grow h-[48px] min-h-px min-w-px relative rounded-[16px] shrink-0 w-full transition-all duration-300 hover:bg-muted/80"
          data-name="Button"
          aria-expanded={isOpen}
          aria-controls="product-details-content"
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
          id="product-details-content"
          className="transition-all duration-300 overflow-hidden w-full"
          style={{
            maxHeight: isOpen ? '800px' : '0px',
            opacity: isOpen ? 1 : 0,
          }}
        >
          <div className="px-[16px] pb-[8px]">
            <label className="block mb-3" style={{ fontFamily: 'var(--font-family-vazirmatn)' }}>
              مشخصات محصول
            </label>
            <ProductSpecsInput value={value} onChange={onChange} />
            <p className="text-xs text-foreground/60 mt-3" style={{ fontFamily: 'var(--font-family-vazirmatn)' }}>
              💡 این مشخصات برای کاربر نهایی در قسمت "جزئیات محصول" نمایش داده می‌شود
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {value.length > 0 && (
        <ProductSpecsPreview specs={value.filter(s => s.key && s.value)} />
      )}
    </div>
  );
}