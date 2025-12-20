/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { TourSpotApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

import TableLayout from "@/components/layout-elements/TableLayout";
import {TourSpotViewListTableRow} from "@/components/data-elements/DataTableRowElements";
import { useEffect, useState, Suspense } from "react";

function TourSpotListingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [queryString, setQueryString] = useState<string>('');

    const {data: tourSpotsData, isLoading: isFetchLoading, isError: isFetchError, refetch: refetchTourSpots} = TourSpotApi.useGetAllTourSpotsRQ(queryString);
    const tourSpots = tourSpotsData?.data;

    useEffect(() => {
        const qString = (window.location.search).slice(1);
        setQueryString(qString);
    }, [searchParams]);

    useEffect(() => {
        refetchTourSpots();
    }, [queryString]);

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">Tour Spots</h3>
                <p className="text-green-200">"All tour spots listed here."</p>

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[900px]">
                            <div className="flex border-1 border-green-800 p-2 bg-gray-600 text-center">
                                <p className="w-[5%]">Sr. No.</p>
                                <p className="w-[20%]">Tour Spot Name</p>
                                <p className="w-[30%]">Tour Spot Image</p>
                                <p className="w-[15%]">Spot Type</p>
                                <p className="w-[10%]">Rating</p>
                                <p className="w-[10%]">Entry Cost</p>
                                <p className="w-[10%]">Tour Spot ID</p>
                            </div>
                            <div className="flex flex-col border-1 border-green-800">
                                {(tourSpots ?? []).map((tourSpot, index) => {
                                    return (
                                        <TourSpotViewListTableRow 
                                            key={tourSpot.id} 
                                            id={index + 1} 
                                            tourSpotName={tourSpot.name || ''} 
                                            tourSpot_id={tourSpot.id} 
                                            tourSpotImageURL={tourSpot.images?.[0]?.url || '/image-not-found.png'} 
                                            spotType={tourSpot.spotType || 'N/A'}
                                            rating={tourSpot.rating}
                                            isPopular={tourSpot.isPopular || false}
                                            onClickNavigate={() => router.push(`/tour-spot/${tourSpot.id}`)}
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

export default function TourSpotListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <TourSpotListingsPage />
        </Suspense>
    );
}

