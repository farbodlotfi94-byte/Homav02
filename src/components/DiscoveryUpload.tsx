import { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useAnimationPreference } from "../hooks/useAnimationPreference";
import type { DiscoveryRequest } from "../types/discovery";

interface DiscoveryUploadProps {
    onUpload: (request: DiscoveryRequest) => void;
    onBack: () => void;
    shopContext?: { name: string; id: string };
}

export function DiscoveryUpload({
    onUpload,
    onBack,
    shopContext,
}: DiscoveryUploadProps) {
    const shouldAnimate = useAnimationPreference();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const backgroundImage = "/images/discovery-banner.jpg";

    // Drag & Drop Handlers
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
        if (droppedFile && droppedFile.type.startsWith("image/")) {
            onUpload({
                image: droppedFile,
                shopId: shopContext?.id,
            });
        }
    }, [onUpload, shopContext]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onUpload({
                image: selectedFile,
                shopId: shopContext?.id,
            });
        }
        e.target.value = "";
    }, [onUpload, shopContext]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen bg-white font-sans text-right" dir="rtl">

            {/* HERO SECTION WITH BACKGROUND */}
            <div className="relative min-h-[60vh] flex flex-col">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={backgroundImage}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* Hero Content */}
                <div className="relative z-[1] px-4 md:px-8 pt-6 pb-8 flex-1 flex flex-col justify-center">
                    {/* Header Text */}
                    <motion.div
                        initial={shouldAnimate ? { opacity: 0, y: -20 } : false}
                        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-6"
                    >
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            عکس اتاقت رو آپلود کن
                        </h1>
                        <p className="text-base text-white/90 flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            هوش مصنوعی بهترین محصولات رو برات پیدا می‌گنه
                        </p>
                    </motion.div>

                    {/* Upload Zone - Large dashed border area */}
                    <motion.div
                        initial={shouldAnimate ? { opacity: 0, scale: 0.98 } : false}
                        animate={shouldAnimate ? { opacity: 1, scale: 1 } : false}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-4xl mx-auto w-full"
                    >
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

                        <div
                            onClick={handleUploadClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                w-full py-16 md:py-20
                                border-2 border-dashed border-white/70
                                transition-all duration-300 cursor-pointer
                                flex flex-col items-center justify-center
                                ${isDragging ? "border-white bg-white/10" : "hover:border-white hover:bg-white/5"}
                            `}
                        >
                            {/* Circular camera icon */}
                            <div className="w-16 h-16 rounded-full border-2 border-white/70 flex items-center justify-center mb-4">
                                <Camera className="w-7 h-7 text-white" />
                            </div>
                            <p className="text-white text-base">
                                برای آپلود بکش و رها کن یا کلیک کن
                            </p>
                        </div>
                    </motion.div>

                    {/* Info text below upload zone */}
                    <motion.div
                        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="max-w-2xl mx-auto mt-6 text-center"
                    >
                        <p className="text-white/80 text-sm">
                            بعد از آپلود، هوش مصنوعی اتاقت رو تحلیل می‌کنه و چند سوال می‌پرسه تا بهترین پیشنهادات رو بهت بده
                        </p>
                    </motion.div>
                </div>
            </div>

        </div>
    );
}

// Camera Icon component
function Camera({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={className}
        >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
        </svg>
    );
}
