/**
 * Types برای پنل فروشنده HOMA
 */

export interface Seller {
  id: string;
  name: string;
  shopName: string;
  instagram?: string;
  whatsapp?: string;
  email: string;
  logo?: string;
  createdAt: string;
}

export interface ProductSpec {
  key: string;   // مثلاً: "رنگ"
  value: string; // مثلاً: "خاکستری روشن"
}

// Prompt Metadata for AI generation
export interface PromptMetadata {
  // Object Identity
  object_type?: string; // rug, sofa, table, art, bed, chair
  role_in_scene?: string; // main_rug, accent_rug, hero_sofa
  style?: string; // modern, scandinavian, boho, classic
  
  // Visual Attributes
  main_colors?: string[]; // ["beige", "warm grey", "cream"]
  pattern?: string; // plain, geometric, oriental, striped
  material?: string; // wool, cotton, wood, metal
  finish_texture?: string; // matte, glossy, soft, coarse
  
  // Size & Shape
  width?: number; // cm
  length?: number; // cm
  height?: number; // cm (for furniture)
  shape?: string; // rectangular, round, square, runner
  relative_scale_hint?: string; // large_rug_for_living_room, small_accent_rug
  
  // Placement Hints
  room_type?: string; // living_room, bedroom, hallway
  typical_placement?: string; // centered_under_main_seating_area, placed_near_bed
  composition_notes?: string; // 2-3 lines
  
  // Brand Tone
  brand_name?: string;
  brand_tone_keywords?: string[]; // ["warm", "cozy", "minimal"]
}

export interface SellerProduct {
  id: string;
  sellerId: string;
  name: string;
  nameEn?: string; // English name
  category?: string; // فرش، مبل، میز، etc.
  description?: string; // توضیحات کوتاه
  fullDescription?: string; // توضیحات کامل
  specs?: ProductSpec[]; // مشخصات محصول به صورت Key-Value (اختیاری)
  price: number;
  currency: 'IRR' | 'USD';
  stock?: number; // موجودی
  sku?: string; // کد محصول
  status?: 'active' | 'inactive'; // وضعیت
  images: string[];
  tryLink: string; // Generated HOMA try link
  promptMetadata?: PromptMetadata; // Metadata for AI prompt generation
  views?: number; // تعداد بازدید
  createdAt: string;
  updatedAt: string;
}

export interface ProductAnalytics {
  productId: string;
  views: number;
  uploads: number;
  purchases: number;
  ctr: number; // Click-through rate
  sources: {
    story: number;
    bio: number;
    dm: number;
    other: number;
  };
  dailyStats: Array<{
    date: string;
    views: number;
    uploads: number;
    purchases: number;
  }>;
}

export interface DashboardStats {
  totalProducts: number;
  totalViews: number;
  totalUploads: number;
  totalPurchases: number;
  avgCTR: number;
  topProduct?: {
    id: string;
    name: string;
    views: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'view' | 'upload' | 'purchase';
    productName: string;
    timestamp: string;
  }>;
}