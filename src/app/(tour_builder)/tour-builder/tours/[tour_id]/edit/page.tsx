"use client";

import { useParams, useRouter } from "next/navigation";
import { TourPackageForm } from "@/components/forms/TourPackageForm";

const TourEditPage = () => {
    const params = useParams();
    const router = useRouter();
    const tourId = params.tour_id as string;

    return (
        <div className="min-h-screen space-y-2 p-2 mt-5 font-sans">
            <h3 className="text-green-500">Edit Tour Plan</h3>
            <p className="text-green-200">Update the tour package template.</p>

            <TourPackageForm
                mode="edit"
                tourPlan_id={tourId}
                onCancel={() => router.back()}
            />
        </div>
    );
}

export default TourEditPage;