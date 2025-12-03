"use client";

import React from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { AddressForm } from "../forms/AddressForm";

interface AddressModalProps {
    isVisible: boolean;
    address?: Partial<Address>;
    onSubmit: (addressData: Partial<Address>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const AddressUpdateModal: React.FC<AddressModalProps> = ({ 
    isVisible, 
    address, 
    onSubmit, 
    onCancel, 
    isLoading = false 
}) => {
    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed z-60 inset-0 flex items-center justify-center bg-black/50 font-sans"
            onClick={onCancel} // Close modal when clicking outside
        >
            <motion.div
                className="bg-gray-800 rounded-md shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <AddressForm
                    address={address}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    isLoading={isLoading}
                    submitButtonText={address?.id ? "Update Address" : "Add Address"}
                />
            </motion.div>
        </div>,
        document.body
    );
};

export default AddressUpdateModal;
