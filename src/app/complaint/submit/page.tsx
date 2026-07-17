"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import {
    CustomTextAreaInput,
    CustomTextInput,
} from "@/components/custom-elements/CustomInputElements";
import {
    ActivitySpotApi,
    AuthApi,
    ComplaintApi,
    GuideApi,
    HotelApi,
} from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import {
    ComplaintAddressedTo,
    ComplaintTargetType,
    ServiceType,
} from "@/types/enums";

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }

    return fallback;
}

function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function parseAddressedTo(value: string | null): ComplaintAddressedTo | null {
    if (!value) return null;
    if (Object.values(ComplaintAddressedTo).includes(value as ComplaintAddressedTo)) {
        return value as ComplaintAddressedTo;
    }
    return null;
}

/** Accept ComplaintTargetType or ServiceType query values. */
function parseTargetType(value: string | null): ComplaintTargetType | null {
    if (!value) return null;

    if (Object.values(ComplaintTargetType).includes(value as ComplaintTargetType)) {
        return value as ComplaintTargetType;
    }

    switch (value as ServiceType) {
        case ServiceType.HOTEL_BOOKING:
            return ComplaintTargetType.HOTEL;
        case ServiceType.ACTIVITY_BOOKING:
            return ComplaintTargetType.ACTIVITY_SPOT;
        case ServiceType.GUIDE_SERVICE:
            return ComplaintTargetType.GUIDE;
        default:
            return null;
    }
}

function targetTypeToServiceType(targetType: ComplaintTargetType): ServiceType {
    switch (targetType) {
        case ComplaintTargetType.HOTEL:
            return ServiceType.HOTEL_BOOKING;
        case ComplaintTargetType.ACTIVITY_SPOT:
            return ServiceType.ACTIVITY_BOOKING;
        case ComplaintTargetType.GUIDE:
            return ServiceType.GUIDE_SERVICE;
        default:
            return ServiceType.HOTEL_BOOKING;
    }
}

function serviceKindLabel(targetType: ComplaintTargetType | null): string {
    switch (targetType) {
        case ComplaintTargetType.HOTEL:
            return "Hotel stay";
        case ComplaintTargetType.ACTIVITY_SPOT:
            return "Activity experience";
        case ComplaintTargetType.GUIDE:
            return "Guided tour";
        default:
            return "Your booking";
    }
}

function recipientLabel(
    addressedTo: ComplaintAddressedTo,
    targetType: ComplaintTargetType | null
): string {
    if (addressedTo === ComplaintAddressedTo.MASTER_ADMIN) {
        return "CholoBD Support";
    }

    switch (targetType) {
        case ComplaintTargetType.HOTEL:
            return "the hotel team";
        case ComplaintTargetType.ACTIVITY_SPOT:
            return "the activity host";
        case ComplaintTargetType.GUIDE:
            return "your guide";
        default:
            return "the service provider";
    }
}

function recipientHeadline(
    addressedTo: ComplaintAddressedTo,
    targetType: ComplaintTargetType | null
): string {
    if (addressedTo === ComplaintAddressedTo.MASTER_ADMIN) {
        return "CholoBD Support";
    }

    switch (targetType) {
        case ComplaintTargetType.HOTEL:
            return "Hotel team";
        case ComplaintTargetType.ACTIVITY_SPOT:
            return "Activity host";
        case ComplaintTargetType.GUIDE:
            return "Your guide";
        default:
            return "Service provider";
    }
}

function ComplaintSubmitContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openNotificationPopUpMessage } = useGlobalUI();

    const addressedTo = parseAddressedTo(searchParams.get("addressedTo"));
    const serviceEntityType = parseTargetType(
        searchParams.get("serviceEntityType") || searchParams.get("targetType")
    );
    const serviceEntityId =
        searchParams.get("serviceEntityId") ||
        searchParams.get("targetEntityId") ||
        "";

    const requiresEligibility =
        addressedTo === ComplaintAddressedTo.SERVICE_ADMIN;

    const paramsValid = useMemo(() => {
        if (!addressedTo) return false;
        if (requiresEligibility) {
            return !!serviceEntityType && !!serviceEntityId;
        }
        return true;
    }, [addressedTo, requiresEligibility, serviceEntityType, serviceEntityId]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [gateChecked, setGateChecked] = useState(false);

    const { data: authResponse, isLoading: isAuthLoading } =
        AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;

    const eligibilityParams =
        requiresEligibility && serviceEntityType && serviceEntityId
            ? {
                  serviceType: targetTypeToServiceType(serviceEntityType),
                  serviceEntityId,
              }
            : null;

    const {
        data: eligibilityResponse,
        isLoading: isEligibilityLoading,
        isError: isEligibilityError,
        isFetched: isEligibilityFetched,
    } = ComplaintApi.useCheckComplaintEligibilityRQ(
        eligibilityParams,
        isAuthenticated && !!eligibilityParams
    );

    const canSubmitComplaint =
        !requiresEligibility || eligibilityResponse?.data?.canSubmit === true;

    const hotelId =
        serviceEntityType === ComplaintTargetType.HOTEL ? serviceEntityId : "";
    const activitySpotId =
        serviceEntityType === ComplaintTargetType.ACTIVITY_SPOT
            ? serviceEntityId
            : "";
    const guideId =
        serviceEntityType === ComplaintTargetType.GUIDE ? serviceEntityId : "";

    const { data: hotelResponse, isLoading: isHotelLoading } =
        HotelApi.useGetHotelDetailRQ(hotelId);
    const { data: activityResponse, isLoading: isActivityLoading } =
        ActivitySpotApi.useGetActivitySpotDetailRQ(activitySpotId);
    const { data: guideResponse, isLoading: isGuideLoading } =
        GuideApi.useGetGuideDetailRQ(guideId);

    const entityName = useMemo(() => {
        if (serviceEntityType === ComplaintTargetType.HOTEL) {
            return hotelResponse?.data?.name || null;
        }
        if (serviceEntityType === ComplaintTargetType.ACTIVITY_SPOT) {
            return activityResponse?.data?.name || null;
        }
        if (serviceEntityType === ComplaintTargetType.GUIDE) {
            const guide = guideResponse?.data;
            if (!guide) return null;
            return (
                `${guide.firstName || ""} ${guide.lastName || ""}`.trim() || null
            );
        }
        return null;
    }, [serviceEntityType, hotelResponse, activityResponse, guideResponse]);

    const isEntityLoading =
        (!!hotelId && isHotelLoading) ||
        (!!activitySpotId && isActivityLoading) ||
        (!!guideId && isGuideLoading);

    const todayLabel = formatDisplayDate(new Date());

    const { mutate: createComplaint, isPending: isSubmitting } =
        ComplaintApi.useCreateComplaintRQ(
            (response) => {
                openNotificationPopUpMessage(
                    "Thanks — your complaint has been sent."
                );
                queryClient.invalidateQueries({
                    queryKey: ["complaints", "my"],
                });
                const complaintId = response?.data?.id;
                if (complaintId) {
                    router.replace(`/complaint/${complaintId}`);
                    return;
                }
                router.replace("/");
            },
            (error: unknown) => {
                openNotificationPopUpMessage(
                    getErrorMessage(
                        error,
                        "We couldn't send your complaint. Please try again."
                    )
                );
            }
        );

    useEffect(() => {
        if (isAuthLoading) return;

        if (!isAuthenticated || !paramsValid) {
            router.replace("/");
            return;
        }

        if (!requiresEligibility) {
            setGateChecked(true);
            return;
        }

        if (isEligibilityLoading || !isEligibilityFetched) return;

        if (isEligibilityError || !canSubmitComplaint) {
            router.replace("/");
            return;
        }

        setGateChecked(true);
    }, [
        isAuthLoading,
        isAuthenticated,
        paramsValid,
        requiresEligibility,
        isEligibilityLoading,
        isEligibilityFetched,
        isEligibilityError,
        canSubmitComplaint,
        router,
    ]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!addressedTo || isSubmitting) return;

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (trimmedTitle.length < 3) {
            openNotificationPopUpMessage(
                "Please add a short title for your complaint."
            );
            return;
        }

        if (trimmedDescription.length < 10) {
            openNotificationPopUpMessage(
                "Please share a bit more detail so we can help."
            );
            return;
        }

        createComplaint({
            title: trimmedTitle,
            description: trimmedDescription,
            addressedTo,
            ...(serviceEntityType && serviceEntityId
                ? {
                      targetType: serviceEntityType,
                      targetEntityId: serviceEntityId,
                  }
                : {}),
        });
    };

    if (
        isAuthLoading ||
        !gateChecked ||
        (requiresEligibility && isEligibilityLoading)
    ) {
        return (
            <section className="w-full min-h-[60vh] flex items-center justify-center theme-text p-8">
                <p className="theme-text-muted text-base">Just a moment…</p>
            </section>
        );
    }

    const sendingTo = recipientHeadline(addressedTo!, serviceEntityType);
    const regardingName = isEntityLoading
        ? "Loading…"
        : entityName || serviceKindLabel(serviceEntityType);

    return (
        <section
            className="w-full min-h-screen theme-text px-4 py-8 md:px-8 md:py-12 font-sans"
            id="complaint_submit_page"
        >
            <div className="max-w-2xl mx-auto flex flex-col gap-8">
                <header className="space-y-3">
                    <p className="theme-text-subtle text-sm tracking-wide uppercase">
                        Help &amp; support
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold theme-text leading-tight">
                        Tell us what went wrong
                    </h1>
                    <p className="theme-text-muted text-base md:text-lg leading-relaxed max-w-xl">
                        We&apos;re sorry something didn&apos;t go as planned.
                        Share what happened and we&apos;ll pass it along to{" "}
                        {recipientLabel(addressedTo!, serviceEntityType)}.
                    </p>
                </header>

                <div
                    className="theme-section rounded-2xl px-5 py-5 md:px-6 md:py-6 space-y-4"
                    style={{
                        borderWidth: "1px",
                        borderColor: "var(--theme-deep-green)",
                    }}
                >
                    <p className="text-sm theme-text-subtle">
                        You&apos;re writing about
                    </p>

                    <div className="space-y-1">
                        <p className="text-xl md:text-2xl font-semibold theme-text-teal">
                            {regardingName}
                        </p>
                        {serviceEntityType && (
                            <p className="theme-text-muted text-sm">
                                {serviceKindLabel(serviceEntityType)}
                            </p>
                        )}
                    </div>

                    <div
                        className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"
                        style={{
                            borderTopWidth: "1px",
                            borderTopColor: "var(--theme-deep-green)",
                        }}
                    >
                        <div>
                            <p className="theme-text-subtle mb-0.5">Sending to</p>
                            <p className="theme-text font-medium">{sendingTo}</p>
                        </div>
                        <div>
                            <p className="theme-text-subtle mb-0.5">Today</p>
                            <p className="theme-text font-medium">{todayLabel}</p>
                        </div>
                    </div>

                    <p className="text-sm theme-text-muted leading-relaxed pt-1">
                        {addressedTo === ComplaintAddressedTo.MASTER_ADMIN
                            ? "Your message goes to the CholoBD support team. We'll review it and get back to you."
                            : `Your message goes straight to ${recipientLabel(addressedTo!, serviceEntityType)}. You can follow the conversation after you send it.`}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="space-y-5">
                        <CustomTextInput
                            label="What is this about?"
                            placeholderText="e.g. Dirty room on arrival, late pickup, cancelled without notice"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <CustomTextAreaInput
                            label="What happened?"
                            placeholderText="Share the details — what went wrong, when it happened, and how you'd like it resolved. The more specific you are, the faster we can help."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={8}
                            required
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1">
                        <button
                            type="submit"
                            className="theme-btn-teal w-full sm:w-auto px-6 py-3 rounded-md font-semibold disabled:opacity-60"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending…" : "Submit Complaint"}
                        </button>

                        <Link
                            href="/"
                            className="theme-text-muted text-sm text-center sm:text-left underline-offset-2 hover:underline"
                        >
                            Never mind, go back
                        </Link>
                    </div>

                    <p className="text-xs theme-text-subtle leading-relaxed">
                        Your complaint will be visible to you and the team
                        handling it. Please keep the conversation respectful.
                    </p>
                </form>
            </div>
        </section>
    );
}

export default function ComplaintSubmitPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <ComplaintSubmitContent />
        </Suspense>
    );
}
