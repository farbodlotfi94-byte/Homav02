import { useState, useEffect } from "react";
import { ProductAwareLanding } from "./components/ProductAwareLanding";
import { PhotoUpload } from "./components/PhotoUpload";
import { FilePrecheck } from "./components/FilePrecheck";
import { StagedUpload } from "./components/StagedUpload";
import { ProductVisualization } from "./components/ProductVisualization";
import { ProductFallback } from "./components/ProductFallback";
import { ProductDetailsModal } from "./components/ProductDetailsModal";
import { ErrorRecovery } from "./components/ErrorRecovery";
import { TermsModal } from "./components/TermsModal";
import { FeedbackSurvey } from "./components/FeedbackSurvey";
import { AdminDashboard } from "./components/AdminDashboard";
import { BrandColors } from "./components/BrandColors";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "./types/product";
import {
  parseEntryParams,
  fetchProduct,
  validateProduct,
  getSuggestedProducts,
} from "./utils/productLoader";
import {
  processImageWithAI,
  saveVisualization,
  trackEvent,
} from "./utils/aiImageProcessor";
import { trackEvent as trackAnalytics } from "./utils/analytics";
import "./utils/mockUrl"; // Load mock URL helper
import "./utils/testHelpers"; // Load test helpers for console

type Step =
  | "loading" // Initial product fetch
  | "product-landing" // Product-aware landing with CTA
  | "product-fallback" // Invalid/unavailable product
  | "upload" // File picker/camera
  | "precheck" // Quality validation
  | "staged-upload" // 3-stage upload progress
  | "confirmation" // Upload success
  | "visualization" // Product visualization preview
  | "feedback" // Feedback survey between action and execution
  | "error"; // Error recovery

type ErrorType = "network" | "timeout" | "server" | "unknown";
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
  const [currentStep, setCurrentStep] =
    useState<Step>("loading");
  const [product, setProduct] = useState<Product | null>(null);
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

  // Initialize: Parse URL and fetch product
  useEffect(() => {
    const initializeApp = async () => {
      console.log("[App] Initializing...");

      // Parse entry parameters from URL
      let entryContext = parseEntryParams(window.location.href);

      if (!entryContext) {
        console.log(
          "[App] No product context found, using default product",
        );
        // Use default product for demo
        const defaultProductId = "prod_rug_21902";

        // Auto-set URL for demo
        const url = new URL(window.location.href);
        url.searchParams.set("productId", defaultProductId);
        url.searchParams.set("utm_source", "instagram");
        url.searchParams.set("utm_medium", "social");
        window.history.replaceState({}, "", url);

        // Re-parse with default
        entryContext = {
          productId: defaultProductId,
          utm: {
            source: "instagram",
            medium: "social",
          },
          timestamp: Date.now(),
        };
      }

      // Track entry
      trackKPI("Entry", {
        productId: entryContext.productId,
        utm_source: entryContext.utm.source,
        utm_medium: entryContext.utm.medium,
        utm_campaign: entryContext.utm.campaign,
        seller: entryContext.seller,
      });

      try {
        // Fetch product data
        const productData = await fetchProduct(
          entryContext.productId,
        );

        if (!productData) {
          console.log("[App] Product not found");
          setFallbackReason("not_found");
          setSuggestedProducts(
            getSuggestedProducts("furniture", 3),
          );
          setCurrentStep("product-fallback");
          return;
        }

        // Validate product
        const validation = validateProduct(productData);

        if (!validation.isValid) {
          console.log(
            "[App] Product invalid:",
            validation.reason,
          );
          setFallbackReason(validation.reason!);
          setSuggestedProducts(
            getSuggestedProducts(productData.category, 3),
          );
          setCurrentStep("product-fallback");
          return;
        }

        // Product is valid, show landing
        console.log(
          "[App] Product loaded successfully:",
          productData.name,
        );
        setProduct(productData);
        setProductVariant({
          color: productData.selectedVariant?.color,
          size: productData.selectedVariant?.size,
        });
        setCurrentStep("product-landing");
      } catch (error) {
        console.error("[App] Error fetching product:", error);
        setFallbackReason("error");
        setCurrentStep("product-fallback");
      }
    };

    initializeApp();
  }, []);

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

  // Product Landing → Upload
  const handleStartUpload = () => {
    trackKPI("upload_start", {
      source: "product_landing",
      productId: product?.id,
      productName: product?.name,
    });

    if (product) {
      trackEvent({
        eventType: "upload_start",
        productId: product.id,
        sessionId,
      });
    }

    setUploadStartTime(Date.now());
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

    // Process image with AI
    if (selectedFile && product) {
      try {
        const result = await processImageWithAI({
          imageFile: selectedFile,
          productId: product.id,
          sessionId,
        });

        if (result.success) {
          setVisualizedImageUrl(result.visualizedImageUrl);
          setPlacementSuccess(true);

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
            },
          });
        } else {
          setPlacementSuccess(false);
          trackEvent({
            eventType: "upload_error",
            productId: product.id,
            sessionId,
            metadata: { error: result.error },
          });
        }

        setCurrentStep("visualization");
      } catch (error) {
        console.error("[App] خطا در پردازش تصویر:", error);
        setPlacementSuccess(false);
        setCurrentStep("visualization");
      }
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
  const handleSave = () => {
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

    alert("تصویر ذخیره شد! 💾");

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
    setSelectedFile(null);
    setPlacementSuccess(true);
    setVisualizedImageUrl("");
    setHasFeedbackForCurrentImage(false); // Reset برای عکس جدید
    setCurrentStep("upload");
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
    });

    if (product) {
      trackEvent({
        eventType: "click_purchase",
        productId: product.id,
        sessionId,
        metadata: {
          variant: productVariant,
          placementSuccess,
        },
      });
    }

    alert(`خرید ${product?.name} - به زودی! 🛒`);
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
    setCurrentStep("upload");
  };

  // Error Recovery
  const handleErrorRetry = () => {
    trackKPI("Error Recovery", {
      action: "retry",
      errorType,
      productId: product?.id,
    });
    setCurrentStep("staged-upload");
  };

  const handleErrorCancel = () => {
    trackKPI("Error Recovery", {
      action: "cancel",
      errorType,
      productId: product?.id,
    });
    setSelectedFile(null);
    setCurrentStep("product-landing");
  };

  // Feedback Survey
  const handleFeedbackSubmit = (feedback: FeedbackType) => {
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

        {/* Product Landing */}
        {currentStep === "product-landing" && product && (
          <ProductAwareLanding
            key="product-landing"
            product={product}
            onUploadStart={handleStartUpload}
            onShowProductDetails={handleShowProductDetails}
            onShowTerms={() => setShowTerms(true)}
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

        {/* Upload */}
        {currentStep === "upload" && (
          <PhotoUpload
            key="upload"
            onUploadComplete={handleFileSelected}
            onBack={() => setCurrentStep("product-landing")}
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
              userImage={
                visualizedImageUrl ||
                URL.createObjectURL(selectedFile)
              }
              fileName={selectedFile.name}
              placementSuccess={placementSuccess}
              onSave={handleSaveClick}
              onShare={handleShare}
              onChangeVariant={handleVariantChange}
              onTryAnother={handleTryAnotherClick}
              onViewProductDetails={handleShowProductDetails}
              onPurchase={handlePurchase}
              onBackToStore={handleBackToStoreClick}
            />
          )}

        {/* Feedback Survey */}
        {currentStep === "feedback" && (
          <FeedbackSurvey
            key="feedback"
            productId={product?.id}
            onFeedbackSubmit={handleFeedbackSubmit}
          />
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
        <ProductDetailsModal
          open={showProductDetails}
          onClose={() => setShowProductDetails(false)}
          product={product}
          onUploadSticky={handleDetailsUploadCTA}
        />
      )}

      {/* Privacy/Consent Modal - Can appear over any step */}
      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
      />

      {/* Admin Dashboard - Accessible with Shift + Ctrl + K */}
      <AdminDashboard />

      {/* Brand Colors Guide - Accessible with Shift + Ctrl + B */}
      <BrandColors />
    </>
  );
}