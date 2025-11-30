import React, { useState, useEffect } from 'react';
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

  // Load image blob URL when imageUrl changes
  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

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

    // Cleanup blob URL on unmount
    return () => {
      isMounted = false;
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [imageUrl]);

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
