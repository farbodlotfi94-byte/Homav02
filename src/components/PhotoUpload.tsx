/**
 * PhotoUpload Component
 *
 * Allows users to upload photos for furniture visualization.
 * Shows optional upload guidance on first view.
 *
 * TODO: Future enhancement - Add localStorage to auto-hide guidance for returning users
 * TODO: Future enhancement - Add info icon (ℹ️) to re-show guidance after dismissal
 */

import { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Upload, Camera } from "lucide-react";
import { Header } from "./Header";
import { UploadGuidanceModal } from "./UploadGuidanceModal";
import type { User } from "../types/auth";
import { useAnimationPreference } from "../hooks/useAnimationPreference";
// import { optimizeImage } from "../utils/imageOptimizer";

interface PhotoUploadProps {
  onUploadComplete: (file: File) => void;
  onBack: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onAboutClick?: () => void;
}

export function PhotoUpload({
  onUploadComplete,
  onBack,
  isAuthenticated,
  user,
  onLogin,
  onLogout,
  onAboutClick
}: PhotoUploadProps) {
  const shouldAnimate = useAnimationPreference();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Track if guidance modal should be shown
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"file" | "camera" | null>(null);

  // Check if user has seen the guidance before (within last 5 minutes)
  const hasSeenGuidance = () => {
    try {
      const seenData = localStorage.getItem('homa_upload_guidance_seen');
      if (!seenData) return false;
      
      const { timestamp } = JSON.parse(seenData);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      // If more than 5 minutes have passed, show hint again
      if (now - timestamp > fiveMinutes) {
        localStorage.removeItem('homa_upload_guidance_seen');
        return false;
      }
      
      return true;
    } catch (e) {
      // If parsing fails, treat as not seen
      return false;
    }
  };

  // Mark guidance as seen with current timestamp
  const markGuidanceAsSeen = () => {
    try {
      const data = {
        seen: true,
        timestamp: Date.now()
      };
      localStorage.setItem('homa_upload_guidance_seen', JSON.stringify(data));
    } catch (e) {
      console.warn('[PhotoUpload] Failed to save guidance status to localStorage');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "image/jpeg" || droppedFile.type === "image/png")) {
      // Optimize image before passing to parent for precheck
      // const optimizedFile = await optimizeImage(droppedFile);
      // onUploadComplete(optimizedFile);
      onUploadComplete(droppedFile);
    }
  }, [onUploadComplete]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Optimize image before passing to parent for precheck
      // const optimizedFile = await optimizeImage(selectedFile);
      // onUploadComplete(optimizedFile);
      onUploadComplete(selectedFile);
    }
  }, [onUploadComplete]);

  const handleFileButtonClick = useCallback(() => {
    if (hasSeenGuidance()) {
      // User has seen guidance before, directly open file picker
      fileInputRef.current?.click();
    } else {
      // Show guidance modal for first time
      setPendingAction("file");
      setShowGuidanceModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCameraButtonClick = useCallback(() => {
    if (hasSeenGuidance()) {
      // User has seen guidance before, directly open camera
      cameraInputRef.current?.click();
    } else {
      // Show guidance modal for first time
      setPendingAction("camera");
      setShowGuidanceModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuidanceConfirm = useCallback(() => {
    // Mark guidance as seen
    markGuidanceAsSeen();
    
    if (pendingAction === "file") {
      fileInputRef.current?.click();
    } else if (pendingAction === "camera") {
      cameraInputRef.current?.click();
    }
    setPendingAction(null);
  }, [pendingAction]);

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onBack={onBack}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        onAboutClick={onAboutClick}
      />

      <div className="pt-14">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
          transition={shouldAnimate ? { duration: 0.5 } : undefined}
          className="max-w-lg mx-auto px-6 py-6"
        >
          {/* Upload Guidance Modal */}
          <UploadGuidanceModal
            open={showGuidanceModal}
            onClose={() => {
              setShowGuidanceModal(false);
              setPendingAction(null);
            }}
            onConfirm={handleGuidanceConfirm}
          />

          {/* Upload Circle */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full aspect-square rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
              isDragging
                ? "bg-gray-200 border-2 border-gray-400 border-dashed"
                : "bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-gray-200 border-dashed"
            }`}
          >
            <div className="text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-gray-600">تصویر را اینجا بکشید</p>
              <p className="text-gray-400 mt-1">یا دکمه زیر را بزنید</p>
            </div>
          </div>

          {/* Upload Info */}
          <div className="mb-6">
            <h2 className="text-gray-900 mb-3 text-right font-bold">عکس خود را انتخاب کنید</h2>
            <p className="text-gray-600 leading-relaxed text-right">
              فایل JPG یا PNG خود را بارگذاری کنید. هوش مصنوعی ما تصویر شما را پردازش و تبدیل‌های شگفت‌انگیز ایجاد می‌کند.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleFileButtonClick}
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors cursor-pointer flex items-center justify-center font-medium select-none"
            >
              انتخاب فایل
            </button>

            {/* Mobile Camera */}
            <div className="md:hidden">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleCameraButtonClick}
                className="w-full h-14 border-2 border-gray-300 text-gray-900 hover:bg-gray-50 rounded-full cursor-pointer flex items-center gap-2 justify-center font-medium select-none"
              >
                <Camera className="w-5 h-5" />
                گرفتن عکس
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}