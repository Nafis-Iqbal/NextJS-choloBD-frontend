"use client";

import { useParams, useRouter } from "next/navigation";
import { TourBuilderApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { TourPackagePostView } from "@/components/modular-components/TourPackagePostView";

function TourDetailStatus({
    title,
    message,
    isError,
    onBack,
}: {
    title: string;
    message: string;
    isError?: boolean;
    onBack: () => void;
}) {
    return (
        <div className="flex flex-col p-4 font-sans md:p-6 lg:p-8">
            <section className="theme-section max-w-2xl space-y-3 rounded-3xl p-6 md:p-8">
                <p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wide">
                    Tour Package
                </p>
                <h3
                    className="theme-text"
                    style={isError ? { color: "var(--theme-red, #C0392B)" } : undefined}
                >
                    {title}
                </h3>
                <p className="theme-text-muted">{message}</p>
                <button
                    type="button"
                    className="theme-btn-teal mt-2 w-fit rounded-lg px-4 py-2 font-semibold"
                    onClick={onBack}
                >
                    Back to Tours
                </button>
            </section>
        </div>
    );
}

function TourDetailContent() {
    const params = useParams();
    const router = useRouter();
    const tourId = params.tour_id as string;

    const { data: tourResponse, isLoading, isError, error } = TourBuilderApi.useGetTourPlanDetailsRQ(tourId);
    const tour = tourResponse?.data;

    if (isLoading) {
        return <SuspenseFallback />;
    }

    if (isError) {
        return (
            <TourDetailStatus
                isError
                title="Error Loading Tour"
                message={error?.message || "Failed to load tour details"}
                onBack={() => router.back()}
            />
        );
    }

    if (!tour) {
        return (
            <TourDetailStatus
                title="No Tour Found"
                message="The tour package you're looking for doesn't exist."
                onBack={() => router.back()}
            />
        );
    }

    return (
        <TourPackagePostView
            tour={tour}
            onEdit={() => router.push(`/tour-builder/custom/tours/${tour.id}/edit`)}
            onBack={() => router.back()}
        />
    );
}

export default function TourDetailPage() {
    return <TourDetailContent />;
}
