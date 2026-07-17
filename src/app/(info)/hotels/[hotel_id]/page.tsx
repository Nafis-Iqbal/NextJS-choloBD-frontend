/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { notFound } from "next/navigation"
import { HotelApi } from "@/services/api"
import { ReviewType, BookmarkType } from "@/types/enums"

import { StarRating } from "@/components/custom-elements/StarRating"
import { ScrollToTopButton } from "@/components/custom-elements/ScrollToTopButton"
import { BookmarkPageButton } from "@/components/custom-elements/BookmarkPageButton"
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
    const availableRooms = hotelDetails?.availableRooms;
    const isBookingAvailable = typeof availableRooms === "number" && availableRooms > 0;
    const bookingCity = hotelDetails?.location?.city || hotelDetails?.location?.name || "";
    const bookingSearchParams = new URLSearchParams({
        hotelId: hotel_id,
        guests: "2",
        rooms: "1",
        shift: "ALL_DAY",
    });

    if (bookingCity) {
        bookingSearchParams.set("city", bookingCity);
    }

    const bookingHref = `/booking/hotel?${bookingSearchParams.toString()}#hotel-booking-panel`;
    const locationId = hotelDetails?.locationId ?? "";
    const nearbyActivityCount = hotelDetails?.nearbyActivitySpotsCount ?? 0;
    const nearbyGuidesCount = hotelDetails?.nearbyGuidesCount ?? 0;
    const nearbyActivitiesHref = `/search?activity-spots=true&locationId=${locationId}`;
    const nearbyGuidesHref = `/search?guides=true&locationId=${locationId}`;

    return (
        <div className="flex flex-col md:px-2 pb-2 font-sans theme-text">
            <div className="md:mx-6 md:mb-6 flex flex-col space-y-5">  
                    
                <div className="flex flex-col w-full space-y-2 pb-3 theme-outline">
                    <HeroSectionFull
                        className="h-[50vh] md:h-[65vh]"
                        imageList={(hotelImages ?? []).map((image: any) => {
                            return {imageURL: image.url, imageAlt: image.altText}
                        })}
                    />

                    <div className="px-3 flex flex-col space-y-2 my-10">
                        <h2 className="theme-text-teal">{hotelDetails?.name ?? "N/A"}</h2>
                            
                        <div className="flex items-center space-x-3">
                            <h4 className="theme-text-muted">Rating:</h4>
                            <StarRating rating={hotelDetails?.rating ?? 0}/>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 items-center">
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="theme-text-muted text-lg">Available Rooms:</span>
                                <span className="px-2 py-1 theme-text-teal rounded-md text-2xl font-bold">{availableRooms ?? "N/A"}</span>
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
                                {nearbyActivityCount > 0 && (
                                <Link
                                    href={nearbyActivitiesHref}
                                    className="text-base md:text-lg cursor-pointer bg-transparent theme-label hover:underline transition-all duration-300"
                                >
                                    Nearby Activities{" "}
                                    <span className="text-sm font-semibold text-green-500">
                                        ({nearbyActivityCount} available)
                                    </span>
                                </Link>
                                )}
                                
                                {nearbyGuidesCount > 0 && (
                                <Link
                                    href={nearbyGuidesHref}
                                    className="text-base md:text-lg cursor-pointer bg-transparent theme-label hover:underline transition-all duration-300"
                                >
                                    Nearby Guides{" "}
                                    <span className="text-sm font-semibold text-green-500">
                                        ({nearbyGuidesCount} available)
                                    </span>
                                </Link>
                                )}
                            </div>
                        </div>

                        <BookmarkPageButton
                            bookmarkType={BookmarkType.HOTEL}
                            bookmarkAssetId={hotelDetails?.id ?? hotel_id}
                            className="mt-2"
                        />
                    </div>
                    
                    <HorizontalDivider className="mx-3 theme-outline"/>

                    <div className="px-3 flex flex-col md:flex-row md:justify-between space-x-0 md:space-x-4 space-y-4 md:space-y-0 w-full">
                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {hotelDetails?.location?.name && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Location:</span>
                                    <span className="theme-text">{hotelDetails.location.name}</span>
                                </div>
                            )}

                            {hotelDetails?.hotelType && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Hotel Type:</span>
                                    <span className="theme-text">{hotelDetails.hotelType}</span>
                                </div>
                            )}

                            {hotelDetails?.phoneNumber && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Phone:</span>
                                    <span className="theme-text">{hotelDetails.phoneNumber}</span>
                                </div>
                            )}

                            {hotelDetails?.email && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Email:</span>
                                    <span className="theme-text">{hotelDetails.email}</span>
                                </div>
                            )}

                            {hotelDetails?.website && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Website:</span>
                                    <a href={hotelDetails.website} target="_blank" rel="noopener noreferrer" className="theme-text-teal hover:underline">{hotelDetails.website}</a>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {hotelDetails?.checkInTime && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Check-in Time:</span>
                                    <span className="theme-text">{hotelDetails.checkInTime}</span>
                                </div>
                            )}

                            {hotelDetails?.checkOutTime && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Check-out Time:</span>
                                    <span className="theme-text">{hotelDetails.checkOutTime}</span>
                                </div>
                            )}

                            {/* {hotelDetails?.totalRooms !== undefined && hotelDetails?.totalRooms !== null && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Total Rooms:</span>
                                    <span className="theme-text">{hotelDetails.totalRooms}</span>
                                </div>
                            )} */}

                            {hotelDetails?.availableRooms !== undefined && hotelDetails?.availableRooms !== null && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Available Rooms:</span>
                                    <span className="theme-text">{hotelDetails.availableRooms}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <label className="px-3 mt-15 theme-label text-2xl">Description</label>
                    <p className="px-3 min-h-[100px] md:min-h-[200px] theme-text">{hotelDetails?.description ?? "N/A"}</p>

                    <div className="px-3 mt-6 space-y-3">

                        <div className="flex flex-col space-y-2">
                            <span className="theme-label">Nearby Attractions:</span>
                            <div className="flex flex-wrap gap-2">
                                {
                                    hotelDetails?.nearbyAttractions && hotelDetails.nearbyAttractions.length > 0 ? hotelDetails.nearbyAttractions.map((attraction: any, index: number) => (
                                        <span key={index} className="theme-badge px-4 py-2 rounded-full text-sm">
                                            {attraction}
                                        </span>
                                    )) :
                                    <span className="theme-text">N/A</span>
                                }
                            </div>
                        </div>
                       
                        <div className="flex flex-col space-y-2">
                            <span className="theme-label">Amenities:</span>
                            <div className="flex flex-wrap gap-2">
                                {
                                    hotelDetails?.amenities && hotelDetails.amenities.length > 0 ? hotelDetails.amenities.map((amenity: any) => (
                                        <span key={amenity.id} className="theme-badge px-4 py-2 rounded-full text-sm">
                                            {amenity}
                                        </span>
                                    )) : 
                                    <span className="theme-text">N/A</span>
                                }
                            </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                            <span className="theme-label">Policies:</span>
                            <div className="flex flex-wrap gap-2">
                                {
                                    hotelDetails?.policies && hotelDetails.policies.length > 0 ? hotelDetails.policies.map((policy: any) => (
                                        <span key={policy.id} className="theme-badge px-4 py-2 rounded-full text-sm">
                                            {policy}
                                        </span>
                                    )) : 
                                    <span className="theme-text">N/A</span>
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

                <ScrollToTopButton className="mt-2" />
            </div>
        </div>
    )
}