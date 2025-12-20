"use client";

import { redirect, useParams } from "next/navigation";

import { TourSpotApi, AuthApi } from "@/services/api";
import { TourAndActivitySpotPageForm } from "@/components/forms/TourAndActivitySpotForm";
import LoadingSpinnerBlock from "@/components/placeholder-components/LoadingSpinnerBlock";

export default function TourSpotEditPage() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const params = useParams();

    const { data: tourSpotDetailData, isError: detailFetchError, isLoading: detailFetchLoading } = TourSpotApi.useGetTourSpotDetailRQ(params.tourSpot_id as string);
    const tourSpotDetail = tourSpotDetailData?.data;

    if(!isAuthenticated || currentUserRole !== "MASTER_ADMIN") return (
        redirect("/")
    );

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="flex flex-col space-y-2 w-full md:w-auto font-sans mx-auto">
                <h3 className="text-green-500 p-2">Edit Tour Spot</h3>
                <div className="flex space-x-10 items-center p-2 h-[40px]">
                    <p className="text-green-200">Edit tour spot to your satisfaction.</p>

                    <LoadingSpinnerBlock isOpen={detailFetchLoading} className="w-[30px] h-[30px]"/>
                </div>

                <TourAndActivitySpotPageForm 
                    mode={"edit"} infoPageData={tourSpotDetail ?? {}} 
                    info_Id={params.tourSpot_id as string}
                />
            </div>
        </div>
    )
}