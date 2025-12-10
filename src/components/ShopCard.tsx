import { motion } from "motion/react";
import { Package, Globe, ExternalLink } from "lucide-react";
import type { Shop } from "../types/shop";

interface ShopCardProps {
  shop: Shop;
  onClick: (shop: Shop) => void;
  shouldAnimate?: boolean;
}

/**
 * Format website URL for display (remove protocol and trailing slash)
 */
function formatWebsiteUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

/**
 * Shop card component with horizontal row layout.
 * Features:
 * - Circular avatar with shop initial (future: logo support)
 * - Horizontal layout: Avatar | Name+Website | Badge
 * - RTL support with proper alignment
 * - Hover effects with shadow increase
 */
export function ShopCard({ shop, onClick, shouldAnimate = true }: ShopCardProps) {
  // Get first letter of shop name for placeholder avatar
  const shopInitial = shop.shop_name.charAt(0).toUpperCase();

  // Generate a consistent color based on shop id
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-600" },
    { bg: "bg-emerald-100", text: "text-emerald-600" },
    { bg: "bg-purple-100", text: "text-purple-600" },
    { bg: "bg-amber-100", text: "text-amber-600" },
    { bg: "bg-rose-100", text: "text-rose-600" },
    { bg: "bg-cyan-100", text: "text-cyan-600" },
    { bg: "bg-indigo-100", text: "text-indigo-600" },
    { bg: "bg-teal-100", text: "text-teal-600" },
  ];
  const color = colors[shop.id % colors.length];

  const cardContent = (
    <div
      className="
        bg-white
        rounded-xl
        border border-gray-200
        p-4
        cursor-pointer
        transition-all
        duration-200
        shadow-sm
        hover:shadow-lg
        hover:border-gray-300
        group
      "
      dir="rtl"
      onClick={() => onClick(shop)}
    >
      {/* Horizontal row layout */}
      <div className="flex items-center gap-3">
        {/* Avatar - Circle with initial (RTL: appears on right) */}
        <div
          className={`
            w-12 h-12
            flex-shrink-0
            rounded-full
            flex items-center justify-center
            text-lg font-bold
            ${color.bg} ${color.text}
            transition-transform duration-200
            group-hover:scale-105
          `}
        >
          {shop.logo_url ? (
            <img
              src={shop.logo_url}
              alt={shop.shop_name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            shopInitial
          )}
        </div>

        {/* Store info - Name and Website (middle, grows to push badge left) */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {shop.shop_name}
          </h3>
          {shop.website && (
            <a
              href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="
                inline-flex items-center gap-1.5
                text-sm text-gray-400
                px-2.5 py-1 -mx-2
                rounded-lg
                border border-transparent
                cursor-pointer
                transition-all duration-200
                hover:text-blue-600
                hover:bg-blue-50
                hover:border-blue-200
                hover:shadow-sm
                hover:scale-[1.02]
                active:scale-[0.98]
                active:bg-blue-100
                group/link
              "
              dir="ltr"
            >
              <Globe className="w-3.5 h-3.5 flex-shrink-0 transition-colors group-hover/link:text-blue-500" />
              <span className="truncate max-w-[150px] group-hover/link:underline underline-offset-2">{formatWebsiteUrl(shop.website)}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
            </a>
          )}
        </div>

        {/* Product count badge (RTL: appears on left) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full flex-shrink-0">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">
            {shop.product_count}
          </span>
        </div>
      </div>
    </div>
  );

  if (shouldAnimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

/**
 * Skeleton loader for shop cards - matches horizontal layout
 */
export function ShopCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />

        {/* Text skeleton - just shop name */}
        <div className="flex-1 min-w-0">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
        </div>

        {/* Badge skeleton */}
        <div className="w-12 h-6 rounded-full bg-gray-100 flex-shrink-0" />
      </div>
    </div>
  );
}
