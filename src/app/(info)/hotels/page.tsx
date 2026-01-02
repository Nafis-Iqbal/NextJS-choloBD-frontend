/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { AuthApi, HotelApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

import TableLayout from "@/components/layout-elements/TableLayout";
import {HotelViewListTableRow} from "@/components/data-elements/DataTableRowElements";
import { useEffect, useState, Suspense } from "react";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

function HotelListingsPage() {
    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const router = useRouter();
    const searchParams = useSearchParams();
    const [queryString, setQueryString] = useState<string>('');

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();

    const {data: hotelsData, isLoading: isHotelsLoading, isError: isHotelsError, refetch: refetchHotels} = HotelApi.useGetAllHotelsRQ(queryString);
    const hotels = hotelsData?.data;

    const {mutate: deleteHotelMutate} = HotelApi.useDeleteHotelRQ(
        (responseData) => {
            if(responseData.status === "success") {
                finishWithMessage("Hotel deleted successfully.");
                queryClient.invalidateQueries({queryKey: ["hotels"]});
                refetchHotels();
            }
            else{
                finishWithMessage(`Failed to delete the hotel. ${responseData.message || ''}`);
            }
        },
        () => {
            finishWithMessage("Failed to delete the hotel. An error occured on the server.");
        }
    );

    const handleDeleteHotel = (tourSpotId: string) => {
        showLoadingContent(true);
        deleteHotelMutate(tourSpotId);
    }

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };
    
    useEffect(() => {
        const qString = (window.location.search).slice(1);
        setQueryString(qString);
    }, [searchParams]);

    useEffect(() => {
        refetchHotels();
    }, [queryString]);

    useEffect(() => {
        if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined || currentUserRole !== 'MASTER_ADMIN')) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return null; // or <FullPageLoader />
    }

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">Hotels</h3>
                {(hotels && hotels.length > 0) ? 
                    <p className="text-green-200">Showing {hotels?.length} of {hotels?.length} active Hotels. <span className="text-gray-400">(Pagination not implemented yet)</span></p> : 
                    <p className="text-green-200">No Hotels found.</p>
                }

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[900px]">
                            <div className="flex border-1 border-green-800 p-2 bg-gray-600 text-center">
                                <p className="w-[5%]">Sr. No.</p>
                                <p className="w-[20%]">Hotel Name</p>
                                <p className="w-[10%]">Location</p>
                                <p className="w-[20%]">Hotel Image</p>
                                <p className="w-[10%]">Hotel Type</p>
                                <p className="w-[10%]">Rating</p>
                                <p className="w-[5%]">Available Rooms</p>
                                <p className="w-[10%]">Hotel ID</p>
                                <p className="w-[10%]">Actions</p>
                            </div>
                            <div className="flex flex-col border-1 border-green-800">
                                {
                                    isHotelsLoading ? (<NoContentTableRow displayMessage="Loading Data" tdColSpan={1}/>) :
                                    isHotelsError ? (<NoContentTableRow displayMessage="An error occurred" tdColSpan={1}/>) :
                                    (hotels && Array.isArray(hotels) && hotels.length <= 0) ? 
                                    (<NoContentTableRow displayMessage="No hotels found" tdColSpan={1}/>) :
                                    
                                    (hotels ?? []).map((hotel, index) => {
                                        return (
                                            <HotelViewListTableRow 
                                                key={hotel.id} 
                                                id={index + 1} 
                                                hotelName={hotel.name || ''}
                                                hotelLocation={hotel.location?.name || 'N/A'}
                                                hotel_id={hotel.id} 
                                                hotelImageURL={hotel.images?.[0]?.url || '/image-not-found.png'} 
                                                hotelType={hotel.hotelType || 'N/A'}
                                                rating={hotel.rating || 0}
                                                totalRooms={hotel.totalRooms}
                                                onClickNavigate={() => router.push(`/hotels/${hotel.id}`)}
                                                onEdit={() => router.push(`/hotels/${hotel.id}/edit`)}
                                                onDelete={() => handleDeleteHotel(hotel.id)}
                                            />
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </TableLayout>

                <button className="green-button w-fit" onClick={() => router.push('/hotels/create')}>
                    Add new Hotel
                </button>
            </div>
        </div>
    )
}

export default function HotelListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <HotelListingsPage />
        </Suspense>
    );
}

