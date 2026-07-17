/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { notFound } from "next/navigation"
import { ActivitySpotApi } from "@/services/api"
import { ReviewType, BookmarkType } from "@/types/enums"

import { StarRating } from "@/components/custom-elements/StarRating"
import { ScrollToTopButton } from "@/components/custom-elements/ScrollToTopButton"
import { BookmarkPageButton } from "@/components/custom-elements/BookmarkPageButton"
import { HeroSectionFull } from "@/components/modular-components/HeroSectionFull"
import { ReviewModule } from "@/components/modular-components/ReviewModule"
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export default async function ActivitySpotDetailPage({params} : {params: Promise<{activitySpot_id: string}>}) {
    const {activitySpot_id} = await params;
    
    // Skip API call for favicon and other non-ID requests to prevent unnecessary backend calls
    if (activitySpot_id === 'favicon.ico') {
        return null;
    }
    
    let activitySpotDetailsData;
    try {
        activitySpotDetailsData = await ActivitySpotApi.getActivitySpotDetail(activitySpot_id);
    } catch (error) {
        console.error("Failed to fetch Activity Spot Details. Error: ", error);
        notFound();
    }
    const activitySpotDetails = activitySpotDetailsData?.data;
    const activitySpotImages = activitySpotDetails?.images;
    const isBookingAvailable = activitySpotDetails?.isActive === true;
    const bookingLocation = activitySpotDetails?.location?.city || activitySpotDetails?.location?.name || "";
    const bookingSearchParams = new URLSearchParams({
        activitySpotId: activitySpot_id,
        participants: "1",
    });

    if (bookingLocation) {
        bookingSearchParams.set("location", bookingLocation);
    }

    if (activitySpotDetails?.activityType) {
        bookingSearchParams.set("type", activitySpotDetails.activityType);
    }

    const bookingHref = `/booking/activity?${bookingSearchParams.toString()}#activity-booking-panel`;
    const locationId = activitySpotDetails?.locationId ?? "";
    const nearbyHotelsCount = activitySpotDetails?.nearbyHotelsCount ?? 0;
    const nearbyGuidesCount = activitySpotDetails?.nearbyGuidesCount ?? 0;
    const nearbyHotelsHref = `/search?hotels=true&locationId=${locationId}`;
    const nearbyGuidesHref = `/search?guides=true&locationId=${locationId}`;

    return (
        <div className="flex flex-col md:px-2 pb-2 font-sans theme-text">
            <div className="md:mx-6 md:mb-6 flex flex-col space-y-5">
                <div className="flex flex-col w-full space-y-2 pb-3 theme-outline">
                    <HeroSectionFull
                        className="h-[50vh] md:h-[65vh]"
                        imageList={(activitySpotImages ?? []).map((image: any) => {return {imageURL: image.url, imageAlt: image.altText}})}
                    />

                    <div className="px-3 flex flex-col my-10">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                            <h2 className="theme-text-teal mb-0">{activitySpotDetails?.name ?? "N/A"}</h2>
                        </div>
                            
                        <div className="flex items-center space-x-3 mt-4">
                            <h4 className="theme-text-muted">Rating:</h4>
                            <StarRating rating={activitySpotDetails?.rating ?? 0}/>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 items-center">
                            <span className="theme-text-muted text-lg">Location:</span>
                            <span className="px-2 py-1 theme-text-teal rounded-md text-2xl font-bold">{activitySpotDetails?.location?.name || "N/A"}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 items-center">
                            <span className="theme-text-muted text-lg">Opening Hours:</span>
                            <span className="theme-text text-2xl font-bold">{activitySpotDetails?.openingHours || "N/A"}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 items-center">
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="theme-text-muted text-lg">Entry Cost:</span>
                                <span className="px-2 py-1 theme-text-teal rounded-md text-2xl font-bold">{activitySpotDetails?.entryCost ?? "N/A"}</span>
                                {isBookingAvailable ? (
                                    <Link
                                        href={bookingHref}
                                        className="green-button px-4 py-2 text-base font-semibold cursor-pointer"
                                    >
                                        Book Now!
                                    </Link>
                                ) : (
                                    <span
                                        className="green-button px-4 py-2 text-base font-semibold opacity-50 hover:cursor-disabled pointer-events-none"
                                        aria-disabled="true"
                                    >
                                        Book Now!
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 w-full md:w-auto md:ml-auto md:justify-end">
                                <Link
                                    href={nearbyHotelsHref}
                                    className="text-base cursor-pointer bg-transparent theme-label hover:underline transition-all duration-300"
                                >
                                    Nearby Hotels{" "}
                                    <span
                                        className="text-sm font-semibold"
                                        style={{
                                            color:
                                                nearbyHotelsCount > 0
                                                    ? "#15803d"
                                                    : "#9a3412",
                                        }}
                                    >
                                        ({nearbyHotelsCount} available)
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <BookmarkPageButton
                            bookmarkType={BookmarkType.ACTIVITY_SPOT}
                            bookmarkAssetId={activitySpotDetails?.id ?? activitySpot_id}
                            className="mt-4"
                        />
                    </div>
                    
                    <HorizontalDivider className="mx-3 theme-outline"/>

                    <div className="px-3 flex flex-col md:flex-row md:justify-between space-x-0 md:space-x-4 space-y-4 md:space-y-0 w-full">
                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {activitySpotDetails?.activityType && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Activity Type:</span>
                                    <span className="theme-text">{activitySpotDetails.activityType}</span>
                                </div>
                            )}

                            {activitySpotDetails?.duration && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Duration:</span>
                                    <span className="theme-text">{activitySpotDetails.duration}</span>
                                </div>
                            )}

                            {activitySpotDetails?.isPopular && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Popular Activity:</span>
                                    <span className="theme-text">Yes</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {activitySpotDetails?.ageRestriction && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Age Restriction:</span>
                                    <span className="theme-text">{activitySpotDetails.ageRestriction}</span>
                                </div>
                            )}

                            {activitySpotDetails?.bestTimeToVisit && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Best Time to Visit:</span>
                                    <span className="theme-text">{activitySpotDetails.bestTimeToVisit}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <label className="px-3 mt-15 theme-label text-2xl">Description</label>
                    <p className="px-3 min-h-[100px] md:min-h-[200px] theme-text">{activitySpotDetails?.description ?? "N/A"}</p>
                </div>
                
                <ReviewModule 
                    pageAssetType={ReviewType.ACTIVITY_SPOT}
                    assetId={activitySpotDetails?.id ?? ""}
                    assetName={activitySpotDetails?.name ?? "N/A"} 
                />

                <ScrollToTopButton className="mt-2" />
            </div>
        </div>
    )
}
