/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { queryClient } from "@/services/apiInstance";

import { HotelType } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { HotelValidators } from "@/validators";
import { HotelApi, LocationApi } from "@/services/api";
import { CustomTextInput, CustomTextAreaInput, CustomSelectInput } from "@/components/custom-elements/CustomInputElements";
import { CategorySelectionModule } from "../modular-components/CategorySelectionModule";
import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
import { produceValidationErrorMessage, stripNulls } from "@/utilities/utilities";

type HotelFormMode = "create" | "edit";

interface HotelFormProps {
  mode: HotelFormMode;
  editMode: 'MASTER_ADMIN' | 'SERVICE_ADMIN';
  hotelData?: Partial<Hotel>;
  hotel_id?: string;
}

export const HotelPageForm = ({mode, editMode, hotelData = {hotelType: HotelType.LUXURY}, hotel_id}: HotelFormProps) => {
    const router = useRouter();

    const [hotelId, setHotelId] = useState<string>(hotel_id ?? "");
    
    const [hotelFormData, setHotelFormData] = useState<Partial<Hotel>>(hotelData);
    const [hotelAmenities, setHotelAmenities] = useState<Category[]>([]);
    const [hotelPolicies, setHotelPolicies] = useState<Category[]>([]);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [actionTrigger, setActionTrigger] = useState<boolean>(false);

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();

    //Hooks
    const {data: locationsListData} = LocationApi.useGetAllLocationsRQ();
    const locationsList = locationsListData?.data?.filter((location) => location.locationType === 'CITY') || [];

    const {mutate: createHotelMutate} = HotelApi.useCreateHotelRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                finishWithMessage("Hotel created successfully.");
                setHotelId(responseData.data?.id || "");
                
                queryClient.invalidateQueries({ queryKey: ["hotels"] });
                router.replace(`/hotels/${responseData.data?.id}`);
            }
            else finishWithMessage("Failed to create hotel. Try again.");
        },
        () => {
            finishWithMessage("Failed to create hotel. Try again.");
        }
    );

    const {mutate: updateHotelInfoMutate} = HotelApi.useUpdateHotelInfoRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                finishWithMessage("Hotel updated successfully.");

                queryClient.invalidateQueries({ queryKey: ["hotels"] });
                router.replace(`/hotels/${responseData.data?.id}`);
            }
            else {
                finishWithMessage("Failed to save changes. Please try again.");
            }
        },
        () => {
            finishWithMessage("Failed to save changes. Please try again.");
        }
    );

    const {mutate: updateHotelCoreInfoMutate} = HotelApi.useUpdateHotelCoreInfoRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                finishWithMessage("Hotel updated successfully.");

                queryClient.invalidateQueries({ queryKey: ["hotels"] });
                router.replace(`/hotels/${responseData.data?.id}`);
            }
            else {
                finishWithMessage("Failed to save changes. Please try again.");
            }
        },
        () => {
            finishWithMessage("Failed to save changes. Please try again.");
        }
    );

    const {mutate: deleteHotelImagesMutate} = HotelApi.useDeleteHotelImagesRQ(
        () => console.log("Hotel images deleted successfully."),
        () => {
            console.log("Failed to delete hotel images.");
        }
    );

    useEffect(() => {
        if(hotelFormData && mode === "edit") setHotelFormData(hotelData);

        if(hotel_id) setHotelId(hotel_id);

        if (!hotelData?.hotelCategories) return;

        const amenities = hotelData.hotelCategories
            .filter((hc) => hc.category.type === "AMENITY")
            .map((hc) => hc.category);

        const policies = hotelData.hotelCategories
            .filter((hc) => hc.category.type === "POLICY")
            .map((hc) => hc.category);

        setHotelAmenities(amenities);
        setHotelPolicies(policies);
    }, [hotelData, hotel_id]);

    const onHotelFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        hotelFormData.amenities = hotelAmenities;
        hotelFormData.policies = hotelPolicies;
        console.log("Submitting hotel form data:", hotelFormData);

        const sanitizedData = stripNulls(hotelFormData);
        console.log("Sanitized Data:", sanitizedData);
        let result;

        if(mode === "create") {
            result = HotelValidators.createHotelSchema.safeParse(sanitizedData);
        }
        else{
            result = HotelValidators.updateHotelInfoSchema.safeParse(sanitizedData);
        }

        if (!result.success) {
            const message = produceValidationErrorMessage(result);
            finishWithMessage(`Validation Failed: ${message}. Try Again.`);
            return;
        }

        console.log("res d ", result.data, "san d ", sanitizedData);
        if(mode === "create") {
            createHotelMutate(result.data as Hotel);
        } else {
            if(editMode === "MASTER_ADMIN") {
                // Call master admin update mutation
                updateHotelInfoMutate({id: sanitizedData.id, ...result.data} as Hotel);
            }
            else if(editMode === "SERVICE_ADMIN") {
                updateHotelInfoMutate({id: sanitizedData.id, ...result.data} as Hotel);
            }
        }

        setActionTrigger(true);
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        const numericFields = new Set(["totalRooms", "availableRooms"]);

        let parsedValue: string | number | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, '');
            parsedValue = noLeadingZeros === '' ? undefined : Number(noLeadingZeros);
        }
        else if (name === "website") {
            if (!value) {
                parsedValue = undefined;
            } else if (/^https?:\/\//i.test(value)) {
                parsedValue = value;
            } else {
                parsedValue = `https://${value}`;
            }
        }
        else {
            parsedValue = value || undefined;
        }

        setHotelFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));

        const updatedData = { ...hotelFormData, [name]: parsedValue };

        let result;

        if(mode === "create") {
            result = HotelValidators.createHotelSchema.safeParse(updatedData);
        }
        else{
            result = HotelValidators.updateHotelInfoSchema.safeParse(updatedData);
        }

        if (!result.success) {
            const key = name as keyof typeof result.error.formErrors.fieldErrors;
            const fieldError = result.error.formErrors.fieldErrors[key]?.[0];

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
                placeholderText="Enter hotel description"
                label="Description"
                labelStyle="text-green-300"
                name="description"
                value={hotelFormData?.description || ""}
                onChange={handleChange}
                error={errors.description}
            />

            <CustomSelectInput
                className="w-full px-2 md:px-0 md:w-[500px] bg-gray-700 text-white"
                label="Location"
                name="locationId"
                value={hotelFormData?.locationId || ""}
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

            <CustomSelectInput
                className="w-full px-2 md:px-0 md:w-[500px] bg-gray-700 text-white"
                label="Hotel Type"
                name="hotelType"
                value={hotelFormData?.hotelType || HotelType.LUXURY}
                onChange={handleChange}
                error={errors.hotelType}
                options={[
                    { label: "-- Select Hotel Type --", value: "" },
                    ...Object.values(HotelType).map((type) => ({
                        label: type.charAt(0) + type.slice(1).toLowerCase(),
                        value: type
                    }))
                ]}
            />

            {/* ActivitySpot-only fields */}
            <CustomTextInput
                type="text"
                className="w-full md:w-[500px]"
                label="Address ID - Un-implemented"
                labelStyle="text-red-400"
                name="addressId"
                value={hotelFormData.addressId || ""}
                onChange={() => {}}
                error={errors.addressId}
                disabled={true}
            />
            
            <CategorySelectionModule
                labelName="Hotel Amenities"
                availableCategories="AMENITY"
                editMode={mode}
                selectedCategories={hotelAmenities || []}
                setSelectedCategories={setHotelAmenities}
                className=""
            />

            <CategorySelectionModule
                labelName="Hotel Policies"
                availableCategories="POLICY"
                editMode={mode}
                selectedCategories={hotelPolicies || []}
                setSelectedCategories={setHotelPolicies}
                className=""
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
                secondaryLabel="(24hrs format)"
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
                secondaryLabel="(24hrs format)"
                labelStyle="text-green-300"
                name="checkOutTime"
                value={hotelFormData?.checkOutTime || ""}
                onChange={handleChange}
                error={errors.checkOutTime}
            />

            <ImageUploadModule 
                imageUploadMode={mode} 
                MAX_FILES={3}
                actionTrigger={actionTrigger} 
                resourceId={hotelId}
                resourceLabel={mode === "edit" ? "Edit Hotel Images" : "Add Hotel Images"}
                pic_url_Builder={() => productPicUploadURLBuilder(hotelId)} 
                updateResourceMutation={editMode === "SERVICE_ADMIN" ? updateHotelInfoMutate : updateHotelInfoMutate}
                deleteResourceMutation={({id, imageIds} : {id: string, imageIds: string[]}) => deleteHotelImagesMutate({hotelId: id, imageIds})}
                oldResourceImages={hotelFormData?.images || []}
            />

            <button type="submit" className="w-fit px-10 bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-3">{mode === "create" ? "Create Hotel" : "Save Changes"}</button>
        </form>
    )
}