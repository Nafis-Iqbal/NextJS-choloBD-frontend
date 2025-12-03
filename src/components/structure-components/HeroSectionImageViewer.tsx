/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { NextImage } from "../custom-elements/UIUtilities";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface ImageProps {
    imageURL: string;
    imageAlt?: string;
}

export const HeroSectionImageViewer = ({ className, imageList }: { className?: string; imageList: ImageProps[] }) => {
    const [displayedImageId, setDisplayedImageId] = useState<number>(0);
    const [direction, setDirection] = useState<"next" | "prev">("next");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
    const isFullyInView = useInView(heroRef, { amount: 1 });

    const startAutoSlide = () => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (!isFullyInView) return;

        timerRef.current = setInterval(() => {
            setDirection("next");
            setDisplayedImageId((prev) => (prev + 1) % imageList.length);
        }, 5000);
    };

    useEffect(() => {
        startAutoSlide();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [imageList.length, isFullyInView]);

    const showNextImage = () => {
        setDirection("next");
        setDisplayedImageId((prev) => (prev + 1) % imageList.length);
        startAutoSlide();
    };

    const showPreviousImage = () => {
        setDirection("prev");
        setDisplayedImageId((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
        startAutoSlide();
    };

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
        <div className={`relative w-full h-[40vh] md:h-[60vh] overflow-hidden bg-black ${className ?? ""}`}>
            <motion.div
                ref={heroRef}
                style={{ scale }}
                className="absolute w-full h-full"
            >
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                        key={displayedImageId}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        className="w-full h-full"
                    >
                        <NextImage
                            className="w-full h-full object-cover"
                            src={imageList[displayedImageId]?.imageURL ?? "/image-not-found.png"}
                            alt={imageList[displayedImageId]?.imageAlt ?? "Hero image"}
                            priority={true}
                        />
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            <button
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/40 rounded-full hover:bg-black/60"
                onClick={showPreviousImage}
            >
                <FaAngleDoubleLeft className="text-2xl md:text-3xl text-white" />
            </button>

            <button
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/40 rounded-full hover:bg-black/60"
                onClick={showNextImage}
            >
                <FaAngleDoubleRight className="text-2xl md:text-3xl text-white" />
            </button>
        </div>
    );
};
