/**
 * Discovery Flow Types
 *
 * Types for the AI-powered room analysis and furniture recommendation feature
 */

export type RoomType = 'living' | 'bedroom' | 'dining' | 'reception';
export type StylePreference = 'minimal' | 'modern' | 'classic';

export interface RoomTypeOption {
  id: RoomType;
  label: string;
  icon: string; // Icon name from lucide-react
  previewImage?: string;
}

export interface StyleOption {
  id: StylePreference;
  label: string;
  previewImage?: string;
}

export interface DiscoveryRequest {
  image: File;
  roomType?: RoomType;
  style?: StylePreference;
  shopId?: string; // For shop-specific recommendations
  userNotes?: string; // Additional notes or preferences
}

export interface DiscoveryContext {
  shopId?: string;
  shopName?: string;
}

export interface ProductRecommendation {
  id: number;
  name: string;
  imageUrl: string;
  matchScore: number; // 0-100
  price?: number;
  currency?: string;
  shopId?: string;
  shopName: string;
  uniqueLink?: string;
  category?: string;
  categoryDisplay?: string;
}

export interface RoomAnalysis {
  detectedRoomType: string;
  detectedStyle: string;
  dominantColors: string[];
  suggestedStyles: string[];
  designNotes: string;
  searchQueries?: string[];
  recommendedProductTypes?: string[];
}

export interface GroupedRecommendations {
  itemType: string;
  itemTypeDisplay: string;
  products: ProductRecommendation[];
}

export interface DiscoveryResult {
  sessionId: string;
  originalImageUrl: string;
  processedImageUrl?: string;
  recommendations: ProductRecommendation[];
  groupedRecommendations?: GroupedRecommendations[];
  roomAnalysis?: RoomAnalysis;
}

export type ProcessingStep = 'upload' | 'analysis' | 'matching' | 'generation';

// Session status from backend API (/api/recommendations/sessions/)
// pending -> analyzing -> generating -> matching -> ready
export type SessionStatus = 'pending' | 'analyzing' | 'generating' | 'matching' | 'ready' | 'failed';

// Backend API response shapes for /api/recommendations/sessions/
export interface BackendMatchedProduct {
  id: number;
  name: string;
  category: string;
  category_display: string;
  image_url: string;
  match_score: number;
  shop_name: string;
  unique_link?: string;
  price?: number;
  currency?: string;
}

export interface BackendSessionItem {
  item_id: number;
  item_type: string; // e.g., "rug", "sofa", "table"
  description: {
    style?: string;
    color?: string;
    material?: string;
    [key: string]: any;
  };
  matched_products: BackendMatchedProduct[];
  tryon_status: 'pending' | 'processing' | 'completed' | 'failed';
  tryon_image_url: string | null;
}

export interface BackendSessionData {
  session_id: string;
  status: SessionStatus;
  created_at?: string;
  expires_at?: string;
  redesigned_image_url?: string; // The AI-generated redesigned room image
  items?: BackendSessionItem[]; // Items detected in the room with matched products
}

export interface BackendSessionResponse {
  success: boolean;
  message: string;
  data: BackendSessionData;
}

export interface BackendSessionCreateResponse {
  success: boolean;
  message: string;
  data: {
    session_id: string;
    status: SessionStatus;
  };
}

// Rate limit error info
export interface DiscoveryRateLimitError {
  limit: number;
  remaining: number;
  resetAt: string;
}

// Room type options with Persian labels
export const ROOM_TYPE_OPTIONS: RoomTypeOption[] = [
  { id: 'reception', label: 'پذیرایی', icon: 'Sofa' },
  { id: 'living', label: 'نشیمن', icon: 'Armchair' },
  { id: 'bedroom', label: 'اتاق خواب', icon: 'Bed' },
  { id: 'dining', label: 'ناهارخوری', icon: 'UtensilsCrossed' },
];

// Style options with Persian labels
export const STYLE_OPTIONS: StyleOption[] = [
  { id: 'minimal', label: 'مینیمال' },
  { id: 'modern', label: 'مدرن' },
  { id: 'classic', label: 'کلاسیک' },
];
