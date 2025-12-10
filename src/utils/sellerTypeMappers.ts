/**
 * Type Mapper Utilities for Seller Dashboard
 *
 * Converts between backend API types and frontend component types
 * Handles field name differences, data structure transforms, and display value mapping
 */

import type {
  ProductDetailsResponse,
  ProductListItem,
  ShopSettingsResponse,
  DashboardResponse,
  ProductAnalyticsItem,
} from '../types/seller-api';
import type {
  Seller,
  SellerProduct,
  ProductSpec,
  DashboardStats,
} from '../integrations/seller-dashboard/types/seller';

/**
 * Map backend ShopSettings to frontend Seller type
 */
export const mapSettingsToSeller = (settings: ShopSettingsResponse): Seller => {
  return {
    id: '', // Not provided by settings endpoint
    name: settings.username,
    shopName: settings.shop_name,
    phoneNumber: settings.phone_number, // Store +98 format
    shopLink: settings.shop_link, // Auto-generated base URL (e.g., https://myhoma.ir/carpet-market/)
    shopWebsiteLink: settings.shop_website_link || '', // Editable link with fallback
    logo: undefined, // Not in backend response
    createdAt: settings.registered_since_display, // Use display format (Persian date)
  };
};

/**
 * Map extra_details object to ProductSpec array
 */
export const mapExtraDetailsToSpecs = (extraDetails: Record<string, string> | undefined): ProductSpec[] => {
  if (!extraDetails || Object.keys(extraDetails).length === 0) {
    return [];
  }

  return Object.entries(extraDetails).map(([key, value]) => ({
    key,
    value,
  }));
};

/**
 * Map ProductSpec array back to extra_details object
 */
export const mapSpecsToExtraDetails = (specs: ProductSpec[] | undefined): Record<string, string> => {
  if (!specs || specs.length === 0) {
    return {};
  }

  return specs.reduce((acc, spec) => {
    acc[spec.key] = spec.value;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Map backend ProductDetailsResponse to frontend SellerProduct
 * @param product - Backend product response
 * @param shopLink - Optional shop base URL (e.g., https://myhoma.ir/carpet-market/)
 */
export const mapBackendProductToSeller = (product: ProductDetailsResponse, shopLink?: string): SellerProduct => {
  // Debug log to trace API response structure
  console.log('[mapBackendProductToSeller] Raw API response:', {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    image_url: product.image_url,
  });

  // Construct tryLink from shopLink + unique_link (always use new format)
  // Format: https://myhoma.ir/{shop_slug}/product/{unique_link}
  const tryLink = product.unique_link && shopLink ? `${shopLink}product/${product.unique_link}` : '';

  // Handle image_url - filter out null, undefined, and empty strings
  const imageUrl = product.image_url && product.image_url.trim() !== '' ? product.image_url : null;
  const images = imageUrl ? [imageUrl] : [];

  return {
    id: product.id?.toString() || '',
    sellerId: '', // Not provided by backend
    name: product.name || '', // Ensure string, fallback to empty
    description: product.description || '', // Ensure string, fallback to empty
    category: product.category?.toString() || '2', // Use raw integer value as string, default to rug category
    price: product.price || 0,
    currency: 'IRR',
    images: images,
    tryLink: tryLink, // Shareable customer link
    uniqueLink: product.unique_link || '', // UUID for fetching full details
    specs: mapExtraDetailsToSpecs(product.extra_details),
    availableSizes: product.available_sizes || [], // Rug sizes (only for RUG_AND_CARPET category)
    createdAt: product.created_at || '',
    updatedAt: product.updated_at || '',
    // Default to 'active' if is_active is undefined (backend might not return it in update response)
    status: product.is_active === false ? 'inactive' : 'active',
  };
};

/**
 * Map backend ProductListItem to frontend SellerProduct (simplified version)
 */
export const mapProductListItemToSeller = (item: ProductListItem): Partial<SellerProduct> => {
  return {
    name: item.name,
    price: item.price,
    images: [item.image_url],
    views: item.total_views,
    currency: 'IRR',
  };
};

/**
 * Map backend DashboardResponse to frontend DashboardStats
 */
export const mapDashboardResponse = (
  dashboard: DashboardResponse,
  totalProducts: number
): DashboardStats => {
  return {
    totalProducts,
    totalViews: dashboard.visits.this_month,
    totalUploads: dashboard.ai_generations.this_month,
    totalPurchases: 0, // Not provided by backend
    avgCTR: 0, // Calculate separately if needed
    topProduct: undefined, // Calculate separately from products list
    recentActivity: [], // Not provided by backend (consider removing from UI)
  };
};

/**
 * Map last_7_days data to chart-friendly format
 */
export const mapChartData = (last7Days: DashboardResponse['last_7_days']) => {
  return last7Days.map((day) => ({
    day: day.day, // Persian day name
    date: day.date, // Persian date
    visits: day.visits,
    uploads: day.ai_generations,
  }));
};

/**
 * Map ProductAnalyticsItem to include engagement calculations
 */
export const enhanceAnalyticsItem = (item: ProductAnalyticsItem) => {
  return {
    ...item,
    engagement_rate: item.engagement_rate, // Already calculated by backend
    viewsTotal: item.views.total,
    aiTotal: item.ai_generations.total,
    viewsToday: item.views.today,
    aiToday: item.ai_generations.today,
  };
};

/**
 * Format price to display with thousand separators (Persian format)
 */
export const formatPriceIRR = (price: number): string => {
  return new Intl.NumberFormat('fa-IR').format(price);
};

/**
 * Format price with currency suffix
 */
export const formatPriceWithCurrency = (price: number): string => {
  return `${formatPriceIRR(price)} تومان`;
};

/**
 * Parse Persian digits to English digits (for form inputs)
 */
export const parsePersianNumber = (str: string): number => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let result = str;
  persianDigits.forEach((persian, i) => {
    result = result.replace(new RegExp(persian, 'g'), i.toString());
  });
  arabicDigits.forEach((arabic, i) => {
    result = result.replace(new RegExp(arabic, 'g'), i.toString());
  });

  return parseInt(result.replace(/,/g, ''), 10) || 0;
};

/**
 * Format Persian date to display format
 * Input: "1403/09/15"
 * Output: "15 آذر 1403"
 */
export const formatPersianDate = (dateStr: string): string => {
  const persianMonths = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];

  try {
    const [year, month, day] = dateStr.split('/');
    const monthIndex = parseInt(month, 10) - 1;
    return `${day} ${persianMonths[monthIndex]} ${year}`;
  } catch (error) {
    return dateStr; // Return original if parsing fails
  }
};

/**
 * Create FormData object for product creation/update
 */
export const createProductFormData = (
  productData: {
    name: string;
    description: string;
    category: string;
    price: number;
    link?: string | null;
    extra_details?: Record<string, string>;
    available_sizes?: string[];
    is_active?: boolean;
  },
  productImage?: File | null
): FormData => {
  const formData = new FormData();

  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('category', productData.category);
  formData.append('price', productData.price.toString());

  if (productImage) {
    formData.append('image', productImage);
  }

  if (productData.link) {
    formData.append('link', productData.link);
  }

  if (productData.extra_details && Object.keys(productData.extra_details).length > 0) {
    formData.append('extra_details', JSON.stringify(productData.extra_details));
  }

  // Add available_sizes for rug products (array sent as JSON)
  if (productData.available_sizes && productData.available_sizes.length > 0) {
    formData.append('available_sizes', JSON.stringify(productData.available_sizes));
  }

  // Preserve is_active status (default to true for new products, preserve existing for updates)
  if (productData.is_active !== undefined) {
    formData.append('is_active', productData.is_active.toString());
  } else {
    formData.append('is_active', 'true');
  }

  return formData;
};

/**
 * Validate product image file
 */
export const validateProductImage = (file: File): { valid: boolean; error?: string } => {
  // Max size: 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد',
    };
  }

  // Valid types
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'فرمت تصویر باید JPG، PNG یا WebP باشد',
    };
  }

  return { valid: true };
};
