/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { ActivityType } from "@/types/enums";

import { ActivitySpotApi, LocationApi, AuthApi } from "@/services/api"; 
import { ActivitySpotValidators } from "@/validators";

import {
    CustomTextInput,
    CustomTextAreaInput,
    CustomSelectInput
} from "@/components/custom-elements/CustomInputElements";

import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
import { stripNulls, produceValidationErrorMessage } from "@/utilities/utilities";
import { AddressManagerModule } from "../modular-components/AddressManagerModule";
import { set } from "zod";

type FormMode = "create" | "edit";

interface FormProps {
    mode: FormMode;
    activitySpotData?: Partial<ActivitySpot>;
    activitySpot_Id?: string;
}

export const ActivitySpotForm = ({ mode, activitySpotData = {activityType: ActivityType.ADVENTURE_SPORTS}, activitySpot_Id }: FormProps) => {
    const router = useRouter();

    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {data: locationsListData} = LocationApi.useGetAllLocationsRQ();
    const locationsList = locationsListData?.data?.filter((location) => location.locationType === 'DISTRICT') || [];

    const [activitySpotId, setActivitySpotId] = useState<string>(activitySpot_Id ?? "");

    const [activitySpotFormData, setActivitySpotFormData] = useState<Partial<ActivitySpot>>(activitySpotData);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [actionTrigger, setActionTrigger] = useState<boolean>(false);

    /* ===================== ACTIVITY SPOT MUTATIONS ===================== */

    const { mutate: createActivitySpotMutate } = ActivitySpotApi.useCreateActivitySpotRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Activity Spot created.");
                setActivitySpotId(responseData.data?.id || "");

                queryClient.invalidateQueries({ queryKey: ["activity-spots"] });
                router.replace(`/activity-spots/${responseData.data?.id}`);
            } else {
                finishWithMessage("Failed to create activity spot.");
            }
        },
        () => finishWithMessage("Failed to create activity spot.")
    );

    const { mutate: updateActivitySpotMutate } = ActivitySpotApi.useUpdateActivitySpotRQ(
        (responseData) => {
            if (responseData.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["activity-spots"] });
                router.replace(`/activity-spots/${responseData.data?.id}`);

                finishWithMessage("Activity Spot updated.");
            } else {
                finishWithMessage("Failed to save changes.");
            }
        },
        () => finishWithMessage("Failed to save changes.")
    );

    const { mutate: deleteActivitySpotImagesMutate } = ActivitySpotApi.useDeleteActivitySpotImagesRQ(
        () => console.log("Activity spot images deleted."),
        () => console.log("Failed to delete activity spot images.")
    );

    useEffect(() => {
        setActivitySpotFormData(activitySpotData);
    }, [activitySpotData]);

    /* ===================== SUBMIT ===================== */

    const onPageFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting form data:", activitySpotFormData);

        let result;

        if (mode === "create") {
            result = ActivitySpotValidators.createActivitySpotSchema.safeParse(activitySpotFormData);
        } else {
            result = ActivitySpotValidators.updateActivitySpotSchema.safeParse(activitySpotFormData);
        }

        if (!result.success) {
            const message = produceValidationErrorMessage(result);
            finishWithMessage(`Validation Failed: ${message}. Try Again.`);
            return;
        }

        const sanitizedData = stripNulls(activitySpotFormData);

        if (mode === "create") {
            createActivitySpotMutate(sanitizedData as ActivitySpot);
        } else {
            updateActivitySpotMutate(sanitizedData as ActivitySpot);
        }

        setActionTrigger(true);
    };


    /* ===================== CHANGE HANDLER ===================== */

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, type } = e.target;

        // Determine the actual value based on input type
        const rawValue = (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
        let parsedValue: any;

        if (type === 'checkbox') {
            parsedValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            parsedValue = rawValue === '' ? undefined : Number(rawValue);
        } else {
            parsedValue = rawValue || undefined;
        }

        setActivitySpotFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));

        const updatedData = { ...activitySpotFormData, [name]: parsedValue };

        const schema = ActivitySpotValidators.createActivitySpotSchema;

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
                value={activitySpotFormData.name || ""}
                onChange={handleChange}
                error={errors.name}
            />

            <CustomTextAreaInput
                className="w-full md:w-[500px] md:h-[150px]"
                label="Description"
                name="description"
                value={activitySpotFormData.description || ""}
                onChange={handleChange}
                error={errors.description}
            />

            <CustomSelectInput
                className="w-full md:w-[500px] bg-gray-700 text-white"
                label="Location"
                name="locationId"
                value={activitySpotFormData.locationId || ""}
                onChange={handleChange}
                error={errors.locationId}
                options={[
                    { label: "-- Select a location --", value: "" },
                    ...locationsList
                        .map((loc) => ({ label: loc.name, value: loc.id }))
                        .sort((a, b) => a.label.localeCompare(b.label))
                ]}
            />

            <CustomTextInput
                type="text"
                className="w-full md:w-[250px]"
                label="Best Time To Visit"
                name="bestTimeToVisit"
                value={activitySpotFormData.bestTimeToVisit || ""}
                onChange={handleChange}
                error={errors.bestTimeToVisit}
            />

            <CustomTextInput
                type="checkbox"
                className="w-fit"
                label="Is Popular"
                name="isPopular"
                checked={activitySpotFormData.isPopular ?? false}
                onChange={handleChange}
                error={errors.isPopular}
            />

            {/* ActivitySpot-only fields */}
            <CustomTextInput
                type="text"
                className="w-full md:w-[500px]"
                label="Address ID - Un-implemented"
                labelStyle="text-red-400"
                name="addressId"
                value={(activitySpotFormData as ActivitySpot).addressId || ""}
                onChange={() => {}}
                error={errors.addressId}
                disabled={true}
            />

            <CustomTextInput
                type="number"
                className="w-full md:w-[250px]"
                label="Entry Cost"
                name="entryCost"
                value={(activitySpotFormData as ActivitySpot).entryCost || ""}
                onChange={handleChange}
                error={errors.entryCost}
            />

            <CustomTextInput
                type="text"
                className="w-full md:w-[250px]"
                label="Opening Hours"
                name="openingHours"
                value={(activitySpotFormData as ActivitySpot).openingHours || ""}
                onChange={handleChange}
                error={errors.openingHours}
            />

            <CustomSelectInput
                className="w-full md:w-[500px] bg-gray-700 text-white"
                label="Activity Spot Type"
                name="activityType"
                value={activitySpotFormData.activityType || ActivityType.ADVENTURE_SPORTS}
                onChange={handleChange}
                error={errors.tourType}
                options={[
                    ...Object.values(ActivityType).map((type) => ({
                        label: type.charAt(0) + type.slice(1).toLowerCase(),
                        value: type
                    }))
                ]}
            />

            <CustomTextInput
                type="text"
                className="w-full md:w-[250px]"
                label="Duration"
                name="duration"
                value={(activitySpotFormData as ActivitySpot).duration || ""}
                onChange={handleChange}
                error={errors.duration}
            />

            <CustomTextInput
                type="text"
                className="w-full md:w-[250px]"
                label="Age Restriction"
                name="ageRestriction"
                value={(activitySpotFormData as ActivitySpot).ageRestriction || ""}
                onChange={handleChange}
                error={errors.ageRestriction}
            />

            <CustomTextInput
                type="checkbox"
                className="w-fit"
                label="Is Active"
                name="isActive"
                checked={(activitySpotFormData as ActivitySpot).isActive ?? true}
                onChange={handleChange}
                error={errors.isActive}
            />
                


            <ImageUploadModule
                imageUploadMode={mode}
                MAX_FILES={3}
                actionTrigger={actionTrigger}
                resourceId={activitySpotId}
                resourceLabel={mode === "create" ? "Add Activity Spot Images" : "Edit Activity Spot Images"}

                pic_url_Builder={() => activitySpotPicUploadURLBuilder(activitySpotId)}

                updateResourceMutation={updateActivitySpotMutate}

                deleteResourceMutation={({id, imageIds} : {id: string, imageIds: string[]}) => 
                    deleteActivitySpotImagesMutate({activitySpotId: id, imageIds}) 
                }
                
                oldResourceImages={(activitySpotFormData as any).images || []}
            />

            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">
                {mode === "create" ? "Create" : "Save Changes"}
            </button>
        </form>
    );
}