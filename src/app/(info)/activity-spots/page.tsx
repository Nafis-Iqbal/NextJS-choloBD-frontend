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
    const {
        data: authResponse,
        isPending,
        isFetching,
        isFetched,
    } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated === true;
    const currentUserRole = authResponse?.data?.userRole;
    const isMasterAdmin = isAuthenticated && currentUserRole === "MASTER_ADMIN";
        
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
        if (!isFetched || isPending || isFetching) return;
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        if (currentUserRole !== "MASTER_ADMIN") {
            router.replace("/");
        }
    }, [isFetched, isPending, isFetching, isAuthenticated, currentUserRole, router]);

    if (!isMasterAdmin) {
        return null;
    }

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="theme-label">Activity Spots</h3>
                {(activitySpots && activitySpots.length > 0) ? 
                    <p className="theme-text-muted">Showing {activitySpots?.length} of {activitySpots?.length} active Activity Spots. <span className="theme-text-subtle">(Pagination not implemented yet)</span></p> : 
                    <p className="theme-text-muted">No activity spots found.</p>
                }

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="w-full">
                        <div
                            className="block rounded-sm md:rounded-md border-0 md:border px-0 py-1 md:p-2"
                            style={{
                                backgroundColor: "var(--theme-card-bg)",
                                borderColor: "var(--theme-deep-green)",
                            }}
                        >
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

