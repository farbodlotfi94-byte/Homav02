import React, { useState, useEffect, useRef } from 'react';
import { sellerApiService } from '../../../services/sellerApiService';

interface SellerProductImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  imageUrl: string | null;
  fallbackIcon?: React.ReactNode;
}

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

/**
 * Seller Product Image Component
 * Handles image loading with seller authentication
 * Converts image URLs to blob URLs with proper auth headers
 */
export function SellerProductImage({
  imageUrl,
  fallbackIcon,
  alt = 'Product image',
  className = '',
  style,
  ...rest
}: SellerProductImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use ref to track the current blob URL for proper cleanup
  const blobUrlRef = useRef<string | null>(null);

  // Load image blob URL when imageUrl changes
  useEffect(() => {
    let isMounted = true;

    // Revoke previous blob URL before loading new one
    if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
      console.log('[SellerProductImage] Revoking old blob URL');
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    // Reset state immediately when imageUrl changes
    setBlobUrl(null);
    setIsLoading(true);
    setHasError(false);

    const loadImage = async () => {
      if (!imageUrl) {
        console.log('[SellerProductImage] No image URL provided');
        if (isMounted) {
          setIsLoading(false);
          setHasError(true);
        }
        return;
      }

      try {
        console.log('[SellerProductImage] Loading image from:', imageUrl);
        const url = await sellerApiService.getImageBlobUrl(imageUrl);

        if (isMounted) {
          if (url) {
            console.log('[SellerProductImage] Image loaded successfully');
            blobUrlRef.current = url;
            setBlobUrl(url);
            setHasError(false);
          } else {
            console.error('[SellerProductImage] Failed to load image blob');
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[SellerProductImage] Error loading image:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup blob URL on unmount or when imageUrl changes
    return () => {
      isMounted = false;
      // Note: Don't revoke here - the next effect run will handle it
      // This prevents race conditions where we revoke a URL still in use
    };
  }, [imageUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
        console.log('[SellerProductImage] Unmount - Revoking blob URL');
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  // Error state
  if (hasError || !blobUrl) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className || ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          {fallbackIcon ? (
            fallbackIcon
          ) : (
            <img src={ERROR_IMG_SRC} alt={alt} {...rest} data-original-url={imageUrl} />
          )}
        </div>
      </div>
    );
  }

  // Image loaded successfully
  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
      style={style}
      {...rest}
    />
  );
}
