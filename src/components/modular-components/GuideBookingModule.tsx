/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { GuideApi, GuideBookingApi } from "@/services/api";
import { createGuideBookingSchema } from "@/validators/guideBookingValidators";
import { produceValidationErrorMessage } from "@/utilities/utilities";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { queryClient } from "@/services/apiInstance";
import {
    CustomDateInput,
    CustomSelectInput,
    CustomTextAreaInput,
    CustomTextInput,
} from "@/components/custom-elements/CustomInputElements";

interface GuideBookingModuleProps {
    guideName: string;
    guideId: string;
    userId?: string;
    pricePerDay: number;
    requiresStartTime?: boolean;
    workingHoursStart?: string | null;
    workingHoursEnd?: string | null;
    initialBookingDate?: string;
    initialTravelers?: number;
    initialStartTime?: string;
    initialEndTime?: string;
    onBookingSuccess?: () => void;
    onCancel?: () => void;
}

interface BookingState {
    bookingDate: string;
    startTime: string;
    endTime: string;
    travelerCount: number;
    specialRequirements: string;
    specialRequests: string;
    paymentMethod: "wallet" | "sslcommerz" | "cash";
}

function combineLocalDateAndTime(date: string, time: string): string {
    return new Date(`${date}T${time}:00`).toISOString();
}

function estimateTotalPrice(
    pricePerDay: number,
    bookingDate: string,
    startTime: string,
    endTime: string
): number {
    if (!bookingDate || !endTime) return pricePerDay;

    if (!startTime) return pricePerDay;

    const start = new Date(`${bookingDate}T${startTime}:00`);
    const end = new Date(`${bookingDate}T${endTime}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        return pricePerDay;
    }

    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const billedDays = Math.max(1, Math.ceil(durationHours / 8));
    return pricePerDay * billedDays;
}

export function GuideBookingModule({
    guideName,
    guideId,
    userId,
    pricePerDay,
    requiresStartTime = false,
    workingHoursStart,
    workingHoursEnd,
    initialBookingDate,
    initialTravelers,
    initialStartTime,
    initialEndTime,
    onBookingSuccess,
    onCancel,
}: GuideBookingModuleProps) {
    const { openNotificationPopUpMessage } = useGlobalUI();

    const defaultStart = initialStartTime || workingHoursStart || "09:00";
    const defaultEnd = initialEndTime || workingHoursEnd || "17:00";

    const [bookingState, setBookingState] = useState<BookingState>({
        bookingDate: initialBookingDate || new Date().toISOString().split("T")[0],
        startTime: defaultStart,
        endTime: defaultEnd,
        travelerCount: initialTravelers || 1,
        specialRequirements: "",
        specialRequests: "",
        paymentMethod: "sslcommerz",
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

    useEffect(() => {
        setBookingState((prev) => ({
            ...prev,
            bookingDate: initialBookingDate || prev.bookingDate,
            travelerCount: initialTravelers || prev.travelerCount,
            startTime: initialStartTime || prev.startTime,
            endTime: initialEndTime || prev.endTime,
        }));
    }, [initialBookingDate, initialTravelers, initialStartTime, initialEndTime]);

    const isTimeValid = useMemo(() => {
        if (!bookingState.bookingDate || !bookingState.endTime) return false;
        if (requiresStartTime && !bookingState.startTime) return false;
        if (!bookingState.startTime) return true;

        const start = new Date(`${bookingState.bookingDate}T${bookingState.startTime}:00`);
        const end = new Date(`${bookingState.bookingDate}T${bookingState.endTime}:00`);
        return end.getTime() > start.getTime();
    }, [bookingState.bookingDate, bookingState.startTime, bookingState.endTime, requiresStartTime]);

    const availabilityParams = useMemo(() => {
        if (!isTimeValid) return undefined;

        return {
            bookingDate: bookingState.bookingDate,
            endTime: combineLocalDateAndTime(bookingState.bookingDate, bookingState.endTime),
            ...(bookingState.startTime
                ? {
                      startTime: combineLocalDateAndTime(
                          bookingState.bookingDate,
                          bookingState.startTime
                      ),
                  }
                : {}),
        };
    }, [bookingState.bookingDate, bookingState.startTime, bookingState.endTime, isTimeValid]);

    const { data: availabilityResponse, isFetching: isCheckingAvailability } =
        GuideApi.useCheckGuideAvailabilityRQ(guideId, availabilityParams);

    const availability = availabilityResponse?.data;
    const estimatedTotal = estimateTotalPrice(
        pricePerDay,
        bookingState.bookingDate,
        bookingState.startTime,
        bookingState.endTime
    );

    const { mutate: createBookingMutation } = GuideBookingApi.useCreateGuideBookingRQ(
        (responseData) => {
            setIsProcessing(false);
            if (responseData.status === "success") {
                setConfirmationCode(responseData.data?.confirmationCode || "REQUEST_CREATED");
                queryClient.invalidateQueries({ queryKey: ["guideBookings"] });
                openNotificationPopUpMessage(
                    "Guide booking request submitted. Payment opens after the guide accepts."
                );
                setTimeout(() => onBookingSuccess?.(), 1500);
            } else {
                openNotificationPopUpMessage(
                    responseData.message || "Failed to submit booking request. Please try again."
                );
            }
        },
        (error) => {
            setIsProcessing(false);
            openNotificationPopUpMessage(
                error?.message || "Failed to submit booking request. Please try again."
            );
        }
    );

    const handleFieldChange = <K extends keyof BookingState>(
        field: K,
        value: BookingState[K]
    ) => {
        setBookingState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!userId) {
            openNotificationPopUpMessage("Please sign in to request a guide.");
            return;
        }

        if (!isTimeValid) {
            openNotificationPopUpMessage("Please select a valid date and time range.");
            return;
        }

        if (availability && availability.available === false) {
            openNotificationPopUpMessage(
                availability.reason || "This guide is not available for the selected time."
            );
            return;
        }

        const payload = {
            guideId,
            userId,
            bookingDate: bookingState.bookingDate,
            endTime: combineLocalDateAndTime(bookingState.bookingDate, bookingState.endTime),
            travelerCount: bookingState.travelerCount,
            paymentMethod: bookingState.paymentMethod,
            ...(bookingState.startTime
                ? {
                      startTime: combineLocalDateAndTime(
                          bookingState.bookingDate,
                          bookingState.startTime
                      ),
                  }
                : {}),
            ...(bookingState.specialRequirements.trim()
                ? { specialRequirements: bookingState.specialRequirements.trim() }
                : {}),
            ...(bookingState.specialRequests.trim()
                ? { specialRequests: bookingState.specialRequests.trim() }
                : {}),
        };

        const result = createGuideBookingSchema.safeParse(payload);
        if (!result.success) {
            openNotificationPopUpMessage(
                `Validation Failed: ${produceValidationErrorMessage(result)}. Try Again.`
            );
            return;
        }

        setIsProcessing(true);
        createBookingMutation(result.data);
    };

    const handleReset = () => {
        setConfirmationCode(null);
        setBookingState({
            bookingDate: new Date().toISOString().split("T")[0],
            startTime: workingHoursStart || "09:00",
            endTime: workingHoursEnd || "17:00",
            travelerCount: 1,
            specialRequirements: "",
            specialRequests: "",
            paymentMethod: "sslcommerz",
        });
    };

    return (
        <section
            id="guide-booking-panel"
            className="mt-8 rounded-xl theme-outline bg-section p-4 md:p-6 scroll-mt-24"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div>
                    <h3 className="theme-text-teal text-2xl font-semibold">Request Guide Booking</h3>
                    <p className="theme-text-muted text-sm mt-1">
                        Booking request for <span className="theme-text font-medium">{guideName}</span>
                    </p>
                </div>
                {onCancel && (
                    <button className="green-underline-button text-sm" onClick={onCancel}>
                        Close
                    </button>
                )}
            </div>

            {confirmationCode ? (
                <div className="bg-sub-section rounded-lg theme-outline p-5 space-y-4">
                    <p className="theme-text-teal text-lg font-semibold">Request submitted</p>
                    <p className="theme-text">
                        Confirmation code:{" "}
                        <span className="theme-text-teal font-bold">{confirmationCode}</span>
                    </p>
                    <p className="theme-text-muted text-sm">
                        The guide will accept or decline your request. Payment is only available after
                        acceptance, and contact details stay hidden until the booking is confirmed.
                    </p>
                    <button className="green-button px-4 py-2 text-sm" onClick={handleReset}>
                        Request Another Slot
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-sub-section rounded-lg theme-outline p-5 mb-6">
                        <h4 className="theme-text-teal font-semibold mb-4">
                            Step 1: Date, Time & Travelers
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <CustomDateInput
                                label="Booking Date"
                                labelStyle="theme-text-teal"
                                value={bookingState.bookingDate}
                                onChange={(e) => handleFieldChange("bookingDate", e.target.value)}
                                className="w-full"
                            />
                            <CustomTextInput
                                type="time"
                                label={`Start Time${requiresStartTime ? "" : " (optional)"}`}
                                labelStyle="theme-text-teal"
                                value={bookingState.startTime}
                                onChange={(e) => handleFieldChange("startTime", e.target.value)}
                                className="w-full"
                            />
                            <CustomTextInput
                                type="time"
                                label="End Time"
                                labelStyle="theme-text-teal"
                                value={bookingState.endTime}
                                onChange={(e) => handleFieldChange("endTime", e.target.value)}
                                className="w-full"
                            />
                            <CustomSelectInput
                                label="Travelers"
                                labelStyle="theme-text-teal"
                                value={String(bookingState.travelerCount)}
                                onChange={(e) =>
                                    handleFieldChange("travelerCount", parseInt(e.target.value, 10))
                                }
                                options={Array.from({ length: 20 }, (_, i) => {
                                    const value = String(i + 1);
                                    return { label: value, value };
                                })}
                                className="w-full"
                            />
                            <CustomSelectInput
                                label="Preferred Payment"
                                labelStyle="theme-text-teal"
                                value={bookingState.paymentMethod}
                                onChange={(e) =>
                                    handleFieldChange(
                                        "paymentMethod",
                                        e.target.value as BookingState["paymentMethod"]
                                    )
                                }
                                options={[
                                    { label: "Card / SSLCommerz", value: "sslcommerz" },
                                    { label: "Wallet", value: "wallet" },
                                    { label: "Cash", value: "cash" },
                                ]}
                                className="w-full"
                            />
                        </div>

                        {!isTimeValid && (
                            <p className="text-red-400 text-xs mt-3">
                                {requiresStartTime && !bookingState.startTime
                                    ? "This guide requires a start time."
                                    : "End time must be after start time."}
                            </p>
                        )}

                        {isTimeValid && (
                            <div className="mt-3 space-y-1">
                                {isCheckingAvailability ? (
                                    <p className="theme-text-muted text-xs">Checking availability...</p>
                                ) : availability?.available === false ? (
                                    <p className="text-red-400 text-xs">
                                        {availability.reason || "Selected slot is not available."}
                                    </p>
                                ) : (
                                    <p className="theme-text-teal text-xs">
                                        ✓ Slot looks available for this guide
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-sub-section rounded-lg theme-outline p-5 mb-6">
                        <h4 className="theme-text-teal font-semibold mb-4">Step 2: Notes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomTextAreaInput
                                label="Special Requirements"
                                labelStyle="theme-text-teal"
                                value={bookingState.specialRequirements}
                                onChange={(e) =>
                                    handleFieldChange("specialRequirements", e.target.value)
                                }
                                className="w-full min-h-[100px]"
                                placeholderText="Accessibility needs, preferred language, etc."
                            />
                            <CustomTextAreaInput
                                label="Special Requests"
                                labelStyle="theme-text-teal"
                                value={bookingState.specialRequests}
                                onChange={(e) => handleFieldChange("specialRequests", e.target.value)}
                                className="w-full min-h-[100px]"
                                placeholderText="Itinerary preferences or meeting point notes"
                            />
                        </div>
                    </div>

                    <div className="bg-sub-section rounded-lg theme-outline p-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="theme-text-muted text-sm">Estimated total</p>
                                <p className="theme-text-teal text-2xl font-bold">
                                    ৳ {estimatedTotal.toLocaleString()}
                                </p>
                                <p className="theme-text-subtle text-xs mt-1">
                                    Final charge happens only after the guide accepts your request.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {onCancel && (
                                    <button
                                        className="px-4 py-2 rounded theme-outline bg-section theme-text text-sm"
                                        onClick={onCancel}
                                        disabled={isProcessing}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    className="green-button px-4 py-2 text-sm font-semibold disabled:opacity-50"
                                    onClick={handleSubmit}
                                    disabled={
                                        isProcessing ||
                                        !isTimeValid ||
                                        availability?.available === false ||
                                        !userId
                                    }
                                >
                                    {isProcessing ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </div>

                        {!userId && (
                            <p className="text-red-400 text-xs mt-3">
                                Sign in to submit a guide booking request.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
