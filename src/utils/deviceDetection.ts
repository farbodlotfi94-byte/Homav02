/**
 * Device Detection Utilities
 * Detects mobile vs desktop devices for conditional functionality
 */

/**
 * Detects if the current device is a mobile device
 * @returns true if mobile (iOS or Android), false if desktop
 */
export const isMobileDevice = (): boolean => {
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Mobile user agent patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUA = mobileRegex.test(userAgent.toLowerCase());

  // Check for touch support (additional indicator)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check screen width (mobile typically < 768px)
  const isSmallScreen = window.innerWidth < 768;

  // Device is mobile if it matches UA pattern OR (has touch AND small screen)
  return isMobileUA || (hasTouch && isSmallScreen);
};

/**
 * Checks if Web Share API is available
 * @returns true if navigator.share is supported
 */
export const isWebShareSupported = (): boolean => {
  return typeof navigator.share !== 'undefined';
};

/**
 * Checks if Web Share API can share files
 * @returns true if navigator.canShare is available and supports files
 */
export const canShareFiles = (): boolean => {
  if (typeof navigator.canShare === 'undefined') {
    return false;
  }

  // Create a dummy file to test if files can be shared
  try {
    const dummyFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    return navigator.canShare({ files: [dummyFile] });
  } catch (error) {
    return false;
  }
};
