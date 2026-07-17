"use client";

import { redirect, useRouter } from "next/navigation";
import { AuthApi } from "@/services/api";
import { HotelPageForm } from "@/components/forms/HotelPageForm";
import { useEffect } from "react";

export default function HotelCreationPage() {
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
                <h3 className="theme-label">Create New Hotel</h3>
                <p className="theme-text-muted">Add a new hotel to your site.</p>

                <HotelPageForm 
                    mode={"create"}
                    editMode={(currentUserRole === "MASTER_ADMIN" || currentUserRole === "SERVICE_ADMIN") ? currentUserRole : "MASTER_ADMIN"} 
                />
            </div>
        </div>
    )
}