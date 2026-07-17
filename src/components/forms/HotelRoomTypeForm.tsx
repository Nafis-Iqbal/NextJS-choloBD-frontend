/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { HotelRoomApi, HotelApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { HotelRoomValidators } from "@/validators";
import {
    CustomTextInput,
    CustomSelectInput,
    CustomCheckboxInput,
} from "../custom-elements/CustomInputElements";
import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
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
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const [resourceRoomTypeId, setResourceRoomTypeId] = useState<string>(roomTypeId ?? "");
    const [roomTypeFormData, setRoomTypeFormData] = useState<Partial<HotelRoomType>>({});
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [actionTrigger, setActionTrigger] = useState<boolean>(false);

    const { data: hotelData } = HotelApi.useGetHotelDetailRQ(hotelId);

    const { mutate: createRoomTypeMutate } = HotelRoomApi.useCreateHotelRoomTypeRQ(
        (responseData) => {
            if (responseData.status === "success") {
                // Keep modal open so ImageUploadModule can attach images, then close via update success
                setResourceRoomTypeId(responseData.data?.id || "");
                queryClient.invalidateQueries({ queryKey: ["hotels", hotelId] });
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
                finishWithMessage(
                    mode === "create"
                        ? "Hotel room created successfully."
                        : "Hotel room updated successfully."
                );
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

    const { mutate: deleteRoomTypeImagesMutate } = HotelRoomApi.useDeleteHotelRoomTypeImagesRQ(
        () => console.log("Hotel room type images deleted successfully."),
        () => {
            console.log("Failed to delete hotel room type images.");
        }
    );

    useEffect(() => {
        if (roomTypeId) {
            setResourceRoomTypeId(roomTypeId);
        }
    }, [roomTypeId]);

    useEffect(() => {
        if (mode === "create") {
            setRoomTypeFormData({
                hotelId,
                singleBedCount: 1,
                doubleBedCount: 0,
                totalCount: 1,
                pricePerNight: 0,
                allowShiftBooking: false,
            } as Partial<HotelRoomType>);
        } else if (mode === "edit" && roomTypeId && hotelData?.data?.roomTypes) {
            const selectedRoomType = hotelData.data.roomTypes.find(
                (rt: HotelRoomType) => rt.id === roomTypeId
            );
            if (selectedRoomType) {
                setRoomTypeFormData({
                    roomType: selectedRoomType.roomType,
                    singleBedCount: selectedRoomType.singleBedCount,
                    doubleBedCount: selectedRoomType.doubleBedCount,
                    totalCount: selectedRoomType.totalCount,
                    pricePerNight: selectedRoomType.pricePerNight,
                    allowShiftBooking: selectedRoomType.allowShiftBooking ?? false,
                    images: selectedRoomType.images || []
                } as Partial<HotelRoomType>);
            }
        }
    }, [hotelId, mode, roomTypeId, hotelData]);

    const onRoomFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const sanitizedData = stripNulls(roomTypeFormData);
        const schema =
            mode === "create"
                ? HotelRoomValidators.createHotelRoomTypeSchema
                : HotelRoomValidators.updateHotelRoomTypeSchema;
        const result = schema.safeParse(sanitizedData);

        if (!result.success) {
            const message = produceValidationErrorMessage(result);
            finishWithMessage(`Validation Failed: ${message}. Try Again.`);
            return;
        }

        showLoadingContent(true);

        const apiData = {
            ...result.data,
            hotelId
        } as any;

        if (mode === "create") {
            createRoomTypeMutate({ data: apiData });
        } else if (resourceRoomTypeId) {
            updateRoomTypeMutate({
                id: resourceRoomTypeId,
                ...result.data
            });
        }

        setActionTrigger(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        const numericFields = new Set(["singleBedCount", "doubleBedCount", "pricePerNight", "totalCount"]);

        let parsedValue: string | number | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, "");
            parsedValue = noLeadingZeros === "" ? 0 : Number(noLeadingZeros);
        } else {
            parsedValue = value || undefined;
        }

        const updatedData = { ...roomTypeFormData, [name]: parsedValue } as Partial<HotelRoomType>;
        setRoomTypeFormData(updatedData);

        const schema =
            mode === "create"
                ? HotelRoomValidators.createHotelRoomTypeSchema
                : HotelRoomValidators.updateHotelRoomTypeSchema;
        const result = schema.safeParse(updatedData);

        if (!result.success) {
            const fieldErrors = result.error.formErrors.fieldErrors as Record<
                string,
                string[] | undefined
            >;
            const fieldError = fieldErrors[name]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));

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
            if (name === "singleBedCount" || name === "doubleBedCount") {
                setErrors((prev) => ({
                    ...prev,
                    singleBedCount: undefined,
                    doubleBedCount: undefined
                }));
            }
        }
    };

    const roomTypePicUploadURLBuilder = (productId: string) => {
        return `cholo_bd/hotels/${hotelId}/room-types/${productId}/images`;
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
                name="roomType"
                value={roomTypeFormData?.roomType || ""}
                onChange={handleChange}
                error={errors.roomType}
                options={[
                    { value: "", label: "Select room type" },
                    ...Object.values(HotelRoomCategory).map((type) => ({
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
                name="totalCount"
                value={roomTypeFormData.totalCount}
                onChange={handleChange}
                error={errors.totalCount}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter price per night"
                label="Price Per Night"
                name="pricePerNight"
                value={roomTypeFormData?.pricePerNight || ""}
                onChange={handleChange}
                error={errors.pricePerNight}
            />

            <CustomCheckboxInput
                label="Allow Shift Booking"
                checked={!!roomTypeFormData.allowShiftBooking}
                onChange={(e) =>
                    setRoomTypeFormData((prev) => ({
                        ...prev,
                        allowShiftBooking: e.target.checked,
                    }))
                }
                className="w-fit"
            />
            <p className="theme-text-subtle text-sm -mt-6">
                Enable if this room type can be booked for morning, afternoon, or night shifts.
            </p>

            <ImageUploadModule
                imageUploadMode={mode}
                MAX_FILES={3}
                actionTrigger={actionTrigger}
                resourceId={resourceRoomTypeId}
                resourceLabel={mode === "edit" ? "Edit Room Type Images" : "Add Room Type Images"}
                pic_url_Builder={(id) => roomTypePicUploadURLBuilder(id)}
                updateResourceMutation={updateRoomTypeMutate}
                deleteResourceMutation={({ id, imageIds }: { id: string; imageIds: string[] }) =>
                    deleteRoomTypeImagesMutate({ roomTypeId: id, imageIds })
                }
                oldResourceImages={roomTypeFormData?.images || []}
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
