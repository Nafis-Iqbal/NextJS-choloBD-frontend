"use client";

import { useRouter } from "next/navigation";
import { AuthApi } from "@/services/api";
import { TransportForm } from "@/components/forms/TransportForm";
import { useEffect } from "react";

export default function CreateTransportPage() {
    const router = useRouter();

    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    useEffect(() => {
        if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined)) {
            router.replace("/");
            return;
        }

        if (!isLoading && currentUserRole !== "MASTER_ADMIN") {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, currentUserRole, router]);

    if (isLoading) {
        return null;
    }

    if (currentUserRole !== "MASTER_ADMIN") {
        return null;
    }

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="flex flex-col space-y-2 font-sans mx-auto">
                <h3 className="theme-label">Create New Transport</h3>
                <p className="theme-text-muted">Add a new transport operator to the platform.</p>

                <TransportForm mode="create" editMode="MASTER_ADMIN" />
            </div>
        </div>
    );
}
