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
            className="fixed z-60 inset-0 flex items-center justify-center bg-gray-100/50 font-sans"
            onClick={onCancel} // Close modal when clicking outside
        >
            <motion.div
                className="p-5 rounded-md shadow-lg md:w-120 text-center border-x-2 border-b-4"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <p className="text-lg text-green-300">{message}</p>
                <div className="mt-6 flex justify-center space-x-4">
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-sm font-medium"
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
