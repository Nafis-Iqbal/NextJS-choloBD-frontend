/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HotelRoomApi, HotelApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { createHotelRoomTypeSchema } from "../../validators/hotelValidators";
import { CustomTextInput, CustomSelectInput } from "../custom-elements/CustomInputElements";
import { HotelRoomCategory } from "@/types/enums";
import { stripNulls, produceValidationErrorMessage } from "@/utilities/utilities";

type HotelRoomFormMode = "create" | "edit";

interface HotelRoomFormProps {
    mode: HotelRoomFormMode;
    hotelId: string;
    roomTypeId?: string;
    onCancel: () => void;
}

export const HotelRoomTypeForm: React.FC<HotelRoomFormProps> = ({
    mode,
    hotelId,
    roomTypeId,
    onCancel
}) => {
    console.log(mode, hotelId, roomTypeId);
    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const [roomTypeFormData, setRoomTypeFormData] = useState<Partial<HotelRoomType>>({});
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    // Fetch hotel detail to get room types data in edit mode
    const { data: hotelData } = HotelApi.useGetHotelDetailRQ(hotelId);
    console.log("hotel data: ", hotelData);
    // React Query Hooks
    const { mutate: createRoomTypeMutate } = HotelRoomApi.useCreateHotelRoomTypeRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Hotel room created successfully.");
                queryClient.invalidateQueries({ queryKey: ["hotels", hotelId] });

                onCancel();
            } else {
                finishWithMessage("Failed to create hotel room. Try again.");
            }
        },
        () => {
            finishWithMessage("Failed to create hotel room. Try again.");
        }
    );

    const { mutate: updateRoomTypeMutate } = HotelRoomApi.useUpdateHotelRoomTypeAdminRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Hotel room updated successfully.");
                queryClient.invalidateQueries({ queryKey: ["hotels", hotelId] });

                onCancel();
            } else {
                finishWithMessage("Failed to update hotel room. Try again.");
            }
        },
        () => {
            finishWithMessage("Failed to update hotel room. Try again.");
        }
    );

    useEffect(() => {
        if (mode === "create") {
            setRoomTypeFormData({ 
                hotelId,
                singleBedCount: 1,
                doubleBedCount: 0,
                totalCount: 1,
                pricePerNight: 0
            } as Partial<HotelRoomType>);
        } else if (mode === "edit" && roomTypeId && hotelData?.data?.roomTypes) {
            // Find the specific room type from the hotel's room types array
            const selectedRoomType = hotelData.data.roomTypes.find((rt: HotelRoomType) => rt.id === roomTypeId);
            console.log("Selected Room Type for Editing:", selectedRoomType);
            if (selectedRoomType) {
                setRoomTypeFormData({
                    roomType: selectedRoomType.roomType,
                    singleBedCount: selectedRoomType.singleBedCount,
                    doubleBedCount: selectedRoomType.doubleBedCount,
                    totalCount: selectedRoomType.totalCount,
                    pricePerNight: selectedRoomType.pricePerNight
                } as Partial<HotelRoomType>);
            }
        }
    }, [hotelId, mode, roomTypeId, hotelData]);

    const onRoomFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const sanitizedData = stripNulls(roomTypeFormData);
        const result = createHotelRoomTypeSchema.safeParse(sanitizedData);
        
        if (!result.success) {
            const message = produceValidationErrorMessage(result);
            finishWithMessage(`Validation Failed: ${message}. Try Again.`);
            return;
        }

        showLoadingContent(true);

        // Add hotelId to the data being sent
        const apiData = {
            ...sanitizedData,
            hotelId
        } as any;

        if (mode === "create") {
            createRoomTypeMutate({
                data: apiData
            });
        } else {
            if (roomTypeId) {
                updateRoomTypeMutate({
                    roomTypeId,
                    data: apiData
                });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        const numericFields = new Set(["singleBedCount", "doubleBedCount", "pricePerNight", "totalCount"]);

        let parsedValue: string | number | boolean | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, '');
            parsedValue = noLeadingZeros === '' ? 0 : Number(noLeadingZeros);
        } else {
            parsedValue = value || undefined;
        }

        const updatedData = { ...roomTypeFormData, [name]: parsedValue } as Partial<HotelRoomType>;

        setRoomTypeFormData(updatedData);
        
        const result = createHotelRoomTypeSchema.safeParse(updatedData);
        if (!result.success) {
            const fieldErrors = result.error.formErrors.fieldErrors;
            const fieldError = fieldErrors[name as keyof typeof fieldErrors]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));

            // Check if the error is about bed counts and show on both fields
            if (name === "singleBedCount" || name === "doubleBedCount") {
                const singleBedError = fieldErrors.singleBedCount?.[0];
                if (singleBedError?.includes("At least one bed")) {
                    setErrors((prev) => ({ 
                        ...prev, 
                        singleBedCount: singleBedError,
                        doubleBedCount: singleBedError
                    }));
                }
            }
        } else {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
            // Clear both bed count errors if validation passes
            if (name === "singleBedCount" || name === "doubleBedCount") {
                setErrors((prev) => ({ 
                    ...prev, 
                    singleBedCount: undefined,
                    doubleBedCount: undefined
                }));
            }
        }
    };

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <form className="flex flex-col p-2 space-y-8 mt-5" onSubmit={onRoomFormSubmit}>
            <CustomSelectInput
                className="w-full px-2 md:px-0 md:w-[300px] bg-gray-700 text-white"
                label="Room Type"
                labelStyle="text-green-300"
                name="roomType"
                value={roomTypeFormData?.roomType || ""}
                onChange={handleChange}
                error={errors.roomType}
                options={[
                    { value: "", label: "Select room type" },
                    ...Object.values(HotelRoomCategory).map(type => ({
                        value: type,
                        label: type
                    }))
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomTextInput
                    type="number"
                    className="w-full"
                    placeholderText="Enter single bed count"
                    label="Single Bed Count"
                    labelStyle="text-green-300"
                    name="singleBedCount"
                    value={roomTypeFormData?.singleBedCount ?? 0}
                    onChange={handleChange}
                    error={errors.singleBedCount}
                />

                <CustomTextInput
                    type="number"
                    className="w-full"
                    placeholderText="Enter double bed count"
                    label="Double Bed Count"
                    labelStyle="text-green-300"
                    name="doubleBedCount"
                    value={roomTypeFormData?.doubleBedCount ?? 0}
                    onChange={handleChange}
                    error={errors.doubleBedCount}
                />
            </div>

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Total room count"
                label="Total Room Count"
                labelStyle="text-green-300"
                name="totalCount"
                value={roomTypeFormData.totalCount}                
                onChange={handleChange}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter price per night"
                label="Price Per Night"
                labelStyle="text-green-300"
                name="pricePerNight"
                value={roomTypeFormData?.pricePerNight || ""}
                onChange={handleChange}
                error={errors.pricePerNight}
            />

            <button 
                type="submit" 
                className="w-fit px-10 bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-3"
            >
                {mode === "create" ? "Create Room Type" : "Save Changes"}
            </button>
        </form>
    );
};
