"use client";

import React from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { CategoryForm } from "../forms/CategoryForm";

interface CategoryUpdateModalProps {
    isVisible: boolean;
    mode: "create" | "edit";
    category_id?: string;
    onCancel: () => void;
}

const CategoryUpdateModal: React.FC<CategoryUpdateModalProps> = ({ 
    isVisible, 
    mode,
    category_id,
    onCancel
}) => {
    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed z-60 inset-0 flex items-center justify-center font-sans"
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onClick={onCancel} // Close modal when clicking outside
        >
            <motion.div
                className="rounded-md shadow-lg max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                style={{
                    backgroundColor: "var(--theme-section-bg)",
                    color: "var(--theme-text)",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold" style={{ color: "var(--theme-text)" }}>
                            {mode === "create" ? "Add Category" : "Update Category"}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-2xl hover:opacity-70 transition-opacity"
                            style={{ color: "var(--theme-text-muted)" }}
                        >
                            ×
                        </button>
                    </div>
                    <CategoryForm
                        mode={mode}
                        category_id={category_id}
                        onCancel={() => onCancel()}
                    />
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default CategoryUpdateModal;
