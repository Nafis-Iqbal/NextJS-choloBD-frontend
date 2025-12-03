"use client";

import React, { useState, useEffect } from "react";
import { createAddressSchema } from "../../validators/addressValidators";

import { CustomTextInput } from "../custom-elements/CustomInputElements";

const defaultAddressFormData: Partial<Address> = {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: ""
};

interface AddressFormProps {
    address?: Partial<Address>;
    onSubmit: (addressData: Partial<Address>) => void;
    onCancel: () => void;
    isLoading?: boolean;
    submitButtonText?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({
    address,
    onSubmit,
    onCancel,
    isLoading = false,
    submitButtonText = "Save Address"
}) => {
    const [addressFormData, setAddressFormData] = useState<Partial<Address>>(defaultAddressFormData);

    const [errors, setErrors] = useState<Partial<Address>>({});

    // Populate form with existing address data if editing
    useEffect(() => {
        if (address) {
            setAddressFormData({
                addressLine1: address.addressLine1 || "",
                addressLine2: address.addressLine2 || "",
                city: address.city || "",
                state: address.state || "",
                postalCode: address.postalCode || "",
                country: address.country || "",
                phoneNumber: address.phoneNumber || ""
            });
        }
    }, [address]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setAddressFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        
        const updatedData = { ...addressFormData, [name]: value };
        
        const result = createAddressSchema.safeParse(updatedData);
        if (!result.success) {
            const key = name as keyof typeof result.error.formErrors.fieldErrors;
            const fieldError = result.error.formErrors.fieldErrors[key]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const onProductFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = createAddressSchema.safeParse(addressFormData);
        if(result.success === true){
            onSubmit(addressFormData);
        }
    }

    return (
        <div className="flex flex-col space-y-4 p-6 bg-gray-800 rounded-md">
            <h2 className="text-xl text-green-400 font-semibold">
                {address?.id ? "Edit Address" : "Add New Address"}
            </h2>
            
            <form onSubmit={onProductFormSubmit} className="flex flex-col space-y-4">
                <CustomTextInput
                    type="text"
                    name="addressLine1"
                    label="Address Line 1 *"
                    labelStyle="text-green-300 text-sm"
                    placeholderText="Street address, P.O. box, company name, c/o"
                    value={addressFormData.addressLine1}
                    onChange={handleChange}
                    error={errors.addressLine1}
                    className="w-full"
                />

                <CustomTextInput
                    type="text"
                    name="addressLine2"
                    label="Address Line 2 (Optional)"
                    labelStyle="text-green-300 text-sm"
                    placeholderText="Apartment, suite, unit, building, floor, etc."
                    value={addressFormData.addressLine2}
                    onChange={handleChange}
                    className="w-full"
                />

                <div className="grid grid-cols-2 gap-4">
                    <CustomTextInput
                        type="text"
                        name="city"
                        label="City *"
                        labelStyle="text-green-300 text-sm"
                        placeholderText="City"
                        value={addressFormData.city}
                        onChange={handleChange}
                        error={errors.city}
                        className="w-full"
                    />

                    <CustomTextInput
                        type="text"
                        name="state"
                        label="State *"
                        labelStyle="text-green-300 text-sm"
                        placeholderText="State/Province"
                        value={addressFormData.state}
                        onChange={handleChange}
                        error={errors.state}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CustomTextInput
                        type="text"
                        name="postalCode"
                        label="Postal Code *"
                        labelStyle="text-green-300 text-sm"
                        placeholderText="ZIP/Postal Code"
                        value={addressFormData.postalCode}
                        onChange={handleChange}
                        error={errors.postalCode}
                        className="w-full"
                    />

                    <CustomTextInput
                        type="text"
                        name="country"
                        label="Country *"
                        labelStyle="text-green-300 text-sm"
                        placeholderText="Country"
                        value={addressFormData.country}
                        onChange={handleChange}
                        error={errors.country}
                        className="w-full"
                    />
                </div>

                <CustomTextInput
                    type="tel"
                    name="phoneNumber"
                    label="Phone Number *"
                    labelStyle="text-green-300 text-sm"
                    placeholderText="+1 (555) 123-4567"
                    value={addressFormData.phoneNumber}
                    onChange={handleChange}
                    error={errors.phoneNumber}
                    className="w-full"
                />

                <div className="flex space-x-3 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-sm font-medium"
                    >
                        {isLoading ? "Saving..." : submitButtonText}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-sm font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
