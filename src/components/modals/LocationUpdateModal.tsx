"use client";

import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { LocationForm } from "../forms/LocationForm";

interface LocationUpdateModalProps {
    isVisible: boolean;
    mode: "create" | "edit";
    location_id?: string;
    onCancel: () => void;
}

const LocationUpdateModal: React.FC<LocationUpdateModalProps> = ({ 
    isVisible, 
    mode,
    location_id,
    onCancel
}) => {
    const isMouseDownInside = useRef(false);

    if (!isVisible) return null;

    const handleBackdropMouseDown = () => {
        isMouseDownInside.current = false;
    };

    const handleModalMouseDown = (e: React.MouseEvent) => {
        isMouseDownInside.current = true;
        e.stopPropagation();
    };

    const handleBackdropClick = () => {
        if (!isMouseDownInside.current) {
            onCancel();
        }
    };

    return ReactDOM.createPortal(
        <div
            className="fixed z-60 inset-0 flex items-center justify-center backdrop-blur-sm font-sans"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            onMouseDown={handleBackdropMouseDown}
            onClick={handleBackdropClick}
        >
            <motion.div
                className="theme-card rounded-md shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onMouseDown={handleModalMouseDown}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold theme-text">
                            {mode === "create" ? "Add Location" : "Update Location"}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="theme-text-muted hover:theme-text text-2xl transition-colors duration-150"
                        >
                            ×
                        </button>
                    </div>
                    <LocationForm
                        mode={mode}
                        location_id={location_id}
                        onCancel={() => onCancel()}
                    />
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default LocationUpdateModal;