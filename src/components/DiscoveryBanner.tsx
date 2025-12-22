import { useState } from "react";
import { motion } from "motion/react";
import { Package } from "lucide-react";
import { useAnimationPreference } from "../hooks/useAnimationPreference";

interface DiscoveryBannerProps {
  variant: "shop" | "product";
  shopName?: string;
  onDiscoveryStart: () => void;
}

/**
 * Discovery Flow entry banner with background image
 *
 * Features a beautiful room background with text overlay
 */
export function DiscoveryBanner({
  variant,
  shopName,
  onDiscoveryStart,
}: DiscoveryBannerProps) {
  const shouldAnimate = useAnimationPreference();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isShopVariant = variant === "shop";

  // Text content based on variant
  const content = isShopVariant
    ? {
        title: "عکس اتاقت رو آپلود کن!",
        subtitle: "ما بهترین محصولات رو پیشنهاد میدیم",
        buttonText: "شروع کن!",
      }
    : {
        title: "عکس اتاقت رو آپلود کن!",
        subtitle: shopName
          ? `بهترین محصولات ${shopName} رو پیدا کن`
          : "ما بهترین محصولات رو پیشنهاد میدیم",
        buttonText: "شروع کن!",
      };

  // Dark navy blue elegant living room background image (local)
  const backgroundImage = "/images/discovery-banner.jpg";

  const bannerContent = (
    <div
      className="relative overflow-hidden cursor-pointer group rounded-2xl"
      onClick={onDiscoveryStart}
      dir="rtl"
    >
      {/* Background Container */}
      <div className="relative w-full" style={{ height: '240px', backgroundColor: '#1a2634' }}>
        {/* Fallback gradient background (shows while image loads or on error) */}
        <div
          className={`
            absolute inset-0
            bg-gradient-to-l from-blue-900 via-blue-800 to-teal-700
            transition-opacity duration-500
            ${imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'}
          `}
        />

        {/* Background Image - blurred for text readability */}
        {!imageError && (
          <img
            src={backgroundImage}
            alt="اتاق نشیمن زیبا"
            className={`
              absolute inset-0 w-full h-full object-cover
              transition-all duration-700
              group-hover:scale-105
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ filter: 'blur(2px)' }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Gradient Overlay - subtle for dark images */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-end p-6 sm:p-8">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3 drop-shadow-lg">
            {content.title}
          </h2>

          {/* Subtitle - Golden/amber color, bold */}
          <p
            className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 drop-shadow-md font-bold"
            style={{ color: '#E5B94E' }}
          >
            {content.subtitle}
          </p>

          {/* CTA Button - Golden/amber, compact pill */}
          <button
            className="
              inline-flex items-center gap-2
              w-fit
              px-6 py-3
              rounded-full
              font-bold
              text-base
              transition-all duration-300
              shadow-lg hover:shadow-xl
              hover:scale-105
            "
            style={{ backgroundColor: '#D4A847', color: '#2d2d2d', width: 'fit-content' }}
            onClick={(e) => {
              e.stopPropagation();
              onDiscoveryStart();
            }}
          >
            <Package className="w-5 h-5" />
            <span>{content.buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (shouldAnimate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {bannerContent}
      </motion.div>
    );
  }

  return bannerContent;
}
