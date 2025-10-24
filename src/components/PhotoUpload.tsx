import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { motion } from "motion/react";
import { Upload, Camera } from "lucide-react";
import { Header } from "./Header";

interface PhotoUploadProps {
  onUploadComplete: (file: File) => void;
  onBack: () => void;
}

export function PhotoUpload({ onUploadComplete, onBack }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "image/jpeg" || droppedFile.type === "image/png")) {
      // Immediately pass to parent for precheck
      onUploadComplete(droppedFile);
    }
  }, [onUploadComplete]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Immediately pass to parent for precheck
      onUploadComplete(selectedFile);
    }
  }, [onUploadComplete]);

  const simulateUpload = (uploadedFile: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsProcessing(true);
          
          setTimeout(() => {
            setIsProcessing(false);
            onUploadComplete(uploadedFile);
          }, 1500);
          
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onBack={onBack} />

      <div className="pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto px-6 py-6"
        >
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
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="block">
              <Button
                asChild
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors cursor-pointer"
              >
                <span>انتخاب فایل</span>
              </Button>
            </label>

            {/* Mobile Camera */}
            <div className="md:hidden">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="camera-upload"
              />
              <label htmlFor="camera-upload" className="block">
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-14 border-gray-300 text-gray-900 hover:bg-gray-50 rounded-full cursor-pointer"
                >
                  <span className="flex items-center gap-2 justify-center">
                    <Camera className="w-5 h-5" />
                    گرفتن عکس
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}