import type { Product, UTMParams, EntryContext } from "../types/product";
import rugImage1 from "figma:asset/ecdea148753a026b4eb9077903a5700290607184.png";
import rugImage2 from "figma:asset/13e86ead7883d0975051ca1d917031988ea7cdd0.png";

// Mock product database
const mockProducts: Record<string, Product> = {
  "prod_rug_21902": {
    id: "prod_rug_21902",
    name: "قالی دستباف قشقایی شیراز",
    nameEn: "Qashqai Handwoven Rug Shiraz",
    thumbnail: rugImage1,
    price: 45000000,
    currency: "تومان",
    seller: {
      name: "گالری فرش ایرانی",
      verified: true
    },
    brand: "قشقایی اصیل",
    category: "rug",
    variants: {
      colors: [
        { name: "قرمز سنتی", hex: "#8B2635", available: true },
      ],
      sizes: [
        { name: "۲×۳ متر", available: true },
        { name: "۳×۴ متر", available: true }
      ]
    },
    selectedVariant: {
      color: "قرمز سنتی",
      size: "۲×۳ متر"
    },
    status: "active",
    images: [
      rugImage1,
      rugImage2
    ],
    description: "قالی دستباف اصیل قشقایی از شیراز با رنگ‌های طبیعی و نقوش سنتی. هنر دست‌بافت اصیل ایرانی با کیفیت بی‌نظیر.",
    features: [
      "رنگ‌های طبیعی گیاهی",
      "بافت دست با پشم طبیعی",
      "نقش‌های سنتی قشقایی",
      "شناسه محصول: 21902",
      "ساخت شیراز - ایران"
    ]
  },
  "prod_chair_01": {
    id: "prod_chair_01",
    name: "صندلی راحتی مدرن",
    nameEn: "Modern Comfort Chair",
    thumbnail: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400",
    price: 2500000,
    currency: "تومان",
    seller: {
      name: "فروشگاه مبل آسمان",
      verified: true
    },
    brand: "Nordic Home",
    category: "furniture",
    variants: {
      colors: [
        { name: "خاکستری", hex: "#808080", available: true },
        { name: "آبی", hex: "#4A90E2", available: true },
        { name: "کرم", hex: "#F5F5DC", available: false }
      ],
      sizes: [
        { name: "تک‌نفره", available: true },
        { name: "دونفره", available: true }
      ]
    },
    selectedVariant: {
      color: "خاکستری",
      size: "تک‌نفره"
    },
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
    ],
    description: "صندلی راحتی با طراحی مدرن و پارچه با کیفیت بالا. مناسب برای اتاق نشیمن و فضاهای مدرن.",
    features: [
      "پارچه ضد لک و قابل شستشو",
      "فوم با کیفیت بالا",
      "پایه فلزی مقاوم",
      "گارانتی ۲ ساله"
    ]
  },
  "prod_lamp_02": {
    id: "prod_lamp_02",
    name: "چراغ ایستاده مینیمال",
    thumbnail: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    priceRange: {
      min: 800000,
      max: 1200000
    },
    currency: "تومان",
    seller: {
      name: "نورسازه",
      verified: false
    },
    category: "lighting",
    variants: {
      colors: [
        { name: "مشکی", hex: "#000000", available: true },
        { name: "سفید", hex: "#FFFFFF", available: true },
        { name: "طلایی", hex: "#FFD700", available: true }
      ]
    },
    selectedVariant: {
      color: "مشکی"
    },
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"
    ],
    description: "چراغ ایستاده با طراحی مینیمال و نور قابل تنظیم.",
    features: [
      "نور LED کم‌مصرف",
      "قابلیت تنظیم شدت نور",
      "طراحی مدرن",
      "مصرف برق کم"
    ]
  }
};

const suggestedProductsMap: Record<string, Product[]> = {
  "rug": [
    mockProducts["prod_rug_21902"],
    mockProducts["prod_chair_01"]
  ],
  "furniture": [
    mockProducts["prod_chair_01"],
    mockProducts["prod_lamp_02"]
  ],
  "lighting": [
    mockProducts["prod_lamp_02"]
  ]
};

/**
 * Parse URL parameters to extract product ID and UTM data
 */
export function parseEntryParams(url: string): EntryContext | null {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const productId = params.get('productId');
    if (!productId) return null;

    const utm: UTMParams = {
      source: params.get('utm_source') || 'direct',
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      content: params.get('utm_content') || undefined,
      term: params.get('utm_term') || undefined
    };

    return {
      productId,
      utm,
      seller: params.get('seller') || undefined,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error parsing entry params:', error);
    return null;
  }
}

/**
 * Fetch product metadata by ID
 * In production, this would be an API call
 */
export async function fetchProduct(productId: string): Promise<Product | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockProducts[productId] || null;
}

/**
 * Get suggested products based on category or product ID
 */
export function getSuggestedProducts(category: string, limit: number = 3): Product[] {
  const suggestions = suggestedProductsMap[category] || Object.values(mockProducts);
  return suggestions.slice(0, limit);
}

/**
 * Validate product availability
 */
export function validateProduct(product: Product): {
  isValid: boolean;
  reason?: "not_found" | "inactive" | "out_of_stock";
} {
  if (!product) {
    return { isValid: false, reason: "not_found" };
  }
  
  if (product.status === "inactive") {
    return { isValid: false, reason: "inactive" };
  }
  
  if (product.status === "out_of_stock") {
    return { isValid: false, reason: "out_of_stock" };
  }
  
  return { isValid: true };
}