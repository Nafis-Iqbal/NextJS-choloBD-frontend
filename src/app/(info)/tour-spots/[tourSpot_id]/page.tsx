/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { notFound } from "next/navigation"
import { TourSpotApi } from "@/services/api"
import { ReviewType, BookmarkType } from "@/types/enums"

import { StarRating } from "@/components/custom-elements/StarRating"
import { ScrollToTopButton } from "@/components/custom-elements/ScrollToTopButton"
import { BookmarkPageButton } from "@/components/custom-elements/BookmarkPageButton"
import { HeroSectionFull } from "@/components/modular-components/HeroSectionFull"
import { ReviewModule } from "@/components/modular-components/ReviewModule"
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export default async function TourSpotDetailPage({params} : {params: Promise<{tourSpot_id: string}>}) {
    const {tourSpot_id} = await params;

    // Skip API call for favicon and other non-ID requests to prevent unnecessary backend calls
    if (tourSpot_id === 'favicon.ico') {
        return null;
    }

    let tourSpotDetailsData;
    try {
        tourSpotDetailsData = await TourSpotApi.getTourSpotDetail(tourSpot_id);
    } catch (error) {
        console.error("Failed to fetch Tour Spot Details. Error: ", error);
        notFound();
    }

    const tourSpotDetails = tourSpotDetailsData?.data;
    const tourSpotImages = tourSpotDetails?.images;
    const locationId = tourSpotDetails?.locationId ?? "";
    const nearbyHotelsCount = tourSpotDetails?.nearbyHotelsCount ?? 0;
    const nearbyActivitySpotsCount = tourSpotDetails?.nearbyActivitySpotsCount ?? 0;
    const nearbyGuidesCount = tourSpotDetails?.nearbyGuidesCount ?? 0;
    const nearbyHotelsHref = `/search?hotels=true&locationId=${locationId}`;
    const nearbyActivitiesHref = `/search?activity-spots=true&locationId=${locationId}`;
    const nearbyGuidesHref = `/search?guides=true&locationId=${locationId}`;

    return (
        <div className="flex flex-col md:px-2 pb-2 font-sans theme-text">
            <div className="md:mx-6 md:mb-6 flex flex-col space-y-5">
                <div className="flex flex-col w-full space-y-2 pb-3 theme-outline">
                    <HeroSectionFull
                        className="h-[50vh] md:h-[65vh]"
                        imageList={(tourSpotImages ?? []).map((image: any) => {return {imageURL: image.url, imageAlt: image.altText}})}
                    />

                    <div className="px-3 flex flex-col space-y-2 my-10">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-10">
                            <h2 className="theme-text-teal mb-0">{tourSpotDetails?.name ?? "N/A"}</h2>
                        </div>
                            
                        <div className="flex items-center space-x-3">
                            <h4 className="theme-text-muted">Rating:</h4>
                            <StarRating rating={tourSpotDetails?.rating ?? 0}/>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 items-center">
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="theme-text-muted text-lg">Location:</span>
                                <span className="px-2 py-1 theme-text-teal rounded-md text-2xl font-bold">{tourSpotDetails?.location?.name ?? "N/A"}</span>
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

                                <Link
                                    href={nearbyActivitiesHref}
                                    className="text-base cursor-pointer bg-transparent theme-label hover:underline transition-all duration-300"
                                >
                                    Nearby Activities{" "}
                                    <span
                                        className="text-sm font-semibold"
                                        style={{
                                            color:
                                                nearbyActivitySpotsCount > 0
                                                    ? "#15803d"
                                                    : "#9a3412",
                                        }}
                                    >
                                        ({nearbyActivitySpotsCount} available)
                                    </span>
                                </Link>

                                <Link
                                    href={nearbyGuidesHref}
                                    className="text-base cursor-pointer bg-transparent theme-label hover:underline transition-all duration-300"
                                >
                                    Nearby Guides{" "}
                                    <span
                                        className="text-sm font-semibold"
                                        style={{
                                            color:
                                                nearbyGuidesCount > 0
                                                    ? "#15803d"
                                                    : "#9a3412",
                                        }}
                                    >
                                        ({nearbyGuidesCount} available)
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <BookmarkPageButton
                            bookmarkType={BookmarkType.TOUR_SPOT}
                            bookmarkAssetId={tourSpotDetails?.id ?? tourSpot_id}
                            className="mt-4"
                        />
                    </div>
                    
                    <HorizontalDivider className="mx-3 theme-outline"/>

                    <div className="px-3 flex flex-col md:flex-row md:justify-between space-x-0 md:space-x-4 space-y-4 md:space-y-0 w-full">
                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {tourSpotDetails?.tourType && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Tour Type:</span>
                                    <span className="theme-text">{tourSpotDetails.tourType}</span>
                                </div>
                            )}

                            {tourSpotDetails?.bestTimeToVisit && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Best Time to Visit:</span>
                                    <span className="theme-text">{tourSpotDetails.bestTimeToVisit}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {tourSpotDetails?.isPopular && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Popular Destination:</span>
                                    <span className="theme-text">Yes</span>
                                </div>
                            )}

                            {tourSpotDetails?.location?.name && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Location:</span>
                                    <span className="theme-text">{tourSpotDetails.location.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <label className="px-3 mt-15 theme-label text-2xl">Description</label>
                    <p className="px-3 min-h-[100px] md:min-h-[200px] theme-text">{tourSpotDetails?.description ?? "N/A"}</p>

                    {tourSpotDetails?.seasonalInfo && (
                        <div className="px-3 mt-6 space-y-3">
                            <div className="flex flex-col space-y-2">
                                <span className="theme-label">Seasonal Info:</span>
                                <div className="theme-text whitespace-pre-wrap break-words">
                                    {typeof tourSpotDetails.seasonalInfo === 'string' 
                                        ? tourSpotDetails.seasonalInfo 
                                        : JSON.stringify(tourSpotDetails.seasonalInfo, null, 2)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <ReviewModule 
                    pageAssetType={ReviewType.TOUR_SPOT}
                    assetId={tourSpotDetails?.id ?? ""}
                    assetName={tourSpotDetails?.name ?? "N/A"} 
                />

                <ScrollToTopButton className="mt-2" />
            </div>
        </div>
    )
}
