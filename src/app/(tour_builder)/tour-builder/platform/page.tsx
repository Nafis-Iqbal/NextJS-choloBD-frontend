"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthApi } from "@/services/api";
import { TourPackageForm } from "@/components/forms/TourPackageForm";
import { LoginRequiredSection } from "@/components/placeholder-components/LoginRequiredSection";
import { Role } from "@/types/enums";

const PlatformTourBuilderPage = () => {
    const router = useRouter();

    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated === true;
    const currentUserRole = authResponse?.data?.userRole;
    const isMasterAdmin = isAuthenticated && currentUserRole === Role.MASTER_ADMIN;

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) return;
        if (currentUserRole !== Role.MASTER_ADMIN) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, currentUserRole, router]);

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <LoginRequiredSection />;
    }

    if (!isMasterAdmin) {
        return null;
    }

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="mx-auto flex w-full max-w-4xl flex-col space-y-2 font-sans">
                <TourPackageForm
                    mode="create"
                    onCancel={() => router.back()}
                />
            </div>
        </div>
    );
}

export default PlatformTourBuilderPage;
