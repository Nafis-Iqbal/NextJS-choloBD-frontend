/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivitySpotBookingApi, PaymentApi, WalletApi } from "@/services/api";
import { createActivityBookingSchema } from "@/validators/activitySpotBookingValidators";
import { produceValidationErrorMessage } from "@/utilities/utilities";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { queryClient } from "@/services/apiInstance";
import { ServiceType } from "@/types/enums";
import {
    CustomDateInput,
    CustomSelectInput,
    CustomTextAreaInput,
} from "@/components/custom-elements/CustomInputElements";

interface ActivityBookingModuleProps {
    activitySpotName: string;
    activitySpotId: string;
    entryCost: number;
    maxBookingsPerDay?: number;
    openingHours?: string | null;
    closingHours?: string | null;
    bookingConfirmInstruction?: string | null;
    userId?: string;
    initialBookingDate?: string;
    initialParticipants?: number;
    onBookingSuccess?: () => void;
    onCancel?: () => void;
}

interface BookingState {
    bookingDate: string;
    participantCount: number;
    specialRequirements: string;
    specialRequests: string;
    paymentMethod: "wallet" | "sslcommerz" | "cash";
}

export function ActivityBookingModule({
    activitySpotName,
    activitySpotId,
    entryCost,
    maxBookingsPerDay,
    openingHours,
    closingHours,
    bookingConfirmInstruction,
    userId,
    initialBookingDate,
    initialParticipants,
    onBookingSuccess,
    onCancel,
}: ActivityBookingModuleProps) {
    const { openNotificationPopUpMessage } = useGlobalUI();

    const [bookingState, setBookingState] = useState<BookingState>({
        bookingDate: initialBookingDate || new Date().toISOString().split("T")[0],
        participantCount: initialParticipants || 1,
        specialRequirements: "",
        specialRequests: "",
        paymentMethod: "sslcommerz",
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [savedConfirmInstruction, setSavedConfirmInstruction] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [payingForBooking, setPayingForBooking] = useState(false);
    const [selectedPayMethod, setSelectedPayMethod] = useState<"wallet" | "card" | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        setBookingState((prev) => ({
            ...prev,
            bookingDate: initialBookingDate || prev.bookingDate,
            participantCount: initialParticipants || prev.participantCount,
        }));
    }, [initialBookingDate, initialParticipants]);

    const isDateValid = useMemo(() => {
        if (!bookingState.bookingDate) return false;
        const bookingDate = new Date(bookingState.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
    }, [bookingState.bookingDate]);

    const estimatedTotal = useMemo(
        () => entryCost * bookingState.participantCount,
        [entryCost, bookingState.participantCount]
    );

    const { mutate: createBookingMutation } = ActivitySpotBookingApi.useCreateActivityBookingRQ(
        (responseData) => {
            setIsProcessing(false);
            if (responseData.status === "success") {
                setConfirmationCode(responseData.data?.confirmationCode || "BOOKING_CREATED");
                setBookingId(responseData.data?.id || null);
                setTotalPrice(responseData.data?.totalPrice ?? estimatedTotal);
                setSavedConfirmInstruction(
                    responseData.data?.bookingConfirmInstruction ||
                        bookingConfirmInstruction ||
                        null
                );
                queryClient.invalidateQueries({ queryKey: ["activityBookings"] });
                openNotificationPopUpMessage("Activity booking created successfully.");
            } else {
                openNotificationPopUpMessage(
                    responseData.message || "Failed to create booking. Please try again."
                );
            }
        },
        (error) => {
            setIsProcessing(false);
            openNotificationPopUpMessage(
                error?.message || "Failed to create booking. Please try again."
            );
        }
    );

    const { mutate: initializePaymentMutation } = PaymentApi.useInitializePaymentRQ(
        (responseData) => {
            setIsProcessingPayment(false);
            if (responseData.status === "success" && responseData.data?.gatewayPageURL) {
                window.location.assign(responseData.data.gatewayPageURL);
            } else {
                openNotificationPopUpMessage(
                    responseData.message || "Payment initialization failed"
                );
            }
        },
        (error) => {
            setIsProcessingPayment(false);
            openNotificationPopUpMessage(error?.message || "Failed to initialize payment");
        }
    );

    const { mutate: chargeWalletMutation } = WalletApi.useChargeWalletCreditsRQ(
        (responseData) => {
            setIsProcessingPayment(false);
            if (responseData.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["myWallet"] });
                queryClient.invalidateQueries({ queryKey: ["activityBookings"] });
                openNotificationPopUpMessage(
                    responseData.message || "Payment completed successfully"
                );
                setPayingForBooking(false);
                setSelectedPayMethod(null);
                setTimeout(() => onBookingSuccess?.(), 2000);
            } else {
                openNotificationPopUpMessage(
                    responseData.message || "Failed to charge wallet"
                );
            }
        },
        (error) => {
            setIsProcessingPayment(false);
            openNotificationPopUpMessage(error?.message || "Failed to process wallet payment");
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
            openNotificationPopUpMessage("Please sign in to book an activity.");
            return;
        }

        if (!isDateValid) {
            openNotificationPopUpMessage("Please select a valid booking date.");
            return;
        }

        const payload = {
            activitySpotId,
            userId,
            bookingDate: bookingState.bookingDate,
            participantCount: bookingState.participantCount,
            paymentMethod: bookingState.paymentMethod,
            ...(bookingState.specialRequirements.trim()
                ? { specialRequirements: bookingState.specialRequirements.trim() }
                : {}),
            ...(bookingState.specialRequests.trim()
                ? { specialRequests: bookingState.specialRequests.trim() }
                : {}),
        };

        const result = createActivityBookingSchema.safeParse(payload);
        if (!result.success) {
            openNotificationPopUpMessage(
                `Validation Failed: ${produceValidationErrorMessage(result)}. Try Again.`
            );
            return;
        }

        setIsProcessing(true);
        createBookingMutation(result.data);
    };

    const onProceedPaymentClicked = () => {
        if (!selectedPayMethod || !bookingId || !userId) return;

        setIsProcessingPayment(true);

        if (selectedPayMethod === "card") {
            initializePaymentMutation({
                serviceType: ServiceType.ACTIVITY_BOOKING,
                serviceTypeId: bookingId,
                userId,
                paymentAmount: totalPrice,
            });
        } else if (selectedPayMethod === "wallet") {
            const creditsAmount = Math.floor(totalPrice * 0.8);
            chargeWalletMutation({
                serviceType: ServiceType.ACTIVITY_BOOKING,
                serviceTypeId: bookingId,
                paymentAmount: creditsAmount,
            });
        }
    };

    const handleReset = () => {
        setConfirmationCode(null);
        setBookingId(null);
        setSavedConfirmInstruction(null);
        setTotalPrice(0);
        setPayingForBooking(false);
        setSelectedPayMethod(null);
        setBookingState({
            bookingDate: new Date().toISOString().split("T")[0],
            participantCount: 1,
            specialRequirements: "",
            specialRequests: "",
            paymentMethod: "sslcommerz",
        });
    };

    return (
        <section
            id="activity-booking-panel"
            className="mt-8 rounded-xl theme-outline bg-section p-4 md:p-6 scroll-mt-24"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div>
                    <h3 className="theme-text-teal text-2xl font-semibold">Book Activity</h3>
                    <p className="theme-text-muted text-sm mt-1">
                        Booking for <span className="theme-text font-medium">{activitySpotName}</span>
                    </p>
                    {(openingHours || closingHours) && (
                        <p className="theme-text-subtle text-xs mt-1">
                            Hours: {openingHours || "—"} – {closingHours || "—"}
                            {maxBookingsPerDay
                                ? ` · Max ${maxBookingsPerDay} bookings/day`
                                : ""}
                        </p>
                    )}
                </div>
                {onCancel && (
                    <button className="green-underline-button text-sm" onClick={onCancel}>
                        Close
                    </button>
                )}
            </div>

            {confirmationCode ? (
                <div className="bg-sub-section rounded-lg theme-outline p-5 space-y-4 max-w-2xl">
                    <p className="theme-text-teal text-lg font-semibold">Booking created</p>
                    <p className="theme-text">
                        Confirmation code:{" "}
                        <span className="theme-text-teal font-bold">{confirmationCode}</span>
                    </p>

                    {savedConfirmInstruction && (
                        <div className="rounded-lg bg-section theme-outline p-3">
                            <p className="theme-text-muted text-xs font-semibold mb-1">
                                Confirmation instructions
                            </p>
                            <p className="theme-text text-sm whitespace-pre-wrap">
                                {savedConfirmInstruction}
                            </p>
                        </div>
                    )}

                    <div className="bg-section rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="theme-text font-medium">Total Amount:</span>
                            <span className="theme-text-teal text-xl font-bold">
                                ৳ {totalPrice.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex space-x-2 w-full">
                            <button
                                onClick={() => {
                                    setPayingForBooking(!payingForBooking);
                                    setSelectedPayMethod(null);
                                }}
                                className="flex-1 px-3 py-2 theme-btn-teal text-sm rounded font-medium transition-colors"
                            >
                                Pay Now
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 px-3 py-2 green-button text-sm rounded font-medium transition-all"
                            >
                                Book Another
                            </button>
                        </div>

                        {payingForBooking && (
                            <div className="mt-4 p-3 bg-section rounded-lg">
                                <p className="theme-text-muted text-xs font-semibold mb-3">
                                    Select Payment Method
                                </p>
                                <div className="space-y-2 mb-3">
                                    <label className="flex items-center gap-3 p-2 bg-sub-section rounded theme-outline cursor-pointer hover:border-2 hover:border-teal-500/60 transition-colors">
                                        <input
                                            type="radio"
                                            name="activity-payment-method"
                                            value="wallet"
                                            checked={selectedPayMethod === "wallet"}
                                            onChange={() => setSelectedPayMethod("wallet")}
                                            className="w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <p className="theme-text text-xs font-medium">
                                                Wallet
                                            </p>
                                            <p className="theme-text-subtle text-xs">
                                                Pay using your wallet balance
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-2 bg-sub-section rounded theme-outline cursor-pointer hover:border-2 hover:border-teal-500/60 transition-colors">
                                        <input
                                            type="radio"
                                            name="activity-payment-method"
                                            value="card"
                                            checked={selectedPayMethod === "card"}
                                            onChange={() => setSelectedPayMethod("card")}
                                            className="w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <p className="theme-text text-xs font-medium">Card</p>
                                            <p className="theme-text-subtle text-xs">
                                                Pay using credit or debit card
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        disabled={!selectedPayMethod || isProcessingPayment}
                                        onClick={onProceedPaymentClicked}
                                        className="flex-1 px-3 py-2 theme-btn-teal text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessingPayment
                                            ? "Processing..."
                                            : "Proceed Payment"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPayingForBooking(false);
                                            setSelectedPayMethod(null);
                                        }}
                                        disabled={isProcessingPayment}
                                        className="px-3 py-2 bg-section theme-outline text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed theme-text hover:theme-text-teal"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-sub-section rounded-lg theme-outline p-5 mb-6">
                        <h4 className="theme-text-teal font-semibold mb-4">
                            Step 1: Date & Participants
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <CustomDateInput
                                label="Activity Date"
                                labelStyle="theme-text-teal"
                                value={bookingState.bookingDate}
                                onChange={(e) => handleFieldChange("bookingDate", e.target.value)}
                                className="w-full"
                            />
                            <CustomSelectInput
                                label="Participants"
                                labelStyle="theme-text-teal"
                                value={String(bookingState.participantCount)}
                                onChange={(e) =>
                                    handleFieldChange(
                                        "participantCount",
                                        parseInt(e.target.value, 10)
                                    )
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

                        {!isDateValid && (
                            <p className="text-red-400 text-xs mt-3">
                                Booking date cannot be in the past.
                            </p>
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
                                placeholderText="Age, accessibility, gear needs, etc."
                            />
                            <CustomTextAreaInput
                                label="Special Requests"
                                labelStyle="theme-text-teal"
                                value={bookingState.specialRequests}
                                onChange={(e) =>
                                    handleFieldChange("specialRequests", e.target.value)
                                }
                                className="w-full min-h-[100px]"
                                placeholderText="Preferred time window or meeting notes"
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
                                    ৳ {entryCost.toLocaleString()} × {bookingState.participantCount}{" "}
                                    participant
                                    {bookingState.participantCount !== 1 ? "s" : ""}
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
                                    disabled={isProcessing || !isDateValid || !userId}
                                >
                                    {isProcessing ? "Booking..." : "Confirm Booking"}
                                </button>
                            </div>
                        </div>

                        {!userId && (
                            <p className="text-red-400 text-xs mt-3">
                                Sign in to book this activity.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
