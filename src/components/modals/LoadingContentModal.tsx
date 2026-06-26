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
    <div className="fixed z-55 inset-0 flex items-center justify-center backdrop-blur-md" style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}>
      {/* Prevents interaction with background elements */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4 font-sans"
        style={{ backgroundColor: "var(--theme-section-bg)" }}
      >
        {/* Loading Animation */}
        <motion.div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--theme-teal)", borderTopColor: "transparent" }}
        />

        {/* Loading Text */}
        <p className="text-lg font-semibold" style={{ color: "var(--theme-text)" }}>Loading...</p>
        <p style={{ color: "var(--theme-text-muted)" }}>Plz wait</p>
      </motion.div>
    </div>
  , document.body);
};

export default LoadingModal;
