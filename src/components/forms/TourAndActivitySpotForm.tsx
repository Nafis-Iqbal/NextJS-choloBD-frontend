/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

import { TourSpotApi, ActivitySpotApi, AuthApi } from "@/services/api"; 
import { TourSpotValidators, ActivitySpotValidators } from "@/validators";

import {
    CustomTextInput,
    CustomTextAreaInput
} from "@/components/custom-elements/CustomInputElements";

import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";

type FormMode = "create" | "edit";

interface FormProps {
    mode: FormMode;
    infoPageData?: Partial<TourSpot> | Partial<ActivitySpot>;
    info_Id?: string;
}

export const TourAndActivitySpotPageForm = ({ mode, infoPageData = {}, info_Id }: FormProps) => {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const [infoId, setInfoId] = useState<string>(info_Id ?? "");
    const [pageAssetType, setPageAssetType] = useState<"tourSpot" | "activitySpot">("tourSpot");

    const [pageFormData, setPageFormData] = useState<Partial<TourSpot> | Partial<ActivitySpot>>(infoPageData);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [actionTrigger, setActionTrigger] = useState<boolean>(false);

    /* ===================== TOUR SPOT MUTATIONS ===================== */

    const { mutate: createTourSpotMutate } =
        TourSpotApi.useCreateTourSpotRQ(
            (responseData) => {
                if (responseData.status === "success") {
                    setInfoId(responseData.data?.id || "");
                    router.replace(`/tour-spot/${responseData.data?.id}`);
                } else {
                    finishWithMessage("Failed to create tour spot. Try again.");
                }
            },
            () => finishWithMessage("Failed to create tour spot. Try again.")
        );

    const { mutate: updateTourSpotMutate } =
        TourSpotApi.useUpdateTourSpotRQ(
            (responseData) => {
                if (responseData.status === "success") {
                    queryClient.invalidateQueries({ queryKey: ["tour-spots"] });
                    router.replace(`/tour-spot/${responseData.data?.id}`);
                } else {
                    finishWithMessage("Failed to save changes. Try again.");
                }
            },
            () => finishWithMessage("Failed to save changes. Try again.")
        );

    const { mutate: deleteTourSpotImagesMutate } =
        TourSpotApi.useDeleteTourSpotImagesRQ(
            () => console.log("Tour spot images deleted."),
            () => console.log("Failed to delete tour spot images.")
        );

    /* ===================== ACTIVITY SPOT MUTATIONS ===================== */

    const { mutate: createActivitySpotMutate } =
        ActivitySpotApi.useCreateActivitySpotRQ(
            (responseData) => {
                if (responseData.status === "success") {
                    setInfoId(responseData.data?.id || "");
                    router.replace(`/activity-spot/${responseData.data?.id}`);
                } else {
                    finishWithMessage("Failed to create activity spot.");
                }
            },
            () => finishWithMessage("Failed to create activity spot.")
        );

    const { mutate: updateActivitySpotMutate } =
        ActivitySpotApi.useUpdateActivitySpotRQ(
            (responseData) => {
                if (responseData.status === "success") {
                    queryClient.invalidateQueries({ queryKey: ["activity-spots"] });
                    router.replace(`/activity-spot/${responseData.data?.id}`);
                } else {
                    finishWithMessage("Failed to save changes.");
                }
            },
            () => finishWithMessage("Failed to save changes.")
        );

    const { mutate: deleteActivitySpotImagesMutate } =
        ActivitySpotApi.useDeleteActivitySpotImagesRQ(
            () => console.log("Activity spot images deleted."),
            () => console.log("Failed to delete activity spot images.")
        );

    /* ===================== EFFECTS ===================== */

    useEffect(() => {
        if (infoPageData && mode === "edit") {
            setPageFormData(infoPageData);
        }
    }, [infoPageData]);

    /* ===================== SUBMIT ===================== */

    const onPageFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (pageAssetType === "tourSpot") {
            let result;

            if (mode === "create") {
                result = TourSpotValidators.createTourSpotSchema.safeParse(pageFormData);
            } else {
                result = TourSpotValidators.updateTourSpotSchema.safeParse(pageFormData);
            }

            if (!result.success) return;

            if (mode === "create") {
                createTourSpotMutate(pageFormData as TourSpot);
            } else {
                updateTourSpotMutate({
                    tourSpotId: infoId,
                    data: pageFormData
                });
            }

            setActionTrigger(true);
            return;
        }

        if( pageAssetType === "activitySpot") {
            // ActivitySpot
            let result;

            if (mode === "create") {
                result = ActivitySpotValidators.createActivitySpotSchema.safeParse(pageFormData);
            } else {
                result = ActivitySpotValidators.updateActivitySpotSchema.safeParse(pageFormData);
            }

            if (!result.success) return;

            if (mode === "create") {
                createActivitySpotMutate(pageFormData as ActivitySpot);
            } else {
                updateActivitySpotMutate({
                    activitySpotId: infoId,
                    data: pageFormData
                });
            }

            setActionTrigger(true);
        }
    };


    /* ===================== CHANGE HANDLER ===================== */

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        const parsedValue = value || undefined;

        setPageFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));

        const updatedData = { ...pageFormData, [name]: parsedValue };

        const schema =
            pageAssetType === "tourSpot"
                ? TourSpotValidators.createTourSpotSchema
                : ActivitySpotValidators.createActivitySpotSchema;

        const result = schema.safeParse(updatedData);

        if (!result.success) {
            const fieldError =
                (result.error.formErrors.fieldErrors as any)[name]?.[0];

            setErrors((prev) => ({
                ...prev,
                [name]: fieldError
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const tourSpotPicUploadURLBuilder = (tourSpotId: string) => {
        return `cholo_bd/tour-spots/${tourSpotId}/images`;
    }

    const activitySpotPicUploadURLBuilder = (activitySpotId: string) => {
        return `cholo_bd/activity-spots/${activitySpotId}/images`;
    }

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    }

    return (
        <form onSubmit={onPageFormSubmit} className="space-y-6">
            <CustomTextInput
                type="text"
                className="w-full md:w-[500px]"
                label="Name"
                name="name"
                value={pageFormData.name || ""}
                onChange={handleChange}
                error={errors.name}
            />

            <CustomTextAreaInput
                className="w-full md:w-[500px] md:h-[150px]"
                label="Description"
                name="description"
                value={pageFormData.description || ""}
                onChange={handleChange}
                error={errors.description}
            />

            <CustomTextInput
                type="text"
                className="w-full md:w-[500px]"
                label="Location ID"
                name="locationId"
                value={pageFormData.locationId || ""}
                onChange={handleChange}
                error={errors.locationId}
            />

            <CustomTextInput
                type="text"
                className="w-full md:w-[500px]"
                label="Address ID"
                name="addressId"
                value={pageFormData.addressId || ""}
                onChange={handleChange}
                error={errors.addressId}
            />

            <CustomTextInput
                type="number"
                className="w-full md:w-[250px]"
                label="Entry Cost"
                name="entryCost"
                value={pageFormData.entryCost ?? ""}
                onChange={handleChange}
                error={errors.entryCost}
            />

            <CustomTextInput
                type="text"
                className="w-full md:w-[250px]"
                label="Opening Hours"
                name="openingHours"
                value={pageFormData.openingHours || ""}
                onChange={handleChange}
                error={errors.openingHours}
            />

            <CustomTextInput
                type="text"
                className="w-full md:w-[250px]"
                label="Best Time To Visit"
                name="bestTimeToVisit"
                value={pageFormData.bestTimeToVisit || ""}
                onChange={handleChange}
                error={errors.bestTimeToVisit}
            />

            <CustomTextInput
                type="number"
                className="w-full md:w-[150px]"
                label="Rating"
                name="rating"
                value={pageFormData.rating ?? ""}
                onChange={handleChange}
                error={errors.rating}
            />

            <CustomTextInput
                type="checkbox"
                className="w-fit"
                label="Is Popular"
                name="isPopular"
                checked={pageFormData.isPopular ?? false}
                onChange={handleChange}
                error={errors.isPopular}
            />

            {pageAssetType === "tourSpot" && (
                <>
                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[250px]"
                        label="Spot Type"
                        name="spotType"
                        value={(pageFormData as TourSpot).spotType || ""}
                        onChange={handleChange}
                        error={errors.spotType}
                    />

                    {/*
                        Complex TourSpot fields (handled separately):
                        - facilities: string[]
                        - contactInfo: object
                        - seasonalInfo: object
                    */}
                </>
            )}

            {/* ActivitySpot-only fields */}
            {pageAssetType === "activitySpot" && (
                <>
                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[250px]"
                        label="Activity Type"
                        name="activityType"
                        value={(pageFormData as ActivitySpot).activityType || ""}
                        onChange={handleChange}
                        error={errors.activityType}
                    />

                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[250px]"
                        label="Duration"
                        name="duration"
                        value={(pageFormData as ActivitySpot).duration || ""}
                        onChange={handleChange}
                        error={errors.duration}
                    />

                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[250px]"
                        label="Age Restriction"
                        name="ageRestriction"
                        value={(pageFormData as ActivitySpot).ageRestriction || ""}
                        onChange={handleChange}
                        error={errors.ageRestriction}
                    />

                    <CustomTextInput
                        type="checkbox"
                        className="w-fit"
                        label="Is Active"
                        name="isActive"
                        checked={(pageFormData as ActivitySpot).isActive ?? true}
                        onChange={handleChange}
                        error={errors.isActive}
                    />
                </>
            )}


            <ImageUploadModule
                imageUploadMode={mode}
                MAX_FILES={3}
                actionTrigger={actionTrigger}
                resourceId={infoId}
                resourceLabel={pageAssetType === "tourSpot" ? "Tour Spot" : "Activity Spot"}

                pic_url_Builder={pageAssetType === "tourSpot" ? 
                    () => tourSpotPicUploadURLBuilder(infoId) : 
                    () => activitySpotPicUploadURLBuilder(infoId)
                }

                updateResourceMutation={pageAssetType === "tourSpot" ? 
                    () => updateTourSpotMutate({tourSpotId: infoId, data: pageFormData as TourSpot}) : 
                    () => updateActivitySpotMutate({activitySpotId: infoId, data: pageFormData as ActivitySpot})
                }

                deleteResourceMutation={pageAssetType === "tourSpot" ? 
                    ({id, imageIds} : {id: string, imageIds: string[]}) => deleteTourSpotImagesMutate({tourSpotId: id, imageIds}) :
                    ({id, imageIds} : {id: string, imageIds: string[]}) => deleteActivitySpotImagesMutate({activitySpotId: id, imageIds}) 
                }
                
                oldResourceImages={(pageFormData as any).images || []}
            />

            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">
                {mode === "create" ? "Create" : "Save Changes"}
            </button>
        </form>
    );
}