/**
 * Discovery Flow Types
 *
 * Types for the AI-powered room analysis and furniture recommendation feature.
 * The AI analyzes uploaded room images and asks contextual questions
 * to determine preferences (no manual selection needed).
 */

export interface DiscoveryRequest {
  image: File;
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
  category?: string | number;
  categoryDisplay?: string;
  // Size fields for rug products
  available_sizes?: string[];        // e.g., ["200x300", "250x350"]
  available_sizes_display?: string[]; // e.g., ["۲×۳ متر", "۲.۵×۳.۵ متر"]
  // Smart Redesign Flow: Persian explanations for product matches
  persianReason?: string;       // e.g., "این محصول با مبل چرم قهوه‌ای شما هماهنگ است"
  matchHighlights?: string[];   // e.g., ["رنگ", "سبک"]
  replacesItem?: string;        // What existing item this product could replace
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

/**
 * Room assessment from AI analysis (Smart Redesign Flow)
 * Indicates what items the AI decided to keep, replace, or add
 */
export interface RoomAssessment {
  items_to_keep: string[];
  items_to_replace: string[];
  gaps_identified: string[];
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

/**
 * Extended result type that includes status and questions
 * Used for intermediate states (e.g., questions_ready)
 */
export interface DiscoveryResultWithQuestions extends DiscoveryResult {
  status?: SessionStatus;
  discoveryQuestions?: DiscoveryQuestionsPayload;
}

export type ProcessingStep = 'upload' | 'analysis' | 'questions' | 'matching' | 'generation';

// Session status from backend API (/api/recommendations/sessions/)
// pending -> analyzing -> questions_ready -> generating -> matching -> ready
export type SessionStatus = 'pending' | 'analyzing' | 'questions_ready' | 'generating' | 'matching' | 'ready' | 'failed';

// =============================================================================
// AI-Guided Discovery Questions (Two-Phase Conversation Flow)
// =============================================================================

/**
 * Question option for single_select and multi_select question types
 * Supports text-based and image-based options for visual selection
 */
export interface QuestionOption {
  value: string;
  label: string;
  imageUrl?: string;        // For image-based selection (mood boards, style cards)
  description?: string;     // Optional description below label
  icon?: string;            // Optional emoji/icon
}

/**
 * Slider configuration for preference questions
 */
export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  minLabel: string;         // e.g., "کم‌نور" (Dim)
  maxLabel: string;         // e.g., "پرنور" (Bright)
  defaultValue?: number;
}

/**
 * Question categories for grouping and visual transitions
 */
export type QuestionCategory = 'layout' | 'color' | 'style' | 'budget' | 'general';

/**
 * Individual discovery question from AI
 * Questions are displayed one-by-one in a full-screen visual UI
 */
export interface DiscoveryQuestion {
  id: string;                          // e.g., "q1", "q2"
  question: string;                    // Persian question text
  type: 'single_select' | 'multi_select' | 'boolean' | 'slider' | 'image_select';
  options: QuestionOption[] | null;    // null for boolean/slider types
  reason: string;                      // Why AI is asking this (Persian)
  category?: QuestionCategory;         // For section grouping
  sliderConfig?: SliderConfig;         // Required for slider type
  subtitle?: string;                   // Optional subtitle/helper text
}

/**
 * Room analysis summary from AI
 * Displayed before questions to give context
 */
export interface RoomAnalysisSummary {
  room_type: string;                   // e.g., "پذیرایی"
  room_size: 'small' | 'medium' | 'large';
  detected_accessories: string[];      // e.g., ["فرش قرمز بزرگ", "پرده کرم‌رنگ"]
  key_accessory_notes: string;         // Main accessory observation
  detected_furniture: string[];        // e.g., ["دو دست مبل راحتی", "میز عسلی"]
  architectural_features: string[];    // e.g., ["پنجره بزرگ با نور طبیعی"]
  functional_observations: string;     // e.g., "مسیر رفت‌وآمد بین مبل‌ها کمی تنگ است"
}

/**
 * Discovery questions payload from backend (status = 'questions_ready')
 */
export interface DiscoveryQuestionsPayload {
  room_analysis: RoomAnalysisSummary;
  questions: DiscoveryQuestion[];
}

/**
 * Answer types for different question types
 */
export type SingleSelectAnswer = string;
export type MultiSelectAnswer = string[];
export type BooleanAnswer = boolean;
export type SliderAnswer = number;
export type QuestionAnswer = SingleSelectAnswer | MultiSelectAnswer | BooleanAnswer | SliderAnswer;

/**
 * Answers map to submit to backend
 * Keys are question IDs (e.g., "q1", "q2")
 */
export interface DiscoveryAnswers {
  [questionId: string]: QuestionAnswer;
}

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
  // Smart Redesign Flow: Persian explanations
  persian_reason?: string;       // AI-generated Persian explanation for match
  match_highlights?: string[];   // Match aspects: ["رنگ", "سبک", "طرح"]
  replaces_item?: string;        // What existing item this could replace
}

export interface BackendSessionData {
  session_id: string;
  status: SessionStatus;
  created_at?: string;
  expires_at?: string;
  redesigned_image_url?: string; // The AI-generated redesigned room image
  items?: BackendSessionItem[]; // Items detected in the room with matched products
  // Smart Redesign Flow: Room assessment
  room_assessment?: {
    items_to_keep: string[];
    items_to_replace: string[];
    gaps_identified: string[];
  };
  // AI-Guided Discovery: Questions payload (when status = 'questions_ready')
  discovery_questions?: DiscoveryQuestionsPayload;
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

// =============================================================================
// Discovery Try-On Types (Auto Try-On from Discovery Results)
// =============================================================================

/**
 * State for the discovery try-on modal
 * Tracks the product being tried on, size selection, and generation status
 */
export interface DiscoveryTryOnState {
  isOpen: boolean;
  product: ProductRecommendation | null;
  selectedSize: string | null;
  status: 'idle' | 'selecting-size' | 'generating' | 'completed' | 'error';
  resultImageUrl: string | null;
  errorMessage: string | null;
}

/**
 * Initial state for discovery try-on
 */
export const INITIAL_DISCOVERY_TRYON_STATE: DiscoveryTryOnState = {
  isOpen: false,
  product: null,
  selectedSize: null,
  status: 'idle',
  resultImageUrl: null,
  errorMessage: null,
};

/**
 * Response from discovery try-on trigger API
 */
export interface DiscoveryTryOnResponse {
  success: boolean;
  status: 'pending' | 'completed';
  imageUrl?: string;
  error?: string;
}

/**
 * Visualization status from discovery session
 */
export interface DiscoveryVisualization {
  product_id: number;
  image_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

