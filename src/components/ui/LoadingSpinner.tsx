import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Color variant
   * @default "default"
   */
  variant?: "default" | "primary" | "white" | "muted";
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Screen reader text
   * @default "در حال بارگذاری..."
   */
  srText?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
  xl: "w-12 h-12 border-4",
};

const variantClasses = {
  default: "border-gray-300 border-t-gray-600",
  primary: "border-gray-200 border-t-[var(--accent)]",
  white: "border-white/30 border-t-white",
  muted: "border-gray-200 border-t-gray-400",
};

/**
 * Reusable Loading Spinner Component
 *
 * @example
 * // Basic usage
 * <LoadingSpinner />
 *
 * // Large primary spinner
 * <LoadingSpinner size="lg" variant="primary" />
 *
 * // White spinner on dark background
 * <LoadingSpinner variant="white" />
 */
export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
  srText = "در حال بارگذاری...",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={srText}
      className={cn(
        "rounded-full animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <span className="sr-only">{srText}</span>
    </div>
  );
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({
  message = "در حال بارگذاری...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <LoadingSpinner size="xl" variant="primary" />
      <p className="mt-4 text-gray-600 text-sm">{message}</p>
    </div>
  );
}
