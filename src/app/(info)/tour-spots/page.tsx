/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { AuthApi, TourSpotApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import TableLayout from "@/components/layout-elements/TableLayout";
import {TourSpotViewListTableRow} from "@/components/data-elements/DataTableRowElements";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";

function TourSpotListingsPage() {
    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const router = useRouter();
    const searchParams = useSearchParams();
    const [queryString, setQueryString] = useState<string>('');

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();

    const {data: tourSpotsData, isLoading: isFetchLoading, isError: isFetchError, refetch: refetchTourSpots} = TourSpotApi.useGetAllTourSpotsRQ(queryString);
    const tourSpots = tourSpotsData?.data;

    const {mutate: deleteTourSpotMutate} = TourSpotApi.useDeleteTourSpotRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                finishWithMessage("Tour spot deleted successfully.");
                refetchTourSpots();
            }
            else{
                finishWithMessage(`Failed to delete the tour spot. ${responseData.message || ''}`);
            }
        },
        () => {
            finishWithMessage("Failed to delete the tour spot. An error occured on the server.");
        }
    );

    const handleDeleteTourSpot = (tourSpotId: string) => {
        showLoadingContent(true);
        deleteTourSpotMutate(tourSpotId);
    }

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    }

    useEffect(() => {
        const qString = (window.location.search).slice(1);
        setQueryString(qString);
    }, [searchParams]);

    useEffect(() => {
        refetchTourSpots();
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
                <h3 className="text-green-500">Tour Spots</h3>
                {(tourSpots && tourSpots.length > 0) ? 
                    <p className="text-green-200">Showing {tourSpots?.length} of {tourSpots?.length} active Tour Spots. <span className="text-gray-400">(Pagination not implemented yet)</span></p> : 
                    <p className="text-green-200">No Tour Spots found.</p>
                }

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[900px]">
                            <div className="flex border-1 border-green-800 p-2 bg-gray-600 text-center">
                                <p className="w-[5%]">Sr. No.</p>
                                <p className="w-[15%]">Tour Spot Name</p>
                                <p className="w-[15%]">Tour Spot Location</p>
                                <p className="w-[20%]">Tour Spot Image</p>
                                <p className="w-[10%]">Spot Type</p>
                                <p className="w-[5%]">Rating</p>
                                <p className="w-[10%]">Is Popular</p>
                                <p className="w-[10%]">Tour Spot ID</p>
                                <p className="w-[10%]">Actions</p>
                            </div>
                            <div className="flex flex-col border-1 border-green-800">
                                {
                                    isFetchLoading ? (<NoContentTableRow displayMessage="Loading Data" tdColSpan={1}/>) :
                                    isFetchError ? (<NoContentTableRow displayMessage="An error occurred" tdColSpan={1}/>) :
                                    (tourSpots && Array.isArray(tourSpots) && tourSpots.length <= 0) ? 
                                    (<NoContentTableRow displayMessage="No activity spots found" tdColSpan={1}/>) :

                                    (tourSpots ?? []).map((tourSpot, index) => {
                                        return (
                                            <TourSpotViewListTableRow 
                                                key={tourSpot.id} 
                                                id={index + 1} 
                                                tourSpotName={tourSpot.name || ''} 
                                                tourSpotLocation={tourSpot?.location?.name || 'N/A'}
                                                tourSpot_id={tourSpot.id} 
                                                tourSpotImageURL={tourSpot.images?.[0]?.url || '/image-not-found.png'} 
                                                tourType={tourSpot.tourType || 'N/A'}
                                                rating={tourSpot.rating}
                                                isPopular={tourSpot.isPopular || false}
                                                onClickNavigate={() => router.push(`/tour-spots/${tourSpot.id}`)}
                                                onEdit={() => router.push(`/tour-spots/${tourSpot.id}/edit`)}
                                                onDelete={() => handleDeleteTourSpot(tourSpot.id)}
                                            />
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </TableLayout>

                <button className="green-button w-fit" onClick={() => router.push('/tour-spots/create')}>
                    Add new Tour Spot
                </button>
            </div>
        </div>
    )
}

export default function TourSpotListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <TourSpotListingsPage />
        </Suspense>
    );
}

