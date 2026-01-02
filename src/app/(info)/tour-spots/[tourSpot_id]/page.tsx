/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { notFound } from "next/navigation"
import { TourSpotApi } from "@/services/api"
import { ReviewType } from "@/types/enums"

import { StarRating } from "@/components/custom-elements/StarRating"
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

    return (
        <div className="flex flex-col px-2 pb-2 font-sans">
            <div className="md:mx-6 md:mb-6 flex flex-col space-y-5">
                <div className="flex flex-col w-full space-y-2 pb-3 border-[0.5px] border-green-800">
                    <HeroSectionFull
                        className="h-[65vh]"
                        imageList={(tourSpotImages ?? []).map((image: any) => {return {imageURL: image.url, imageAlt: image.altText}})}
                    />

                    <div className="px-3 flex flex-col space-y-2 my-10">
                        <h2 className="text-green-500 mb-10">{tourSpotDetails?.name ?? "N/A"}</h2>
                            
                        <div className="flex items-center space-x-3">
                            <h4 className="text-green-200">Rating:</h4>
                            <StarRating rating={tourSpotDetails?.rating ?? 0}/>
                        </div>

                        <div className="flex space-x-4 mt-4 items-baseline">
                            <span className="text-green-200 text-lg">Location:</span>
                            <span className="p-1 text-white bg-green-500 rounded-md text-2xl font-bold">{tourSpotDetails?.location.name}</span>
                        </div>
                    </div>
                    
                    <HorizontalDivider className="mx-3 border-green-800"/>

                    <div className="px-3 flex flex-col md:flex-row md:justify-between space-x-0 md:space-x-4 space-y-4 md:space-y-0 w-full">
                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {tourSpotDetails?.tourType && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Tour Type:</span>
                                    <span className="text-white">{tourSpotDetails.tourType}</span>
                                </div>
                            )}

                            {tourSpotDetails?.bestTimeToVisit && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Best Time to Visit:</span>
                                    <span className="text-white">{tourSpotDetails.bestTimeToVisit}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {tourSpotDetails?.isPopular && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Popular Destination:</span>
                                    <span className="text-white">Yes</span>
                                </div>
                            )}

                            {tourSpotDetails?.location?.name && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Location:</span>
                                    <span className="text-white">{tourSpotDetails.location.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <label className="px-3 mt-15 text-green-200 text-2xl">Description</label>
                    <p className="px-3 min-h-[100px] md:min-h-[200px]">{tourSpotDetails?.description ?? "N/A"}</p>

                    {tourSpotDetails?.seasonalInfo && (
                        <div className="px-3 mt-6 space-y-3">
                            <div className="flex flex-col space-y-2">
                                <span className="text-green-200">Seasonal Info:</span>
                                <div className="text-white whitespace-pre-wrap break-words">
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
            </div>
        </div>
    )
}