"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import { TourSpotApi, AuthApi } from "@/services/api";
import { TourSpotForm } from "@/components/forms/TourSpotForm";
import LoadingSpinnerBlock from "@/components/placeholder-components/LoadingSpinnerBlock";

export default function TourSpotEditPage() {
    const router = useRouter();

    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const params = useParams();

    const { data: tourSpotDetailData, isError: detailFetchError, isLoading: detailFetchLoading } = TourSpotApi.useGetTourSpotDetailRQ(params.tourSpot_id as string);
    const tourSpotDetail = tourSpotDetailData?.data;

    useEffect(() => {
        if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined)) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return null; // or <FullPageLoader />
    }

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="flex flex-col space-y-2 w-full md:w-auto font-sans mx-auto">
                <h3 className="text-green-500 p-2">Edit Tour Spot</h3>
                <div className="flex space-x-10 items-center p-2 h-[40px]">
                    <p className="text-green-200">Edit tour spot to your satisfaction.</p>

                    <LoadingSpinnerBlock isOpen={detailFetchLoading} className="w-[30px] h-[30px]"/>
                </div>

                <TourSpotForm 
                    mode={"edit"} tourSpotData={tourSpotDetail ?? {}} 
                    tourSpot_Id={params.tourSpot_id as string}
                />
            </div>
        </div>
    )
}