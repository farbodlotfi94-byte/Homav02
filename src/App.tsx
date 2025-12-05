import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import { ProductAwareLanding } from "./components/ProductAwareLanding";
import { ProductSelection } from "./components/ProductSelection";
import { PhotoUpload } from "./components/PhotoUpload";
import { FilePrecheck } from "./components/FilePrecheck";
import { StagedUpload } from "./components/StagedUpload";
import { ProductVisualization } from "./components/ProductVisualization";
import { ProductFallback } from "./components/ProductFallback";
import { ErrorRecovery } from "./components/ErrorRecovery";
import { OTPLogin } from "./components/OTPLogin";
import { AboutUs } from "./components/AboutUs";
import { AnimatePresence, motion } from "motion/react";
import { toast, Toaster } from "sonner";

// Lazy load modals and admin components
const ProductDetailsModal = lazy(() => import("./components/ProductDetailsModal").then(m => ({ default: m.ProductDetailsModal })));
const TermsModal = lazy(() => import("./components/TermsModal").then(m => ({ default: m.TermsModal })));
const FeedbackSurvey = lazy(() => import("./components/FeedbackSurvey").then(m => ({ default: m.FeedbackSurvey })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const BrandColors = lazy(() => import("./components/BrandColors").then(m => ({ default: m.BrandColors })));
const SellerDashboardApp = lazy(() => import("./integrations/seller-dashboard/SellerDashboardApp").then(m => ({ default: m.SellerDashboardApp })));

// Loading fallback component
const ModalLoadingFallback = () => null;
import type { Product } from "./types/product";
import type { User, AuthData } from "./types/auth";
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
  sanitizeShopNameForUrl,
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
  | "product-selection" // Product selection from list
  | "product-landing" // Product-aware landing with CTA
  | "product-fallback" // Invalid/unavailable product
  | "user-auth" // User authentication (login/register) - NEW
  | "upload" // File picker/camera
  | "precheck" // Quality validation
  | "staged-upload" // 3-stage upload progress
  | "confirmation" // Upload success
  | "visualization" // Product visualization preview
  | "feedback" // Feedback survey between action and execution
  | "error"; // Error recovery

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
  const [processedImageId, setProcessedImageId] = useState<number | null>(null);

  // NEW: User authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // About Us modal state
  const [showAboutUs, setShowAboutUs] = useState(false);

  // Rate limit state
  const [rateLimitExpiry, setRateLimitExpiry] = useState<number | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>('');

  // Shop filter state
  const [shopFilter, setShopFilter] = useState<string | null>(null);
  const [invalidShopError, setInvalidShopError] = useState(false);

  // Rate limit countdown with auto-clear on expiry
  const rateLimitCountdown = useCountdown(rateLimitExpiry, () => {
    console.log('[App] Rate limit expired, clearing state');
    if (product?.shop_id) {
      clearRateLimitState(product.shop_id);
    }
    setRateLimitExpiry(null);
    setRateLimitMessage('');
  });

  // Initialize PostHog with environment-aware settings
  useEffect(() => {
    posthogService.init();
  }, []);

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
      const reservedRoutes = ['/seller', '/admin', '/health'];
      if (reservedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        console.log("[App] Reserved route detected, skipping initialization:", pathname);
        return;
      }

      // Reset shop filter
      setShopFilter(null);
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

            // Verify shop name matches (case-insensitive, handle both raw and sanitized)
            const normalizedShopName = shopName.toLowerCase().trim();
            const productShopName = (productData.seller.name || '').toLowerCase().trim();
            const sanitizedProductShopName = sanitizeShopNameForUrl(productData.seller.name || '').toLowerCase().trim();

            // Match if URL shop name matches either raw shop name or sanitized version
            if (normalizedShopName !== productShopName && normalizedShopName !== sanitizedProductShopName) {
              console.log("[App] Shop name mismatch:", { 
                urlShop: shopName, 
                productShop: productData.seller.name,
                sanitized: sanitizedProductShopName
              });
              setErrorType("invalid_shop");
              setCurrentStep("error");
              return;
            }

            // Product is valid, show landing
            console.log("[App] Product loaded successfully:", productData.name);
            setProduct(productData);
            setProductUniqueLink(productData.unique_link);
            setShopFilter(sanitizeShopNameForUrl(productData.seller.name || ''));
            setProductVariant({
              color: productData.selectedVariant?.color,
              size: productData.selectedVariant?.size,
            });

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
          setShopFilter(shopName);
          setCurrentStep("product-selection");
        }
      } else {
        // Case 3: Root path / - Show all products
        console.log("[App] Root path, showing all products");
        setShopFilter(null);
        setCurrentStep("product-selection");
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
      const reservedRoutes = ['/seller', '/admin', '/health'];
      if (reservedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        console.log("[App] Reserved route, skipping popstate handling:", pathname);
        return;
      }

      // Parse the current URL to determine what to show
      const entryContext = parseEntryParams(window.location.href);

      if (entryContext) {
        // URL has productId - should show product landing
        console.log("[App] Navigated to product:", entryContext.productId);
        // Don't fetch again if it's the same product
        if (product && event.state?.productId === `prod_${product.id}`) {
          console.log("[App] Same product, just updating step");
          setCurrentStep("product-landing");
        } else {
          // Different product or no product loaded yet
          console.log("[App] Loading product for navigation");
          setCurrentStep("loading");
          fetchProduct(entryContext.productId).then((productData) => {
            if (productData) {
              const validation = validateProduct(productData);
              if (validation.isValid) {
                setProduct(productData);
                setProductUniqueLink(productData.unique_link);
                setProductVariant({
                  color: productData.selectedVariant?.color,
                  size: productData.selectedVariant?.size,
                });
                setCurrentStep("product-landing");
              }
            }
          });
        }
      } else {
        // No URL parameters - show product selection
        console.log("[App] Navigated back to product selection");
        setCurrentStep("product-selection");
        // Clear product state when going back to selection
        setProduct(null);
        setProductUniqueLink("");
        setSelectedFile(null);
        setVisualizedImageUrl("");
        setApiProcessingPromise(null);
        setApiStartTime(0);
        setApiStatus('idle');
        setProcessedImageId(null);
      }
    };

    // Add event listener
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [product]);

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

    // Track in analytics service
    trackAnalytics(event, eventData);
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

      // Update URL for sharing - use shop_name/unique_link format
      const shopSlug = sanitizeShopNameForUrl(productData.seller.name || '');
      navigate(`/${shopSlug}/${uniqueLink}`, { replace: true });

      // Product is valid, show landing
      console.log("[App] Selected product loaded successfully:", productData.name);
      setProduct(productData);
      setProductUniqueLink(uniqueLink);
      setShopFilter(shopSlug);
      setProductVariant({
        color: productData.selectedVariant?.color,
        size: productData.selectedVariant?.size,
      });
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

  // About Us button handler (opens About Us modal)
  const handleAboutUsClick = () => {
    console.log('[App] About Us button clicked');
    setShowAboutUs(true);
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
      });
      setApiProcessingPromise(apiPromise);
      setApiStartTime(Date.now());
      setApiStatus('pending');
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
        }

        setCurrentStep("visualization");
      } catch (error) {
        console.error("[App] خطا در پردازش تصویر:", error);
        setApiStatus('failure');
        setPlacementSuccess(false);

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

        // Generate filename with "homa" prefix and timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const productName = product?.name.replace(/\s+/g, '-') || 'product';
        const filename = `homa-${productName}-${timestamp}.jpg`;

        // Check if mobile device and Web Share API is available
        const isMobile = isMobileDevice();
        const canShare = isWebShareSupported() && canShareFiles();

        if (isMobile && canShare) {
          // Mobile: Use Web Share API to save to gallery
          try {
            const file = new File([blob], filename, { type: 'image/jpeg' });

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
              downloadImage(blob, filename);
              setIsSaved(true);
            }
          }
        } else {
          // Desktop or Web Share not supported: Use traditional download
          downloadImage(blob, filename);
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
      const shopSlug = sanitizeShopNameForUrl(product.seller.name || '');
      navigate(`/${shopSlug}`);
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

  return (
    <Routes>
      {/* Admin Route */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Seller Dashboard Route - must come before catch-all */}
      <Route path="/seller" element={
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div>در حال بارگذاری پنل فروشنده...</div></div>}>
          <SellerDashboardApp />
        </Suspense>
      } />

      {/* Main App Route - handles both / and /:uniqueLink */}
      <Route path="/*" element={
        <>
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

        {/* Product Selection */}
        {currentStep === "product-selection" && (
          <ProductSelection
            key="product-selection"
            onProductSelect={handleProductSelect}
            shopName={shopFilter}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogin={handleLoginClick}
            onLogout={handleLogout}
            onAboutClick={handleAboutUsClick}
            onSellerDashboard={handleSellerDashboard}
          />
        )}

        {/* Product Landing */}
        {currentStep === "product-landing" && product && (
          <ProductAwareLanding
            key="product-landing"
            product={product}
            onUploadStart={handleStartUpload}
            onShowProductDetails={handleShowProductDetails}
            onShowTerms={() => setShowTerms(true)}
            onBack={() => {
              if (shopFilter && product) {
                const shopSlug = sanitizeShopNameForUrl(product.seller.name || '');
                navigate(`/${shopSlug}`);
              } else {
                setCurrentStep("product-selection");
              }
            }}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogin={handleLoginClick}
            onLogout={handleLogout}
            onAboutClick={handleAboutUsClick}
            onSellerDashboard={handleSellerDashboard}
            rateLimitExpiry={rateLimitExpiry}
            rateLimitMessage={rateLimitMessage}
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

        {/* Upload - Guard: Only allow authenticated users */}
        {currentStep === "upload" && (
          <>
          {!isAuthenticated ? (
            // Redirect to auth if not authenticated
            <OTPLogin
              key="upload-auth-guard"
              isOpen={true}
              initialPhoneNumber={user?.phone_number || undefined}
              onClose={handleAuthClose}
              onSuccess={handleAuthSuccess}
            />
          ) : (
              <PhotoUpload
                key="upload"
                onUploadComplete={handleFileSelected}
                onBack={() => setCurrentStep("product-landing")}
                product={product}
                isAuthenticated={isAuthenticated}
                user={user}
                onLogin={handleLoginClick}
                onLogout={handleLogout}
                onAboutClick={handleAboutUsClick}
                onSellerDashboard={handleSellerDashboard}
              />
            )}
          </>
        )}

        {/* Precheck */}
        {currentStep === "precheck" && selectedFile && (
          <FilePrecheck
            key="precheck"
            file={selectedFile}
            onApprove={handlePrecheckApprove}
            onRetake={handlePrecheckRetake}
            onContinueAnyway={handleContinueAnyway}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogin={handleLoginClick}
            onLogout={handleLogout}
            onAboutClick={handleAboutUsClick}
            onSellerDashboard={handleSellerDashboard}
          />
        )}

        {/* Staged Upload */}
        {currentStep === "staged-upload" && selectedFile && (
          <StagedUpload
            key="staged-upload"
            file={selectedFile}
            onComplete={handleUploadComplete}
            onError={handleUploadError}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogin={handleLoginClick}
            onLogout={handleLogout}
            onAboutClick={handleAboutUsClick}
            onSellerDashboard={handleSellerDashboard}
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
              isAuthenticated={isAuthenticated}
              user={user}
              onLogin={handleLoginClick}
              onLogout={handleLogout}
              onAboutClick={handleAboutUsClick}
              onSellerDashboard={handleSellerDashboard}
            />
          )}

        {/* Feedback Survey */}
        {currentStep === "feedback" && (
          <Suspense fallback={<ModalLoadingFallback />}>
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

      {/* About Us Modal - Accessible from hamburger menu */}
      <AboutUs
        open={showAboutUs}
        onOpenChange={setShowAboutUs}
      />

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
        </>
      } />
    </Routes>
  );
}