"use client";

import { Suspense } from "react";
import { GuideApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { useAdminEntityListQuery } from "@/hooks/useAdminEntityListQuery";
import { AdminEntityListShell } from "@/components/layout-elements/AdminEntityListShell";
import { GuideViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

function GuideListingsPage() {
    const listQuery = useAdminEntityListQuery("/guides");
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {
        data: guidesData,
        isLoading,
        isError,
        refetch,
    } = GuideApi.useGetAllGuidesRQ(listQuery.queryString);
    const guides = guidesData?.data ?? [];

    const { mutate: deleteGuideMutate } = GuideApi.useDeleteGuideRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Guide deleted successfully.");
                queryClient.invalidateQueries({ queryKey: ["guides"] });
                refetch();
            } else {
                finishWithMessage(`Failed to delete the guide. ${responseData.message || ""}`);
            }
        },
        () => finishWithMessage("Failed to delete the guide. An error occured on the server.")
    );

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <AdminEntityListShell
            title="Guides"
            entityLabel="guides"
            entityLabelSingular="guide"
            createHref="/guides/create"
            createLabel="Add new Guide"
            listQuery={listQuery}
            pagination={guidesData?.pagination}
            isLoading={isLoading}
            isError={isError}
            itemCount={guides.length}
        >
            {({ rowNumber, router }) =>
                guides.map((guide, index) => (
                    <GuideViewListTableRow
                        key={guide.id}
                        id={rowNumber(index)}
                        guideName={`${guide.firstName || ""} ${guide.lastName || ""}`.trim()}
                        guideLocation={guide.location?.name || "N/A"}
                        guide_id={guide.id}
                        guideImageURL={guide.images?.[0]?.url || "/image-not-found.png"}
                        specializations={(guide.specializations || []).join(", ") || "N/A"}
                        rating={guide.rating || 0}
                        pricePerDay={guide.pricePerDay}
                        isVerified={guide.isVerified}
                        onClickNavigate={() => router.push(`/guides/${guide.id}`)}
                        onEdit={() => router.push(`/guides/${guide.id}/edit`)}
                        onDelete={() => {
                            showLoadingContent(true);
                            deleteGuideMutate(guide.id);
                        }}
                    />
                ))
            }
        </AdminEntityListShell>
    );
}

export default function GuideListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <GuideListingsPage />
        </Suspense>
    );
}
