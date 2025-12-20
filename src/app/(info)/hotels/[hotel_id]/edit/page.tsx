"use client";

import { redirect, useParams } from "next/navigation";

import { HotelApi, AuthApi } from "@/services/api";
import { HotelPageForm } from "@/components/forms/HotelPageForm";
import LoadingSpinnerBlock from "@/components/placeholder-components/LoadingSpinnerBlock";

export default function HotelEditPage() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const params = useParams();

    const { data: hotelDetailData, isError: detailFetchError, isLoading: detailFetchLoading } = HotelApi.useGetHotelDetailRQ(params.hotel_id as string);
    const hotelDetail = hotelDetailData?.data;

    if(!isAuthenticated || (currentUserRole !== "MASTER_ADMIN" && currentUserRole !== "SERVICE_ADMIN")) return (
        redirect("/")
    );

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
                    editMode={currentUserRole}
                    hotelData={hotelDetail ?? {}} 
                    hotel_id={params.tourSpot_id as string}
                />
            </div>
        </div>
    )
}