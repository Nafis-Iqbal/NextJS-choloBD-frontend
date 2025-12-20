/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { queryClient } from "@/services/apiInstance";

import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { HotelValidators } from "@/validators";
import { HotelApi, AuthApi } from "@/services/api";
import { CustomTextInput, CustomTextAreaInput } from "@/components/custom-elements/CustomInputElements";
import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";

type HotelFormMode = "create" | "edit";

interface HotelFormProps {
  mode: HotelFormMode;
  editMode: 'MASTER_ADMIN' | 'SERVICE_ADMIN';
  hotelData?: Partial<Hotel>;
  hotel_id?: string;
}

export const HotelPageForm = ({mode, editMode, hotelData = {}, hotel_id}: HotelFormProps) => {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const router = useRouter();

    const [hotelId, setHotelId] = useState<string>(hotel_id ?? "");

    const [hotelFormData, setHotelFormData] = useState<Partial<Hotel>>(hotelData);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [actionTrigger, setActionTrigger] = useState<boolean>(false);

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();

    //Hooks
    const {mutate: createHotelMutate} = HotelApi.useCreateHotelRQ(
        (responseData) => {
            if(responseData.status === "success")
            {               
                setHotelId(responseData.data?.id || "");
            }
            else finishWithMessage(mode === "create" ? "Failed to create product. Try again." : "Failed to save changes. Kindly try again.");
        },
        () => {
            finishWithMessage(mode === "create" ? "Failed to create product. Try again." : "Failed to save changes. Kindly try again.");
        }
    );

    const {mutate: updateHotelInfoMutate} = HotelApi.useUpdateHotelInfoRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                finishWithMessage("Hotel created successfully. Images uploaded.");

                queryClient.invalidateQueries({ queryKey: ["hotels"] });
                router.replace(`/hotels/${responseData.data?.id}`);
            }
            else {
                finishWithMessage("Failed to save changes. Please try again.");

                showLoadingContent(false);
            }
        },
        () => {
            finishWithMessage("Failed to save changes. Please try again.");

            showLoadingContent(false);
        }
    );

    const {mutate: updateHotelCoreInfoMutate} = HotelApi.useUpdateHotelCoreInfoRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                finishWithMessage("Hotel core info updated successfully. Images uploaded.");

                queryClient.invalidateQueries({ queryKey: ["hotels"] });
                router.replace(`/hotels/${responseData.data?.id}`);
            }
            else {
                finishWithMessage("Failed to save changes. Please try again.");

                showLoadingContent(false);
            }
        },
        () => {
            finishWithMessage("Failed to save changes. Please try again.");

            showLoadingContent(false);
        }
    );

    const {mutate: deleteHotelImagesMutate} = HotelApi.useDeleteHotelImagesRQ(
        (responseData) => {
            if(responseData.status === "success") console.log("Product images deleted successfully.");
            else console.log("Failed to delete image URLs from db. Try again.");
        },
        () => {
            console.log("Failed to delete image URLs from db. Try again.");
        }
    );

    useEffect(() => {
        if(hotelFormData && mode === "edit") setHotelFormData(hotelData);
    }, [hotelData]);

    const onHotelFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = HotelValidators.createHotelSchema.safeParse(hotelFormData);

        if(result.success === true){
            if(mode === "create") createHotelMutate(hotelFormData as Hotel);
            else {
                if(editMode === "MASTER_ADMIN" && currentUserRole === "MASTER_ADMIN") {
                    // Call master admin update mutation
                }
                else if(editMode === "SERVICE_ADMIN" && currentUserRole === "SERVICE_ADMIN") {
                    updateHotelInfoMutate({hotelId, data: hotelFormData as Hotel});
                }
            }

            setActionTrigger(true);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        const numericFields = new Set(["totalRooms", "availableRooms", "rating"]);

        let parsedValue: string | number | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, '');

            parsedValue = noLeadingZeros === '' ? undefined : Number(noLeadingZeros);
        } else {
            parsedValue = value || undefined;
        }

        setHotelFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));
        
        const updatedData = { ...hotelFormData, [name]: parsedValue };
        
        const result = HotelValidators.createHotelSchema.safeParse(updatedData);
        if (!result.success) {
            const key = name as keyof typeof result.error.formErrors.fieldErrors;
            const fieldError = result.error.formErrors.fieldErrors[key]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const productPicUploadURLBuilder = (productId: string) => {
        return `cholo_bd/hotels/${productId}/images`;
    }

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    }

    return (
        <form className="flex flex-col p-2 space-y-8 mt-5" onSubmit={onHotelFormSubmit}>
            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Enter hotel name"
                label="Hotel Name"
                labelStyle="text-green-300"
                name="name"
                value={hotelFormData?.name || ""}
                onChange={handleChange}
                error={errors.name}
            />

            <CustomTextAreaInput
                className="w-full px-2 md:px-0 md:w-[500px] md:h-[150px]"
                placeholderText="Enter product description"
                label="Description"
                labelStyle="text-green-300"
                name="description"
                value={hotelFormData?.description || ""}
                onChange={handleChange}
                error={errors.description}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter phone number"
                label="Phone Number"
                labelStyle="text-green-300"
                name="phoneNumber"
                value={hotelFormData?.phoneNumber || ""}
                onChange={handleChange}
                error={errors.phoneNumber}
            />

            <CustomTextInput
                type="email"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter email address"
                label="Email"
                labelStyle="text-green-300"
                name="email"
                value={hotelFormData?.email || ""}
                onChange={handleChange}
                error={errors.email}
            />

            <CustomTextInput
                type="url"
                className="w-full px-2 md:px-0 md:w-[400px]"
                placeholderText="Enter website URL"
                label="Website"
                labelStyle="text-green-300"
                name="website"
                value={hotelFormData?.website || ""}
                onChange={handleChange}
                error={errors.website}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[250px]"
                placeholderText="Enter total number of rooms"
                label="Total Rooms"
                labelStyle="text-green-300"
                name="totalRooms"
                value={hotelFormData?.totalRooms || ""}
                onChange={handleChange}
                error={errors.totalRooms}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[250px]"
                placeholderText="Enter available rooms"
                label="Available Rooms"
                labelStyle="text-green-300"
                name="availableRooms"
                value={hotelFormData?.availableRooms || ""}
                onChange={handleChange}
                error={errors.availableRooms}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter check-in time (e.g., 2:00 PM)"
                label="Check-in Time"
                labelStyle="text-green-300"
                name="checkInTime"
                value={hotelFormData?.checkInTime || ""}
                onChange={handleChange}
                error={errors.checkInTime}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter check-out time (e.g., 11:00 AM)"
                label="Check-out Time"
                labelStyle="text-green-300"
                name="checkOutTime"
                value={hotelFormData?.checkOutTime || ""}
                onChange={handleChange}
                error={errors.checkOutTime}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[200px]"
                placeholderText="Enter hotel rating (0-5)"
                label="Rating"
                labelStyle="text-green-300"
                name="rating"
                value={hotelFormData?.rating || ""}
                onChange={handleChange}
                error={errors.rating}
            />

            <ImageUploadModule 
                imageUploadMode={mode} 
                MAX_FILES={3}
                actionTrigger={actionTrigger} 
                resourceId={hotelId}
                resourceLabel={mode === "edit" ? "Edit Hotel Images" : "Add Hotel Images"}
                pic_url_Builder={() => productPicUploadURLBuilder(hotelId)} 
                updateResourceMutation={editMode === "SERVICE_ADMIN" ? 
                    () => updateHotelInfoMutate({hotelId, data: hotelFormData}) : 
                    () => updateHotelCoreInfoMutate({hotelId, data: hotelFormData})
                }
                deleteResourceMutation={({id, imageIds} : {id: string, imageIds: string[]}) => deleteHotelImagesMutate({hotelId: id, imageIds})}
                oldResourceImages={hotelFormData?.images || []}
            />

            <button type="submit" className="w-fit px-10 bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-3">{mode === "create" ? "Create Hotel" : "Save Changes"}</button>
        </form>
    )
}