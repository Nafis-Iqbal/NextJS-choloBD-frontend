"use client";

import { ReactNode, useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NextImage } from "../custom-elements/UIUtilities";

interface ImageProps {
    imageURL: string;
    imageAlt?: string;
    imageText?: ReactNode;
    imageStyle?: string;
}

export const HeroSectionFull = ({ 
    className, 
    imageList, 
    titleText, 
    titleTextStyle 
}: { 
    imageList: ImageProps[], 
    className?: string, 
    titleText?: string,
    titleTextStyle?: string 
}) => {
    // Auto-rotation delay in milliseconds - configurable variable
    const AUTO_ROTATION_DELAY = 7000; // 5 seconds
    
    const [imageURLsList, setImageURLsList] = useState<ImageProps[]>(imageList);
    const [displayedImageId, setDisplayedImageId] = useState<number>(0);
    const [direction, setDirection] = useState<"next" | "prev">("next");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const resetAutoRotationTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
            setDisplayedImageId(prevId => {
                const nextId = prevId === imageList.length - 1 ? 0 : prevId + 1;
                setDirection(prevId === imageList.length - 1 ? "next" : "next");
                return nextId;
            });
        }, AUTO_ROTATION_DELAY);
    }, [imageList.length, AUTO_ROTATION_DELAY]);

    useEffect(() => {
        resetAutoRotationTimer();
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [resetAutoRotationTimer]);

    const showPreviousImage = () => {
        if (displayedImageId > 0) {
            setDirection("prev");
            setDisplayedImageId(displayedImageId - 1);
        }
        resetAutoRotationTimer(); 
    };

    const showNextImage = () => {
        if (displayedImageId < imageList.length - 1) {
            setDirection("next");
            setDisplayedImageId(displayedImageId + 1);
        }
        resetAutoRotationTimer(); 
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
        <div id="hero" className={`flex flex-col w-full bg-gray-700 ${className ? className : 'h-full'}`}>
            <div className="relative flex flex-1 bg-black">
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
                            <NextImage
                                className="w-full h-full min-h-[300px]"
                                nextImageClassName={imageURLsList[displayedImageId]?.imageStyle ?? `object-cover object-top`} 
                                src={imageURLsList[displayedImageId]?.imageURL ?? "/404E.jpg"} 
                                alt={imageURLsList[displayedImageId]?.imageAlt ?? "Some stuff about the pic."}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Title Text - positioned at bottom left of image area */}
                {titleText && (
                    <h1 className={`${titleTextStyle} absolute bottom-5 md:bottom-20 left-5 md:left-40 text-3xl md:text-5xl font-bold drop-shadow-lg`}>
                        {titleText}
                    </h1>
                )}

                {/* Image Selection Dots - positioned at bottom center of image area */}
                {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 px-3 py-2 rounded-full">
                    {imageList.map((_, index) => (
                        <button
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === displayedImageId 
                                    ? 'bg-emerald-500 scale-125' 
                                    : 'bg-gray-400 hover:bg-gray-300 hover:scale-110'
                            }`}
                            onClick={() => {
                                setDirection(index > displayedImageId ? "next" : "prev");
                                setDisplayedImageId(index);
                                resetAutoRotationTimer(); // Reset timer when user clicks dot
                            }}
                        />
                    ))}
                </div> */}
            </div>
        </div>
    );
};
