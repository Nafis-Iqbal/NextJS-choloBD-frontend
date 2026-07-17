/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { Language, TourType } from "@/types/enums";

import { GuideApi, LocationApi } from "@/services/api";
import type {
    CreateGuideData,
    UpdateGuideData,
    UpdateGuideAdminData,
} from "@/services/api/guideApi";
import { GuideValidators } from "@/validators";

import {
    CustomTextInput,
    CustomTextAreaInput,
    CustomSelectInput,
    FieldHelpInfo,
} from "@/components/custom-elements/CustomInputElements";

import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
import { produceValidationErrorMessage } from "@/utilities/utilities";

type FormMode = "create" | "edit";

interface GuideFormProps {
    mode: FormMode;
    editMode: "MASTER_ADMIN" | "SERVICE_ADMIN";
    guideData?: Partial<Guide>;
    guide_id?: string;
}

const DAY_OPTIONS = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

const defaultGuideData: Partial<Guide> = {
    specializations: [],
    languages: [],
    experienceYears: 0,
    workingDays: [1, 2, 3, 4, 5],
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    requiresStartTime: true,
    isActive: true,
    isVerified: false,
};

const formatEnumLabel = (value: string) =>
    value
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");

export const GuideForm = ({
    mode,
    editMode,
    guideData = defaultGuideData,
    guide_id,
}: GuideFormProps) => {
    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const { data: locationsListData } = LocationApi.useGetAllLocationsRQ();
    const locationsList =
        locationsListData?.data?.filter((location) => location.locationType === "DISTRICT") || [];

    const [guideId, setGuideId] = useState<string>(guide_id ?? "");
    const [guideFormData, setGuideFormData] = useState<Partial<Guide>>({
        ...defaultGuideData,
        ...guideData,
    });
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [actionTrigger, setActionTrigger] = useState<boolean>(false);

    const isAdminContext = mode === "create" || editMode === "MASTER_ADMIN";

    /* ===================== GUIDE MUTATIONS ===================== */

    const { mutate: createGuideMutate } = GuideApi.useCreateGuideRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Guide profile created.");
                setGuideId(responseData.data?.id || "");

                queryClient.invalidateQueries({ queryKey: ["guides"] });
                router.replace(`/guides/${responseData.data?.id}`);
            } else {
                finishWithMessage("Failed to create guide profile.");
            }
        },
        () => finishWithMessage("Failed to create guide profile.")
    );

    const { mutate: updateGuideMutate } = GuideApi.useUpdateGuideRQ(
        (responseData) => {
            if (responseData.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["guides"] });
                router.replace(`/guides/${responseData.data?.id}`);

                finishWithMessage("Guide profile updated.");
            } else {
                finishWithMessage("Failed to save changes.");
            }
        },
        () => finishWithMessage("Failed to save changes.")
    );

    const { mutate: updateGuideAdminMutate } = GuideApi.useUpdateGuideAdminRQ(
        (responseData) => {
            if (responseData.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["guides"] });
                router.replace(`/guides/${responseData.data?.id}`);

                finishWithMessage("Guide profile updated.");
            } else {
                finishWithMessage("Failed to save changes.");
            }
        },
        () => finishWithMessage("Failed to save changes.")
    );

    useEffect(() => {
        setGuideFormData({
            ...defaultGuideData,
            ...guideData,
            workingDays: guideData.workingDays?.length
                ? guideData.workingDays
                : defaultGuideData.workingDays,
            workingHoursStart: guideData.workingHoursStart || defaultGuideData.workingHoursStart,
            workingHoursEnd: guideData.workingHoursEnd || defaultGuideData.workingHoursEnd,
            requiresStartTime: guideData.requiresStartTime ?? true,
        });
    }, [guideData]);

    /* ===================== SUBMIT ===================== */

    const onPageFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let result;

        if (mode === "create") {
            result = GuideValidators.createGuideSchema.safeParse(guideFormData);
        } else if (editMode === "MASTER_ADMIN") {
            result = GuideValidators.updateGuideAdminSchema.safeParse(guideFormData);
        } else {
            result = GuideValidators.updateGuideSchema.safeParse(guideFormData);
        }

        if (!result.success) {
            const message = produceValidationErrorMessage(result);
            finishWithMessage(`Validation Failed: ${message}. Try Again.`);
            return;
        }

        const payload = result.data;

        if (mode === "create") {
            createGuideMutate(payload as CreateGuideData);
        } else if (editMode === "MASTER_ADMIN") {
            updateGuideAdminMutate({ id: guideId, ...(payload as UpdateGuideAdminData) });
        } else {
            updateGuideMutate({ id: guideId, ...(payload as UpdateGuideData) });
        }

        setActionTrigger(true);
    };

    /* ===================== CHANGE HANDLERS ===================== */

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, type } = e.target;
        const rawValue = (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
        let parsedValue: any;

        if (type === "checkbox") {
            parsedValue = (e.target as HTMLInputElement).checked;
        } else if (type === "number") {
            parsedValue = rawValue === "" ? undefined : Number(rawValue);
        } else {
            parsedValue = rawValue || undefined;
        }

        setGuideFormData((prev) => ({
            ...prev,
            [name]: parsedValue,
        }));

        const updatedData = { ...guideFormData, [name]: parsedValue };
        const schema =
            mode === "create"
                ? GuideValidators.createGuideSchema
                : editMode === "MASTER_ADMIN"
                  ? GuideValidators.updateGuideAdminSchema
                  : GuideValidators.updateGuideSchema;

        const result = schema.safeParse(updatedData);

        if (!result.success) {
            const fieldError = (result.error.formErrors.fieldErrors as any)[name]?.[0];
            setErrors((prev) => ({
                ...prev,
                [name]: fieldError,
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleSpecializationChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = e.target.value;
        setGuideFormData((prev) => ({
            ...prev,
            specializations: value ? [value as TourType] : [],
        }));
    };

    const validateArrayField = (
        fieldName: "languages" | "workingDays",
        nextValue: Language[] | number[]
    ) => {
        const updatedData = { ...guideFormData, [fieldName]: nextValue };
        const schema =
            mode === "create"
                ? GuideValidators.createGuideSchema
                : editMode === "MASTER_ADMIN"
                  ? GuideValidators.updateGuideAdminSchema
                  : GuideValidators.updateGuideSchema;

        const result = schema.safeParse(updatedData);
        if (!result.success) {
            const fieldError = (result.error.formErrors.fieldErrors as any)[fieldName]?.[0];
            setErrors((prev) => ({ ...prev, [fieldName]: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
        }
    };

    const toggleLanguage = (language: Language) => {
        const current = guideFormData.languages || [];
        const next = current.includes(language)
            ? current.filter((item) => item !== language)
            : [...current, language];

        setGuideFormData((prev) => ({
            ...prev,
            languages: next,
        }));

        validateArrayField("languages", next);
    };

    const toggleWorkingDay = (day: number) => {
        const current = guideFormData.workingDays || [];
        const next = current.includes(day)
            ? current.filter((item) => item !== day)
            : [...current, day].sort((a, b) => a - b);

        setGuideFormData((prev) => ({
            ...prev,
            workingDays: next,
        }));

        validateArrayField("workingDays", next);
    };

    const guidePicUploadURLBuilder = (resourceId: string) => {
        return `cholo_bd/guides/${resourceId}/images`;
    };

    const imageUpdateMutation = ({ id, imageURLs }: { id: string; imageURLs: string[] }) => {
        if (editMode === "MASTER_ADMIN") {
            updateGuideAdminMutate({ id, imageURLs });
            return;
        }

        updateGuideMutate({ id, imageURLs });
    };

    const imageDeleteMutation = ({ id, imageIds }: { id: string; imageIds: string[] }) => {
        if (editMode === "MASTER_ADMIN") {
            updateGuideAdminMutate({ id, imageIdsToDelete: imageIds });
            return;
        }

        updateGuideMutate({ id, imageIdsToDelete: imageIds });
    };

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <form onSubmit={onPageFormSubmit} className="space-y-8">
            {/* ── Section 1: Basic Info ─────────────────────────────── */}
            <section className="theme-section rounded-lg p-4 md:p-6 space-y-6">
                <h4 className="theme-label border-b pb-2" style={{ borderColor: "var(--theme-border-subtle)" }}>
                    Basic Info
                </h4>

                {isAdminContext && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <CustomTextInput
                            type="text"
                            className="w-full md:w-[250px]"
                            label="First Name"
                            name="firstName"
                            value={guideFormData.firstName || ""}
                            onChange={handleChange}
                            error={errors.firstName}
                        />

                        <CustomTextInput
                            type="text"
                            className="w-full md:w-[250px]"
                            label="Last Name"
                            name="lastName"
                            value={guideFormData.lastName || ""}
                            onChange={handleChange}
                            error={errors.lastName}
                        />
                    </div>
                )}

                <CustomTextAreaInput
                    className="w-full md:w-[500px] md:h-[150px]"
                    label="Bio"
                    name="bio"
                    value={guideFormData.bio || ""}
                    onChange={handleChange}
                    error={errors.bio}
                />

                <CustomSelectInput
                    className="w-full md:w-[500px]"
                    label="Primary Location"
                    name="locationId"
                    value={guideFormData.locationId || ""}
                    onChange={handleChange}
                    error={errors.locationId}
                    options={[
                        { label: "-- Select a location --", value: "" },
                        ...locationsList
                            .map((loc) => ({ label: loc.name, value: loc.id }))
                            .sort((a, b) => a.label.localeCompare(b.label)),
                    ]}
                />

                <div className="space-y-2 w-full">
                    <div className="flex items-center space-x-2">
                        <label className="theme-label">Languages</label>
                        <FieldHelpInfo helpInfo="Select every language this guide can use with travelers. Only the platform language list is accepted." />
                    </div>
                    <div className="flex flex-wrap gap-3 w-full">
                        {Object.values(Language).map((language) => {
                            const isSelected = (guideFormData.languages || []).includes(language);

                            return (
                                <label
                                    key={language}
                                    className="flex items-center gap-2 text-sm cursor-pointer"
                                    style={{ color: "var(--theme-text)" }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleLanguage(language)}
                                        style={{ accentColor: "var(--theme-teal)" }}
                                    />
                                    {formatEnumLabel(language)}
                                </label>
                            );
                        })}
                    </div>
                    {errors.languages && (
                        <p className="text-sm" style={{ color: "#DC2626" }}>{errors.languages}</p>
                    )}
                </div>

                <CustomSelectInput
                    className="w-full md:w-[500px]"
                    label="Specialization"
                    name="specializations"
                    value={guideFormData.specializations?.[0] || ""}
                    onChange={handleSpecializationChange}
                    error={errors.specializations}
                    options={[
                        { label: "-- Select a specialization --", value: "" },
                        ...Object.values(TourType).map((type) => ({
                            label: formatEnumLabel(type),
                            value: type,
                        })),
                    ]}
                />

                <div className="flex flex-col md:flex-row gap-6">
                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[350px]"
                        label="Phone Number"
                        name="phoneNumber"
                        value={guideFormData.phoneNumber || ""}
                        onChange={handleChange}
                        error={errors.phoneNumber}
                        helpInfo="Required contact number for this guide. Hidden from travelers until a booking is confirmed."
                    />

                    <CustomTextInput
                        type="email"
                        className="w-full md:w-[350px]"
                        label="Contact Email"
                        name="contactEmail"
                        value={guideFormData.contactEmail || ""}
                        onChange={handleChange}
                        error={errors.contactEmail}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[350px]"
                        label="Certification Number"
                        name="certificationNumber"
                        value={guideFormData.certificationNumber || ""}
                        onChange={handleChange}
                        error={errors.certificationNumber}
                    />

                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[350px]"
                        label="License Number"
                        name="licenseNumber"
                        value={guideFormData.licenseNumber || ""}
                        onChange={handleChange}
                        error={errors.licenseNumber}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <CustomTextInput
                        type="number"
                        className="w-full md:w-[250px]"
                        label="Years of Experience"
                        name="experienceYears"
                        value={guideFormData.experienceYears ?? 0}
                        onChange={handleChange}
                        error={errors.experienceYears}
                    />

                    <CustomTextInput
                        type="number"
                        className="w-full md:w-[250px]"
                        label="Price Per Day (BDT)"
                        name="pricePerDay"
                        value={guideFormData.pricePerDay ?? ""}
                        onChange={handleChange}
                        error={errors.pricePerDay}
                    />
                </div>

                <ImageUploadModule
                    imageUploadMode={mode}
                    MAX_FILES={5}
                    actionTrigger={actionTrigger}
                    resourceId={guideId}
                    resourceLabel={mode === "create" ? "Add Guide Images" : "Edit Guide Images"}
                    pic_url_Builder={() => guidePicUploadURLBuilder(guideId)}
                    updateResourceMutation={imageUpdateMutation}
                    deleteResourceMutation={imageDeleteMutation}
                    oldResourceImages={(guideFormData as any).images || []}
                />
            </section>

            {/* ── Section 2: Work Hour Preferences ──────────────────── */}
            <section className="theme-card rounded-lg p-4 md:p-6 space-y-6">
                <h4 className="theme-label border-b pb-2" style={{ borderColor: "var(--theme-border-subtle)" }}>
                    Work Hour Preferences
                </h4>

                <div className="space-y-2 w-full">
                    <div className="flex items-center space-x-2">
                        <label className="theme-label">Working Days</label>
                        <FieldHelpInfo
                            helpInfo="Days of the week this guide accepts bookings. Requests on unchecked days are rejected. Guides can run multiple timed tours on the same working day as long as the shifts do not overlap."
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 w-full">
                        {DAY_OPTIONS.map((day) => {
                            const isSelected = (guideFormData.workingDays || []).includes(day.value);

                            return (
                                <label
                                    key={day.value}
                                    className="flex items-center gap-2 text-sm cursor-pointer"
                                    style={{ color: "var(--theme-text)" }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleWorkingDay(day.value)}
                                        style={{ accentColor: "var(--theme-teal)" }}
                                    />
                                    {day.label}
                                </label>
                            );
                        })}
                    </div>
                    {errors.workingDays && (
                        <p className="text-sm" style={{ color: "#DC2626" }}>{errors.workingDays}</p>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[250px]"
                        label="Working Hours Start"
                        secondaryLabel="(HH:MM, 24-hour)"
                        name="workingHoursStart"
                        placeholderText="09:00"
                        value={guideFormData.workingHoursStart || ""}
                        onChange={handleChange}
                        error={errors.workingHoursStart}
                        helpInfo="Earliest time a tour shift may start on a working day. Every booking's start time must fall within this window. Used with Working Hours End to define the guide's daily availability range."
                    />

                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[250px]"
                        label="Working Hours End"
                        secondaryLabel="(HH:MM, 24-hour)"
                        name="workingHoursEnd"
                        placeholderText="18:00"
                        value={guideFormData.workingHoursEnd || ""}
                        onChange={handleChange}
                        error={errors.workingHoursEnd}
                        helpInfo="Latest time a tour shift may end on a working day. Must be after Working Hours Start. Booking end times outside this window are rejected."
                    />
                </div>

                <CustomTextInput
                    type="checkbox"
                    className="w-fit"
                    label="Traveler Must Provide Start Time"
                    name="requiresStartTime"
                    checked={guideFormData.requiresStartTime ?? true}
                    onChange={handleChange}
                    error={errors.requiresStartTime}
                    helpInfo="Keep this enabled for shift-based scheduling. Travelers must pick an exact start time so the guide can run multiple non-overlapping tours on the same day. If disabled, bookings default to Working Hours Start and same-day multi-tour scheduling becomes unreliable."
                />
            </section>

            {/* ── Section 3: Guide Status ───────────────────────────── */}
            {isAdminContext && (
                <section
                    className="rounded-lg p-4 md:p-6 space-y-6"
                    style={{
                        backgroundColor: "var(--theme-input-bg)",
                        border: "1px solid var(--theme-deep-green)",
                    }}
                >
                    <h4 className="theme-label border-b pb-2" style={{ borderColor: "var(--theme-border-subtle)" }}>
                        Guide Status
                    </h4>

                    <CustomTextInput
                        type="text"
                        className="w-full md:w-[500px]"
                        label="Service Admin User ID"
                        secondaryLabel="(optional UUID)"
                        name="serviceAdminUserId"
                        value={guideFormData.serviceAdminUserId || ""}
                        onChange={handleChange}
                        error={errors.serviceAdminUserId}
                        helpInfo="Assigns the SERVICE_ADMIN operator who manages this guide profile and booking requests."
                    />

                    <div className="flex flex-col md:flex-row gap-6">
                        <CustomTextInput
                            type="checkbox"
                            className="w-fit"
                            label="Is Active"
                            name="isActive"
                            checked={guideFormData.isActive ?? true}
                            onChange={handleChange}
                            error={errors.isActive}
                            helpInfo="Inactive guides are hidden from booking discovery and cannot receive new requests."
                        />

                        <CustomTextInput
                            type="checkbox"
                            className="w-fit"
                            label="Is Verified"
                            name="isVerified"
                            checked={guideFormData.isVerified ?? false}
                            onChange={handleChange}
                            error={errors.isVerified}
                            helpInfo="Marks the guide as platform-verified after credentials and profile review."
                        />
                    </div>
                </section>
            )}

            <button type="submit" className="theme-btn-teal px-6 py-2 rounded">
                {mode === "create" ? "Create Guide" : "Save Changes"}
            </button>
        </form>
    );
};
