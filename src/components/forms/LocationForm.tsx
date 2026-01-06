"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LocationApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { createLocationSchema } from "../../validators/locationValidators";
import { CustomTextInput, CustomSelectInput } from "../custom-elements/CustomInputElements";
import { LocationType } from "@/types/enums";
import { stripNulls, produceValidationErrorMessage } from "@/utilities/utilities";

type LocationFormMode = "create" | "edit";

interface LocationFormProps {
    mode: LocationFormMode;
    location_id?: string;
    onCancel: () => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({
    mode,
    location_id,
    onCancel
}) => {
    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {data: locationData } = LocationApi.useGetLocationByIdRQ(location_id || "");
    const {data: allLocationsData } = LocationApi.useGetAllLocationsRQ();
    const allLocations = allLocationsData?.data || [];

    const [locationFormData, setLocationFormData] = useState<Partial<Location>>({});
    
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    // React Query Hooks
    const { mutate: createLocationMutate } = LocationApi.useCreateLocationRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Location created successfully.");
                queryClient.invalidateQueries({ queryKey: ["locations"] });

                onCancel();
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

                onCancel();
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

        const result = createLocationSchema.safeParse(locationFormData);
        
        if (!result.success) {
            const message = produceValidationErrorMessage(result);
            finishWithMessage(`Validation Failed: ${message}. Try Again.`);
            return;
        }

        const sanitizedData = stripNulls(locationFormData);
        showLoadingContent(true);

        if(mode === "create")
        {
            createLocationMutate(sanitizedData as Location);
        }else{
            if(location_id)
            {
                updateLocationMutate({
                    locationId: location_id,
                    locationData: sanitizedData as Partial<Location>
                });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        const numericFields = new Set(["latitude", "longitude"]);

        let parsedValue: string | number | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, '');
            parsedValue = noLeadingZeros === '' ? undefined : Number(noLeadingZeros);
        } else {
            parsedValue = value || undefined;
        }

        // Map parentLocation field name to parentLocationId
        const fieldName = name === "parentLocation" ? "parentLocationId" : name;

        setLocationFormData((prev) => ({
            ...prev,
            [fieldName]: parsedValue
        }));
        
        const updatedData = { ...locationFormData, [fieldName]: parsedValue };
        
        const result = createLocationSchema.safeParse(updatedData);
        if (!result.success) {
            const key = name as keyof typeof result.error.formErrors.fieldErrors;
            const fieldError = result.error.formErrors.fieldErrors[key]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
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
                {/* <CustomTextInput
                    type="text"
                    className="w-full"
                    placeholderText="Enter country"
                    label="Country"
                    labelStyle="text-green-300"
                    name="country"
                    value={locationFormData?.country || ""}
                    onChange={handleChange}
                    error={errors.country}
                /> */}

                {/* <CustomTextInput
                    type="text"
                    className="w-full"
                    placeholderText="Enter state (optional)"
                    label="State"
                    labelStyle="text-green-300"
                    name="state"
                    value={locationFormData?.state || ""}
                    onChange={handleChange}
                    error={errors.state}
                /> */}
                <AnimatePresence mode="wait">
                    {requiresDivision(locationFormData.locationType) &&
                        (
                            <motion.div
                                key="division-field"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <CustomSelectInput
                                    className="w-full"
                                    label="Division"
                                    labelStyle="text-green-300"
                                    name="parentLocation"
                                    value={locationFormData?.parentLocationId || ""}
                                    onChange={handleChange}
                                    error={errors.parentLocation}
                                    options={[
                                        { value: "", label: "Select Division" },
                                            ...Object.values(allLocations).filter((location) => location.locationType === "DIVISION").map(location => ({
                                                value: location.id,
                                                label: location.name
                                        }))
                                    ]}
                                />
                            </motion.div>
                        )
                    }

                    {requiresDistrict(locationFormData.locationType) &&
                        (
                            <motion.div
                                key="district-division-fields"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="col-span-1 md:col-span-2"
                            >
                                <div className="flex flex-col md:flex-row gap-4">    
                                    <CustomSelectInput
                                        className="w-full"
                                        label="District"
                                        labelStyle="text-green-300"
                                        value={locationFormData?.parentLocationId || ""}
                                        onChange={handleChange}
                                        name="parentLocation"
                                        error={errors.parentLocation}
                                        options={[
                                            { value: "", label: "Select District" },
                                                ...Object.values(allLocations).filter((location) => location.locationType === "DISTRICT").map(location => ({
                                                    value: location.id,
                                                    label: location.name
                                            }))
                                        ]}
                                    />
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence>
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

            <button 
                type="submit" 
                className="w-fit px-10 bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-3"
            >
                {mode === "create" ? "Create Location" : "Save Changes"}
            </button>
        </form>
    );
};

function requiresDistrict(locationType: LocationType | undefined): boolean {
    return locationType === LocationType.CITY || locationType === LocationType.COUNTRYSIDE || 
    locationType === LocationType.ISLAND;
}

//UNUSED FUNCTION
function requiresDivision(locationType: LocationType | undefined): boolean {
    return locationType === LocationType.DISTRICT;
}

function requiresCountry(locationType: LocationType | undefined): boolean {
    return locationType === LocationType.DIVISION;
}