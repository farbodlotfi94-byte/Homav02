/**
 * Hook to determine if animations should be enabled
 * Disables animations on mobile devices and respects prefers-reduced-motion
 */

import { useEffect, useState } from 'react';
import { isMobileDevice } from '../utils/deviceDetection';

export const useAnimationPreference = () => {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check if device is mobile
    const isMobile = isMobileDevice();

    // Disable animations if mobile OR user prefers reduced motion
    setShouldAnimate(!isMobile && !prefersReducedMotion);
  }, []);

  return shouldAnimate;
};
