/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import {
    CustomSelectInput,
    CustomDateInput,
    CustomTextInput,
} from "@/components/custom-elements/CustomInputElements";
import { Language, TourType } from "@/types/enums";

import { AuthApi, GuideApi, LocationApi } from "@/services/api";
import { GuideBookingModule } from "@/components/modular-components/GuideBookingModule";
import type { GuideListParams, PaginatedGuideList } from "@/services/api/guideApi";

interface GuideCardProps {
    guide: Guide;
    onBookNowClicked: (guide: Guide) => void;
    onViewDetails: (guide: Guide) => void;
}

function formatTourTypeLabel(value: string) {
    return value
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");
}

function formatLanguageLabel(value: string) {
    return value
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");
}

function normalizeGuidesResponse(
    data: Guide[] | PaginatedGuideList | null | undefined
): Guide[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.results || [];
}

function GuideBookingContent() {
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
        startTime: "",
        endTime: "",
        travelers: "1",
        specialization: "",
        language: "",
        minRating: "0",
        sort: "rating" as "rating" | "name" | "price",
    });

    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

    const guideListParams = useMemo<GuideListParams>(() => {
        const params: GuideListParams = {
            isActive: true,
        };

        if (form.city && locationNameToIdMap[form.city]) {
            params.locationId = locationNameToIdMap[form.city];
        }

        if (form.specialization) {
            params.specialization = form.specialization as TourType;
        }

        if (form.language) {
            params.language = form.language as Language;
        }

        if (form.minRating && form.minRating !== "0") {
            params.minRating = Number(form.minRating);
        }

        return params;
    }, [form.city, form.specialization, form.language, form.minRating, locationNameToIdMap]);

    const { data: guidesResponse, isLoading, error } = GuideApi.useGetAllGuidesRQ(guideListParams);
    const guides = useMemo(
        () => normalizeGuidesResponse(guidesResponse?.data),
        [guidesResponse]
    );

    const guideIdParam = searchParams.get("guideId") || "";
    const { data: guideDetailResponse } = GuideApi.useGetGuideDetailRQ(guideIdParam);

    useEffect(() => {
        const city = searchParams.get("city") || searchParams.get("location") || "";
        const bookingDate = searchParams.get("bookingDate") || "";
        const startTime = searchParams.get("startTime") || "";
        const endTime = searchParams.get("endTime") || "";
        const travelers = searchParams.get("travelers") || "1";
        const specialization = searchParams.get("specialization") || "";
        const language = searchParams.get("language") || "";
        const minRating = searchParams.get("minRating") || "0";
        const sort = (searchParams.get("sort") || "rating") as "rating" | "name" | "price";

        setForm((prev) => ({
            ...prev,
            city: cityOptions.includes(city)
                ? city
                : prev.city || (cityOptions.length > 0 ? cityOptions[0] : ""),
            bookingDate,
            startTime,
            endTime,
            travelers: ["1", "2", "3", "4", "5", "6", "8", "10"].includes(travelers)
                ? travelers
                : "1",
            specialization: Object.values(TourType).includes(specialization as TourType)
                ? specialization
                : "",
            language: Object.values(Language).includes(language as Language) ? language : "",
            minRating: ["0", "3", "4", "4.5"].includes(minRating) ? minRating : "0",
            sort: sort === "name" || sort === "price" ? sort : "rating",
        }));
    }, [searchParams, cityOptions]);

    useEffect(() => {
        if (!guideIdParam) return;

        const matchedGuide =
            guides.find((guide) => guide.id === guideIdParam) || guideDetailResponse?.data;

        if (!matchedGuide) return;

        setSelectedGuide(matchedGuide);
        requestAnimationFrame(() => {
            document.getElementById("guide-booking-panel")?.scrollIntoView({ behavior: "smooth" });
        });
    }, [guideIdParam, guides, guideDetailResponse]);

    const results = useMemo(() => {
        const sorted = [...guides].sort((a, b) => {
            if (form.sort === "name") {
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            }
            if (form.sort === "price") {
                return a.pricePerDay - b.pricePerDay;
            }
            return (b.rating ?? 0) - (a.rating ?? 0);
        });

        return sorted;
    }, [guides, form.sort]);

    const invalidTimeRange = useMemo(() => {
        if (!form.bookingDate || !form.endTime) return false;
        if (!form.startTime) return false;

        const start = new Date(`${form.bookingDate}T${form.startTime}:00`);
        const end = new Date(`${form.bookingDate}T${form.endTime}:00`);
        return end.getTime() <= start.getTime();
    }, [form.bookingDate, form.startTime, form.endTime]);

    if (isLoading || locationsLoading) {
        return (
            <div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
                <div className="flex flex-col gap-2">
                    <h3 className="theme-text-teal font-fredericka">Guide Booking</h3>
                    <p className="theme-text-muted">Loading guide data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
                <div className="flex flex-col gap-2">
                    <h3 className="theme-text-teal font-fredericka">Guide Booking</h3>
                    <p className="text-red-400">Failed to load guides. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-3 md:p-6 mt-5 font-sans min-h-screen">
            <div className="flex flex-col gap-2">
                <h3 className="theme-text-teal font-fredericka">Guide Booking</h3>
                <p className="theme-text-muted">
                    Find a local guide and submit a booking request for your trip.
                </p>
            </div>

            <section className="flex flex-col space-y-4 md:w-[60%] mt-5 rounded-xl theme-outline bg-section p-4 md:p-5">
                <p className="text-2xl theme-text-teal">Guide Filters</p>

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
                        label="Specialization"
                        labelStyle="theme-text-teal"
                        value={form.specialization}
                        onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                        options={[
                            { label: "Any", value: "" },
                            ...Object.values(TourType).map((type) => ({
                                label: formatTourTypeLabel(type),
                                value: type,
                            })),
                        ]}
                        className="w-full"
                    />
                    <CustomSelectInput
                        label="Language"
                        labelStyle="theme-text-teal"
                        value={form.language}
                        onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                        options={[
                            { label: "Any", value: "" },
                            ...Object.values(Language).map((language) => ({
                                label: formatLanguageLabel(language),
                                value: language,
                            })),
                        ]}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
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
                            { label: "Guide name", value: "name" },
                        ]}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <CustomDateInput
                        label="Preferred Date"
                        labelStyle="theme-text-teal"
                        value={form.bookingDate}
                        onChange={(e) => setForm((p) => ({ ...p, bookingDate: e.target.value }))}
                        className="w-full"
                    />
                    <CustomSelectInput
                        label="Travelers"
                        labelStyle="theme-text-teal"
                        value={form.travelers}
                        onChange={(e) => setForm((p) => ({ ...p, travelers: e.target.value }))}
                        options={["1", "2", "3", "4", "5", "6", "8", "10"].map((n) => ({
                            label: n,
                            value: n,
                        }))}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <CustomTextInput
                        type="time"
                        label="Preferred Start Time"
                        labelStyle="theme-text-teal"
                        value={form.startTime}
                        onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                        className="w-full"
                    />
                    <CustomTextInput
                        type="time"
                        label="Preferred End Time"
                        labelStyle="theme-text-teal"
                        value={form.endTime}
                        onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
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
                                startTime: "",
                                endTime: "",
                                travelers: "1",
                                specialization: "",
                                language: "",
                                minRating: "0",
                                sort: "rating",
                            });
                            setSelectedGuide(null);
                            router.push("?");
                        }}
                    >
                        Reset
                    </button>
                </div>

                {invalidTimeRange && (
                    <p className="mt-3 text-red-400 text-sm">
                        Preferred end time must be after start time.
                    </p>
                )}
            </section>

            <section className="mt-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="theme-text-muted">
                        Showing <span className="theme-text font-medium">{results.length}</span> guides{" "}
                        {form.city && (
                            <>
                                in <span className="theme-text font-medium">{form.city}</span>
                            </>
                        )}
                    </p>
                </div>

                {results.length === 0 ? (
                    <div className="mt-3 rounded-xl theme-outline bg-sub-section p-5">
                        <p className="theme-text-subtle">No guides found. Try changing filters.</p>
                    </div>
                ) : (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((guide) => (
                            <GuideCard
                                key={guide.id}
                                guide={guide}
                                onViewDetails={() => router.push(`/guides/${guide.id}`)}
                                onBookNowClicked={() => {
                                    setSelectedGuide(guide);
                                    router.push(`#guide-booking-panel`);
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>

            {selectedGuide && (
                <GuideBookingModule
                    guideName={`${selectedGuide.firstName} ${selectedGuide.lastName}`.trim()}
                    guideId={selectedGuide.id}
                    userId={authUserId}
                    pricePerDay={selectedGuide.pricePerDay}
                    requiresStartTime={selectedGuide.requiresStartTime}
                    workingHoursStart={selectedGuide.workingHoursStart}
                    workingHoursEnd={selectedGuide.workingHoursEnd}
                    initialBookingDate={form.bookingDate}
                    initialTravelers={parseInt(form.travelers, 10)}
                    initialStartTime={form.startTime}
                    initialEndTime={form.endTime}
                    onCancel={() => setSelectedGuide(null)}
                    onBookingSuccess={() => {
                        setSelectedGuide(null);
                    }}
                />
            )}
        </div>
    );
}

export default function GuideBookingPage() {
    return (
        <Suspense fallback={<SuspenseFallback loadingText="guides" />}>
            <GuideBookingContent />
        </Suspense>
    );
}

function GuideCard({ guide, onViewDetails, onBookNowClicked }: GuideCardProps) {
    const guideName = `${guide.firstName} ${guide.lastName}`.trim();
    const specializations = (guide.specializations || []).slice(0, 2);
    const languages = (guide.languages || []).slice(0, 2);

    return (
        <div className="rounded-xl theme-outline bg-sub-section overflow-hidden">
            <div className="h-28 bg-teal-700" />
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="theme-text font-semibold">{guideName}</p>
                        <p className="text-sm theme-text-subtle">
                            {guide.location?.name || guide.location?.city || "Unknown location"}
                        </p>
                        {guide.isVerified && (
                            <p className="text-xs theme-text-teal mt-1">Verified guide</p>
                        )}
                    </div>
                    <div className="text-sm theme-star">
                        {"★".repeat(Math.max(1, Math.round(guide.rating || 0)))}
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                    {specializations.map((item) => (
                        <span
                            key={item}
                            className="text-xs px-2 py-1 rounded bg-indigo-600/20 text-indigo-300"
                        >
                            {formatTourTypeLabel(item)}
                        </span>
                    ))}
                    {languages.map((language) => (
                        <span
                            key={language}
                            className="text-xs px-2 py-1 rounded bg-sub-section theme-text-subtle"
                        >
                            {formatLanguageLabel(language)}
                        </span>
                    ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div>
                        <p className="theme-text font-semibold">৳ {guide.pricePerDay}/day</p>
                        <p className="text-xs theme-text-subtle">
                            {guide.experienceYears ?? 0}+ years experience
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="green-button text-sm px-2 py-1"
                            onClick={() => onBookNowClicked(guide)}
                        >
                            Request
                        </button>
                        <button
                            className="green-button text-sm px-2 py-1"
                            onClick={() => onViewDetails(guide)}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
