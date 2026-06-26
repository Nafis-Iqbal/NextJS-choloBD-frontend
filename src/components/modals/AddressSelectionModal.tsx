"use client";

import React from "react";
import { AddressDataBlock } from "../data-elements/DataTableRowElements";

interface AddressSelectionModalProps {
    isVisible: boolean;
    addresses: Address[];
    onSelect: ({ id, address }: { id: string; address: Address; }) => void
    onCancel: () => void;
    selectedAddressId: string;
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({
    isVisible,
    addresses,
    onSelect,
    onCancel,
    selectedAddressId
}) => {
    if (!isVisible) return null;

    return (
        <div className="fixed z-60 inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
            onClick={onCancel} // Close modal when clicking outside
        >
            <div className="theme-card rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: 'var(--theme-deep-green)' }}>
                    <h2 className="text-xl font-semibold theme-text">Select Address</h2>
                    <button
                        onClick={onCancel}
                        className="theme-text-muted hover:theme-text transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {addresses.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="theme-text-subtle">No addresses available.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <AddressDataBlock
                                    addressSelectMode={true}
                                    key={address.id}
                                    AddressInfo={address}
                                    selectedAddressId={selectedAddressId}
                                    onChangeDefault={() => onSelect({ id: address.id, address })}
                                    showActions={false}
                                    className="w-full theme-outline hover:theme-outline-teal transition-colors cursor-pointer"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t" style={{ borderColor: 'var(--theme-deep-green)' }}>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 theme-text rounded-md transition-colors"
                        style={{ backgroundColor: 'var(--theme-deep-green)', color: 'white' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-teal)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-deep-green)'}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressSelectionModal;