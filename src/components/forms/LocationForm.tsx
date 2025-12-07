"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LocationApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { createLocationSchema } from "../../validators/locationValidators";
import { CustomTextInput, CustomSelectInput } from "../custom-elements/CustomInputElements";
import { LocationType } from "@/types/enums";

type LocationFormMode = "create" | "edit";

interface LocationFormProps {
    mode: LocationFormMode;
    location_id?: string;
}

export const LocationForm: React.FC<LocationFormProps> = ({
    mode,
    location_id
}) => {
    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {data: locationData } = LocationApi.useGetLocationByIdRQ(location_id || "");
    const [locationFormData, setLocationFormData] = useState<Partial<Location>>({});
    
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    // React Query Hooks
    const { mutate: createLocationMutate } = LocationApi.useCreateLocationRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Location created successfully.");
                queryClient.invalidateQueries({ queryKey: ["locations"] });
                router.back();
            } else {
                finishWithMessage("Failed to create location. Try again.");
            }
        },
        () => {
            finishWithMessage("Failed to create location. Try again.");
        }
    );

    const { mutate: updateLocationMutate } = LocationApi.useUpdateLocationRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Location updated successfully.");
                queryClient.invalidateQueries({ queryKey: ["locations"] });
                router.back();
            } else {
                finishWithMessage("Failed to update location. Try again.");
            }
        },
        () => {
            finishWithMessage("Failed to update location. Try again.");
        }
    );

    useEffect(() => {
        if (locationData && mode === "edit") {
            setLocationFormData(locationData?.data || {});
        }
    }, [locationData, mode]);

    const onLocationFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(mode === "create")
        {
            const result = createLocationSchema.safeParse(locationFormData);

            if (result.success === true) {
                showLoadingContent(true);
                createLocationMutate(locationFormData as Location);
            }
        }else{
            if(location_id)
            {
                updateLocationMutate({
                    locationId: location_id,
                    locationData: locationFormData as Partial<Location>
                });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        const numericFields = new Set(["latitude", "longitude", "popularityScore"]);
        const booleanFields = new Set(["isPopular"]);

        let parsedValue: string | number | boolean | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, '');
            parsedValue = noLeadingZeros === '' ? undefined : Number(noLeadingZeros);
        } else if (booleanFields.has(name)) {
            parsedValue = value === 'true';
        } else {
            parsedValue = value || undefined;
        }

        setLocationFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));
        
        const updatedData = { ...locationFormData, [name]: parsedValue };
        
        const result = createLocationSchema.safeParse(updatedData);
        if (!result.success) {
            const key = name as keyof typeof result.error.formErrors.fieldErrors;
            const fieldError = result.error.formErrors.fieldErrors[key]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;
        const featuresArray = value.split(',').map(feature => feature.trim()).filter(feature => feature !== '');
        
        setLocationFormData((prev) => ({
            ...prev,
            features: featuresArray
        }));

        const updatedData = { ...locationFormData, features: featuresArray };
        
        const result = createLocationSchema.safeParse(updatedData);
        if (!result.success) {
            const fieldError = result.error.formErrors.fieldErrors.features?.[0];
            setErrors((prev) => ({ ...prev, features: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, features: undefined }));
        }
    };

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <form className="flex flex-col p-2 space-y-8 mt-5" onSubmit={onLocationFormSubmit}>
            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Enter location name"
                label="Location Name"
                labelStyle="text-green-300"
                name="name"
                value={locationFormData?.name || ""}
                onChange={handleChange}
                error={errors.name}
            />

            <div className="flex flex-col space-y-2">
                <label className="text-green-300 font-medium">Description</label>
                <textarea
                    className="w-full px-2 md:px-0 md:w-[500px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter location description (optional)"
                    name="description"
                    value={locationFormData?.description || ""}
                    onChange={handleChange}
                    rows={4}
                />
                {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
            </div>

            <CustomSelectInput
                className="w-full px-2 md:px-0 md:w-[300px] bg-gray-700 text-white"
                label="Location Type"
                labelStyle="text-green-300"
                name="locationType"
                value={locationFormData?.locationType || ""}
                onChange={handleChange}
                error={errors.locationType}
                options={[
                    { value: "", label: "Select location type" },
                    ...Object.values(LocationType).map(type => ({
                        value: type,
                        label: type
                    }))
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomTextInput
                    type="text"
                    className="w-full"
                    placeholderText="Enter country"
                    label="Country"
                    labelStyle="text-green-300"
                    name="country"
                    value={locationFormData?.country || ""}
                    onChange={handleChange}
                    error={errors.country}
                />

                <CustomTextInput
                    type="text"
                    className="w-full"
                    placeholderText="Enter state (optional)"
                    label="State"
                    labelStyle="text-green-300"
                    name="state"
                    value={locationFormData?.state || ""}
                    onChange={handleChange}
                    error={errors.state}
                />

                <CustomTextInput
                    type="text"
                    className="w-full"
                    placeholderText="Enter city (optional)"
                    label="City"
                    labelStyle="text-green-300"
                    name="city"
                    value={locationFormData?.city || ""}
                    onChange={handleChange}
                    error={errors.city}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomTextInput
                    type="number"
                    className="w-full"
                    placeholderText="Enter latitude (optional)"
                    label="Latitude"
                    labelStyle="text-green-300"
                    name="latitude"
                    value={locationFormData?.latitude || ""}
                    onChange={handleChange}
                    error={errors.latitude}
                />

                <CustomTextInput
                    type="number"
                    className="w-full"
                    placeholderText="Enter longitude (optional)"
                    label="Longitude"
                    labelStyle="text-green-300"
                    name="longitude"
                    value={locationFormData?.longitude || ""}
                    onChange={handleChange}
                    error={errors.longitude}
                />
            </div>

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter timezone (optional)"
                label="Timezone"
                labelStyle="text-green-300"
                name="timezone"
                value={locationFormData?.timezone || ""}
                onChange={handleChange}
                error={errors.timezone}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[200px]"
                placeholderText="Enter popularity score (0-100)"
                label="Popularity Score"
                labelStyle="text-green-300"
                name="popularityScore"
                value={locationFormData?.popularityScore || ""}
                onChange={handleChange}
                error={errors.popularityScore}
            />

            <CustomTextInput
                type="url"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Enter image URL (optional)"
                label="Image URL"
                labelStyle="text-green-300"
                name="imageUrl"
                value={locationFormData?.imageUrl || ""}
                onChange={handleChange}
                error={errors.imageUrl}
            />

            <div className="flex flex-col space-y-2">
                <label className="text-green-300 font-medium">Features (comma-separated)</label>
                <textarea
                    className="w-full px-2 md:px-0 md:w-[500px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter features separated by commas (e.g., Beach, Mountains, Historical)"
                    name="features"
                    value={locationFormData?.features?.join(', ') || ""}
                    onChange={handleFeaturesChange}
                    rows={3}
                />
                {errors.features && <span className="text-red-500 text-sm">{errors.features}</span>}
            </div>

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter climate description (optional)"
                label="Climate"
                labelStyle="text-green-300"
                name="climate"
                value={locationFormData?.climate || ""}
                onChange={handleChange}
                error={errors.climate}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[400px]"
                placeholderText="Enter best visit time (optional)"
                label="Best Visit Time"
                labelStyle="text-green-300"
                name="bestVisitTime"
                value={locationFormData?.bestVisitTime || ""}
                onChange={handleChange}
                error={errors.bestVisitTime}
            />

            <CustomSelectInput
                className="w-full px-2 md:px-0 md:w-[200px] bg-gray-700 text-white"
                label="Is Popular Location?"
                labelStyle="text-green-300"
                name="isPopular"
                value={locationFormData?.isPopular ? 'true' : 'false'}
                onChange={handleChange}
                error={errors.isPopular}
                options={[
                    { value: "false", label: "No" },
                    { value: "true", label: "Yes" }
                ]}
            />

            <button 
                type="submit" 
                className="w-fit px-10 bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-3"
            >
                {mode === "create" ? "Create Location" : "Save Changes"}
            </button>
        </form>
    );
};