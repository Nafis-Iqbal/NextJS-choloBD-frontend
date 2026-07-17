/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { AuthApi, GuideApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

import TableLayout from "@/components/layout-elements/TableLayout";
import { GuideViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import { useEffect, useState, Suspense } from "react";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

function GuideListingsPage() {
    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const router = useRouter();
    const searchParams = useSearchParams();
    const [queryString, setQueryString] = useState<string>('');

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();

    const {data: guidesData, isLoading: isGuidesLoading, isError: isGuidesError, refetch: refetchGuides} = GuideApi.useGetAllGuidesRQ();
    const guidesRaw = guidesData?.data;
    const guides = Array.isArray(guidesRaw) ? guidesRaw : (guidesRaw?.results ?? []);

    const {mutate: deleteGuideMutate} = GuideApi.useDeleteGuideRQ(
        (responseData) => {
            if(responseData.status === "success") {
                finishWithMessage("Guide deleted successfully.");
                queryClient.invalidateQueries({queryKey: ["guides"]});
                refetchGuides();
            }
            else{
                finishWithMessage(`Failed to delete the guide. ${responseData.message || ''}`);
            }
        },
        () => {
            finishWithMessage("Failed to delete the guide. An error occured on the server.");
        }
    );

    const handleDeleteGuide = (guideId: string) => {
        showLoadingContent(true);
        deleteGuideMutate(guideId);
    }

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };
    
    useEffect(() => {
        const qString = (window.location.search).slice(1);
        setQueryString(qString);
    }, [searchParams]);

    useEffect(() => {
        refetchGuides();
    }, [queryString]);

    useEffect(() => {
        if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined || currentUserRole !== 'MASTER_ADMIN')) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return null; // or <FullPageLoader />
    }

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="theme-label">Guides</h3>
                {(guides && guides.length > 0) ? 
                    <p className="theme-text-muted">Showing {guides?.length} of {guides?.length} Guides. <span className="theme-text-subtle">(Pagination not implemented yet)</span></p> : 
                    <p className="theme-text-muted">No Guides found.</p>
                }

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="w-full">
                        <div
                            className="block rounded-sm md:rounded-md border-0 md:border px-0 py-1 md:p-2"
                            style={{
                                backgroundColor: "var(--theme-card-bg)",
                                borderColor: "var(--theme-deep-green)",
                            }}
                        >
                            {
                                isGuidesLoading ? (<NoContentTableRow displayMessage="Loading Data" tdColSpan={1}/>) :
                                isGuidesError ? (<NoContentTableRow displayMessage="An error occurred" tdColSpan={1}/>) :
                                (guides && Array.isArray(guides) && guides.length <= 0) ?
                                (<NoContentTableRow displayMessage="No guides found" tdColSpan={1}/>) :

                                (guides ?? []).map((guide, index) => {
                                    return (
                                        <GuideViewListTableRow
                                            key={guide.id}
                                            id={index + 1}
                                            guideName={`${guide.firstName || ''} ${guide.lastName || ''}`.trim()}
                                            guideLocation={guide.location?.name || 'N/A'}
                                            guide_id={guide.id}
                                            guideImageURL={guide.images?.[0]?.url || '/image-not-found.png'}
                                            specializations={(guide.specializations || []).join(', ') || 'N/A'}
                                            rating={guide.rating || 0}
                                            pricePerDay={guide.pricePerDay}
                                            isVerified={guide.isVerified}
                                            onClickNavigate={() => router.push(`/guides/${guide.id}`)}
                                            onEdit={() => router.push(`/guides/${guide.id}/edit`)}
                                            onDelete={() => handleDeleteGuide(guide.id)}
                                        />
                                    );
                                })
                            }
                        </div>
                    </div>
                </TableLayout>

                <button className="green-button w-fit" onClick={() => router.push('/guides/create')}>
                    Add new Guide
                </button>
            </div>
        </div>
    )
}

export default function GuideListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <GuideListingsPage />
        </Suspense>
    );
}
