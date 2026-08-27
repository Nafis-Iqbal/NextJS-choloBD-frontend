"use client";

import { useRouter } from "next/navigation";
import { AuthApi } from "@/services/api";
import { CustomTourPackageForm } from "@/components/forms/CustomTourPackageForm";
import { LoginRequiredSection } from "@/components/placeholder-components/LoginRequiredSection";

const TourBuilderPage = () => {
    const router = useRouter();

    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated === true;

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <LoginRequiredSection />;
    }

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="mx-auto flex w-full max-w-4xl flex-col space-y-2 font-sans">
                <CustomTourPackageForm
                    mode="create"
                    onCancel={() => router.back()}
                />
            </div>
        </div>
    );
}

export default TourBuilderPage;
