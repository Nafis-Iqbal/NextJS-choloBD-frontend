/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { TourType } from "@/types/enums";

import { TourSpotApi, LocationApi } from "@/services/api"; 
import { TourSpotValidators } from "@/validators";

import {
    CustomTextInput,
    CustomTextAreaInput,
    CustomSelectInput
} from "@/components/custom-elements/CustomInputElements";

import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
import { stripNulls, produceValidationErrorMessage } from "@/utilities/utilities";

type FormMode = "create" | "edit";

interface FormProps {
    mode: FormMode;
    tourSpotData?: Partial<TourSpot>;
    tourSpot_Id?: string;
}

export const TourSpotForm = ({ mode, tourSpotData = {tourType: TourType.ADVENTURE}, tourSpot_Id }: FormProps) => {
    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {data: locationsListData} = LocationApi.useGetAllLocationsRQ();
    const locationsList = locationsListData?.data || [];

    const [tourSpotId, setTourSpotId] = useState<string>(tourSpot_Id ?? "");

    const [tourSpotFormData, setTourSpotFormData] = useState<Partial<TourSpot>>(tourSpotData);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [actionTrigger, setActionTrigger] = useState<boolean>(false);

    /* ===================== TOUR SPOT MUTATIONS ===================== */

    const { mutate: createTourSpotMutate } = TourSpotApi.useCreateTourSpotRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Tour Spot created.");
                setTourSpotId(responseData.data?.id || "");

                queryClient.invalidateQueries({ queryKey: ["tour-spots"] });
                router.replace(`/tour-spots/${responseData.data?.id}`);
            } else {
                finishWithMessage("Failed to create tour spot.");
            }
        },
        () => finishWithMessage("Failed to create tour spot.")
    );

    const { mutate: updateTourSpotMutate } = TourSpotApi.useUpdateTourSpotRQ(
        (responseData) => {
            if (responseData.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["tour-spots"] });
                router.replace(`/tour-spots/${responseData.data?.id}`);

                finishWithMessage("Tour Spot updated.");
            } else {
                finishWithMessage("Failed to save changes.");
            }
        },
        () => finishWithMessage("Failed to save changes.")
    );

    const { mutate: deleteTourSpotImagesMutate } = TourSpotApi.useDeleteTourSpotImagesRQ(
        () => console.log("Tour spot images deleted."),
        () => console.log("Failed to delete tour spot images.")
    );

    useEffect(() => {
        setTourSpotFormData(tourSpotData);
    }, [tourSpotData]);
    /* ===================== SUBMIT ===================== */

    const onPageFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting form data:", tourSpotFormData);

        let result;

        if (mode === "create") {
            result = TourSpotValidators.createTourSpotSchema.safeParse(tourSpotFormData);
        } else {
            result = TourSpotValidators.updateTourSpotSchema.safeParse(tourSpotFormData);
        }
        
        if (!result.success) {
            const message = produceValidationErrorMessage(result);
            finishWithMessage(`Validation Failed: ${message}. Try Again.`);
            return;
        }

        const sanitizedData = stripNulls(tourSpotFormData);

        if (mode === "create") {
            createTourSpotMutate(sanitizedData as TourSpot);
        } else {
            updateTourSpotMutate(sanitizedData as TourSpot);
        }

        setActionTrigger(true);
    };


    /* ===================== CHANGE HANDLER ===================== */

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, type } = e.target;

        // Determine the actual value based on input type
        let parsedValue: any;
        
        if (type === 'checkbox') {
            parsedValue = (e.target as HTMLInputElement).checked;
        } else {
            const value = (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
            parsedValue = value === '' ? undefined : value;
        }

        setTourSpotFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));

        const updatedData = { ...tourSpotFormData, [name]: parsedValue };

        const schema = TourSpotValidators.createTourSpotSchema;

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
                value={tourSpotFormData.name || ""}
                onChange={handleChange}
                error={errors.name}
            />

            <CustomTextAreaInput
                className="w-full md:w-[500px] md:h-[150px]"
                label="Description"
                name="description"
                value={tourSpotFormData.description || ""}
                onChange={handleChange}
                error={errors.description}
            />

            <CustomSelectInput
                className="w-full md:w-[500px] bg-gray-700 text-white"
                label="Location"
                name="locationId"
                value={tourSpotFormData.locationId || ""}
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
                value={tourSpotFormData.bestTimeToVisit || ""}
                onChange={handleChange}
                error={errors.bestTimeToVisit}
            />

            <CustomTextInput
                type="checkbox"
                className="w-fit"
                label="Is Popular"
                name="isPopular"
                checked={tourSpotFormData.isPopular ?? false}
                onChange={handleChange}
                error={errors.isPopular}
            />

            <CustomSelectInput
                className="w-full md:w-[500px] bg-gray-700 text-white"
                label="Tour Spot Type"
                name="tourType"
                value={tourSpotFormData.tourType || TourType.ADVENTURE}
                onChange={
                    handleChange}
                
                error={errors.tourType}
                options={[
                    ...Object.values(TourType).map((type) => ({
                        label: type.charAt(0) + type.slice(1).toLowerCase(),
                        value: type
                    }))
                ]}
            />

            <ImageUploadModule
                imageUploadMode={mode}
                MAX_FILES={3}
                actionTrigger={actionTrigger}
                resourceId={tourSpotId}
                resourceLabel={mode === "create" ? "Add Tour Spot Images" : "Edit Tour Spot Images"}

                pic_url_Builder={() => tourSpotPicUploadURLBuilder(tourSpotId)}

                updateResourceMutation={updateTourSpotMutate}

                deleteResourceMutation={({id, imageIds} : {id: string, imageIds: string[]}) => 
                    deleteTourSpotImagesMutate({tourSpotId: id, imageIds}) 
                }
                
                oldResourceImages={tourSpotFormData.images || []}
            />

            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">
                {mode === "create" ? "Create" : "Save Changes"}
            </button>
        </form>
    );
}