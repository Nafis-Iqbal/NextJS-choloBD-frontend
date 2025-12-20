"use client";

import { redirect } from "next/navigation";
import { AuthApi } from "@/services/api";
import { TourAndActivitySpotPageForm } from "@/components/forms/TourAndActivitySpotForm";

export default function TourSpotCreationPage() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    if(!isAuthenticated || currentUserRole !== "MASTER_ADMIN") return (
        redirect("/")
    );

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="flex flex-col space-y-2 font-sans mx-auto">
                <h3 className="text-green-500">Create New Tour Spot</h3>
                <p className="text-green-200">Add a new tour spot to your site.</p>

                <TourAndActivitySpotPageForm 
                    mode={"create"} 
                    infoPageData={{}}
                />
            </div>
        </div>
    )
}