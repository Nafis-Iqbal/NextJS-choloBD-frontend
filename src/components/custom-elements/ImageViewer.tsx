"use client";

import { NextImage } from "./UIUtilities";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface ImageProps {
  imageURL: string;
  imageAlt?: string;
}

export const ImageViewer = ({ imageList }: { imageList: ImageProps[] }) => {
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

  // Animation variants
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
    <div className="flex flex-col w-full md:w-[40%] p-2 overflow-hidden bg-gray-700 border-green-800 border-1">
        <div className="flex p-2 bg-gray-500">
            <div className="relative w-full h-[250px] md:h-[400px]">
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
                        className="absolute w-full h-full"
                    >
                        <NextImage
                        className="w-full h-full object-contain" src={imageURLsList[displayedImageId]?.imageURL ?? "/CPUPIC.webp"} 
                        alt={imageURLsList[displayedImageId]?.imageAlt ?? "Some stuff about the pic."}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      

        <div className="flex justify-between mt-4">
            <button className="p-2 ml-2" onClick={showPreviousImage}>
                <FaAngleDoubleLeft className="text-4xl text-green-500 hover:text-green-400" />
            </button>

            <button className="p-2 mr-2" onClick={showNextImage}>
                <FaAngleDoubleRight className="text-right text-4xl text-green-500 hover:text-green-400" />
            </button>
        </div>
    </div>
  );
};
