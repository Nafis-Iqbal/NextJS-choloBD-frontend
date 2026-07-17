"use client";

import { useParams, useRouter } from "next/navigation";

import { GuideApi, AuthApi } from "@/services/api";
import { GuideForm } from "@/components/forms/GuideForm";
import LoadingSpinnerBlock from "@/components/placeholder-components/LoadingSpinnerBlock";
import { useEffect } from "react";

export default function GuideEditPage() {
    const router = useRouter();

    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const params = useParams();

    const {
        data: guideDetailData,
        isLoading: detailFetchLoading,
    } = GuideApi.useGetGuideDetailRQ(params.guide_id as string);
    const guideDetail = guideDetailData?.data;

    useEffect(() => {
        if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined)) {
            router.replace("/");
            return;
        }

        if (
            !isLoading &&
            currentUserRole !== "MASTER_ADMIN" &&
            currentUserRole !== "SERVICE_ADMIN"
        ) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, currentUserRole, router]);

    if (isLoading) {
        return null;
    }

    if (currentUserRole !== "MASTER_ADMIN" && currentUserRole !== "SERVICE_ADMIN") {
        return null;
    }

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="flex flex-col space-y-2 w-full md:w-auto font-sans mx-auto">
                <h3 className="theme-label p-2">Edit Guide</h3>
                <div className="flex space-x-10 items-center p-2 h-[40px]">
                    <p className="theme-text-muted">Update guide profile details.</p>

                    <LoadingSpinnerBlock isOpen={detailFetchLoading} className="w-[30px] h-[30px]" />
                </div>

                <GuideForm
                    mode="edit"
                    editMode={
                        currentUserRole === "MASTER_ADMIN" || currentUserRole === "SERVICE_ADMIN"
                            ? currentUserRole
                            : "MASTER_ADMIN"
                    }
                    guideData={guideDetail ?? {}}
                    guide_id={params.guide_id as string}
                />
            </div>
        </div>
    );
}
