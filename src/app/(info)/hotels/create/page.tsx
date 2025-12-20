"use client";

import { redirect } from "next/navigation";
import { AuthApi } from "@/services/api";
import { HotelPageForm } from "@/components/forms/HotelPageForm";

export default function HotelCreationPage() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    if(!isAuthenticated || currentUserRole !== "MASTER_ADMIN") return (
        redirect("/")
    );

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="flex flex-col space-y-2 font-sans mx-auto">
                <h3 className="text-green-500">Create New Hotel</h3>
                <p className="text-green-200">Add a new hotel to your site.</p>

                <HotelPageForm 
                    mode={"create"}
                    editMode={currentUserRole} 
                />
            </div>
        </div>
    )
}