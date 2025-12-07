"use client";

import React from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { LocationForm } from "../forms/LocationForm";

interface LocationUpdateModalProps {
    isVisible: boolean;
    mode: "create" | "edit";
    locationData?: Partial<Location>;
    location_id?: string;
    onCancel: () => void;
}

const LocationUpdateModal: React.FC<LocationUpdateModalProps> = ({ 
    isVisible, 
    mode,
    locationData, 
    location_id,
    onCancel
}) => {
    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed z-60 inset-0 flex items-center justify-center bg-black/50 font-sans"
            onClick={onCancel} // Close modal when clicking outside
        >
            <motion.div
                className="bg-gray-800 rounded-md shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">
                            {mode === "create" ? "Add Location" : "Update Location"}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    <LocationForm
                        mode={mode}
                        location_id={location_id}
                    />
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default LocationUpdateModal;