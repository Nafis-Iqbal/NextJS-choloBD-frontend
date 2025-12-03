/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import ReactDOM from "react-dom";

const LoadingModal: React.FC = () => {
  const isOpen = useSelector((state: any) => state.popUps.isLoading);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed z-55 inset-0 flex items-center justify-center bg-gray-100/50 backdrop-blur-md">
      {/* Prevents interaction with background elements */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gray-600 p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4 font-sans"
      >
        {/* Loading Animation */}
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        />

        {/* Loading Text */}
        <p className="text-lg font-semibold">Loading...</p>
        <p className="text-gray-600">Plz wait</p>
      </motion.div>
    </div>
  , document.body);
};

export default LoadingModal;
