import { Plus, X } from 'lucide-react';
import type { ProductSpec } from '../types/seller';

interface ProductSpecsInputProps {
  value: ProductSpec[];
  onChange: (value: ProductSpec[]) => void;
}

export function ProductSpecsInput({ value, onChange }: ProductSpecsInputProps) {
  const addSpec = () => {
    onChange([...value, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...value];
    updated[index][field] = newValue;
    onChange(updated);
  };

  return (
    <div className="space-y-3" dir="rtl">
      {value.map((spec, index) => (
        <div key={index} className="flex flex-row-reverse gap-2 items-start" dir="rtl">
          <button
            type="button"
            onClick={() => removeSpec(index)}
            className="p-2 hover:bg-muted rounded-lg transition-all duration-300 mt-0.5"
            aria-label="حذف"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 grid grid-cols-2 gap-2" dir="rtl">
            <input
              type="text"
              value={spec.key}
              onChange={(e) => updateSpec(index, 'key', e.target.value)}
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-[12px] text-foreground text-right focus:outline-none focus:border-accent transition-all duration-300"
              placeholder="مثال: رنگ"
              dir="rtl"
            />
            <input
              type="text"
              value={spec.value}
              onChange={(e) => updateSpec(index, 'value', e.target.value)}
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-[12px] text-foreground text-right focus:outline-none focus:border-accent transition-all duration-300"
              placeholder="مثال: خاکستری روشن"
              dir="rtl"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSpec}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-border hover:border-foreground hover:bg-muted rounded-[12px] transition-all duration-300 text-foreground"
        dir="rtl"
      >
        <Plus className="w-5 h-5" />
        <span>افزودن مشخصات جدید</span>
      </button>

      {value.length === 0 && (
        <p className="caption text-muted-foreground text-right" dir="rtl">
          💡 مثال: رنگ، سایز، جنس، ساخت، گارانتی
        </p>
      )}
    </div>
  );
}