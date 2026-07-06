"use client";

import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ImageViewerModule } from "../modular-components/ImageViewerModule";

interface ImageProps {
    imageURL: string;
    videoURL?: string;
    imageAlt?: string;
    imageStyle?: string;
}

interface CommunityPostDetailModalProps {
    isVisible: boolean;
    caption: string;
    images: Image[];
    onCancel: () => void;
}

const CommunityPostDetailModal: React.FC<CommunityPostDetailModalProps> = ({
    isVisible,
    caption,
    images,
    onCancel
}) => {
    const isMouseDownInside = useRef(false);

    if (!isVisible) return null;

    // Transform images to match ImageProps format
    const normalizedImages: ImageProps[] = (images || []).map((img: Image) => ({
        imageURL: img.url || "",
    })).filter((img: ImageProps) => img.imageURL);

    const handleBackdropMouseDown = () => {
        isMouseDownInside.current = false;
    };

    const handleModalMouseDown = (e: React.MouseEvent) => {
        isMouseDownInside.current = true;
        e.stopPropagation();
    };

    const handleBackdropClick = () => {
        if (!isMouseDownInside.current) {
            onCancel();
        }
    };

    return ReactDOM.createPortal(
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    className="fixed z-60 inset-0 flex items-center justify-center font-sans px-4 py-6"
                    style={{ 
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseDown={handleBackdropMouseDown}
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        className="rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden relative"
                        style={{
                            backgroundColor: "var(--theme-section-bg)",
                            border: "1px solid var(--theme-border)",
                        }}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ 
                            duration: 0.3, 
                            ease: [0.4, 0, 0.2, 1]
                        }}
                        onMouseDown={handleModalMouseDown}
                    >
                        {/* Header with gradient accent */}
                        <div 
                            className="sticky top-0 z-10 px-6 py-5 border-b backdrop-blur-sm"
                            style={{
                                backgroundColor: "var(--theme-section-bg)",
                                borderColor: "var(--theme-border)",
                            }}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div 
                                            className="w-1 h-6 rounded-full"
                                            style={{ backgroundColor: "var(--theme-deep-green)" }}
                                        />
                                        <h2 
                                            className="text-2xl font-bold tracking-tight" 
                                            style={{ color: "var(--theme-text)" }}
                                        >
                                            Post Details
                                        </h2>
                                    </div>
                                    <p 
                                        className="text-sm ml-7 mt-1"
                                        style={{ color: "var(--theme-text-subtle)" }}
                                    >
                                        View post content and media
                                    </p>
                                </div>
                                <motion.button
                                    onClick={onCancel}
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                    style={{
                                        backgroundColor: "transparent",
                                        color: "var(--theme-text-subtle)",
                                    }}
                                    whileHover={{ 
                                        scale: 1.05,
                                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Close modal"
                                >
                                    <svg 
                                        width="24" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-130px)] px-6 py-6">
                            {/* Caption Section */}
                            <motion.div 
                                className="mb-8 pb-8 border-b"
                                style={{ borderColor: "var(--theme-border)" }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <svg 
                                        width="18" 
                                        height="18" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        style={{ color: "var(--theme-deep-green)" }}
                                    >
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <h3 
                                        className="text-xs font-semibold uppercase tracking-wider" 
                                        style={{ color: "var(--theme-text-subtle)" }}
                                    >
                                        Caption
                                    </h3>
                                </div>
                                <div 
                                    className="overflow-y-auto max-h-32 pr-2"
                                    style={{
                                        scrollbarWidth: "thin",
                                    }}
                                >
                                    <p 
                                        className="text-base leading-relaxed whitespace-pre-wrap" 
                                        style={{ color: "var(--theme-text)" }}
                                    >
                                        {caption || "No caption provided"}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Image Viewer Section */}
                            <motion.div 
                                className="mb-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <svg 
                                        width="18" 
                                        height="18" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        style={{ color: "var(--theme-deep-green)" }}
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                    <h3 
                                        className="text-xs font-semibold uppercase tracking-wider" 
                                        style={{ color: "var(--theme-text-subtle)" }}
                                    >
                                        Media ({normalizedImages.length})
                                    </h3>
                                </div>
                                <div 
                                    className="rounded-xl overflow-hidden border shadow-inner"
                                    style={{ 
                                        borderColor: "var(--theme-border)",
                                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                                    }}
                                >
                                    <ImageViewerModule
                                        imageList={normalizedImages}
                                        className="h-96"
                                        imagePlacementStyle="object-cover"
                                    />
                                </div>
                            </motion.div>
                            
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CommunityPostDetailModal;
