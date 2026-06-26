"use client";

import React from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";

interface ConfirmationModalProps {
    isVisible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel } : ConfirmationModalProps) => {

    if(!isVisible) return <></>;

    return ReactDOM.createPortal(
        <div
            className="fixed z-60 inset-0 flex items-center justify-center font-sans"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={onCancel} // Close modal when clicking outside
        >
            <motion.div
                className="p-5 rounded-md shadow-lg md:w-120 text-center"
                style={{
                    backgroundColor: "var(--theme-section-bg)",
                    borderLeft: "2px solid var(--theme-deep-green)",
                    borderRight: "2px solid var(--theme-deep-green)",
                    borderBottom: "4px solid var(--theme-deep-green)",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <p className="text-lg" style={{ color: "var(--theme-text)" }}>{message}</p>
                <div className="mt-6 flex justify-center space-x-4">
                    <button
                        className="px-4 py-2 text-white rounded"
                        style={{
                            backgroundColor: "var(--theme-teal)",
                            transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--theme-teal-hover)";
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--theme-teal)";
                        }}
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                    <button
                        className="px-4 py-2 disabled:cursor-not-allowed rounded-sm font-medium"
                        style={{
                            backgroundColor: "var(--theme-text-muted)",
                            color: "white",
                            transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--theme-text-subtle)";
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--theme-text-muted)";
                        }}
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

export default ConfirmationModal;
