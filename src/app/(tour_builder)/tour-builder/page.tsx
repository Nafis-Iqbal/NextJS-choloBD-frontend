import { TourPackageForm } from "@/components/forms/TourPackageForm";

const TourBuilderPage = () => {
    return (
        <div className="min-h-screen space-y-2 p-2 mt-5 font-sans">
            <h3 className="text-green-500">Create New Tour Plan</h3>
            <p className="text-green-200">Add a new tour package template to your site.</p>

            <TourPackageForm/>
        </div>
    );
}

export default TourBuilderPage;