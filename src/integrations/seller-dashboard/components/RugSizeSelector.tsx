import { STANDARD_RUG_SIZES } from '../../../constants/rugSizes';

interface RugSizeSelectorProps {
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
}

/**
 * Multi-select checkbox group for rug sizes.
 * Used in seller dashboard when adding/editing rugs.
 */
export function RugSizeSelector({ selectedSizes, onChange }: RugSizeSelectorProps) {
  const toggleSize = (code: string) => {
    if (selectedSizes.includes(code)) {
      onChange(selectedSizes.filter(s => s !== code));
    } else {
      onChange([...selectedSizes, code]);
    }
  };

  const selectAll = () => {
    onChange(STANDARD_RUG_SIZES.map(size => size.code));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      {/* Quick actions */}
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={selectAll}
          className="text-accent hover:underline"
        >
          انتخاب همه
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-muted-foreground hover:underline"
        >
          پاک کردن
        </button>
      </div>

      {/* Size grid */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-input-background rounded-lg border border-border max-h-[300px] overflow-y-auto">
        {STANDARD_RUG_SIZES.map((size) => (
          <label
            key={size.code}
            className={`flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors ${
              selectedSizes.includes(size.code)
                ? 'bg-accent/10 border border-accent'
                : 'hover:bg-gray-100 border border-transparent'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedSizes.includes(size.code)}
              onChange={() => toggleSize(size.code)}
              className="w-4 h-4 accent-accent rounded"
            />
            <span className="text-sm text-foreground">{size.display}</span>
          </label>
        ))}
      </div>

      {/* Selected count */}
      <p className="text-sm text-muted-foreground">
        {selectedSizes.length} سایز انتخاب شده
      </p>
    </div>
  );
}
