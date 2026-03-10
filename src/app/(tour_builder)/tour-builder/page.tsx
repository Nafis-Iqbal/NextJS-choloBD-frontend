"use client";

import { useRouter } from "next/navigation";
import { TourPackageForm } from "@/components/forms/TourPackageForm";

const TourBuilderPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen space-y-2 p-2 mt-5 font-sans">
            <h3 className="text-green-500">Create New Tour Plan</h3>
            <p className="text-green-200">Add a new tour package template to your site.</p>

            <TourPackageForm
                mode="create"
                onCancel={() => router.back()}
            />
        </div>
    );
}

export default TourBuilderPage;