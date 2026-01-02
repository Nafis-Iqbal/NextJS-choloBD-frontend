"use client";

import { redirect, useParams, useRouter } from "next/navigation";

import { ActivitySpotApi, AuthApi } from "@/services/api";
import { ActivitySpotForm } from "@/components/forms/ActivitySpotForm";
import LoadingSpinnerBlock from "@/components/placeholder-components/LoadingSpinnerBlock";
import { useEffect } from "react";

export default function ActivitySpotEditPage() {
    const router = useRouter();
    
    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const params = useParams();

    const { data: activitySpotDetailData, isError: detailFetchError, isLoading: detailFetchLoading } = ActivitySpotApi.useGetActivitySpotDetailRQ(params.activitySpot_id as string);
    const activitySpotDetail = activitySpotDetailData?.data;

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
                <h3 className="text-green-500 p-2">Edit Activity Spot</h3>
                <div className="flex space-x-10 items-center p-2 h-[40px]">
                    <p className="text-green-200">Edit activity spot to your satisfaction.</p>

                    <LoadingSpinnerBlock isOpen={detailFetchLoading} className="w-[30px] h-[30px]"/>
                </div>

                <ActivitySpotForm 
                    mode={"edit"} activitySpotData={activitySpotDetail ?? {}} 
                    activitySpot_Id={params.activitySpot_id as string}
                />
            </div>
        </div>
    )
}