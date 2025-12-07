import * as React from "react";

// Tailwind CSS default breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

const MOBILE_BREAKPOINT = BREAKPOINTS.md; // 768px

export type Breakpoint = "mobile" | "tablet" | "desktop";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/**
 * Hook to detect current breakpoint for responsive behavior
 *
 * Breakpoint ranges:
 * - mobile: < 768px (md breakpoint)
 * - tablet: 768px - 1023px
 * - desktop: >= 1024px (lg breakpoint)
 *
 * @example
 * const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();
 *
 * if (isDesktop) {
 *   // Show sidebar
 * }
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>("mobile");

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.md) {
        setBreakpoint("mobile");
      } else if (width < BREAKPOINTS.lg) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    // Initial check
    updateBreakpoint();

    // Listen for resize events
    window.addEventListener("resize", updateBreakpoint);

    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
    // Convenience helpers for common patterns
    isMobileOrTablet: breakpoint === "mobile" || breakpoint === "tablet",
    isTabletOrDesktop: breakpoint === "tablet" || breakpoint === "desktop",
  };
}

/**
 * Hook to check if viewport matches a specific breakpoint or above
 *
 * @example
 * const isLargeScreen = useMediaQuery("lg"); // >= 1024px
 * const isMediumUp = useMediaQuery("md"); // >= 768px
 */
export function useMediaQuery(breakpoint: keyof typeof BREAKPOINTS) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
    const mql = window.matchMedia(query);

    const onChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Initial check
    setMatches(mql.matches);

    // Listen for changes
    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return matches;
}
