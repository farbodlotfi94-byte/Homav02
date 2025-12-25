/**
 * MatchHighlightTags Component
 *
 * Displays colored tags for product match highlights (e.g., color, style, pattern).
 * Used in product recommendation cards to show why a product was matched.
 */

interface MatchHighlightTagsProps {
  /** Array of highlight strings in Persian (e.g., ["رنگ", "سبک"]) */
  highlights: string[];
  /** Size variant: 'sm' for compact, 'md' for standard */
  size?: 'sm' | 'md';
}

/**
 * Color mapping for known highlight types
 */
const HIGHLIGHT_COLORS: Record<string, string> = {
  // Color match
  'رنگ': 'bg-blue-100 text-blue-700 ring-blue-200',
  // Style match
  'سبک': 'bg-green-100 text-green-700 ring-green-200',
  // Pattern match
  'طرح': 'bg-purple-100 text-purple-700 ring-purple-200',
  // Material match
  'جنس': 'bg-amber-100 text-amber-700 ring-amber-200',
  // Size match
  'اندازه': 'bg-gray-100 text-gray-600 ring-gray-200',
  // Texture match
  'بافت': 'bg-rose-100 text-rose-700 ring-rose-200',
  // Shape match
  'شکل': 'bg-cyan-100 text-cyan-700 ring-cyan-200',
};

/**
 * Default color for unknown highlight types
 */
const DEFAULT_COLOR = 'bg-slate-100 text-slate-600 ring-slate-200';

/**
 * Get the color classes for a highlight tag
 */
function getHighlightColor(highlight: string): string {
  return HIGHLIGHT_COLORS[highlight] || DEFAULT_COLOR;
}

export function MatchHighlightTags({ highlights, size = 'sm' }: MatchHighlightTagsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5" dir="rtl">
      {highlights.map((highlight, index) => (
        <span
          key={`${highlight}-${index}`}
          className={`
            inline-flex items-center
            rounded-full
            ring-1 ring-inset
            font-medium
            ${sizeClasses}
            ${getHighlightColor(highlight)}
          `}
        >
          {highlight}
        </span>
      ))}
    </div>
  );
}

export default MatchHighlightTags;
