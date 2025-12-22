import { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Sofa, Armchair, Bed, UtensilsCrossed, Sparkles } from "lucide-react";
import { useAnimationPreference } from "../hooks/useAnimationPreference";
import type { RoomType, StylePreference, DiscoveryRequest } from "../types/discovery";
import { ROOM_TYPE_OPTIONS, STYLE_OPTIONS } from "../types/discovery";

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
    const [selectedRoomType, setSelectedRoomType] = useState<RoomType>("reception");
    const [selectedStyle, setSelectedStyle] = useState<StylePreference>("classic");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const backgroundImage = "/images/discovery-banner.jpg";

    // Icons Helper
    const getRoomIcon = (iconName: string, isSelected: boolean) => {
        const className = `w-4 h-4 ${isSelected ? "text-white" : "text-gray-600"}`;
        switch (iconName) {
            case "Sofa": return <Sofa className={className} />;
            case "Armchair": return <Armchair className={className} />;
            case "Bed": return <Bed className={className} />;
            case "UtensilsCrossed": return <UtensilsCrossed className={className} />;
            default: return <Sofa className={className} />;
        }
    };

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
                roomType: selectedRoomType,
                style: selectedStyle,
                shopId: shopContext?.id,
            });
        }
    }, [onUpload, selectedRoomType, selectedStyle, shopContext]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onUpload({
                image: selectedFile,
                roomType: selectedRoomType,
                style: selectedStyle,
                shopId: shopContext?.id,
            });
        }
        e.target.value = "";
    }, [onUpload, selectedRoomType, selectedStyle, shopContext]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen bg-white font-sans text-right" dir="rtl">

            {/* HERO SECTION WITH BACKGROUND */}
            <div className="relative">
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
                <div className="relative z-10 px-4 md:px-8 pt-6 pb-8">
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
                        className="max-w-4xl mx-auto"
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
                </div>
            </div>

            {/* FILTER SECTION - Flat white area below hero */}
            <motion.div
                initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white px-4 md:px-8 py-6"
            >
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Row 1: Room Type */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Sofa className="w-5 h-5" />
                            <span className="font-bold text-base">نوع اتاق</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {ROOM_TYPE_OPTIONS.map((option) => {
                                const isSelected = selectedRoomType === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedRoomType(option.id)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                            transition-all duration-200 border
                                            ${isSelected
                                                ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                                                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"}
                                        `}
                                    >
                                        {getRoomIcon(option.icon, isSelected)}
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Row 2: Style */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-800">
                            <div className="w-4 h-4 rounded bg-gray-400" />
                            <span className="font-bold text-base">سبک مورد علاقه</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {STYLE_OPTIONS.map((option) => {
                                const isSelected = selectedStyle === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedStyle(option.id)}
                                        className={`
                                            px-5 py-2 rounded-full text-sm font-medium
                                            transition-all duration-200 border
                                            ${isSelected
                                                ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                                                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"}
                                        `}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </motion.div>

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
