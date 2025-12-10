/**
 * Standard rug sizes for the Iranian/Persian market.
 *
 * This module defines industry-standard rug dimensions used across the platform.
 * Sizes are stored in centimeters and displayed in both متر (meters) and سانتی‌متر (centimeters).
 */

export interface RugSize {
  code: string;
  width_cm: number;
  length_cm: number;
  display: string;
}

/**
 * Standard rug sizes for the Iranian market.
 * Display format: "W×L متر (W×L سانتی‌متر)"
 */
export const STANDARD_RUG_SIZES: RugSize[] = [
  {
    code: "60x90",
    width_cm: 60,
    length_cm: 90,
    display: "۰.۶×۰.۹ متر (۶۰×۹۰ سانتی‌متر)"
  },
  {
    code: "80x120",
    width_cm: 80,
    length_cm: 120,
    display: "۰.۸×۱.۲ متر (۸۰×۱۲۰ سانتی‌متر)"
  },
  {
    code: "100x150",
    width_cm: 100,
    length_cm: 150,
    display: "۱×۱.۵ متر (۱۰۰×۱۵۰ سانتی‌متر)"
  },
  {
    code: "120x180",
    width_cm: 120,
    length_cm: 180,
    display: "۱.۲×۱.۸ متر (۱۲۰×۱۸۰ سانتی‌متر)"
  },
  {
    code: "150x225",
    width_cm: 150,
    length_cm: 225,
    display: "۱.۵×۲.۲۵ متر (۱۵۰×۲۲۵ سانتی‌متر)"
  },
  {
    code: "200x300",
    width_cm: 200,
    length_cm: 300,
    display: "۲×۳ متر (۲۰۰×۳۰۰ سانتی‌متر)"
  },
  {
    code: "250x350",
    width_cm: 250,
    length_cm: 350,
    display: "۲.۵×۳.۵ متر (۲۵۰×۳۵۰ سانتی‌متر)"
  },
  {
    code: "300x400",
    width_cm: 300,
    length_cm: 400,
    display: "۳×۴ متر (۳۰۰×۴۰۰ سانتی‌متر)"
  },
  // Runners (کناره)
  {
    code: "runner_80x250",
    width_cm: 80,
    length_cm: 250,
    display: "کناره ۰.۸×۲.۵ متر"
  },
  {
    code: "runner_80x300",
    width_cm: 80,
    length_cm: 300,
    display: "کناره ۰.۸×۳ متر"
  },
  // Round rugs (گرد)
  {
    code: "round_150",
    width_cm: 150,
    length_cm: 150,
    display: "گرد قطر ۱.۵ متر"
  },
  {
    code: "round_200",
    width_cm: 200,
    length_cm: 200,
    display: "گرد قطر ۲ متر"
  },
];

/**
 * Valid size codes for validation
 */
export const VALID_SIZE_CODES: string[] = STANDARD_RUG_SIZES.map(size => size.code);

/**
 * Rug category ID (must match backend ProductCategory.RUG_AND_CARPET)
 */
export const RUG_CATEGORY_ID = '2';

/**
 * Get size details by code
 */
export function getSizeByCode(code: string): RugSize | undefined {
  return STANDARD_RUG_SIZES.find(size => size.code === code);
}

/**
 * Get display string for a size code
 */
export function getSizeDisplay(code: string): string {
  const size = getSizeByCode(code);
  return size?.display || code;
}

/**
 * Check if a size code is valid
 */
export function isValidSizeCode(code: string): boolean {
  return VALID_SIZE_CODES.includes(code);
}
