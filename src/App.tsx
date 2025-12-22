import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import { ProductAwareLanding } from "./components/ProductAwareLanding";
import { ProductSelection } from "./components/ProductSelection";
import { ShopSelection } from "./components/ShopSelection";
import { PhotoUpload } from "./components/PhotoUpload";
import { FilePrecheck } from "./components/FilePrecheck";
import { StagedUpload } from "./components/StagedUpload";
import { ProductVisualization } from "./components/ProductVisualization";
import { ProductFallback } from "./components/ProductFallback";
import { ErrorRecovery } from "./components/ErrorRecovery";
import { OTPLogin } from "./components/OTPLogin";
import { AboutUsPage } from "./components/AboutUsPage";
import { MainNavigation } from "./components/MainNavigation";
import { DiscoveryUpload } from "./components/DiscoveryUpload";
import { DiscoveryProcessing } from "./components/DiscoveryProcessing";
import { DiscoveryResults } from "./components/DiscoveryResults";
import { DiscoveryResultsWrapper } from "./components/DiscoveryResultsWrapper";
import { AnimatePresence, motion } from "motion/react";
import { toast, Toaster } from "sonner";
import { Menu, ChevronRight } from "lucide-react";

// Lazy load modals and admin components
const ProductDetailsModal = lazy(() => import("./components/ProductDetailsModal").then(m => ({ default: m.ProductDetailsModal })));
const TermsModal = lazy(() => import("./components/TermsModal").then(m => ({ default: m.TermsModal })));
const FeedbackSurvey = lazy(() => import("./components/FeedbackSurvey").then(m => ({ default: m.FeedbackSurvey })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const BrandColors = lazy(() => import("./components/BrandColors").then(m => ({ default: m.BrandColors })));
const SellerDashboardApp = lazy(() => import("./integrations/seller-dashboard/SellerDashboardApp").then(m => ({ default: m.SellerDashboardApp })));

// Loading fallback component
const ModalLoadingFallback = () => null;

// FeedbackSurvey loading fallback with matching green background
const FeedbackLoadingFallback = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: '#9dc183' }}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: '#1a4d4d',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  </div>
);
import type { Product } from "./types/product";
import type { User, AuthData } from "./types/auth";
import { AppProvider, type AppContextType } from "./contexts";
import type {
  DiscoveryRequest,
  DiscoveryResult,
  DiscoveryContext,
  ProcessingStep,
  ProductRecommendation,
} from "./types/discovery";
import { processDiscoveryImage, cancelDiscoveryRequest } from "./utils/discoveryProcessor";
import { userAuthService } from "./services/userAuthService";
import { submitVote } from "./services/api";
import {
  parseEntryParams,
  parseUniqueLinkFromPath,
  parseShopAndProductFromPath,
  fetchProduct,
  fetchProductByUniqueLink,
  fetchProductsByShopName,
  validateProduct,
  getSuggestedProducts,
} from "./utils/productLoader";
import {
  isMobileDevice,
  isWebShareSupported,
  canShareFiles,
} from "./utils/deviceDetection";
import {
  processImageWithAI,
  saveVisualization,
  trackEvent,
  type ProcessImageResponse,
} from "./utils/aiImageProcessor";
import { posthogService } from "./services/posthog";
import { trackEvent as trackAnalytics } from "./utils/analytics";
import { getRateLimitState, saveRateLimitState, clearRateLimitState } from "./utils/rateLimitStorage";
import { useCountdown } from "./hooks/useCountdown";
import "./utils/mockUrl"; // Load mock URL helper
import "./utils/testHelpers"; // Load test helpers for console

type Step =
  | "loading" // Initial product fetch
  | "shop-selection" // Shop selection from list (root view)
  | "product-selection" // Product selection from list (within a shop)
  | "product-landing" // Product-aware landing with CTA
  | "product-fallback" // Invalid/unavailable product
  | "user-auth" // User authentication (login/register)
  | "upload" // File picker/camera
  | "precheck" // Quality validation
  | "staged-upload" // 3-stage upload progress
  | "confirmation" // Upload success
  | "visualization" // Product visualization preview
  | "feedback" // Feedback survey between action and execution
  | "error" // Error recovery
  | "discovery-processing"; // Discovery: AI processing modal (transient state)

type ErrorType = "network" | "timeout" | "server" | "unknown" | "old_url" | "invalid_shop";
type FallbackReason =
  | "not_found"
  | "inactive"
  | "out_of_stock"
  | "error";
type PendingAction =
  | "save"
  | "tryAnother"
  | "backToStore"
  | null;
type FeedbackType =
  | "satisfied"
  | "neutral"
  | "dissatisfied"
  | null;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] =
    useState<Step>("loading");
  const [product, setProduct] = useState<Product | null>(null);
  const [productUniqueLink, setProductUniqueLink] = useState<string>("");
  const [suggestedProducts, setSuggestedProducts] = useState<
    Product[]
  >([]);
  const [fallbackReason, setFallbackReason] =
    useState<FallbackReason>("not_found");
  const [selectedFile, setSelectedFile] = useState<File | null>(
    null,
  );
  const [showProductDetails, setShowProductDetails] =
    useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [errorType, setErrorType] =
    useState<ErrorType>("network");
  const [uploadStartTime, setUploadStartTime] =
    useState<number>(0);
  const [placementSuccess, setPlacementSuccess] =
    useState<boolean>(true);
  const [productVariant, setProductVariant] = useState<{
    color?: string;
    size?: string;
  }>({});
  const [visualizedImageUrl, setVisualizedImageUrl] =
    useState<string>("");
  const [sessionId] = useState<string>(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);
  const [userFeedback, setUserFeedback] =
    useState<FeedbackType>(null);
  const [
    hasFeedbackForCurrentImage,
    setHasFeedbackForCurrentImage,
  ] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [apiProcessingPromise, setApiProcessingPromise] = useState<Promise<ProcessImageResponse> | null>(null);
  const [apiStartTime, setApiStartTime] = useState<number>(0);
  const [apiStatus, setApiStatus] = useState<'idle' | 'pending' | 'success' | 'failure'>('idle');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processedImageId, setProcessedImageId] = useState<number | null>(null);

  // NEW: User authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Rate limit state
  const [rateLimitExpiry, setRateLimitExpiry] = useState<number | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>('');

  // Shop filter state (display name used for both URLs and API calls)
  const [shopFilter, setShopFilter] = useState<string | null>(null);
  const [invalidShopError, setInvalidShopError] = useState(false);

  // Rug size selection state (for rug products)
  const [selectedRugSize, setSelectedRugSize] = useState<string | null>(null);

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Discovery Flow state
  const [discoveryRequest, setDiscoveryRequest] = useState<DiscoveryRequest | null>(null);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [discoveryProcessingStep, setDiscoveryProcessingStep] = useState<ProcessingStep>("upload");
  const [discoveryContext, setDiscoveryContext] = useState<DiscoveryContext | null>(null);

  // Rate limit countdown with auto-clear on expiry
  const rateLimitCountdown = useCountdown(rateLimitExpiry, () => {
    console.log('[App] Rate limit expired, clearing state');
    if (product?.shop_id) {
      clearRateLimitState(product.shop_id);
    }
    setRateLimitExpiry(null);
    setRateLimitMessage('');
  });

  // PostHog is initialized in main.tsx before React renders

  // Initialize: Load auth state from storage
  useEffect(() => {
    // Check if user is authenticated
    const isAuth = userAuthService.isAuthenticated();
    setIsAuthenticated(isAuth);

    if (isAuth) {
      const userData = userAuthService.getUser();
      setUser(userData);

      console.log('[App] Auth initialized:', { isAuthenticated: isAuth, user: userData?.phone_number });
    } else {
      console.log('[App] Auth initialized: Not authenticated');
    }
  }, []);

  // Initialize: Parse URL and determine entry flow
  useEffect(() => {
    const initializeApp = async () => {
      console.log("[App] Initializing...");
      console.log("[App] Current URL:", window.location.href);

      // Skip initialization for reserved routes (handled by React Router)
      // These routes have their own components and don't need main app initialization
      const pathname = window.location.pathname;
      const reservedRoutes = ['/seller', '/admin', '/health', '/about-us', '/discovery'];
      if (reservedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        console.log("[App] Reserved route detected, skipping initialization:", pathname);
        return;
      }

      // Reset error state (but NOT shopFilter - it will be set based on URL parsing below)
      setInvalidShopError(false);

      // First, check for old URL formats (UUID at root or query params) - show error
      const oldFormatUniqueLink = parseUniqueLinkFromPath(window.location.href);
      const oldFormatQueryParams = parseEntryParams(window.location.href);

      if (oldFormatUniqueLink || oldFormatQueryParams) {
        // Old URL format detected - show error
        console.log("[App] Old URL format detected, showing error");
        setErrorType("old_url");
        setCurrentStep("error");
        return;
      }

      // Try new shop-based routing
      const shopAndProduct = parseShopAndProductFromPath(window.location.href);
      console.log("[App] Shop and product from path:", shopAndProduct);

      if (shopAndProduct) {
        const { shopName, uniqueLink } = shopAndProduct;

        // Case 1: /shop_name/unique_link - Product detail page
        if (shopName && uniqueLink) {
          console.log("[App] Shop-based product entry:", { shopName, uniqueLink });

          // Track entry
          trackKPI("Entry", {
            uniqueLink,
            shopName,
            entryType: 'shop_product_path',
          });

          try {
            // Fetch product data using unique_link
            const productData = await fetchProductByUniqueLink(uniqueLink);

            if (!productData) {
              console.log("[App] Product not found");
              setFallbackReason("not_found");
              setSuggestedProducts(await getSuggestedProducts("all", 3));
              setCurrentStep("product-fallback");
              return;
            }

            // Validate product
            const validation = validateProduct(productData);

            if (!validation.isValid) {
              console.log("[App] Product invalid:", validation.reason);
              setFallbackReason(validation.reason!);
              setSuggestedProducts(await getSuggestedProducts(productData.category, 3));
              setCurrentStep("product-fallback");
              return;
            }

            // Verify shop name matches (case-insensitive)
            // URLs use display name, but also accept username for backwards compatibility
            const normalizedShopName = shopName.toLowerCase().trim();
            const productShopName = (productData.seller.name || '').toLowerCase().trim();
            const productShopUsername = (productData.seller.username || '').toLowerCase().trim();

            // Match if URL shop name matches display name (primary) or username (fallback)
            if (normalizedShopName !== productShopName && normalizedShopName !== productShopUsername) {
              console.log("[App] Shop name mismatch:", {
                urlShop: shopName,
                productShopUsername: productData.seller.username,
                productShopName: productData.seller.name
              });
              setErrorType("invalid_shop");
              setCurrentStep("error");
              return;
            }

            // Product is valid, show landing
            console.log("[App] Product loaded successfully:", productData.name);
            setProduct(productData);
            setProductUniqueLink(productData.unique_link);
            // Use display name for both URL and API (backend accepts shop_name)
            const shopDisplayName = productData.seller.name || shopName;
            setShopFilter(shopDisplayName);
            setProductVariant({
              color: productData.selectedVariant?.color,
              size: productData.selectedVariant?.size,
            });
            setSelectedRugSize(null); // Reset rug size when product changes

            // Check for existing rate limit from localStorage
            const existingRateLimit = getRateLimitState(productData.shop_id);
            if (existingRateLimit) {
              console.log('[App] Restored rate limit from localStorage:', existingRateLimit);
              setRateLimitExpiry(existingRateLimit.expiryTimestamp);
              setRateLimitMessage(existingRateLimit.message);
            }

            setCurrentStep("product-landing");
          } catch (error) {
            console.error("[App] Error fetching product:", error);
            setFallbackReason("error");
            setCurrentStep("product-fallback");
          }
        }
        // Case 2: /shop_name - Shop product listing page
        else if (shopName && !uniqueLink) {
          console.log("[App] Shop listing page:", shopName);

          // Track entry
          trackKPI("Entry", {
            shopName,
            entryType: 'shop_listing',
          });

          // Validate shop exists by fetching products
          const shopProducts = await fetchProductsByShopName(shopName);

          if (shopProducts.length === 0) {
            console.log("[App] No products found for shop:", shopName);
            setErrorType("invalid_shop");
            setInvalidShopError(true);
            setCurrentStep("error");
            return;
          }

          // Shop exists, show product selection with filter
          // shopName from URL is display name - backend accepts shop_name for filtering
          setShopFilter(shopName);
          setCurrentStep("product-selection");
        }
      } else {
        // Case 3: Root path / - Show shop selection
        console.log("[App] Root path, showing shop selection");
        setShopFilter(null);
        setCurrentStep("shop-selection");
      }
    };

    initializeApp();
  }, [location]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.log("[App] Browser navigation detected:", window.location.href);
      console.log("[App] PopState event state:", event.state);

      // Skip for reserved routes (handled by React Router)
      const pathname = window.location.pathname;
      const reservedRoutes = ['/seller', '/admin', '/health', '/about-us', '/discovery'];
      if (reservedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        console.log("[App] Reserved route, skipping popstate handling:", pathname);
        return;
      }

      // Parse the current URL to determine what to show
      // Use parseShopAndProductFromPath for new URL format: /shop_name, /shop_name/product/uuid
      const pathContext = parseShopAndProductFromPath(window.location.href);
      const shopName = pathContext?.shopName;
      const uniqueLink = pathContext?.uniqueLink;

      if (uniqueLink) {
        // Case 1: /shop_name/product/unique_link - should show product landing
        console.log("[App] Navigated to product:", uniqueLink);
        // Don't fetch again if it's the same product
        if (product && product.unique_link === uniqueLink) {
          console.log("[App] Same product, just updating step");
          setCurrentStep("product-landing");
        } else {
          // Different product or no product loaded yet
          console.log("[App] Loading product for navigation");
          setCurrentStep("loading");
          fetchProductByUniqueLink(uniqueLink).then((productData) => {
            if (productData) {
              const validation = validateProduct(productData);
              if (validation.isValid) {
                setProduct(productData);
                setProductUniqueLink(productData.unique_link);
                setProductVariant({
                  color: productData.selectedVariant?.color,
                  size: productData.selectedVariant?.size,
                });
                // Use display name for shopFilter (backend accepts shop_name)
                const shopDisplayName = productData.seller.name || shopName;
                setShopFilter(shopDisplayName);
                setCurrentStep("product-landing");
              }
            }
          });
        }
      } else if (shopName) {
        // Case 2: /shop_name - show product selection with shop filter
        console.log("[App] Navigated to shop listing:", shopName);
        // shopName from URL is display name - backend accepts shop_name for filtering
        setShopFilter(shopName);
        setCurrentStep("product-selection");
        // Reset processing state but keep shop context
        setSelectedFile(null);
        setVisualizedImageUrl("");
        setApiProcessingPromise(null);
        setApiStartTime(0);
        setApiStatus('idle');
        setProcessedImageId(null);
        setSelectedRugSize(null);
      } else {
        // Case 3: Root path - show shop selection (root view)
        console.log("[App] Navigated back to shop selection");
        setCurrentStep("shop-selection");
        // Clear all state when going back to root
        setProduct(null);
        setProductUniqueLink("");
        setSelectedFile(null);
        setVisualizedImageUrl("");
        setApiProcessingPromise(null);
        setApiStartTime(0);
        setApiStatus('idle');
        setProcessedImageId(null);
        setSelectedRugSize(null);
        setShopFilter(null);
      }
    };

    // Add event listener
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [product]);

  // Preload FeedbackSurvey when user reaches visualization step
  useEffect(() => {
    if (currentStep === 'visualization') {
      // Preload FeedbackSurvey chunk in background
      import('./components/FeedbackSurvey').catch(() => {
        // Silently ignore preload errors
      });
    }
  }, [currentStep]);

  // KPI Tracking
  const trackKPI = (
    event: string,
    metadata?: Record<string, any>,
  ) => {
    const eventData = {
      timestamp: new Date().toISOString(),
      step: currentStep,
      productId: product?.id,
      productName: product?.name,
      ...metadata,
    };

    console.log(`[KPI] ${event}`, eventData);

    // Track in analytics service (local)
    trackAnalytics(event, eventData);

    // Track in PostHog (remote)
    posthogService.track(event, eventData);
  };

  // Shop Selection Handler
  const handleShopSelect = (shopDisplayName: string) => {
    trackKPI("Shop Selected", { shopDisplayName });
    console.log("[App] Shop selected:", shopDisplayName);
    // Use display name for both URL and API (backend accepts shop_name)
    setShopFilter(shopDisplayName);
    navigate(`/${encodeURIComponent(shopDisplayName)}`);
  };

  // Product Selection Handler
  const handleProductSelect = async (productId: string, uniqueLink: string, backendProduct?: any) => {
    trackKPI("Product Selected", {
      productId,
      uniqueLink,
    });

    try {
      let productData;

      // If product data was passed from ProductSelection, use it directly (faster)
      if (backendProduct) {
        console.log("[App] Using cached product data from selection");
        // Transform backend product to internal format
        const { API_CONFIG } = await import('./config/api');
        const shopName = backendProduct.shop_name || "فروشگاه";
        productData = {
          id: productId,
          unique_link: backendProduct.unique_link,
          name: backendProduct.name,
          thumbnail: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(backendProduct.image_path)}`,
          price: backendProduct.price,
          currency: backendProduct.currency || "ریال",
          seller: {
            name: shopName,
            verified: true
          },
          category: backendProduct.category,
          status: "active" as const,
          images: [`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE_SERVE(backendProduct.image_path)}`],
          description: backendProduct.description,
          features: [
            "محصول از پیش تعریف شده",
            "قابل تست در فضای شما",
            `دسته‌بندی: ${backendProduct.category}`,
            `تاریخ ایجاد: ${new Date(backendProduct.created_at).toLocaleDateString('fa-IR')}`
          ],
          link: backendProduct.link,
          extra_details: backendProduct.extra_details,
          shop_id: backendProduct.shop_id,
          is_predefined: backendProduct.is_predefined,
          image_path: backendProduct.image_path,
          created_at: backendProduct.created_at
        };
      } else {
        // Fallback: Fetch product data (for URL-based navigation)
        setCurrentStep("loading");
        console.log("[App] Fetching product data from API");
        productData = await fetchProductByUniqueLink(uniqueLink);

        if (!productData) {
          console.log("[App] Product not found after selection");
          setFallbackReason("not_found");
          setCurrentStep("product-fallback");
          return;
        }
      }

      // Validate product
      const validation = validateProduct(productData);

      if (!validation.isValid) {
        console.log("[App] Selected product invalid:", validation.reason);
        setFallbackReason(validation.reason!);
        setCurrentStep("product-fallback");
        return;
      }

      // Update URL for sharing - use shop display name for both URL and API
      const shopDisplayName = productData.seller.name || '';
      navigate(`/${encodeURIComponent(shopDisplayName)}/product/${uniqueLink}`, { replace: true });

      // Product is valid, show landing
      console.log("[App] Selected product loaded successfully:", productData.name);
      setProduct(productData);
      setProductUniqueLink(uniqueLink);
      setShopFilter(shopDisplayName);
      setProductVariant({
        color: productData.selectedVariant?.color,
        size: productData.selectedVariant?.size,
      });
      setSelectedRugSize(null); // Reset rug size when product changes
      setCurrentStep("product-landing");
    } catch (error) {
      console.error("[App] Error loading selected product:", error);
      setFallbackReason("error");
      setCurrentStep("product-fallback");
    }
  };

  // NEW: Auth success handler (login or register)
  const handleAuthSuccess = (authData: AuthData) => {
    setUser(authData.user);
    setIsAuthenticated(true);

    trackKPI('user_authenticated', {
      userId: authData.user.id,
      phone: authData.user.phone_number,
      source: 'upload_attempt',
    });

    console.log('[App] User authenticated successfully:', authData.user.phone_number);

    // Determine where to navigate after successful authentication
    if (product && productUniqueLink) {
      // User has a product selected, proceed to upload
      console.log('[App] Product exists, navigating to upload');
      setCurrentStep('upload');
    } else {
      // No product selected, go to product selection
      console.log('[App] No product selected, navigating to product-selection');
      setCurrentStep('product-selection');
    }
  };

  // NEW: Logout handler
  const handleLogout = async (redirectToAuth: boolean = false) => {
    await userAuthService.logout();

    setUser(null);
    setIsAuthenticated(false);

    // Clear any ongoing processing
    setApiProcessingPromise(null);
    setApiStartTime(0);
    setApiStatus('idle');
    setSelectedFile(null);
    setProcessedImageId(null);

    trackKPI('user_logout', {
      productId: product?.id,
      redirectToAuth,
    });

    console.log('[App] User logged out', { redirectToAuth });

    // Redirect to auth page if session expired during upload, otherwise go to product landing
    if (redirectToAuth) {
      setCurrentStep('user-auth');
    } else {
      setCurrentStep('product-landing');
    }
  };

  // NEW: Login button handler (opens auth modal)
  const handleLoginClick = () => {
    console.log('[App] Login button clicked');
    setCurrentStep('user-auth');
  };

  const handleAuthClose = () => {
    if (product && productUniqueLink) {
      setCurrentStep("product-landing");
    } else {
      setCurrentStep("product-selection");
    }
  };

  // About Us button handler (navigates to About Us page for SEO)
  const handleAboutUsClick = () => {
    console.log('[App] About Us button clicked - navigating to /about-us');
    navigate('/about-us');
  };

  // Seller Dashboard button handler (navigate to seller dashboard)
  const handleSellerDashboard = () => {
    console.log('[App] Seller Dashboard button clicked');
    navigate('/seller');
  };

  // Product Landing → Check Auth → Upload
  const handleStartUpload = () => {
    trackKPI("upload_start", {
      source: "product_landing",
      productId: product?.id,
      productName: product?.name,
      isAuthenticated,
    });

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('[App] User not authenticated, redirecting to auth');
      trackKPI('auth_required', {
        source: 'upload_attempt',
        productId: product?.id,
      });
      setCurrentStep('user-auth');
      return;
    }

    if (product) {
      trackEvent({
        eventType: "upload_start",
        productId: product.id,
        sessionId,
      });
    }

    setUploadStartTime(Date.now());
    setIsSaved(false); // Reset saved state for new upload
    setCurrentStep("upload");
  };

  // Upload → Precheck
  const handleFileSelected = (file: File) => {
    trackKPI("File Selected", {
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name,
      productId: product?.id,
    });
    setSelectedFile(file);

    // Start API processing immediately in background
    if (product && productUniqueLink) {
      console.log('[App] Starting API processing in background...');
      const apiPromise = processImageWithAI({
        imageFile: file,
        productId: product.id,
        uniqueLink: productUniqueLink,
        sessionId,
        selectedSize: selectedRugSize || undefined, // Pass selected rug size if available
      });
      setApiProcessingPromise(apiPromise);
      setApiStartTime(Date.now());
      setApiStatus('pending');
      setProcessingError(null); // Clear any previous error
    } else {
      console.warn('[App] Product or uniqueLink not available, cannot start API processing');
    }

    setCurrentStep("precheck");
  };

  // Precheck → Staged Upload (Pass)
  const handlePrecheckApprove = () => {
    trackKPI("precheck_pass", {
      fileName: selectedFile?.name,
      precheckDuration: Date.now() - uploadStartTime,
      productId: product?.id,
    });
    setCurrentStep("staged-upload");
  };

  // Precheck → Upload (Retake)
  const handlePrecheckRetake = () => {
    trackKPI("retry_upload", {
      reason: "user_initiated",
      source: "precheck_retake",
      productId: product?.id,
    });
    setSelectedFile(null);
    setProcessedImageId(null); // Clear processed image_id for retake
    // Clear any ongoing API processing
    setApiProcessingPromise(null);
    setApiStartTime(0);
    setApiStatus('idle');
    setCurrentStep("upload");
  };

  // Precheck → Staged Upload (Continue Anyway)
  const handleContinueAnyway = () => {
    trackKPI("Precheck Override", {
      fileName: selectedFile?.name,
      reason: "user_continue_anyway",
      productId: product?.id,
    });
    setCurrentStep("staged-upload");
  };

  // Staged Upload → Confirmation
  const handleUploadComplete = async () => {
    const ttfu = Date.now() - uploadStartTime;
    trackKPI("Upload Success", {
      fileName: selectedFile?.name,
      ttfu: ttfu,
      ttfuSeconds: (ttfu / 1000).toFixed(2),
      guardRail: ttfu < 10000 ? "pass" : "fail",
      productId: product?.id,
      userId: user?.id,
    });

    // Track upload success event
    if (selectedFile && product) {
      trackEvent({
        eventType: "upload_success",
        productId: product.id,
        sessionId,
        metadata: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          ttfu,
        },
      });
    }

    // Reset feedback flag for new image
    setHasFeedbackForCurrentImage(false);

    setCurrentStep("confirmation");

    // Await API processing that was started earlier
    if (apiProcessingPromise && product) {
      try {
        console.log('[App] Waiting for background API processing to complete...');
        const apiProcessingTime = Date.now() - apiStartTime;
        console.log(`[App] API has been processing for ${(apiProcessingTime / 1000).toFixed(1)}s`);

        const result = await apiProcessingPromise;

        const totalApiTime = Date.now() - apiStartTime;
        console.log(`[App] API processing completed in ${(totalApiTime / 1000).toFixed(1)}s`);

        // Handle 401 error (token expired and refresh failed)
        if (result.status === 401 && result.requiresLogin) {
          console.error('[App] Session expired during upload, redirecting to login');
          await handleLogout(true); // Pass true to redirect to auth page
          setApiStatus('failure');
          setPlacementSuccess(false);
          // Don't set to visualization - handleLogout will redirect to user-auth
          return;
        }

        // Handle 429 rate limit error
        if (result.status === 429 && result.isRateLimited && result.rateLimitInfo) {
          console.log('[App] محدودیت تعداد درخواست رسیده است');
          setApiStatus('failure');
          setPlacementSuccess(false);

          // Calculate expiry timestamp
          const expiryTimestamp = Date.now() + (result.rateLimitInfo.retryAfter * 1000);
          setRateLimitExpiry(expiryTimestamp);
          setRateLimitMessage(result.rateLimitInfo.message);

          // Save to localStorage for persistence
          if (product?.shop_id) {
            saveRateLimitState(
              product.shop_id,
              expiryTimestamp,
              result.rateLimitInfo.message,
              result.rateLimitInfo.availableIn
            );
          }

          // Show toast notification
          toast.error(result.rateLimitInfo.message, {
            description: `لطفاً ${result.rateLimitInfo.availableIn} دیگر تلاش کنید.\n\nتوجه: محدودیت فقط برای این فروشگاه است. می‌توانید محصولات فروشگاه‌های دیگر را امتحان کنید.`,
            duration: 8000,
          });

          // Track rate limit event
          trackEvent({
            eventType: "rate_limit_hit",
            productId: product.id,
            sessionId,
            metadata: {
              retryAfter: result.rateLimitInfo.retryAfter,
              availableIn: result.rateLimitInfo.availableIn,
              shopId: product.shop_id,
            },
          });

          setCurrentStep("visualization");
          return;
        }

        if (result.success && result.visualizedImageUrl && result.visualizedImageUrl.length > 0) {
          setVisualizedImageUrl(result.visualizedImageUrl);
          setApiStatus('success');
          setPlacementSuccess(true);

          // Store processed image_id for vote API
          if (result.imageId !== undefined && result.imageId !== null) {
            setProcessedImageId(result.imageId);
            console.log('[App] Stored processed image_id:', result.imageId);
          }

          // Save visualization
          const entryContext = parseEntryParams(
            window.location.href,
          );
          await saveVisualization({
            productId: product.id,
            originalImageUrl: result.originalImageUrl,
            visualizedImageUrl: result.visualizedImageUrl,
            sessionId,
            utm: entryContext?.utm,
          });

          // Track view result
          trackEvent({
            eventType: "view_result",
            productId: product.id,
            sessionId,
            metadata: {
              processingTime: result.processingTime,
              confidence: result.confidence,
              backgroundProcessingTime: totalApiTime,
            },
          });

          // Wait a moment to show completion state before transitioning
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          setApiStatus('failure');
          setPlacementSuccess(false);
          setProcessingError(result.error || null);
          console.error('[App] Image processing failed:', {
            error: result.error,
            hasVisualizedUrl: !!result.visualizedImageUrl,
            visualizedUrlLength: result.visualizedImageUrl?.length,
            hasImageId: result.imageId !== undefined,
            imageId: result.imageId,
            resultSuccess: result.success,
            fullResult: result,
          });
          trackEvent({
            eventType: "upload_error",
            productId: product.id,
            sessionId,
            metadata: { error: result.error || 'No visualized image URL' },
          });

          // Show toast notification for critical errors
          if (result.status === 402) {
            toast.error('اعتبار فروشگاه به پایان رسیده است', {
              duration: 8000,
            });
          }
        }

        setCurrentStep("visualization");
      } catch (error) {
        console.error("[App] خطا در پردازش تصویر:", error);
        setApiStatus('failure');
        setPlacementSuccess(false);
        setProcessingError(error instanceof Error ? error.message : 'خطای ناشناخته');

        // Track the error
        if (product) {
          trackEvent({
            eventType: "upload_error",
            productId: product.id,
            sessionId,
            metadata: {
              error: error instanceof Error ? error.message : 'خطای ناشناخته',
              errorType: 'processing_exception'
            },
          });
        }

        setCurrentStep("visualization");
      } finally {
        // Clear the promise after completion
        setApiProcessingPromise(null);
        setApiStartTime(0);
      }
    } else if (!apiProcessingPromise) {
      console.error('[App] No API promise available - this should not happen');
      setApiStatus('failure');
      setPlacementSuccess(false);
      setCurrentStep("visualization");
    }
  };

  // Staged Upload → Error
  const handleUploadError = (error: string) => {
    trackKPI("Upload Error", {
      error,
      fileName: selectedFile?.name,
      attemptDuration: Date.now() - uploadStartTime,
      productId: product?.id,
    });
    setErrorType("network");
    setCurrentStep("error");
  };

  // Visualization Actions - با feedback بین کلیک و اجرا
  const handleSaveClick = () => {
    trackKPI("Action Initiated: Save", {
      productId: product?.id,
      placementSuccess,
      hasFeedbackForCurrentImage,
    });

    // اگر قبلاً feedback داده شده، مستقیم ذخیره کن
    if (hasFeedbackForCurrentImage) {
      handleSave();
      setCurrentStep("visualization"); // بمون در همین صفحه
    } else {
      // اگر feedback نداده، برو نظرسنجی
      setPendingAction("save");
      setCurrentStep("feedback");
    }
  };

  const handleTryAnotherClick = () => {
    trackKPI("Action Initiated: Try Another", {
      source: "visualization",
      productId: product?.id,
      hasFeedbackForCurrentImage,
    });

    // اگر قبلاً feedback داده شده، مستقیم برو به آپلود
    if (hasFeedbackForCurrentImage) {
      handleTryAnother();
    } else {
      // اگر feedback نداده، برو نظرسنجی
      setPendingAction("tryAnother");
      setCurrentStep("feedback");
    }
  };

  const handleBackToStoreClick = () => {
    trackKPI("Action Initiated: Back to Store", {
      productId: product?.id,
      placementSuccess,
      hasFeedbackForCurrentImage,
    });

    // اگر قبلاً feedback داده شده، مستقیم برگرد
    if (hasFeedbackForCurrentImage) {
      handleBackToStore();
    } else {
      // اگر feedback نداده، برو نظرسنجی
      setPendingAction("backToStore");
      setCurrentStep("feedback");
    }
  };

  // عملیات واقعی که بعد از feedback اجرا می‌شن
  const handleSave = async () => {
    trackKPI("Action: Save", {
      productId: product?.id,
      placementSuccess,
      feedback: userFeedback,
    });

    if (product) {
      trackEvent({
        eventType: "save_visualization",
        productId: product.id,
        sessionId,
        metadata: {
          action: "save",
          feedback: userFeedback,
        },
      });
    }

    // Download the processed image
    if (visualizedImageUrl) {
      try {
        const response = await fetch(visualizedImageUrl);
        const blob = await response.blob();

        // Convert to JPEG if not already
        async function convertToJpeg(inputBlob: Blob): Promise<Blob> {
          // If already JPEG, return as-is
          if (inputBlob.type === 'image/jpeg') {
            console.log('[App] Image already JPEG, skipping conversion');
            return inputBlob;
          }

          console.log('[App] Converting image to JPEG from:', inputBlob.type);
          const objectUrl = URL.createObjectURL(inputBlob);
          try {
            const image = new Image();
            await new Promise<void>((resolve, reject) => {
              image.onload = () => resolve();
              image.onerror = () => reject(new Error('Failed to load image for conversion'));
              image.src = objectUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get canvas context');

            ctx.drawImage(image, 0, 0);

            return new Promise((resolve, reject) => {
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    console.log('[App] Successfully converted to JPEG');
                    resolve(jpegBlob);
                  } else {
                    reject(new Error('Failed to convert to JPEG'));
                  }
                },
                'image/jpeg',
                0.92
              );
            });
          } finally {
            URL.revokeObjectURL(objectUrl);
          }
        }

        const jpegBlob = await convertToJpeg(blob);

        // Generate filename with "homa" prefix and product name
        const productName = product?.name.replace(/\s+/g, '-') || 'product';
        const filename = `homa-${productName}.jpg`;

        // Check if mobile device and Web Share API is available
        const isMobile = isMobileDevice();
        const canShare = isWebShareSupported() && canShareFiles();

        if (isMobile && canShare) {
          // Mobile: Use Web Share API to save to gallery
          try {
            const file = new File([jpegBlob], filename, { type: 'image/jpeg' });

            await navigator.share({
              files: [file],
              title: 'HOMA - ' + (product?.name || 'محصول'),
              text: 'تصویر پردازش شده از HOMA',
            });

            // Show success feedback
            setIsSaved(true);
            console.log('[App] Image shared successfully via Web Share API');
          } catch (shareError: any) {
            // User cancelled share or sharing failed
            if (shareError.name === 'AbortError') {
              console.log('[App] Share cancelled by user');
              // Don't show error, user intentionally cancelled
            } else {
              console.error('[App] Share failed:', shareError);
              // Fallback to traditional download
              downloadImage(jpegBlob, filename);
              setIsSaved(true);
            }
          }
        } else {
          // Desktop or Web Share not supported: Use traditional download
          downloadImage(jpegBlob, filename);
          setIsSaved(true);
        }
      } catch (error) {
        console.error('[App] Download failed:', error);
        alert('خطا در دانلود تصویر');
      }
    }

    // Helper function for traditional anchor tag download
    function downloadImage(blob: Blob, filename: string) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    // اگه از feedback اومده، برگرد به visualization
    if (pendingAction === "save") {
      setCurrentStep("visualization");
    }
  };

  const handleTryAnother = () => {
    trackKPI("Action: Try Another", {
      source: "visualization",
      productId: product?.id,
      feedback: userFeedback,
    });

    // Navigate to shop's product listing page if we have shop filter
    if (shopFilter && product) {
      // Use display name (shopFilter) for URL - it's user-friendly
      navigate(`/${encodeURIComponent(shopFilter)}`);
      return;
    }

    // Fallback: Navigate to product selection
    navigate("/");
  };

  const handleBackToStore = () => {
    trackKPI("Action: Back to Store", {
      productId: product?.id,
      placementSuccess,
      feedback: userFeedback,
    });
    // Try to close Instagram in-app browser
    if (window.opener) {
      window.close();
    } else {
      // If can't close, redirect to Instagram profile
      window.location.href = "instagram://user?username=homa";
      // Fallback to web if Instagram app not installed
      setTimeout(() => {
        window.location.href = "https://instagram.com/homa";
      }, 500);
    }
  };

  const handleShare = () => {
    trackKPI("Action: Share", {
      productId: product?.id,
      placementSuccess,
    });

    if (product) {
      trackEvent({
        eventType: "feedback",
        productId: product.id,
        sessionId,
        metadata: { action: "share" },
      });
    }

    alert("اشتراک‌گذاری... 📤");
  };

  const handleVariantChange = (
    type: "color" | "size",
    value: string,
  ) => {
    trackKPI("Variant Change", {
      type,
      value,
      productId: product?.id,
    });
    setProductVariant((prev) => ({ ...prev, [type]: value }));
  };

  // Handler for changing rug size (from visualization)
  // Goes back to product landing to select a different size while keeping uploaded file
  const handleChangeRugSize = () => {
    trackKPI("Action: Change Rug Size", {
      productId: product?.id,
      currentSize: selectedRugSize,
    });

    // Clear the selected size
    setSelectedRugSize(null);

    // Clear API processing state but keep the file
    setApiProcessingPromise(null);
    setApiStartTime(0);
    setApiStatus('idle');
    setVisualizedImageUrl('');
    setProcessedImageId(null);

    // Go back to product landing where size selector is shown
    setCurrentStep("product-landing");
  };

  const handlePurchase = () => {
    trackKPI("Action: Purchase", {
      productId: product?.id,
      productName: product?.name,
      variant: productVariant,
      placementSuccess,
      hasLink: !!product?.link,
    });

    if (product) {
      trackEvent({
        eventType: "click_purchase",
        productId: product.id,
        sessionId,
        metadata: {
          variant: productVariant,
          placementSuccess,
          link: product.link,
        },
      });

      // Redirect to product link if available
      if (product.link) {
        window.open(product.link, '_blank', 'noopener,noreferrer');
      } else {
        alert(`خرید ${product?.name} - به زودی! 🛒`);
      }
    }
  };

  // Product Details Modal
  const handleShowProductDetails = () => {
    trackKPI("View Product Details", {
      source: currentStep,
      productId: product?.id,
    });
    setShowProductDetails(true);
  };

  const handleDetailsUploadCTA = () => {
    trackKPI("Details Modal Upload CTA", {
      productId: product?.id,
    });
    setShowProductDetails(false);

    // Check if user is authenticated before going to upload
    if (!isAuthenticated) {
      console.log('[App] User not authenticated for details upload CTA, redirecting to auth');
      trackKPI('auth_required', {
        source: 'details_modal_upload',
        productId: product?.id,
      });
      setCurrentStep('user-auth');
      return;
    }

    // Clear any ongoing API processing
    setApiProcessingPromise(null);
    setApiStartTime(0);
    setCurrentStep("upload");
  };

  // Product Fallback Actions
  const handleSelectSuggestedProduct = (productId: string) => {
    trackKPI("Suggested Product Selected", {
      newProductId: productId,
      previousReason: fallbackReason,
    });
    // In real app, reload with new productId
    window.location.href = `?productId=${productId}&utm_source=suggestion`;
  };

  const handleFallbackUpload = () => {
    trackKPI("Fallback Upload", {
      reason: fallbackReason,
    });

    // Check if user is authenticated before going to upload
    if (!isAuthenticated) {
      console.log('[App] User not authenticated for fallback upload, redirecting to auth');
      trackKPI('auth_required', {
        source: 'fallback_upload',
        reason: fallbackReason,
      });
      setCurrentStep('user-auth');
      return;
    }

    // Clear any ongoing API processing
    setApiProcessingPromise(null);
    setApiStartTime(0);
    setApiStatus('idle');
    setCurrentStep("upload");
  };

  // Error Recovery
  const handleErrorRetry = () => {
    trackKPI("Error Recovery", {
      action: "retry",
      errorType,
      productId: product?.id,
    });
    
    // For old_url and invalid_shop errors, redirect to root
    if (errorType === "old_url" || errorType === "invalid_shop") {
      navigate("/");
      return;
    }
    
    setApiStatus('idle');
    setCurrentStep("staged-upload");
  };

  const handleErrorCancel = () => {
    trackKPI("Error Recovery", {
      action: "cancel",
      errorType,
      productId: product?.id,
    });

    // For old_url and invalid_shop errors, redirect to root
    if (errorType === "old_url" || errorType === "invalid_shop") {
      navigate("/");
      return;
    }

    setSelectedFile(null);
    setProcessedImageId(null); // Clear processed image_id on error cancel
    setApiStatus('idle');
    setCurrentStep("product-landing");
  };

  // ============================================
  // Discovery Flow Handlers
  // ============================================

  // Start Discovery Flow (from banner click)
  const handleDiscoveryStart = (context?: DiscoveryContext) => {
    trackKPI("Discovery Started", {
      source: context?.shopId ? "product_selection" : "shop_selection",
      shopId: context?.shopId,
      shopName: context?.shopName,
    });

    console.log("[App] Discovery flow started:", context);
    setDiscoveryContext(context || null);
    setDiscoveryResult(null);
    setDiscoveryProcessingStep("upload");
    // Navigate to discovery page (SEO-friendly route)
    navigate("/discovery");
  };

  // Handle Discovery Upload (user uploads photo with preferences)
  const handleDiscoveryUpload = async (request: DiscoveryRequest) => {
    trackKPI("Discovery Upload", {
      hasRoomType: !!request.roomType,
      hasStyle: !!request.style,
      shopId: discoveryContext?.shopId,
    });

    console.log("[App] Discovery upload:", {
      roomType: request.roomType,
      style: request.style,
      fileSize: request.image.size,
    });

    setDiscoveryRequest(request);
    setDiscoveryProcessingStep("upload");
    // Show processing modal (stays as state - transient)
    setCurrentStep("discovery-processing");

    // Start API processing with real progress callbacks
    try {
      // Progress callback that updates UI based on real API status
      const onProgress = (step: ProcessingStep, _progress: number) => {
        setDiscoveryProcessingStep(step);
      };

      // Call the API with progress callback
      const result = await processDiscoveryImage(request, onProgress);

      if (result.success && result.result) {
        console.log("[App] Discovery processing complete:", result.result);
        setDiscoveryResult(result.result);
        // Navigate to results page with sessionId (SEO-friendly, shareable route)
        navigate(`/discovery/results/${result.result.sessionId}`);

        trackKPI("Discovery Complete", {
          recommendationCount: result.result.recommendations.length,
          hasProcessedImage: !!result.result.processedImageUrl,
          sessionId: result.result.sessionId,
          shopId: discoveryContext?.shopId,
        });
      } else {
        console.error("[App] Discovery processing failed:", result.error);

        // Handle authentication required
        if (result.requiresLogin) {
          toast.error("لطفاً ابتدا وارد شوید");
          // Could trigger login modal here if needed
        } else if (result.isRateLimited) {
          toast.error(result.error || "محدودیت تعداد درخواست رسیده است");
        } else {
          toast.error(result.error || "خطا در پردازش تصویر");
        }
        navigate("/discovery");
      }
    } catch (error) {
      console.error("[App] Discovery processing error:", error);
      toast.error("خطا در پردازش تصویر. لطفاً دوباره تلاش کنید.");
      navigate("/discovery");
    }
  };

  // Handle Discovery Cancel (during processing)
  const handleDiscoveryCancel = () => {
    trackKPI("Discovery Cancelled", {
      step: discoveryProcessingStep,
      shopId: discoveryContext?.shopId,
    });

    console.log("[App] Discovery cancelled at step:", discoveryProcessingStep);

    // Cancel the ongoing API request
    cancelDiscoveryRequest();

    setDiscoveryRequest(null);
    setDiscoveryResult(null);
    setDiscoveryProcessingStep("upload");
    // Navigate back to discovery upload page
    navigate("/discovery");
  };

  // Handle Discovery Product Click (view product details)
  const handleDiscoveryProductClick = async (recommendation: ProductRecommendation) => {
    trackKPI("Discovery Product Click", {
      productId: recommendation.id,
      productName: recommendation.name,
      matchScore: recommendation.matchScore,
      shopId: recommendation.shopId,
    });

    console.log("[App] Discovery product clicked:", recommendation);

    // Navigate to product page
    navigate(
      `/${encodeURIComponent(recommendation.shopName)}/product/${recommendation.uniqueLink}`
    );
  };

  // Handle Discovery Share
  const handleDiscoveryShare = async () => {
    // Use processed image if available, otherwise use original
    const imageUrl = discoveryResult?.processedImageUrl || discoveryResult?.originalImageUrl;
    if (!imageUrl) return;

    trackKPI("Discovery Share", {
      shopId: discoveryContext?.shopId,
    });

    const isMobile = isMobileDevice();
    const canShare = isWebShareSupported();

    if (isMobile && canShare) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "homa-discovery.jpg", { type: "image/jpeg" });

        await navigator.share({
          files: [file],
          title: "HOMA - پیشنهادات هوش مصنوعی",
          text: "تصویر طراحی شده با HOMA",
        });
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("[App] Share failed:", error);
          toast.error("خطا در اشتراک‌گذاری");
        }
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("لینک کپی شد");
      } catch {
        toast.error("خطا در کپی لینک");
      }
    }
  };

  // Handle Discovery Save
  const handleDiscoverySave = async () => {
    // Use processed image if available, otherwise use original
    const imageUrl = discoveryResult?.processedImageUrl || discoveryResult?.originalImageUrl;
    if (!imageUrl) return;

    trackKPI("Discovery Save", {
      shopId: discoveryContext?.shopId,
    });

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const isMobile = isMobileDevice();
      const canShare = isWebShareSupported() && canShareFiles();

      if (isMobile && canShare) {
        const file = new File([blob], "homa-discovery.jpg", { type: "image/jpeg" });
        await navigator.share({
          files: [file],
          title: "HOMA - پیشنهادات AI",
        });
        toast.success("تصویر ذخیره شد");
      } else {
        // Desktop download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "homa-discovery.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("تصویر دانلود شد");
      }
    } catch (error) {
      console.error("[App] Save failed:", error);
      toast.error("خطا در ذخیره تصویر");
    }
  };

  // Feedback Survey
  const handleFeedbackSubmit = async (feedback: FeedbackType) => {
    trackKPI("Feedback Survey Submitted", {
      feedback,
      productId: product?.id,
    });

    if (product) {
      trackEvent({
        eventType: "feedback_survey",
        productId: product.id,
        sessionId,
        metadata: { feedback },
      });
    }

    setUserFeedback(feedback);
    setHasFeedbackForCurrentImage(true);

    // Submit vote to backend API if we have processedImageId and feedback
    if (processedImageId && feedback) {
      // Convert feedback to vote value: satisfied=1 (GOOD), neutral=2 (NEUTRAL), dissatisfied=3 (BAD)
      const voteValue: 1 | 2 | 3 = feedback === 'satisfied' ? 1 : feedback === 'neutral' ? 2 : 3;

      try {
        console.log('[App] Submitting vote for image:', { imageId: processedImageId, vote: voteValue });
        const voteResponse = await submitVote(processedImageId, voteValue);

        if (voteResponse.success) {
          console.log('[App] Vote submitted successfully:', voteResponse.data);
          trackKPI("Vote Submitted", {
            imageId: processedImageId,
            vote: voteValue,
            productId: product?.id,
          });
        } else {
          // Handle errors without blocking user flow
          const errorStatus = voteResponse.status;
          let errorMessage = 'خطا در ثبت رأی';

          if (errorStatus === 400) {
            errorMessage = 'مقدار رأی نامعتبر است';
          } else if (errorStatus === 401) {
            // Already handled by api.ts (auto-refresh), but log if refresh failed
            errorMessage = 'نیاز به ورود مجدد';
          } else if (errorStatus === 403) {
            errorMessage = 'شما دسترسی به این تصویر ندارید';
          } else if (errorStatus === 404) {
            errorMessage = 'تصویر پردازش‌شده یافت نشد';
          } else {
            errorMessage = voteResponse.error || 'خطا در ثبت رأی';
          }

          console.error('[App] Vote submission failed:', {
            status: errorStatus,
            error: voteResponse.error,
            message: errorMessage,
          });

          // Log error but don't block user flow (vote is non-critical)
          trackKPI("Vote Submission Failed", {
            imageId: processedImageId,
            vote: voteValue,
            status: errorStatus,
            error: errorMessage,
            productId: product?.id,
          });
        }
      } catch (error) {
        // Network or unexpected errors
        console.error('[App] Vote submission error:', error);
        trackKPI("Vote Submission Error", {
          imageId: processedImageId,
          vote: voteValue,
          error: error instanceof Error ? error.message : 'Unknown error',
          productId: product?.id,
        });
        // Don't block user flow on vote errors
      }
    } else if (processedImageId && !feedback) {
      // User skipped feedback - don't submit vote
      console.log('[App] Feedback skipped, not submitting vote');
    } else if (!processedImageId) {
      // No processed image_id available
      console.warn('[App] No processed image_id available for vote submission');
    }

    // Continue with existing flow (execute pending action)
    if (pendingAction) {
      switch (pendingAction) {
        case "save":
          handleSave();
          break;
        case "tryAnother":
          handleTryAnother();
          break;
        case "backToStore":
          handleBackToStore();
          break;
        default:
          break;
      }
      setPendingAction(null);
    }
  };

  // Create app context value to eliminate prop drilling
  const appContextValue: AppContextType = {
    user,
    isAuthenticated,
    onLogin: handleLoginClick,
    onLogout: handleLogout,
    onAboutClick: handleAboutUsClick,
    onSellerDashboard: handleSellerDashboard,
  };

  return (
    <AppProvider value={appContextValue}>
      <Routes>
        {/* Admin Route */}
        <Route path="/admin" element={<AdminDashboard />} />

      {/* About Us Route - standalone page for SEO */}
      <Route path="/about-us" element={<AboutUsPage />} />

      {/* Discovery Routes - SEO-friendly pages with sidebar */}
      <Route path="/discovery/*" element={
        <div className="flex flex-col md:flex-row min-h-screen" dir="rtl">
          {/* Mobile Hamburger Button */}
          {!isMobileSidebarOpen && (
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg border bg-white border-gray-100"
              aria-label="منو"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Mobile Backdrop Overlay */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <aside
            dir="ltr"
            className={`
              fixed top-0 right-0 h-full z-50
              md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0
              bg-white
              transition-transform duration-300 ease-in-out
              flex flex-col flex-shrink-0
              ${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={{ width: '280px', minWidth: '280px', borderLeft: '1px solid #f3f4f6' }}
          >
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden absolute p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ top: '1.25rem', left: '1rem' }}
              aria-label="بستن"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
            </button>

            <MainNavigation
              isAuthenticated={isAuthenticated}
              user={user}
              onLogin={() => {
                setIsMobileSidebarOpen(false);
                handleLoginClick();
              }}
              onLogout={() => {
                setIsMobileSidebarOpen(false);
                handleLogout(false);
              }}
              onAboutClick={() => {
                setIsMobileSidebarOpen(false);
                handleAboutUsClick();
              }}
              onSellerDashboard={() => {
                setIsMobileSidebarOpen(false);
                handleSellerDashboard();
              }}
              onHomeClick={() => {
                setIsMobileSidebarOpen(false);
                navigate('/');
              }}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-hidden">
            <Routes>
              <Route index element={
                <DiscoveryUpload
                  onUpload={handleDiscoveryUpload}
                  onBack={() => navigate(discoveryContext?.shopId ? `/${encodeURIComponent(discoveryContext.shopName || "")}` : "/")}
                  shopContext={
                    discoveryContext
                      ? {
                          name: discoveryContext.shopName || "",
                          id: discoveryContext.shopId || "",
                        }
                      : undefined
                  }
                />
              } />

              <Route path="results/:sessionId?" element={
                <DiscoveryResultsWrapper
                  cachedResult={discoveryResult}
                  onRetry={() => {
                    setDiscoveryResult(null);
                    setDiscoveryProcessingStep("upload");
                    navigate("/discovery");
                  }}
                  onBackToShops={() => {
                    setDiscoveryRequest(null);
                    setDiscoveryResult(null);
                    setDiscoveryContext(null);
                    setDiscoveryProcessingStep("upload");
                    navigate(discoveryContext?.shopId ? `/${encodeURIComponent(discoveryContext.shopName || "")}` : "/");
                  }}
                  onProductClick={handleDiscoveryProductClick}
                  onShare={handleDiscoveryShare}
                  onSave={handleDiscoverySave}
                  onResultLoaded={(result) => setDiscoveryResult(result)}
                />
              } />
            </Routes>

            {/* Discovery Processing Modal */}
            {currentStep === "discovery-processing" && (
              <DiscoveryProcessing
                currentStep={discoveryProcessingStep}
                onCancel={handleDiscoveryCancel}
              />
            )}

            {/* Toast Notifications */}
            <Toaster
              position="top-center"
              richColors
              closeButton
              dir="rtl"
            />
          </main>
        </div>
      } />

      {/* Seller Dashboard Route - must come before catch-all */}
      <Route path="/seller" element={
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div>در حال بارگذاری پنل فروشنده...</div></div>}>
          <SellerDashboardApp />
        </Suspense>
      } />

      {/* Main App Route - handles both / and /:uniqueLink */}
      <Route path="/*" element={
        <div className="flex flex-col md:flex-row min-h-screen" dir="rtl">
          {/* Mobile Hamburger Button - Only show on mobile when sidebar is closed */}
          {!isMobileSidebarOpen && (
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg border bg-white border-gray-100"
              aria-label="منو"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Mobile Backdrop Overlay */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              />
            )}
          </AnimatePresence>

          {/* Sidebar - Desktop: always visible in flex flow, Mobile: slide-out drawer */}
          <aside
            dir="ltr"
            className={`
              fixed top-0 right-0 h-full z-50
              md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0
              bg-white
              transition-transform duration-300 ease-in-out
              flex flex-col flex-shrink-0
              ${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={{ width: '280px', minWidth: '280px', borderLeft: '1px solid #f3f4f6' }}
          >
            {/* Mobile Close Button - Left edge of sidebar (near backdrop) */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden absolute p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ top: '1.25rem', left: '1rem' }}
              aria-label="بستن"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
            </button>

            <MainNavigation
              isAuthenticated={isAuthenticated}
              user={user}
              onLogin={() => {
                setIsMobileSidebarOpen(false);
                handleLoginClick();
              }}
              onLogout={() => {
                setIsMobileSidebarOpen(false);
                handleLogout(false);
              }}
              onAboutClick={() => {
                setIsMobileSidebarOpen(false);
                handleAboutUsClick();
              }}
              onSellerDashboard={() => {
                setIsMobileSidebarOpen(false);
                handleSellerDashboard();
              }}
              onHomeClick={() => {
                setIsMobileSidebarOpen(false);
                // Navigate to shop's product list if viewing a product from that shop
                if (shopFilter) {
                  navigate(`/${shopFilter}`);
                } else {
                  navigate('/');
                }
              }}
            />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Loading State */}
              {currentStep === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-screen bg-[#fafafa] flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">
                      در حال بارگذاری...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Shop Selection (Root View) */}
              {currentStep === "shop-selection" && (
                <ShopSelection
                  key="shop-selection"
                  onShopSelect={handleShopSelect}
                  onDiscoveryStart={() => handleDiscoveryStart()}
                />
              )}

              {/* Product Selection */}
              {currentStep === "product-selection" && (
                <ProductSelection
                  key="product-selection"
                  onProductSelect={handleProductSelect}
                  shopName={shopFilter}
                  onDiscoveryStart={() => handleDiscoveryStart(shopFilter || undefined)}
                />
              )}

              {/* Product Landing */}
              {currentStep === "product-landing" && product && (
                <ProductAwareLanding
                  key="product-landing"
                  product={product}
                  onUploadStart={handleStartUpload}
                  onBack={() => {
                    if (shopFilter && product) {
                      // Use display name (shopFilter) for URL - it's user-friendly
                      navigate(`/${encodeURIComponent(shopFilter)}`);
                    } else {
                      // No shop filter - go back to shop selection
                      navigate('/');
                    }
                  }}
                  rateLimitExpiry={rateLimitExpiry}
                  selectedSize={selectedRugSize}
                  onSizeSelect={setSelectedRugSize}
                />
              )}

                  {/* User Auth (OTP) */}
                  {currentStep === "user-auth" && (
                    <OTPLogin
                      key="user-auth"
                      isOpen={true}
                      initialPhoneNumber={user?.phone_number || undefined}
                      onClose={handleAuthClose}
                      onSuccess={handleAuthSuccess}
                    />
                  )}

                  {/* Product Fallback */}
                  {currentStep === "product-fallback" && (
                    <ProductFallback
                      key="product-fallback"
                      reason={fallbackReason}
                      suggestedProducts={suggestedProducts}
                      onSelectProduct={handleSelectSuggestedProduct}
                      onUploadForSuggestions={handleFallbackUpload}
                    />
                  )}

                  {/* Upload - Auth is checked in handleStartUpload before transitioning here */}
                  {currentStep === "upload" && (
                    <PhotoUpload
                      key="upload"
                      onUploadComplete={handleFileSelected}
                      onBack={() => setCurrentStep("product-landing")}
                      product={product}
                    />
                  )}

                  {/* Precheck */}
                  {currentStep === "precheck" && selectedFile && (
                    <FilePrecheck
                      key="precheck"
                      file={selectedFile}
                      onApprove={handlePrecheckApprove}
                      onRetake={handlePrecheckRetake}
                      onContinueAnyway={handleContinueAnyway}
                    />
                  )}

                  {/* Staged Upload */}
                  {currentStep === "staged-upload" && selectedFile && (
                    <StagedUpload
                      key="staged-upload"
                      file={selectedFile}
                      onComplete={handleUploadComplete}
                      onError={handleUploadError}
                    />
                  )}

                  {/* Confirmation */}
                  {currentStep === "confirmation" &&
                    selectedFile &&
                    product && (
                      <motion.div
                        key="confirmation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen bg-white flex items-center justify-center p-4"
                      >
                        <div className="text-center">
                          {/* HOMA Logo - Large and Centered */}
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              duration: 0.6,
                              ease: "easeOut",
                            }}
                            className="mb-8"
                          >
                            <div
                              style={{
                                fontSize: "96px",
                                fontFamily:
                                  '"Inter", "Helvetica Neue", "Helvetica", Arial, sans-serif',
                                fontWeight: 700,
                                letterSpacing: "-4px",
                                color: "#000",
                                textTransform: "uppercase",
                                lineHeight: "1",
                              }}
                            >
                              HOMA
                            </div>
                          </motion.div>

                          {/* Loading Dots */}
                          <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="flex gap-2">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-3 h-3 bg-gray-900 rounded-full"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* "Please Wait" Text */}
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-600"
                            style={{ fontSize: "16px" }}
                          >
                            منتظر باشید
                          </motion.p>

                          {/* Optional: Product name hint */}
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-400 mt-4"
                            style={{ fontSize: "14px" }}
                          >
                            در حال تست {product.name} در فضای شما...
                          </motion.p>
                        </div>
                      </motion.div>
                    )}

                  {/* Visualization */}
                  {currentStep === "visualization" &&
                    selectedFile &&
                    product && (
                      <ProductVisualization
                        key="visualization"
                        product={product}
                        userImage={visualizedImageUrl}
                        apiStatus={apiStatus}
                        errorMessage={processingError}
                        fileName={selectedFile.name}
                        placementSuccess={placementSuccess}
                        isSaved={isSaved}
                        onSave={handleSaveClick}
                        onShare={handleShare}
                        onChangeVariant={handleVariantChange}
                        onTryAnother={handleTryAnotherClick}
                        onViewProductDetails={handleShowProductDetails}
                        onPurchase={handlePurchase}
                        onBackToStore={handleBackToStoreClick}
                        onBack={() => setCurrentStep("product-landing")}
                        onChangeSize={handleChangeRugSize}
                      />
                    )}

                  {/* Feedback Survey */}
                  {currentStep === "feedback" && (
                    <Suspense fallback={<FeedbackLoadingFallback />}>
                      <FeedbackSurvey
                        key="feedback"
                        productId={product?.id}
                        onFeedbackSubmit={handleFeedbackSubmit}
                      />
                    </Suspense>
                  )}

              {/* Error Recovery */}
              {currentStep === "error" && (
                <ErrorRecovery
                  key="error"
                  errorType={errorType}
                  onRetry={handleErrorRetry}
                  onCancel={handleErrorCancel}
                />
              )}
            </AnimatePresence>

            {/* Product Details Modal - Can appear over any step */}
            {product && (
              <Suspense fallback={<ModalLoadingFallback />}>
                <ProductDetailsModal
                  open={showProductDetails}
                  onClose={() => setShowProductDetails(false)}
                  product={product}
                  onUploadSticky={handleDetailsUploadCTA}
                />
              </Suspense>
            )}

            {/* Privacy/Consent Modal - Can appear over any step */}
            <Suspense fallback={<ModalLoadingFallback />}>
              <TermsModal
                open={showTerms}
                onClose={() => setShowTerms(false)}
              />
            </Suspense>

            {/* Brand Colors Guide - Accessible with Shift + Ctrl + B */}
            <Suspense fallback={null}>
              <BrandColors />
            </Suspense>

            {/* Toast Notifications */}
            <Toaster
              position="top-center"
              richColors
              closeButton
              dir="rtl"
            />
          </main>
        </div>
      } />
      </Routes>
    </AppProvider>
  );
}