"use client";

import { redirect, useParams, useRouter } from "next/navigation";

import { HotelApi, AuthApi } from "@/services/api";
import { HotelPageForm } from "@/components/forms/HotelPageForm";
import LoadingSpinnerBlock from "@/components/placeholder-components/LoadingSpinnerBlock";
import { useEffect } from "react";

export default function HotelEditPage() {
    const router = useRouter();
    
    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const params = useParams();

    const { data: hotelDetailData, isError: detailFetchError, isLoading: detailFetchLoading } = HotelApi.useGetHotelDetailRQ(params.hotel_id as string);
    const hotelDetail = hotelDetailData?.data;

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
                <h3 className="text-green-500 p-2">Edit Hotel</h3>
                <div className="flex space-x-10 items-center p-2 h-[40px]">
                    <p className="text-green-200">Edit Hotel Details to your satisfaction.</p>

                    <LoadingSpinnerBlock isOpen={detailFetchLoading} className="w-[30px] h-[30px]"/>
                </div>

                <HotelPageForm 
                    mode={"edit"} 
                    editMode={(currentUserRole === "MASTER_ADMIN" || currentUserRole === "SERVICE_ADMIN") ? currentUserRole : "MASTER_ADMIN"}
                    hotelData={hotelDetail ?? {}} 
                    hotel_id={params.hotel_id as string}
                />
            </div>
        </div>
    )
}