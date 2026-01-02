/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { notFound } from "next/navigation"
import { HotelApi } from "@/services/api"
import { ReviewType } from "@/types/enums"

import { StarRating } from "@/components/custom-elements/StarRating"
import { HeroSectionFull } from "@/components/modular-components/HeroSectionFull"
import { ReviewModule } from "@/components/modular-components/ReviewModule"
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export default async function HotelDetailPage({params} : {params: Promise<{hotel_id: string}>}) {
    const {hotel_id} = await params;

    // Skip API call for favicon and other non-ID requests to prevent unnecessary backend calls
    if (hotel_id === 'favicon.ico') {
        return null;
    }

    let hotelDetailsData;
    try {
        hotelDetailsData = await HotelApi.getHotelDetail(hotel_id);
        console.log(hotelDetailsData?.data);
    } catch (error) {
        console.error("Failed to fetch Tour Spot Details. Error: ", error);
        notFound();
    }
    const hotelDetails = hotelDetailsData?.data;
    const hotelImages = hotelDetails?.images;

    return (
        <div className="flex flex-col px-2 pb-2 font-sans">
            <div className="md:mx-6 md:mb-6 flex flex-col space-y-5">  
                    
                <div className="flex flex-col w-full space-y-2 pb-3 border-[0.5px] border-green-800">
                    <HeroSectionFull
                        className="h-[65vh]"
                        imageList={(hotelImages ?? []).map((image: any) => {
                            return {imageURL: image.url, imageAlt: image.altText}
                        })}
                    />

                    <div className="px-3 flex flex-col space-y-2 my-10">
                        <h2 className="text-green-500 mb-10">{hotelDetails?.name ?? "N/A"}</h2>
                            
                        <div className="flex items-center space-x-3">
                            <h4 className="text-green-200">Rating:</h4>
                            <StarRating rating={hotelDetails?.rating ?? 0}/>
                        </div>

                        <div className="flex space-x-4 mt-4 items-baseline">
                            <span className="text-green-200 text-lg">Available Rooms:</span>
                            <span className="p-1 text-white bg-green-500 rounded-md text-2xl font-bold">{hotelDetails.availableRooms || "N/A"}</span>
                        </div>
                    </div>
                    
                    <HorizontalDivider className="mx-3 border-green-800"/>

                    <div className="px-3 flex flex-col md:flex-row md:justify-between space-x-0 md:space-x-4 space-y-4 md:space-y-0 w-full">
                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {hotelDetails?.location?.name && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Location:</span>
                                    <span className="text-white">{hotelDetails.location.name}</span>
                                </div>
                            )}

                            {hotelDetails?.hotelType && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Hotel Type:</span>
                                    <span className="text-white">{hotelDetails.hotelType}</span>
                                </div>
                            )}

                            {hotelDetails?.phoneNumber && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Phone:</span>
                                    <span className="text-white">{hotelDetails.phoneNumber}</span>
                                </div>
                            )}

                            {hotelDetails?.email && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Email:</span>
                                    <span className="text-white">{hotelDetails.email}</span>
                                </div>
                            )}

                            {hotelDetails?.website && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Website:</span>
                                    <a href={hotelDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">{hotelDetails.website}</a>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {hotelDetails?.checkInTime && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Check-in Time:</span>
                                    <span className="text-white">{hotelDetails.checkInTime}</span>
                                </div>
                            )}

                            {hotelDetails?.checkOutTime && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Check-out Time:</span>
                                    <span className="text-white">{hotelDetails.checkOutTime}</span>
                                </div>
                            )}

                            {hotelDetails?.totalRooms !== undefined && hotelDetails?.totalRooms !== null && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Total Rooms:</span>
                                    <span className="text-white">{hotelDetails.totalRooms}</span>
                                </div>
                            )}

                            {hotelDetails?.availableRooms !== undefined && hotelDetails?.availableRooms !== null && (
                                <div className="flex justify-between">
                                    <span className="text-green-200">Available Rooms:</span>
                                    <span className="text-white">{hotelDetails.availableRooms}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <label className="px-3 mt-15 text-green-200 text-2xl">Description</label>
                    <p className="px-3 min-h-[100px] md:min-h-[200px]">{hotelDetails?.description ?? "N/A"}</p>

                    <div className="px-3 mt-6 space-y-3">

                        <div className="flex flex-col space-y-2">
                            <span className="text-green-200">Nearby Attractions:</span>
                            <div className="flex flex-wrap gap-2">
                                {
                                    hotelDetails?.nearbyAttractions && hotelDetails.nearbyAttractions.length > 0 ? hotelDetails.nearbyAttractions.map((attraction: any, index: number) => (
                                        <span key={index} className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm">
                                            {attraction}
                                        </span>
                                    )) :
                                    <span className="text-white">N/A</span>
                                }
                            </div>
                        </div>
                       
                        <div className="flex flex-col space-y-2">
                            <span className="text-green-200">Amenities:</span>
                            <div className="flex flex-wrap gap-2">
                                {
                                    hotelDetails?.amenities && hotelDetails.amenities.length > 0 ? hotelDetails.amenities.map((amenity: any) => (
                                        <span key={amenity.id} className="bg-green-900 text-white px-3 py-1 rounded-full text-sm">
                                            {amenity}
                                        </span>
                                    )) : 
                                    <span className="text-white">N/A</span>
                                }
                            </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                            <span className="text-green-200">Policies:</span>
                            <div className="flex flex-wrap gap-2">
                                {
                                    hotelDetails?.policies && hotelDetails.policies.length > 0 ? hotelDetails.policies.map((policy: any) => (
                                        <span key={policy.id} className="bg-green-900 text-white px-3 py-1 rounded-full text-sm">
                                            {policy}
                                        </span>
                                    )) : 
                                    <span className="text-white">N/A</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                
                <ReviewModule 
                    pageAssetType={ReviewType.HOTEL}
                    assetId={hotelDetails?.id ?? ""}
                    assetName={hotelDetails?.name ?? "N/A"} 
                />
            </div>
        </div>
    )
}