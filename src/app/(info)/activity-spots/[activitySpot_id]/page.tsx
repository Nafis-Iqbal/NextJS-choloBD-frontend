import Link from "next/link"
import { TourSpotApi } from "@/services/api"
import { ReviewType } from "@/types/enums"
//import type { PageProps } from ".next/types/app/page"

import { StarRating } from "@/components/custom-elements/StarRating"
import { ImageViewer } from "@/components/custom-elements/ImageViewer"
import { ReviewModule } from "@/components/modular-components/ReviewModule"


// interface Props extends PageProps {
//   params: Promise<{tourSpot_id: string}>;
// }

export default async function ActivitySpotDetailPage({params} : {params: Promise<{tourSpot_id: string}>}) {
    const {tourSpot_id} = await params;
    const tourSpotDetailsData = await TourSpotApi.getTourSpotDetail(tourSpot_id);
    const tourSpotDetails = tourSpotDetailsData?.data;
    const tourSpotImages = tourSpotDetails?.images;

    return (
        <div className="flex flex-col p-2 font-sans">
            <div className="md:mx-6 md:my-6 flex flex-col space-y-5">
                <div className="flex flex-col md:flex-row w-full space-x-5 space-y-2 md:space-y-0">
                    <ImageViewer 
                        imageList={(tourSpotImages ?? []).map((image) => {return {imageURL: image.url, imageAlt: image.altText}})}
                    />
                    
                    <div className="flex flex-col w-full md:w-[60%] p-3 border-[0.5px] border-green-800 space-y-2">
                        <div className="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 w-full">
                            <div className="flex flex-col space-y-4 md:w-[60%]">
                                <h2 className="text-green-500">{tourSpotDetails?.name ?? "N/A"}</h2>
                                
                                <div className="flex items-center space-x-3">
                                    <h4 className="text-green-200">Rating:</h4>

                                    <StarRating rating={tourSpotDetails?.rating ?? 0}/>
                                </div>
                            </div>
                        </div>
                        
                        <label className="mt-5 text-green-200">Tour Spot Description</label>
                        <p className="min-h-[100px] md:min-h-[200px]">{tourSpotDetails?.description ?? "N/A"}</p>

                        <div className="mt-6 space-y-3">
                            {tourSpotDetails?.spotType && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Spot Type:</span>
                                    <span className="text-white">{tourSpotDetails.spotType}</span>
                                </div>
                            )}

                            {tourSpotDetails?.entryCost !== undefined && tourSpotDetails?.entryCost !== null && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Entry Cost:</span>
                                    <span className="text-white">{tourSpotDetails.entryCost}</span>
                                </div>
                            )}

                            {tourSpotDetails?.openingHours && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Opening Hours:</span>
                                    <span className="text-white">{tourSpotDetails.openingHours}</span>
                                </div>
                            )}

                            {tourSpotDetails?.bestTimeToVisit && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Best Time to Visit:</span>
                                    <span className="text-white">{tourSpotDetails.bestTimeToVisit}</span>
                                </div>
                            )}

                            {tourSpotDetails?.isPopular && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Popular:</span>
                                    <span className="text-white">Yes</span>
                                </div>
                            )}

                            {tourSpotDetails?.facilities && tourSpotDetails.facilities.length > 0 && (
                                <div className="flex flex-col space-y-2">
                                    <span className="text-green-200">Facilities:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {tourSpotDetails.facilities.map((facility, index) => (
                                            <span key={index} className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm">
                                                {facility}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tourSpotDetails?.contactInfo && (
                                <div className="flex flex-col space-y-2">
                                    <span className="text-green-200">Contact Info:</span>
                                    <div className="text-white whitespace-pre-wrap break-words">
                                        {typeof tourSpotDetails.contactInfo === 'string' 
                                            ? tourSpotDetails.contactInfo 
                                            : JSON.stringify(tourSpotDetails.contactInfo, null, 2)}
                                    </div>
                                </div>
                            )}

                            {tourSpotDetails?.seasonalInfo && (
                                <div className="flex flex-col space-y-2">
                                    <span className="text-green-200">Seasonal Info:</span>
                                    <div className="text-white whitespace-pre-wrap break-words">
                                        {typeof tourSpotDetails.seasonalInfo === 'string' 
                                            ? tourSpotDetails.seasonalInfo 
                                            : JSON.stringify(tourSpotDetails.seasonalInfo, null, 2)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* testing */}
                        {/* <ProductCartConsole productDetails={productDetails?.data ?? {}} className="mt-5"/> */}
                    </div>
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