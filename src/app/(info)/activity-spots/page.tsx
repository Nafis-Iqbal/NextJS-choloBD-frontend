/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ActivitySpotApi, AuthApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

import TableLayout from "@/components/layout-elements/TableLayout";
import {ActivitySpotViewListTableRow} from "@/components/data-elements/DataTableRowElements";
import { useEffect, useState, Suspense } from "react";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

function ActivitySpotListingsPage() {
    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;
        
    const router = useRouter();
    const searchParams = useSearchParams();
    const [queryString, setQueryString] = useState<string>('');

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();

    const {data: activitySpotsData, isLoading: isActivitySpotsLoading, isError: isActivitySpotsError, refetch: refetchActivitySpots} = ActivitySpotApi.useGetAllActivitySpotsRQ(queryString);
    const activitySpots = activitySpotsData?.data;

    const {mutate: deleteActivitySpotMutate} = ActivitySpotApi.useDeleteActivitySpotRQ(
        (responseData) => {
            if(responseData.status === "success") {
                finishWithMessage("Hotel deleted successfully.");
                queryClient.invalidateQueries({queryKey: ["hotels"]});
                refetchActivitySpots();
            }
            else{
                finishWithMessage(`Failed to delete the hotel. ${responseData.message || ''}`);
            }
        },
        () => {
            finishWithMessage("Failed to delete the hotel. An error occured on the server.");
        }
    );

    const handleDeleteActivitySpot = (tourSpotId: string) => {
        showLoadingContent(true);
        deleteActivitySpotMutate(tourSpotId);
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
        refetchActivitySpots();
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
                <h3 className="text-green-500">Activity Spots</h3>
                {(activitySpots && activitySpots.length > 0) ? 
                    <p className="text-green-200">Showing {activitySpots?.length} of {activitySpots?.length} active Activity Spots. <span className="text-gray-400">(Pagination not implemented yet)</span></p> : 
                    <p className="text-green-200">No activity spots found.</p>
                }

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[900px]">
                            <div className="flex border-1 border-green-800 p-2 bg-gray-600 text-center">
                                <p className="w-[5%]">Sr. No.</p>
                                <p className="w-[20%]">Activity Spot Name</p>
                                <p className="w-[20%]">Activity Spot Image</p>
                                <p className="w-[15%]">Activity Type</p>
                                <p className="w-[10%]">Rating</p>
                                <p className="w-[10%]">Entry Cost</p>
                                <p className="w-[10%]">Activity Spot ID</p>
                                <p className="w-[10%]">Actions</p>
                            </div>
                            <div className="flex flex-col border-1 border-green-800">
                                {
                                    isActivitySpotsLoading ? (<NoContentTableRow displayMessage="Loading Data" tdColSpan={1}/>) :
                                    isActivitySpotsError ? (<NoContentTableRow displayMessage="An error occurred" tdColSpan={1}/>) :
                                    (activitySpots && Array.isArray(activitySpots) && activitySpots.length <= 0) ? 
                                    (<NoContentTableRow displayMessage="No activity spots found" tdColSpan={1}/>) :
                                    
                                    (activitySpots ?? []).map((activitySpot, index) => {
                                        return (
                                            <ActivitySpotViewListTableRow 
                                                key={activitySpot.id} 
                                                id={index + 1} 
                                                activitySpotName={activitySpot.name || ''} 
                                                activitySpot_id={activitySpot.id} 
                                                activitySpotImageURL={activitySpot.images?.[0]?.url || '/image-not-found.png'} 
                                                activityType={activitySpot.activityType || 'N/A'}
                                                rating={activitySpot.rating}
                                                entryCost={activitySpot.entryCost || 0}
                                                onClickNavigate={() => router.push(`/activity-spots/${activitySpot.id}`)}
                                                onEdit={() => router.push(`/activity-spots/${activitySpot.id}/edit`)}
                                                onDelete={() => handleDeleteActivitySpot(activitySpot.id)}
                                            />
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </TableLayout>

                <button className="green-button w-fit" onClick={() => router.push('/activity-spots/create')}>
                    Add new Activity Spot
                </button>
            </div>
        </div>
    )
}

export default function ActivitySpotListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <ActivitySpotListingsPage />
        </Suspense>
    );
}

