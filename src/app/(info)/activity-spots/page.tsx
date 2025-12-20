/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ActivitySpotApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

import TableLayout from "@/components/layout-elements/TableLayout";
import {ActivitySpotViewListTableRow} from "@/components/data-elements/DataTableRowElements";
import { useEffect, useState, Suspense } from "react";

function ActivitySpotListingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [queryString, setQueryString] = useState<string>('');

    const {data: activitySpotsData, isLoading: isFetchLoading, isError: isFetchError, refetch: refetchActivitySpots} = ActivitySpotApi.useGetAllActivitySpotsRQ(queryString);
    const activitySpots = activitySpotsData?.data;

    useEffect(() => {
        const qString = (window.location.search).slice(1);
        setQueryString(qString);
    }, [searchParams]);

    useEffect(() => {
        refetchActivitySpots();
    }, [queryString]);

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">Activity Spots</h3>
                <p className="text-green-200">"All activity spots listed here."</p>

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[900px]">
                            <div className="flex border-1 border-green-800 p-2 bg-gray-600 text-center">
                                <p className="w-[5%]">Sr. No.</p>
                                <p className="w-[20%]">Activity Spot Name</p>
                                <p className="w-[30%]">Activity Spot Image</p>
                                <p className="w-[15%]">Activity Type</p>
                                <p className="w-[10%]">Rating</p>
                                <p className="w-[10%]">Entry Cost</p>
                                <p className="w-[10%]">Activity Spot ID</p>
                            </div>
                            <div className="flex flex-col border-1 border-green-800">
                                {(activitySpots ?? []).map((activitySpot, index) => {
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
                                            onClickNavigate={() => router.push(`/activity-spot/${activitySpot.id}`)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </TableLayout>
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

