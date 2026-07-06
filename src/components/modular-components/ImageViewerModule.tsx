"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NextImage } from "../custom-elements/UIUtilities";

interface ImageProps {
    imageURL: string;
    videoURL?: string;
    imageAlt?: string;
    imageStyle?: string;
}

// Helper function to detect and convert YouTube URLs to embed format
const getYouTubeEmbedUrl = (url: string): string | null => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
};

// Helper function to check if URL is a video (YouTube or other video URLs)
const isVideoUrl = (url: string): boolean => {
    return getYouTubeEmbedUrl(url) !== null || url.includes('youtube.com') || url.includes('youtu.be');
};

export const ImageViewerModule = ({ 
    className, 
    imageList, 
    imagePlacementStyle = "object-top" 
}: { 
    imageList: ImageProps[], 
    className?: string, 
    imagePlacementStyle?: string 
}) => {
    const [imageURLsList, setImageURLsList] = useState<ImageProps[]>(imageList);
    const [displayedImageId, setDisplayedImageId] = useState<number>(0);
    const [direction, setDirection] = useState<"next" | "prev">("next");


    const showPreviousImage = () => {
        if (displayedImageId > 0) {
            setDirection("prev");
            setDisplayedImageId(displayedImageId - 1);
        }
    };

    const showNextImage = () => {
        if (displayedImageId < imageList.length - 1) {
            setDirection("next");
            setDisplayedImageId(displayedImageId + 1);
        }
    };
        
    useEffect(() => {
        setImageURLsList(imageList);
    }, [imageList]);

    const variants = {
        enter: (direction: "next" | "prev") => ({
            x: direction === "next" ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: "next" | "prev") => ({
            x: direction === "next" ? -300 : 300,
            opacity: 0,
        }),
    };

    return (
        <div className={`flex flex-col w-full ${className ? className : 'h-full'}`} style={{ backgroundColor: 'var(--theme-section-bg)' }}>
            <div className="relative flex flex-1" style={{ backgroundColor: 'var(--theme-bg)' }}>
                {imageList.length > 0 ? (
                    <div className="relative w-full h-full">
                        <AnimatePresence custom={direction}>
                            <motion.div
                                key={displayedImageId} // Ensures animation on change
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                }}
                                className="absolute w-full h-full flex flex-col md:flex-row"
                            >
                                {/* Conditionally render iframe for videos or NextImage for images */}
                                {(() => {
                                    const currentItem = imageURLsList[displayedImageId];
                                    const videoUrl = currentItem?.videoURL || currentItem?.imageURL;
                                    
                                    // Check if it's a video URL
                                    if (videoUrl && isVideoUrl(videoUrl)) {
                                        const embedUrl = getYouTubeEmbedUrl(videoUrl);
                                        return (
                                            <iframe
                                                className="w-full h-full"
                                                src={embedUrl || videoUrl}
                                                title={currentItem?.imageAlt || "Video content"}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        );
                                    } else {
                                        // Render image for non-video content
                                        return (
                                            <NextImage
                                                className="w-full h-full"
                                                nextImageClassName={currentItem?.imageStyle ?? `object-cover ${imagePlacementStyle}`} 
                                                src={currentItem?.imageURL ?? "/no-image.jpg"} 
                                                alt={currentItem?.imageAlt ?? "Some stuff about the pic."}
                                            />
                                        );
                                    }
                                })()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons - positioned relative to image area */}
                        <button 
                            className="absolute top-1/2 left-4 transform -translate-y-1/2 p-3 text-white rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                            style={{ 
                                backgroundColor: 'var(--theme-card-bg)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-teal)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)'}
                            onClick={showPreviousImage}
                            hidden={displayedImageId === 0}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button 
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 p-3 text-white rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                            style={{ 
                                backgroundColor: 'var(--theme-card-bg)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-teal)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)'}
                            onClick={showNextImage}
                            hidden={displayedImageId === imageList.length - 1}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
                        <div className="absolute w-full h-full flex flex-col md:flex-row">
                            <NextImage
                                className="w-full h-full"
                                nextImageClassName={`object-cover object-top`} 
                                src={"/no-image.jpg"} 
                                alt={"No content available"}
                            />
                        </div>
                    </div>
                )}

                {/* Image Selection Dots - positioned at bottom center of image area */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 px-3 py-2 rounded-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    {imageList.map((_, index) => (
                        <button
                            key={index}
                            className="w-3 h-3 rounded-full transition-all duration-300 hover:scale-110"
                            style={{
                                backgroundColor: index === displayedImageId ? 'var(--theme-teal)' : 'var(--theme-text-subtle)',
                                transform: index === displayedImageId ? 'scale(1.25)' : 'scale(1)',
                            }}
                            onClick={() => {
                                setDirection(index > displayedImageId ? "next" : "prev");
                                setDisplayedImageId(index);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
