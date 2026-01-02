"use client";

import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { AuthApi } from "@/services/api";
import { TourSpotForm } from "@/components/forms/TourSpotForm";
import { useEffect } from "react";

export default function TourSpotCreationPage() {
    const router = useRouter();

    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

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
            <div className="flex flex-col space-y-2 font-sans mx-auto">
                <h3 className="text-green-500">Create New Tour Spot</h3>
                <p className="text-green-200">Add a new tour spot to your site.</p>

                <TourSpotForm 
                    mode={"create"} 
                />
            </div>
        </div>
    )
}