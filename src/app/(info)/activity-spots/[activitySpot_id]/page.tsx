/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { ActivitySpotApi } from "@/services/api"
import { ReviewType } from "@/types/enums"

import { StarRating } from "@/components/custom-elements/StarRating"
import { HeroSectionFull } from "@/components/modular-components/HeroSectionFull"
import { ReviewModule } from "@/components/modular-components/ReviewModule"
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"
import { notFound } from "next/navigation"

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
        console.error("Failed to fetch Tour Spot Details. Error: ", error);
        notFound();
    }
    const activitySpotDetails = activitySpotDetailsData?.data;
    const activitySpotImages = activitySpotDetails?.images;

    return (
        <div className="flex flex-col px-2 pb-2 font-sans">
            <div className="md:mx-6 md:mb-6 flex flex-col space-y-5">
                <div className="flex flex-col w-full space-y-2 pb-3 border-[0.5px] border-green-800">
                    <HeroSectionFull
                        className="h-[65vh]"
                        imageList={(activitySpotImages ?? []).map((image: any) => {return {imageURL: image.url, imageAlt: image.altText}})}
                    />

                    <div className="px-3 flex flex-col space-y-2 my-10">
                        <h2 className="text-green-500 mb-10">{activitySpotDetails?.name ?? "N/A"}</h2>
                            
                        <div className="flex items-center space-x-3">
                            <h4 className="text-green-200">Rating:</h4>
                            <StarRating rating={activitySpotDetails?.rating ?? 0}/>
                        </div>

                        <div className="flex space-x-4 items-baseline mt-4">
                            <span className="text-green-200 text-lg">Location:</span>
                            <span className="p-1 text-white bg-green-500 rounded-md text-2xl font-bold">{activitySpotDetails?.location.name || "N/A"}</span>
                        </div>

                        <div className="flex space-x-4 items-baseline mt-4">
                            <span className="text-green-200 text-lg">Opening Hours:</span>
                            <span className="text-white text-2xl font-bold">{activitySpotDetails?.openingHours || "N/A"}</span>
                        </div>

                        <div className="flex space-x-4 items-baseline mt-4">
                            <span className="text-green-200 text-lg">Entry Cost:</span>
                            <span className="p-1 text-white bg-green-500 rounded-md text-2xl font-bold">{activitySpotDetails?.entryCost || "N/A"}</span>
                        </div>
                    </div>
                    
                    <HorizontalDivider className="mx-3 border-green-800"/>

                    <div className="px-3 flex flex-col md:flex-row md:justify-between space-x-0 md:space-x-4 space-y-4 md:space-y-0 w-full">
                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {activitySpotDetails?.activityType && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Activity Type:</span>
                                    <span className="text-white">{activitySpotDetails.activityType}</span>
                                </div>
                            )}

                            {activitySpotDetails?.duration && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Duration:</span>
                                    <span className="text-white">{activitySpotDetails.duration}</span>
                                </div>
                            )}

                            {activitySpotDetails?.isPopular && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Popular Activity:</span>
                                    <span className="text-white">Yes</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {activitySpotDetails?.ageRestriction && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Age Restriction:</span>
                                    <span className="text-white">{activitySpotDetails.ageRestriction}</span>
                                </div>
                            )}

                            {activitySpotDetails?.bestTimeToVisit && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Best Time to Visit:</span>
                                    <span className="text-white">{activitySpotDetails.bestTimeToVisit}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <label className="px-3 mt-15 text-green-200 text-2xl">Description</label>
                    <p className="px-3 min-h-[100px] md:min-h-[200px]">{activitySpotDetails?.description ?? "N/A"}</p>
                </div>
                
                <ReviewModule 
                    pageAssetType={ReviewType.ACTIVITY_SPOT}
                    assetId={activitySpotDetails?.id ?? ""}
                    assetName={activitySpotDetails?.name ?? "N/A"} 
                />
            </div>
        </div>
    )
}