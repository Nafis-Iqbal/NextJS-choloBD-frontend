/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { queryClient } from "@/services/apiInstance";
import { TransportServiceType } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { TransportValidators } from "@/validators";
import { LocationApi, TransportApi } from "@/services/api";
import type {
    CreateTransportData,
    UpdateTransportAdminData,
    UpdateTransportData,
} from "@/services/api/transportApi";
import {
    CustomTextInput,
    CustomTextAreaInput,
    CustomSelectInput,
} from "@/components/custom-elements/CustomInputElements";
import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
import { produceValidationErrorMessage, stripNulls } from "@/utilities/utilities";

type TransportFormMode = "create" | "edit";

interface TransportFormProps {
    mode: TransportFormMode;
    editMode: "MASTER_ADMIN" | "SERVICE_ADMIN";
    transportData?: Partial<Transport>;
    transport_id?: string;
}

const DEFAULT_TRANSPORT_DATA: Partial<Transport> = {
    transportType: TransportServiceType.BUS,
    extraPhoneNumbers: [],
    operatingRoutes: [],
    amenities: [],
    policies: [],
    isActive: true,
    isVerified: false,
    vehicleCount: 1,
};

const formatEnumLabel = (value: string) =>
    value
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");

const toCsv = (values?: string[] | null) => (values ?? []).join(", ");

export const TransportForm = ({
    mode,
    editMode,
    transportData = DEFAULT_TRANSPORT_DATA,
    transport_id,
}: TransportFormProps) => {
    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const { data: locationsListData } = LocationApi.useGetAllLocationsRQ();
    const locationsList =
        locationsListData?.data?.filter((location) => location.locationType === "DISTRICT") || [];

    const [transportId, setTransportId] = useState<string>(transport_id ?? "");
    const [formData, setFormData] = useState<Partial<Transport>>({
        ...DEFAULT_TRANSPORT_DATA,
        ...transportData,
    });
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [actionTrigger, setActionTrigger] = useState(false);

    const { mutate: createTransportMutate } = TransportApi.useCreateTransportRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Transport created successfully.");
                setTransportId(responseData.data?.id || "");
                queryClient.invalidateQueries({ queryKey: ["transports"] });
                router.replace(`/transports/${responseData.data?.id}`);
            } else {
                finishWithMessage("Failed to create transport. Try again.");
            }
        },
        () => finishWithMessage("Failed to create transport. Try again.")
    );

    const { mutate: updateTransportMutate } = TransportApi.useUpdateTransportRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Transport updated successfully.");
                queryClient.invalidateQueries({ queryKey: ["transports"] });
                router.replace(`/transports/${responseData.data?.id}`);
            } else {
                finishWithMessage("Failed to save changes. Please try again.");
            }
        },
        () => finishWithMessage("Failed to save changes. Please try again.")
    );

    const { mutate: updateTransportAdminMutate } = TransportApi.useUpdateTransportAdminRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Transport updated successfully.");
                queryClient.invalidateQueries({ queryKey: ["transports"] });
                router.replace(`/transports/${responseData.data?.id}`);
            } else {
                finishWithMessage("Failed to save changes. Please try again.");
            }
        },
        () => finishWithMessage("Failed to save changes. Please try again.")
    );

    useEffect(() => {
        if (mode !== "edit") return;
        setFormData({ ...DEFAULT_TRANSPORT_DATA, ...transportData });
        if (transport_id) setTransportId(transport_id);
    }, [mode, transportData, transport_id]);

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const sanitizedData = stripNulls(formData);
        let result;

        if (mode === "create") {
            result = TransportValidators.createTransportSchema.safeParse(sanitizedData);
        } else if (editMode === "MASTER_ADMIN") {
            result = TransportValidators.updateTransportAdminSchema.safeParse(sanitizedData);
        } else {
            result = TransportValidators.updateTransportSchema.safeParse(sanitizedData);
        }

        if (!result.success) {
            const message = produceValidationErrorMessage(result);
            finishWithMessage(`Validation Failed: ${message}. Try Again.`);
            return;
        }

        if (mode === "create") {
            createTransportMutate(result.data as CreateTransportData);
        } else if (editMode === "MASTER_ADMIN") {
            updateTransportAdminMutate({
                transportId,
                data: result.data as UpdateTransportAdminData,
            });
        } else {
            updateTransportMutate({ id: transportId, ...(result.data as UpdateTransportData) });
        }

        setActionTrigger(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, type } = e.target;
        const rawValue = e.target.value;
        let parsedValue: any;

        if (type === "checkbox") {
            parsedValue = (e.target as HTMLInputElement).checked;
        } else if (type === "number") {
            parsedValue = rawValue === "" ? undefined : Number(rawValue);
        } else if (name === "website") {
            if (!rawValue) parsedValue = undefined;
            else if (/^https?:\/\//i.test(rawValue)) parsedValue = rawValue;
            else parsedValue = `https://${rawValue}`;
        } else if (
            name === "extraPhoneNumbers" ||
            name === "operatingRoutes" ||
            name === "amenities" ||
            name === "policies"
        ) {
            parsedValue = rawValue
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        } else {
            parsedValue = rawValue || undefined;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: parsedValue,
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const imageUpdateMutation = ({ id, imageURLs }: { id: string; imageURLs: string[] }) => {
        if (editMode === "MASTER_ADMIN") {
            updateTransportAdminMutate({ transportId: id, data: { imageURLs } });
        } else {
            updateTransportMutate({ id, imageURLs });
        }
    };

    const imageDeleteMutation = ({ id, imageIds }: { id: string; imageIds: string[] }) => {
        if (editMode === "MASTER_ADMIN") {
            updateTransportAdminMutate({ transportId: id, data: { imageIdsToDelete: imageIds } });
        } else {
            updateTransportMutate({ id, imageIdsToDelete: imageIds });
        }
    };

    const canEditIdentity = mode === "create" || editMode === "MASTER_ADMIN";

    return (
        <form className="flex flex-col p-2 space-y-8 mt-5" onSubmit={onFormSubmit}>
            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Enter operator name"
                label="Transport Name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                error={errors.name}
                disabled={!canEditIdentity}
            />

            <CustomTextAreaInput
                className="w-full px-2 md:px-0 md:w-[500px] md:h-[150px]"
                placeholderText="Enter a short description"
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                error={errors.description}
            />

            <CustomSelectInput
                className="w-full px-2 md:px-0 md:w-[500px]"
                label="Transport Type"
                name="transportType"
                value={formData.transportType || TransportServiceType.BUS}
                onChange={handleChange}
                error={errors.transportType}
                disabled={!canEditIdentity}
                options={[
                    { label: "-- Select type --", value: "" },
                    ...Object.values(TransportServiceType).map((type) => ({
                        label: formatEnumLabel(type),
                        value: type,
                    })),
                ]}
            />

            <CustomSelectInput
                className="w-full px-2 md:px-0 md:w-[500px]"
                label="Primary Location"
                name="locationId"
                value={formData.locationId || ""}
                onChange={handleChange}
                error={errors.locationId}
                options={[
                    { label: "-- Select a location --", value: "" },
                    ...locationsList
                        .map((location) => ({ label: location.name, value: location.id }))
                        .sort((a, b) => a.label.localeCompare(b.label)),
                ]}
            />

            <CustomTextInput
                type="email"
                className="w-full px-2 md:px-0 md:w-[400px]"
                placeholderText="Enter contact email"
                label="Contact Email"
                name="contactEmail"
                value={formData.contactEmail || ""}
                onChange={handleChange}
                error={errors.contactEmail}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="Enter phone number"
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                error={errors.phoneNumber}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Optional extra numbers, comma separated"
                label="Extra Phone Numbers"
                name="extraPhoneNumbers"
                value={toCsv(formData.extraPhoneNumbers)}
                onChange={handleChange}
                error={errors.extraPhoneNumbers}
            />

            <CustomTextInput
                type="url"
                className="w-full px-2 md:px-0 md:w-[400px]"
                placeholderText="Enter website URL"
                label="Website"
                name="website"
                value={formData.website || ""}
                onChange={handleChange}
                error={errors.website}
            />

            <div className="flex flex-col md:flex-row gap-6">
                <CustomTextInput
                    type="number"
                    className="w-full md:w-[200px]"
                    label="Vehicle Count"
                    name="vehicleCount"
                    value={formData.vehicleCount ?? 1}
                    onChange={handleChange}
                    error={errors.vehicleCount}
                />
                <CustomTextInput
                    type="number"
                    className="w-full md:w-[200px]"
                    label="Capacity"
                    name="capacity"
                    value={formData.capacity ?? ""}
                    onChange={handleChange}
                    error={errors.capacity}
                />
            </div>

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[300px]"
                placeholderText="e.g. DHA"
                label="License Plate Prefix"
                name="licensePlatePrefix"
                value={formData.licensePlatePrefix || ""}
                onChange={handleChange}
                error={errors.licensePlatePrefix}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Dhaka-Cox's Bazar, Dhaka-Sylhet"
                label="Operating Routes"
                secondaryLabel="(comma separated)"
                name="operatingRoutes"
                value={toCsv(formData.operatingRoutes)}
                onChange={handleChange}
                error={errors.operatingRoutes}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="WiFi, Charging ports"
                label="Amenities"
                secondaryLabel="(comma separated)"
                name="amenities"
                value={toCsv(formData.amenities)}
                onChange={handleChange}
                error={errors.amenities}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="No smoking, Luggage included"
                label="Policies"
                secondaryLabel="(comma separated)"
                name="policies"
                value={toCsv(formData.policies)}
                onChange={handleChange}
                error={errors.policies}
            />

            {canEditIdentity && (
                <CustomTextInput
                    type="text"
                    className="w-full px-2 md:px-0 md:w-[500px]"
                    label="Service Admin User ID"
                    secondaryLabel="(optional UUID)"
                    name="serviceAdminUserId"
                    value={formData.serviceAdminUserId || ""}
                    onChange={handleChange}
                    error={errors.serviceAdminUserId}
                />
            )}

            {editMode === "MASTER_ADMIN" && mode === "edit" && (
                <div className="flex flex-col md:flex-row gap-6">
                    <CustomTextInput
                        type="checkbox"
                        className="w-fit"
                        label="Is Active"
                        name="isActive"
                        checked={formData.isActive ?? true}
                        onChange={handleChange}
                        error={errors.isActive}
                    />
                    <CustomTextInput
                        type="checkbox"
                        className="w-fit"
                        label="Is Verified"
                        name="isVerified"
                        checked={formData.isVerified ?? false}
                        onChange={handleChange}
                        error={errors.isVerified}
                    />
                </div>
            )}

            <ImageUploadModule
                imageUploadMode={mode}
                MAX_FILES={5}
                actionTrigger={actionTrigger}
                resourceId={transportId}
                resourceLabel={mode === "create" ? "Add Transport Images" : "Edit Transport Images"}
                pic_url_Builder={() => `cholo_bd/transports/${transportId}/images`}
                updateResourceMutation={imageUpdateMutation}
                deleteResourceMutation={imageDeleteMutation}
                oldResourceImages={formData.images}
            />

            <button type="submit" className="green-button w-fit px-10 p-2 mt-3">
                {mode === "create" ? "Create Transport" : "Save Changes"}
            </button>
        </form>
    );
};
