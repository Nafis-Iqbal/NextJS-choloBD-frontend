"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface RatingInputModalProps {
    isVisible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    setRating: React.Dispatch<React.SetStateAction<number>>;
}

const RatingInputModal = ({
    isVisible,
    message,
    onConfirm,
    onCancel,
    setRating,
}: RatingInputModalProps) => {
    const [hovered, setHovered] = useState<number | null>(null);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const handleStarClick = (star: number) => {
        setSelectedRating(star);
        setRating(star);
    };

    const handleMouseEnter = (star: number) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHovered(star);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setHovered(null);
        }, 1500); // 1.5s delay
    };

    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed z-60 inset-0 flex items-center justify-center font-sans"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            onClick={onCancel}
        >
            <motion.div
                className="p-5 rounded-md shadow-lg md:w-120 text-center border-x-2 border-b-4"
                style={{
                    backgroundColor: "var(--theme-card-bg)",
                    borderColor: "var(--theme-deep-green)",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
            >
                <p
                    className="text-lg mb-4 font-semibold"
                    style={{ color: "var(--theme-text)" }}
                >
                    {message}
                </p>

                {/* ⭐ Star Selector */}
                <div className="flex justify-center mb-6 space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const isHighlighted = hovered !== null
                            ? star <= hovered
                            : star <= selectedRating;

                        return (
                            <button
                                key={star}
                                onClick={() => handleStarClick(star)}
                                onMouseEnter={() => handleMouseEnter(star)}
                                onMouseLeave={handleMouseLeave}
                                className="transition"
                                type="button"
                            >
                                <Star
                                    size={32}
                                    style={{
                                        color: isHighlighted
                                            ? "var(--theme-star)"
                                            : "var(--theme-text-subtle)",
                                    }}
                                    fill={isHighlighted ? "currentColor" : "none"}
                                />
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        type="button"
                        className="px-4 py-2 text-white rounded-sm font-medium transition-colors"
                        style={{
                            backgroundColor: "var(--theme-teal)",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                                "var(--theme-teal-hover)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                                "var(--theme-teal)")
                        }
                        onClick={onConfirm}
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 text-white rounded-sm font-medium transition-colors"
                        style={{
                            backgroundColor: "var(--theme-text-muted)",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                                "var(--theme-text)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                                "var(--theme-text-muted)")
                        }
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default RatingInputModal;
