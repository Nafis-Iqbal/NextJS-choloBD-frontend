/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import {
    CustomSelectInput,
    CustomDateInput,
} from "@/components/custom-elements/CustomInputElements";
import { ActivityType } from "@/types/enums";

import { AuthApi, ActivitySpotApi, LocationApi } from "@/services/api";
import { ActivityBookingModule } from "@/components/modular-components/ActivityBookingModule";

interface ActivityCardProps {
    activitySpot: ActivitySpot;
    onBookNowClicked: (activitySpot: ActivitySpot) => void;
    onViewDetails: (activitySpot: ActivitySpot) => void;
}

function formatActivityTypeLabel(value: string) {
    return value
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");
}

function ActivityBookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const authUserId = authResponse?.data?.userId;

    const {
        data: locationsResponse,
        isLoading: locationsLoading,
    } = LocationApi.useGetAllLocationsRQ();

    const cityOptions = useMemo(() => {
        return (locationsResponse?.data || [])
            .filter((loc) => loc.locationType === "DISTRICT")
            .map((loc) => loc.name)
            .sort();
    }, [locationsResponse]);

    const locationNameToIdMap = useMemo(() => {
        const map: Record<string, string> = {};
        (locationsResponse?.data || [])
            .filter((loc) => loc.locationType === "DISTRICT")
            .forEach((loc) => {
                map[loc.name] = loc.id;
            });
        return map;
    }, [locationsResponse]);

    const [form, setForm] = useState({
        city: "",
        bookingDate: "",
        participants: "1",
        activityType: "",
        minRating: "0",
        sort: "rating" as "rating" | "name" | "price",
    });

    const [selectedActivitySpot, setSelectedActivitySpot] = useState<ActivitySpot | null>(null);

    const apiQueryString = useMemo(() => {
        const params = new URLSearchParams();

        if (form.city && locationNameToIdMap[form.city]) {
            params.append("locationId", locationNameToIdMap[form.city]);
        }

        if (form.activityType) {
            params.append("activityType", form.activityType);
        }

        if (form.minRating && form.minRating !== "0") {
            params.append("minRating", form.minRating);
        }

        params.append("isActive", "true");

        return params.toString();
    }, [form.city, form.activityType, form.minRating, locationNameToIdMap]);

    const { data: activitySpotsResponse, isLoading, error } =
        ActivitySpotApi.useGetAllActivitySpotsRQ(apiQueryString);

    const activitySpots: ActivitySpot[] = useMemo(() => {
        return activitySpotsResponse?.data || [];
    }, [activitySpotsResponse]);

    const activitySpotIdParam =
        searchParams.get("activitySpotId") || searchParams.get("activityId") || "";
    const { data: activitySpotDetailResponse } =
        ActivitySpotApi.useGetActivitySpotDetailRQ(activitySpotIdParam);

    useEffect(() => {
        const city =
            searchParams.get("city") ||
            searchParams.get("location") ||
            "";
        const bookingDate =
            searchParams.get("bookingDate") ||
            searchParams.get("date") ||
            "";
        const participants =
            searchParams.get("participants") ||
            searchParams.get("travelers") ||
            "1";
        const activityType =
            searchParams.get("activityType") ||
            searchParams.get("type") ||
            "";
        const minRating = searchParams.get("minRating") || "0";
        const sort = (searchParams.get("sort") || "rating") as "rating" | "name" | "price";

        setForm((prev) => ({
            ...prev,
            city: cityOptions.includes(city)
                ? city
                : prev.city || (cityOptions.length > 0 ? cityOptions[0] : ""),
            bookingDate,
            participants: ["1", "2", "3", "4", "5", "6", "8", "10"].includes(participants)
                ? participants
                : "1",
            activityType: Object.values(ActivityType).includes(activityType as ActivityType)
                ? activityType
                : "",
            minRating: ["0", "3", "4", "4.5"].includes(minRating) ? minRating : "0",
            sort: sort === "name" || sort === "price" ? sort : "rating",
        }));
    }, [searchParams, cityOptions]);

    useEffect(() => {
        if (!activitySpotIdParam) return;

        const matchedSpot =
            activitySpots.find((spot) => spot.id === activitySpotIdParam) ||
            activitySpotDetailResponse?.data;

        if (!matchedSpot) return;

        setSelectedActivitySpot(matchedSpot);
        requestAnimationFrame(() => {
            document
                .getElementById("activity-booking-panel")
                ?.scrollIntoView({ behavior: "smooth" });
        });
    }, [activitySpotIdParam, activitySpots, activitySpotDetailResponse]);

    const results = useMemo(() => {
        const sorted = [...activitySpots].sort((a, b) => {
            if (form.sort === "name") {
                return a.name.localeCompare(b.name);
            }
            if (form.sort === "price") {
                return (a.entryCost ?? 0) - (b.entryCost ?? 0);
            }
            return (b.rating ?? 0) - (a.rating ?? 0);
        });

        return sorted;
    }, [activitySpots, form.sort]);

    const invalidDate = useMemo(() => {
        if (!form.bookingDate) return false;
        const bookingDate = new Date(form.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate < today;
    }, [form.bookingDate]);

    if (isLoading || locationsLoading) {
        return (
            <div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
                <div className="flex flex-col gap-2">
                    <h3 className="theme-text-teal font-fredericka">Activity Booking</h3>
                    <p className="theme-text-muted">Loading activity spots...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
                <div className="flex flex-col gap-2">
                    <h3 className="theme-text-teal font-fredericka">Activity Booking</h3>
                    <p className="text-red-400">Failed to load activity spots. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-3 md:p-6 mt-5 font-sans min-h-screen">
            <div className="flex flex-col gap-2">
                <h3 className="theme-text-teal font-fredericka">Activity Booking</h3>
                <p className="theme-text-muted">
                    Find and book activity spots with QR-ready confirmation.
                </p>
            </div>

            <section className="flex flex-col space-y-4 md:w-[60%] mt-5 rounded-xl theme-outline bg-section p-4 md:p-5">
                <p className="text-2xl theme-text-teal">Activity Filters</p>

                <div className="grid grid-cols-1 gap-3 mb-4">
                    <CustomSelectInput
                        label="City / District"
                        labelStyle="theme-text-teal"
                        value={form.city}
                        onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                        options={cityOptions.map((c) => ({ label: c, value: c }))}
                        defaultSelectText="Select a location"
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <CustomSelectInput
                        label="Activity Type"
                        labelStyle="theme-text-teal"
                        value={form.activityType}
                        onChange={(e) => setForm((p) => ({ ...p, activityType: e.target.value }))}
                        options={[
                            { label: "Any", value: "" },
                            ...Object.values(ActivityType).map((type) => ({
                                label: formatActivityTypeLabel(type),
                                value: type,
                            })),
                        ]}
                        className="w-full"
                    />
                    <CustomSelectInput
                        label="Min Rating"
                        labelStyle="theme-text-teal"
                        value={form.minRating}
                        onChange={(e) => setForm((p) => ({ ...p, minRating: e.target.value }))}
                        options={[
                            { label: "Any", value: "0" },
                            { label: "3.0+", value: "3" },
                            { label: "4.0+", value: "4" },
                            { label: "4.5+", value: "4.5" },
                        ]}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <CustomDateInput
                        label="Activity Date"
                        labelStyle="theme-text-teal"
                        value={form.bookingDate}
                        onChange={(e) => setForm((p) => ({ ...p, bookingDate: e.target.value }))}
                        className="w-full"
                    />
                    <CustomSelectInput
                        label="Participants"
                        labelStyle="theme-text-teal"
                        value={form.participants}
                        onChange={(e) => setForm((p) => ({ ...p, participants: e.target.value }))}
                        options={["1", "2", "3", "4", "5", "6", "8", "10"].map((n) => ({
                            label: n,
                            value: n,
                        }))}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <CustomSelectInput
                        label="Sort"
                        labelStyle="theme-text-teal"
                        value={form.sort}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                sort: e.target.value as "rating" | "name" | "price",
                            }))
                        }
                        options={[
                            { label: "Highest rating", value: "rating" },
                            { label: "Lowest price", value: "price" },
                            { label: "Activity name", value: "name" },
                        ]}
                        className="w-full"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        className="green-underline-button"
                        onClick={() => {
                            setForm({
                                city: cityOptions.length > 0 ? cityOptions[0] : "",
                                bookingDate: "",
                                participants: "1",
                                activityType: "",
                                minRating: "0",
                                sort: "rating",
                            });
                            setSelectedActivitySpot(null);
                            router.push("?");
                        }}
                    >
                        Reset
                    </button>
                </div>

                {invalidDate && (
                    <p className="mt-3 text-red-400 text-sm">
                        Activity date cannot be in the past.
                    </p>
                )}
            </section>

            <section className="mt-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="theme-text-muted">
                        Showing <span className="theme-text font-medium">{results.length}</span>{" "}
                        activities{" "}
                        {form.city && (
                            <>
                                in <span className="theme-text font-medium">{form.city}</span>
                            </>
                        )}
                    </p>
                </div>

                {results.length === 0 ? (
                    <div className="mt-3 rounded-xl theme-outline bg-sub-section p-5">
                        <p className="theme-text-subtle">
                            No activity spots found. Try changing filters.
                        </p>
                    </div>
                ) : (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((spot) => (
                            <ActivityCard
                                key={spot.id}
                                activitySpot={spot}
                                onViewDetails={() => router.push(`/activity-spots/${spot.id}`)}
                                onBookNowClicked={() => {
                                    setSelectedActivitySpot(spot);
                                    router.push(`#activity-booking-panel`);
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>

            {selectedActivitySpot && (
                <ActivityBookingModule
                    activitySpotName={selectedActivitySpot.name}
                    activitySpotId={selectedActivitySpot.id}
                    entryCost={selectedActivitySpot.entryCost}
                    maxBookingsPerDay={selectedActivitySpot.maxBookingsPerDay}
                    openingHours={selectedActivitySpot.openingHours}
                    closingHours={selectedActivitySpot.closingHours}
                    bookingConfirmInstruction={selectedActivitySpot.bookingConfirmInstruction}
                    userId={authUserId}
                    initialBookingDate={form.bookingDate}
                    initialParticipants={parseInt(form.participants, 10)}
                    onCancel={() => setSelectedActivitySpot(null)}
                    onBookingSuccess={() => {
                        setSelectedActivitySpot(null);
                    }}
                />
            )}
        </div>
    );
}

export default function ActivityBookingPage() {
    return (
        <Suspense fallback={<SuspenseFallback loadingText="activities" />}>
            <ActivityBookingContent />
        </Suspense>
    );
}

function ActivityCard({ activitySpot, onViewDetails, onBookNowClicked }: ActivityCardProps) {
    return (
        <div className="rounded-xl theme-outline bg-sub-section overflow-hidden">
            <div className="h-28 bg-teal-700" />
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="theme-text font-semibold">{activitySpot.name}</p>
                        <p className="text-sm theme-text-subtle">
                            {activitySpot.location?.name ||
                                activitySpot.location?.city ||
                                "Unknown location"}
                        </p>
                        {activitySpot.duration && (
                            <p className="text-xs theme-text-subtle mt-1">
                                Duration: {activitySpot.duration}
                            </p>
                        )}
                    </div>
                    <div className="text-sm theme-star">
                        {"★".repeat(Math.max(1, Math.round(activitySpot.rating || 0)))}
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                    {activitySpot.activityType && (
                        <span className="text-xs px-2 py-1 rounded bg-indigo-600/20 text-indigo-300">
                            {formatActivityTypeLabel(activitySpot.activityType)}
                        </span>
                    )}
                    {activitySpot.ageRestriction && (
                        <span className="text-xs px-2 py-1 rounded bg-sub-section theme-text-subtle">
                            {activitySpot.ageRestriction}
                        </span>
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div>
                        <p className="theme-text font-semibold">
                            ৳ {(activitySpot.entryCost ?? 0).toLocaleString()}
                        </p>
                        <p className="text-xs theme-text-subtle">per participant</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="green-button text-sm px-2 py-1"
                            onClick={() => onBookNowClicked(activitySpot)}
                        >
                            Book Now
                        </button>
                        <button
                            className="green-button text-sm px-2 py-1"
                            onClick={() => onViewDetails(activitySpot)}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
