/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { AuthApi, TourBuilderApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import TableLayout from "@/components/layout-elements/TableLayout";
import { TourPackageViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";

function TourPackageListingsPage() {
    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const router = useRouter();
    const searchParams = useSearchParams();
    const [queryString, setQueryString] = useState<string>('');

    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const { data: tourPackagesData, isLoading: isFetchLoading, isError: isFetchError, refetch: refetchTourPackages } = TourBuilderApi.useGetAllTourPlansRQ(queryString);
    const tourPackages = tourPackagesData?.data;

    const { mutate: deleteTourPackageMutate } = TourBuilderApi.useDeleteTourPlanRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Tour package deleted successfully.");
                refetchTourPackages();
            }
            else {
                finishWithMessage(`Failed to delete the tour package. ${responseData.message || ''}`);
            }
        },
        () => {
            finishWithMessage("Failed to delete the tour package. An error occurred on the server.");
        }
    );

    const handleDeleteTourPackage = (tourPackageId: string) => {
        showLoadingContent(true);
        deleteTourPackageMutate(tourPackageId);
    }

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    }

    useEffect(() => {
        const qString = (window.location.search).slice(1);
        setQueryString(qString);
    }, [searchParams]);

    useEffect(() => {
        refetchTourPackages();
    }, [queryString]);

    useEffect(() => {
        if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined || currentUserRole !== 'MASTER_ADMIN')) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return null;
    }

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">Tour Packages</h3>
                {(tourPackages && tourPackages.length > 0) ?
                    <p className="text-green-200">Showing {tourPackages?.length} of {tourPackages?.length} tour packages. <span className="text-gray-400">(Pagination not implemented yet)</span></p> :
                    <p className="text-green-200">No tour packages found.</p>
                }

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[1200px]">
                            <div className="flex border-1 border-green-800 p-2 bg-gray-600 text-center">
                                <p className="w-[5%] text-sm">Sr. No.</p>
                                <p className="w-[20%]">Package Name</p>
                                <p className="w-[12%]">Division</p>
                                <p className="w-[10%]">Tour Type</p>
                                <p className="w-[8%]">Duration</p>
                                <p className="w-[25%] text-left">Day Segments</p>
                                <p className="w-[10%]">Package ID</p>
                                <p className="w-[10%]">Actions</p>
                            </div>
                            <div className="flex flex-col border-1 border-green-800">
                                {
                                    isFetchLoading ? (<NoContentTableRow displayMessage="Loading Data" tdColSpan={1} />) :
                                        isFetchError ? (<NoContentTableRow displayMessage="An error occurred" tdColSpan={1} />) :
                                            (tourPackages && Array.isArray(tourPackages) && tourPackages.length <= 0) ?
                                                (<NoContentTableRow displayMessage="No tour packages found" tdColSpan={1} />) :

                                                (tourPackages ?? []).map((tourPackage, index) => {
                                                    return (
                                                        <TourPackageViewListTableRow
                                                            key={tourPackage.id}
                                                            id={index + 1}
                                                            packageName={tourPackage.packageName || ''}
                                                            tourPackage_id={tourPackage.id}
                                                            division={tourPackage.location?.name || 'N/A'}
                                                            tourType={tourPackage.tourType || 'N/A'}
                                                            duration={tourPackage.duration}
                                                            daySegments={
                                                                (tourPackage.daySegments ?? []).map(segment => ({
                                                                    dayNumber: segment.dayNumber,
                                                                    tourSpotName: segment.tourSpotName,
                                                                    activitySpotName: segment.activitySpotName,
                                                                    transportOption: segment.transportOption,
                                                                    hotelOption: segment.hotelOption
                                                                }))
                                                            }
                                                            onClickNavigate={() => router.push(`/tour-builder/tours/${tourPackage.id}`)}
                                                            onEdit={() => router.push(`/tour-builder/tours/${tourPackage.id}/edit`)}
                                                            onDelete={() => handleDeleteTourPackage(tourPackage.id)}
                                                        />
                                                    );
                                                })
                                }
                            </div>
                        </div>
                    </div>
                </TableLayout>

                <button className="green-button w-fit" onClick={() => router.push('/tour-builder/create')}>
                    Create New Tour Package
                </button>
            </div>
        </div>
    )
}

export default function TourPackageListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <TourPackageListingsPage />
        </Suspense>
    );
}