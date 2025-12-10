import { useEffect, useRef, useCallback } from "react";
import { Search, X, Command } from "lucide-react";

interface ShopSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

/**
 * Command palette style search bar for shop selection.
 * Features:
 * - Keyboard shortcut: Ctrl+K (Windows/Linux) or Cmd+K (Mac)
 * - RTL support with search icon on right
 * - Clear button when input has value
 * - Focus ring animation
 */
export function ShopSearchBar({
  value,
  onChange,
  placeholder = "جستجوی فروشگاه...",
  loading = false,
}: ShopSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut handler (Ctrl+K / Cmd+K)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      inputRef.current?.focus();
    }
    // Escape to clear and blur
    if (e.key === "Escape" && document.activeElement === inputRef.current) {
      if (value) {
        onChange("");
      } else {
        inputRef.current?.blur();
      }
    }
  }, [value, onChange]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  // Detect platform for shortcut display
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Search icon - positioned on the right for RTL */}
        <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Search input - RTL text with explicit padding */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir="rtl"
          style={{ paddingRight: '3rem', paddingLeft: '3.5rem' }}
          className="
            w-full
            h-12
            bg-white
            border border-gray-200
            rounded-xl
            text-base
            text-gray-900
            placeholder:text-gray-400
            outline-none
            transition-all
            duration-200
            shadow-sm
            hover:shadow-md
            hover:border-gray-300
            focus:shadow-md
            focus:border-gray-400
            focus:ring-2
            focus:ring-gray-100
          "
        />

        {/* Clear button or keyboard shortcut hint - positioned on the left */}
        <div className="absolute left-4 top-0 bottom-0 flex items-center">
          {value ? (
            <button
              onClick={handleClear}
              type="button"
              className="
                p-1.5
                rounded-md
                text-gray-400
                hover:text-gray-600
                hover:bg-gray-100
                transition-all
                duration-150
              "
              aria-label="پاک کردن"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              {isMac ? (
                <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-medium">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </kbd>
              ) : (
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-medium text-[10px]">
                  Ctrl+K
                </kbd>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
