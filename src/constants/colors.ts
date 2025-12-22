/**
 * Color Tokens - Centralized color definitions
 *
 * This file documents all color tokens used in the application.
 * Use CSS variables (var(--token-name)) in components for theming support.
 *
 * IMPORTANT: When adding new colors, define them in globals.css first,
 * then document them here. Don't use hardcoded hex values in components!
 *
 * Usage:
 * - For CSS/Tailwind: Use CSS variables directly, e.g., text-[var(--accent)]
 * - For TypeScript: Import from this file, e.g., COLORS.accent
 */

// =============================================================================
// BRAND COLORS
// =============================================================================

/**
 * HOMA Brand Colors
 * Primary: Red (#E31E24) - Used for main CTAs and branding
 * Secondary: Beige/Cream (#F5E6D3) - Used for subtle backgrounds
 */
export const BRAND_COLORS = {
  /** HOMA Red - Primary brand color */
  accent: 'var(--accent)',
  accentRaw: '#E31E24',

  /** HOMA Beige/Cream - Secondary brand color */
  accentLight: 'var(--accent-light)',
  accentLightRaw: '#F5E6D3',

  /** Foreground on accent */
  accentForeground: 'var(--accent-foreground)',
  accentForegroundRaw: '#ffffff',
} as const;

// =============================================================================
// SEMANTIC COLORS (Use CSS variables for theme support)
// =============================================================================

export const SEMANTIC_COLORS = {
  // Backgrounds
  background: 'var(--background)',
  card: 'var(--card)',
  popover: 'var(--popover)',
  sidebar: 'var(--sidebar)',

  // Foregrounds
  foreground: 'var(--foreground)',
  cardForeground: 'var(--card-foreground)',
  popoverForeground: 'var(--popover-foreground)',
  sidebarForeground: 'var(--sidebar-foreground)',

  // Interactive
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',

  // States
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  destructive: 'var(--destructive)',
  destructiveForeground: 'var(--destructive-foreground)',

  // Borders & Inputs
  border: 'var(--border)',
  input: 'var(--input)',
  inputBackground: 'var(--input-background)',
  ring: 'var(--ring)',
} as const;

// =============================================================================
// FEEDBACK SURVEY COLORS
// =============================================================================

export const FEEDBACK_COLORS = {
  good: 'var(--feedback-good)',
  goodRaw: '#00312D',

  neutral: 'var(--feedback-neutral)',
  neutralRaw: '#FC6F20',

  bad: 'var(--feedback-bad)',
  badRaw: '#5D0D02',

  background: 'var(--feedback-bg)',
  backgroundRaw: '#FEE8D0',
} as const;

// =============================================================================
// CHART COLORS
// =============================================================================

export const CHART_COLORS = {
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
} as const;

// =============================================================================
// SIDEBAR COLORS
// =============================================================================

export const SIDEBAR_COLORS = {
  background: 'var(--sidebar)',
  foreground: 'var(--sidebar-foreground)',
  primary: 'var(--sidebar-primary)',
  primaryForeground: 'var(--sidebar-primary-foreground)',
  accent: 'var(--sidebar-accent)',
  accentForeground: 'var(--sidebar-accent-foreground)',
  border: 'var(--sidebar-border)',
  ring: 'var(--sidebar-ring)',
} as const;

// =============================================================================
// LEGACY/HARDCODED COLORS (TO BE MIGRATED)
// =============================================================================

/**
 * Colors that are currently hardcoded in components but should use tokens.
 * Use these as a reference when refactoring components.
 */
export const HARDCODED_COLORS = {
  // OTPLogin gradient - should be refactored to use tokens
  orangeGradient: {
    from: '#FFB020',
    via: '#FFA000',
    to: '#E68A00',
    description: 'Orange button gradient used in OTPLogin',
  },

  // VIP gold in OTPLogin
  vipGold: '#D4AF37',

  // Discovery banner colors
  discoveryBg: '#1a2634',
  discoveryAccent: '#E5B94E',
  discoveryButton: '#D4A847',

  // Discovery upload dragging state
  discoveryDragBorder: '#D97706',
  discoveryDefaultBorder: '#C9A962',
} as const;

// =============================================================================
// SPECIAL COLORS
// =============================================================================

export const SPECIAL_COLORS = {
  // Old Flax theme (used in some areas)
  oldFlax: 'var(--old-flax)',
  oldFlaxLight: 'var(--old-flax-light)',
  oldFlaxBg: 'var(--old-flax-bg)',

  // Jet Black
  jetBlack: 'var(--jet-black)',
} as const;

// =============================================================================
// SELLER THEME COLORS
// =============================================================================

export const SELLER_THEME_COLORS = {
  primary: 'var(--seller-primary)',
  primaryRaw: '#EEFF41',

  primaryHover: 'var(--seller-primary-hover)',
  primaryHoverRaw: '#D9E838',

  primaryDark: 'var(--seller-primary-dark)',
  primaryDarkRaw: '#C4D02F',
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const COLORS = {
  brand: BRAND_COLORS,
  semantic: SEMANTIC_COLORS,
  feedback: FEEDBACK_COLORS,
  chart: CHART_COLORS,
  sidebar: SIDEBAR_COLORS,
  seller: SELLER_THEME_COLORS,
  special: SPECIAL_COLORS,

  // Direct access to most common colors
  accent: BRAND_COLORS.accent,
  accentLight: BRAND_COLORS.accentLight,
  primary: SEMANTIC_COLORS.primary,
  background: SEMANTIC_COLORS.background,
  foreground: SEMANTIC_COLORS.foreground,
} as const;

// =============================================================================
// RADIUS TOKENS
// =============================================================================

export const RADIUS = {
  default: 'var(--radius)',
  defaultRaw: '26px',

  button: 'var(--radius-button)',
  buttonRaw: '100px',

  card: 'var(--radius-card)',
  cardRaw: '20px',
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    vazirmatn: 'var(--font-family-vazirmatn)',
    sfPro: 'var(--font-family-sf-pro)',
  },
  fontSize: {
    h1: 'var(--text-h1-size)',
    h2: 'var(--text-h2-size)',
    h3: 'var(--text-h3-size)',
    h4: 'var(--text-h4-size)',
    p: 'var(--text-p-size)',
    label: 'var(--text-label-size)',
    caption: 'var(--text-caption-size)',
    default: 'var(--font-size)',
  },
  fontWeight: {
    bold: 'var(--font-weight-bold)',
    semibold: 'var(--font-weight-semibold)',
    regular: 'var(--font-weight-regular)',
  },
} as const;

// =============================================================================
// SPACING TOKENS
// =============================================================================

export const SPACING = {
  container: 'var(--spacing-container)',
  section: 'var(--spacing-section)',
  element: 'var(--spacing-element)',
} as const;

export default COLORS;
