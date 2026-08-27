"use client";

import { useParams, useRouter } from "next/navigation";
import { TourBuilderApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { TourPackagePostView } from "@/components/modular-components/TourPackagePostView";

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
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 font-sans">
                <section className="theme-section rounded-3xl p-6 md:p-8 max-w-2xl space-y-3">
                    <p className="theme-label">Tour Package</p>
                    <h3 className="theme-text" style={{ color: "var(--theme-red)" }}>
                        Error Loading Tour
                    </h3>
                    <p className="theme-text-muted">
                        {error?.message || "Failed to load tour details"}
                    </p>
                    <button
                        type="button"
                        className="theme-btn-teal w-fit rounded-lg px-4 py-2 mt-2"
                        onClick={() => router.back()}
                    >
                        Back to Tours
                    </button>
                </section>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 font-sans">
                <section className="theme-section rounded-3xl p-6 md:p-8 max-w-2xl space-y-3">
                    <p className="theme-label">Tour Package</p>
                    <h3 className="theme-text">No Tour Found</h3>
                    <p className="theme-text-muted">
                        The tour package you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <button
                        type="button"
                        className="theme-btn-teal w-fit rounded-lg px-4 py-2 mt-2"
                        onClick={() => router.back()}
                    >
                        Back to Tours
                    </button>
                </section>
            </div>
        );
    }

    return (
        <TourPackagePostView
            tour={tour}
            onEdit={() => router.push(`/tour-builder/platform/tours/${tour.id}/edit`)}
            onBack={() => router.back()}
        />
    );
}

export default function TourDetailPage() {
    return <TourDetailContent />;
}
