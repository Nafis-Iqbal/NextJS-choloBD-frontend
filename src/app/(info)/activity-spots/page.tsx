"use client";

import { Suspense } from "react";
import { ActivitySpotApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { useAdminEntityListQuery } from "@/hooks/useAdminEntityListQuery";
import { AdminEntityListShell } from "@/components/layout-elements/AdminEntityListShell";
import { ActivitySpotViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

function ActivitySpotListingsPage() {
    const listQuery = useAdminEntityListQuery("/activity-spots");
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {
        data: activitySpotsData,
        isLoading,
        isError,
        refetch,
    } = ActivitySpotApi.useGetAllActivitySpotsRQ(listQuery.queryString);
    const activitySpots = activitySpotsData?.data ?? [];

    const { mutate: deleteActivitySpotMutate } = ActivitySpotApi.useDeleteActivitySpotRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Activity spot deleted successfully.");
                queryClient.invalidateQueries({ queryKey: ["activity-spots"] });
                refetch();
            } else {
                finishWithMessage(`Failed to delete the activity spot. ${responseData.message || ""}`);
            }
        },
        () => finishWithMessage("Failed to delete the activity spot. An error occured on the server.")
    );

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <AdminEntityListShell
            title="Activity Spots"
            entityLabel="activity spots"
            entityLabelSingular="activity spot"
            createHref="/activity-spots/create"
            createLabel="Add new Activity Spot"
            listQuery={listQuery}
            pagination={activitySpotsData?.pagination}
            isLoading={isLoading}
            isError={isError}
            itemCount={activitySpots.length}
        >
            {({ rowNumber, router }) =>
                activitySpots.map((activitySpot, index) => (
                    <ActivitySpotViewListTableRow
                        key={activitySpot.id}
                        id={rowNumber(index)}
                        activitySpotName={activitySpot.name || ""}
                        activitySpot_id={activitySpot.id}
                        activitySpotImageURL={activitySpot.images?.[0]?.url || "/image-not-found.png"}
                        activityType={activitySpot.activityType || "N/A"}
                        rating={activitySpot.rating}
                        entryCost={activitySpot.entryCost || 0}
                        onClickNavigate={() => router.push(`/activity-spots/${activitySpot.id}`)}
                        onEdit={() => router.push(`/activity-spots/${activitySpot.id}/edit`)}
                        onDelete={() => {
                            showLoadingContent(true);
                            deleteActivitySpotMutate(activitySpot.id);
                        }}
                    />
                ))
            }
        </AdminEntityListShell>
    );
}

export default function ActivitySpotListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <ActivitySpotListingsPage />
        </Suspense>
    );
}
