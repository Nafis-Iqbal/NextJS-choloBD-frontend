/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideApi } from "@/services/api";
import { ReviewType, BookmarkType } from "@/types/enums";

import { StarRating } from "@/components/custom-elements/StarRating";
import { ScrollToTopButton } from "@/components/custom-elements/ScrollToTopButton";
import { BookmarkPageButton } from "@/components/custom-elements/BookmarkPageButton";
import { ImageViewerModule } from "@/components/modular-components/ImageViewerModule";
import { ReviewModule } from "@/components/modular-components/ReviewModule";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTourTypeLabel(value: string) {
    return value
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");
}

function formatWorkingDays(workingDays?: number[]) {
    if (!workingDays || workingDays.length === 0) {
        return "Not specified";
    }

    return [...workingDays]
        .sort((a, b) => a - b)
        .map((day) => DAY_LABELS[day] ?? String(day))
        .join(", ");
}

export default async function GuideDetailPage({
    params,
}: {
    params: Promise<{ guide_id: string }>;
}) {
    const { guide_id } = await params;

    if (guide_id === "favicon.ico") {
        return null;
    }

    let guideDetailsData;
    try {
        guideDetailsData = await GuideApi.getGuideDetail(guide_id);
    } catch (error) {
        console.error("Failed to fetch Guide Details. Error: ", error);
        notFound();
    }

    const guideDetails = guideDetailsData?.data;

    if (!guideDetails) {
        notFound();
    }

    const guideImages = guideDetails.images ?? [];
    const guideName = `${guideDetails.firstName} ${guideDetails.lastName}`.trim();
    const isBookingAvailable = guideDetails.isActive === true;
    const reviewCount = guideDetails._count?.reviews ?? guideDetails.reviews?.length ?? 0;
    const completedTours = guideDetails.toursCompleted;

    const bookingSearchParams = new URLSearchParams({
        guideId: guide_id,
        travelers: "1",
    });

    if (guideDetails.location?.city || guideDetails.location?.name) {
        bookingSearchParams.set(
            "location",
            guideDetails.location.city || guideDetails.location.name || ""
        );
    }

    const bookingHref = `/booking/guide?${bookingSearchParams.toString()}#guide-booking-panel`;

    const imageList = guideImages.map((image: any) => ({
        imageURL: image.url,
        imageAlt: image.altText || `${guideName} photo`,
        imageStyle: "object-cover object-center",
    }));

    return (
        <div className="flex flex-col md:px-2 pb-2 font-sans theme-text">
            <div className="md:mx-6 md:mb-6 flex flex-col space-y-5">
                <div className="flex flex-col w-full space-y-2 pb-3 theme-outline">
                    <div className="px-3 pt-6">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
                                <ImageViewerModule
                                    className="h-[420px] md:h-[520px] rounded-2xl overflow-hidden theme-outline"
                                    imagePlacementStyle="object-cover object-center"
                                    imageList={imageList}
                                />
                            </div>

                            <div className="flex-1 flex flex-col space-y-5">
                                <div className="flex flex-col space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="theme-text-teal text-3xl md:text-4xl font-semibold">
                                                {guideName || "Guide Profile"}
                                            </h2>
                                            {guideDetails.isVerified && (
                                                <span className="theme-badge px-3 py-1 rounded-full text-sm font-medium">
                                                    Verified Guide
                                                </span>
                                            )}
                                            {!guideDetails.isActive && (
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-300">
                                                    Currently Unavailable
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {guideDetails.location?.name && (
                                        <p className="theme-text-muted text-lg">
                                            Based in {guideDetails.location.name}
                                            {guideDetails.location.city &&
                                            guideDetails.location.city !== guideDetails.location.name
                                                ? `, ${guideDetails.location.city}`
                                                : ""}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="theme-text-muted">Rating:</span>
                                            <StarRating rating={guideDetails.rating ?? 0} />
                                            <span className="theme-text-muted text-sm">
                                                ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                                            </span>
                                        </div>
                                    </div>

                                    <BookmarkPageButton
                                        bookmarkType={BookmarkType.GUIDE}
                                        bookmarkAssetId={guideDetails.id ?? guide_id}
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-sub-section rounded-xl p-4 flex flex-col space-y-1">
                                        <span className="theme-label text-sm">Experience</span>
                                        <span className="theme-text-teal text-2xl font-bold">
                                            {guideDetails.experienceYears ?? 0}+ yrs
                                        </span>
                                    </div>

                                    <div className="bg-sub-section rounded-xl p-4 flex flex-col space-y-1">
                                        <span className="theme-label text-sm">Daily Rate</span>
                                        <span className="theme-text-teal text-2xl font-bold">
                                            ৳{guideDetails.pricePerDay ?? "N/A"}
                                        </span>
                                    </div>

                                    <div className="bg-sub-section rounded-xl p-4 flex flex-col space-y-1">
                                        <span className="theme-label text-sm">Availability</span>
                                        <span className="theme-text text-lg font-semibold">
                                            {guideDetails.availabilityStatus || "Available"}
                                        </span>
                                    </div>

                                    {typeof completedTours === "number" && (
                                        <div className="bg-sub-section rounded-xl p-4 flex flex-col space-y-1">
                                            <span className="theme-label text-sm">Completed Tours</span>
                                            <span className="theme-text-teal text-2xl font-bold">
                                                {completedTours}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 items-center">
                                    {isBookingAvailable ? (
                                        <Link
                                            href={bookingHref}
                                            className="green-button px-5 py-2.5 text-base font-semibold cursor-pointer"
                                        >
                                            Request Guide
                                        </Link>
                                    ) : (
                                        <span
                                            className="green-button px-5 py-2.5 text-base font-semibold opacity-50 hover:cursor-disabled pointer-events-none"
                                            aria-disabled="true"
                                        >
                                            Request Guide
                                        </span>
                                    )}

                                    <p className="theme-text-muted text-sm max-w-xl">
                                        Submit a booking request to check this guide&apos;s schedule.
                                        Contact details are shared after your request is accepted and confirmed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <HorizontalDivider className="mx-3 theme-outline my-8" />

                    <div className="px-3 flex flex-col space-y-8">
                        <div>
                            <label className="theme-label text-2xl">About</label>
                            <p className="mt-3 min-h-[80px] theme-text leading-relaxed whitespace-pre-wrap">
                                {guideDetails.bio || "This guide has not added a bio yet."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-col space-y-2">
                                    <span className="theme-label">Specializations</span>
                                    <div className="flex flex-wrap gap-2">
                                        {guideDetails.specializations &&
                                        guideDetails.specializations.length > 0 ? (
                                            guideDetails.specializations.map((specialization) => (
                                                <span
                                                    key={specialization}
                                                    className="theme-badge px-4 py-2 rounded-full text-sm"
                                                >
                                                    {formatTourTypeLabel(specialization)}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="theme-text">Not specified</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <span className="theme-label">Languages</span>
                                    <div className="flex flex-wrap gap-2">
                                        {guideDetails.languages && guideDetails.languages.length > 0 ? (
                                            guideDetails.languages.map((language) => (
                                                <span
                                                    key={language}
                                                    className="theme-badge px-4 py-2 rounded-full text-sm"
                                                >
                                                    {language
                                                        .split("_")
                                                        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
                                                        .join(" ")}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="theme-text">Not specified</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-between gap-4">
                                    <span className="theme-label">Working Days</span>
                                    <span className="theme-text text-right">
                                        {formatWorkingDays(guideDetails.workingDays)}
                                    </span>
                                </div>

                                {(guideDetails.workingHoursStart || guideDetails.workingHoursEnd) && (
                                    <div className="flex justify-between gap-4">
                                        <span className="theme-label">Working Hours</span>
                                        <span className="theme-text text-right">
                                            {guideDetails.workingHoursStart || "--:--"} –{" "}
                                            {guideDetails.workingHoursEnd || "--:--"}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between gap-4">
                                    <span className="theme-label">Start Time Required</span>
                                    <span className="theme-text">
                                        {guideDetails.requiresStartTime ? "Yes" : "No"}
                                    </span>
                                </div>

                                {guideDetails.certificationNumber && (
                                    <div className="flex justify-between gap-4">
                                        <span className="theme-label">Certification</span>
                                        <span className="theme-text text-right">
                                            {guideDetails.certificationNumber}
                                        </span>
                                    </div>
                                )}

                                {guideDetails.licenseNumber && (
                                    <div className="flex justify-between gap-4">
                                        <span className="theme-label">License</span>
                                        <span className="theme-text text-right">
                                            {guideDetails.licenseNumber}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <ReviewModule
                    pageAssetType={ReviewType.GUIDE}
                    assetId={guideDetails.id}
                    assetName={guideName || "Guide"}
                />

                <ScrollToTopButton className="mt-2" />
            </div>
        </div>
    );
}
