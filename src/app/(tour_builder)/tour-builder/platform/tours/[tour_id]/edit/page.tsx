"use client";

import { useParams, useRouter } from "next/navigation";
import { TourPackageForm } from "@/components/forms/TourPackageForm";

const TourEditPage = () => {
    const params = useParams();
    const router = useRouter();
    const tourId = params.tour_id as string;

    return (
        <div className="flex flex-col p-2 mt-5">
            <div className="mx-auto flex w-full max-w-4xl flex-col space-y-2 font-sans">
                <TourPackageForm
                    mode="edit"
                    tourPlan_id={tourId}
                    onCancel={() => router.back()}
                />
            </div>
        </div>
    );
}

export default TourEditPage;