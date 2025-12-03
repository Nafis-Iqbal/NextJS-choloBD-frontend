import React from "react";
import { motion } from "framer-motion";

const LoadingSpinnerDiv: React.FC<{customStyle?: string}> = ({customStyle = ""}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[30px] space-y-2 mt-2 mb-2 ${customStyle}`}>
      {/* Rotating Circular Orb */}
      <motion.div
        className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />

      {/* Loading Text with Animated Dots */}
      <motion.div
        className="text-lg font-semibold text-gray-700 flex"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        Loading ...
      </motion.div>
    </div>
  );
};

export default LoadingSpinnerDiv;
