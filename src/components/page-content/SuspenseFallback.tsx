"use client";

import { motion } from "framer-motion";

interface SuspenseFallbackProps {
    loadingText?: string;
}

export default function SuspenseFallback({ loadingText = "content" }: SuspenseFallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] md:min-h-[400px] bg-gray-800 text-white font-sans">
            {/* Simple Spinner */}
            <motion.div
                className="w-8 h-8 md:w-12 md:h-12 border-4 border-gray-700 border-t-[#00FF99] rounded-full mb-4"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Loading Text with Animated Dots */}
            <div className="flex items-center">
                <span className="text-sm md:text-lg text-gray-300">
                    Loading {loadingText}
                </span>
                <motion.div 
                    className="flex ml-1"
                    animate={{
                        transition: {
                            staggerChildren: 0.3,
                            repeat: Infinity
                        }
                    }}
                >
                    {[1, 2, 3].map((dot) => (
                        <motion.span
                            key={dot}
                            className="text-[#00FF99] text-sm md:text-lg font-bold"
                            animate={{
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 0.9,
                                repeat: Infinity,
                                delay: dot * 0.3
                            }}
                        >
                            .
                        </motion.span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}