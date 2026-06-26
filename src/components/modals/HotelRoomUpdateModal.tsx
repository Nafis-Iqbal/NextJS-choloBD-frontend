"use client";

import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { HotelRoomTypeForm } from "../forms/HotelRoomTypeForm";

interface HotelRoomUpdateModalProps {
    isVisible: boolean;
    mode: "create" | "edit";
    hotelId: string;
    roomTypeId?: string;
    onCancel: () => void;
}

const HotelRoomUpdateModal: React.FC<HotelRoomUpdateModalProps> = ({
    isVisible,
    mode,
    hotelId,
    roomTypeId,
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
            className="fixed z-60 inset-0 flex items-center justify-center font-sans"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onMouseDown={handleBackdropMouseDown}
            onClick={handleBackdropClick}
        >
            <motion.div
                className="rounded-md shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                style={{
                    backgroundColor: "var(--theme-section-bg)",
                    borderColor: "var(--theme-deep-green)",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onMouseDown={handleModalMouseDown}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold" style={{ color: "var(--theme-text)" }}>
                            {mode === "create" ? "Add Hotel Room" : "Update Hotel Room"}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-2xl"
                            style={{
                                color: "var(--theme-text-subtle)",
                                transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.color = "var(--theme-text)";
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.color = "var(--theme-text-subtle)";
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <HotelRoomTypeForm
                        mode={mode}
                        hotelId={hotelId}
                        roomTypeId={roomTypeId}
                        onCancel={() => onCancel()}
                    />
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default HotelRoomUpdateModal;
