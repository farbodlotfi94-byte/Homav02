import { cn } from "../../lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Container width variant:
   * - `narrow`: max-w-lg (512px) - for focused content like forms
   * - `default`: scales from max-w-lg to max-w-4xl - for main content
   * - `wide`: scales from max-w-lg to max-w-6xl - for grids and dashboards
   */
  variant?: "narrow" | "default" | "wide";
  /**
   * Whether to include responsive horizontal padding
   * @default true
   */
  withPadding?: boolean;
  /**
   * HTML element to render
   * @default "div"
   */
  as?: "div" | "main" | "section" | "article";
}

const containerVariants = {
  narrow: "max-w-lg",
  default: "max-w-lg md:max-w-2xl lg:max-w-4xl",
  wide: "max-w-lg md:max-w-3xl lg:max-w-6xl xl:max-w-7xl",
};

/**
 * ResponsiveContainer - A wrapper component for consistent responsive layouts
 *
 * Uses the same responsive patterns as the seller dashboard:
 * - Mobile: max-w-lg (512px)
 * - Tablet (md): scales up based on variant
 * - Desktop (lg+): maximum width with centered content
 *
 * @example
 * // Default responsive container
 * <ResponsiveContainer>
 *   <Content />
 * </ResponsiveContainer>
 *
 * @example
 * // Wide container for product grids
 * <ResponsiveContainer variant="wide">
 *   <ProductGrid />
 * </ResponsiveContainer>
 *
 * @example
 * // Narrow container without padding
 * <ResponsiveContainer variant="narrow" withPadding={false}>
 *   <Form />
 * </ResponsiveContainer>
 */
export function ResponsiveContainer({
  children,
  className,
  variant = "default",
  withPadding = true,
  as: Component = "div",
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full",
        containerVariants[variant],
        withPadding && "px-4 sm:px-6 md:px-8",
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Pre-configured container for page content
 */
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ResponsiveContainer
      variant="default"
      as="main"
      className={cn("py-6 md:py-8 lg:py-10", className)}
    >
      {children}
    </ResponsiveContainer>
  );
}

/**
 * Pre-configured container for product grids
 */
export function GridContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ResponsiveContainer variant="wide" className={className}>
      {children}
    </ResponsiveContainer>
  );
}
