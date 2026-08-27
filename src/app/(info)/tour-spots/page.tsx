"use client";

import { Suspense } from "react";
import { TourSpotApi } from "@/services/api";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { useAdminEntityListQuery } from "@/hooks/useAdminEntityListQuery";
import { AdminEntityListShell } from "@/components/layout-elements/AdminEntityListShell";
import { TourSpotViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

function TourSpotListingsPage() {
    const listQuery = useAdminEntityListQuery("/tour-spots");
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {
        data: tourSpotsData,
        isLoading,
        isError,
        refetch,
    } = TourSpotApi.useGetAllTourSpotsRQ(listQuery.queryString);
    const tourSpots = tourSpotsData?.data ?? [];

    const { mutate: deleteTourSpotMutate } = TourSpotApi.useDeleteTourSpotRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Tour spot deleted successfully.");
                refetch();
            } else {
                finishWithMessage(`Failed to delete the tour spot. ${responseData.message || ""}`);
            }
        },
        () => finishWithMessage("Failed to delete the tour spot. An error occured on the server.")
    );

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <AdminEntityListShell
            title="Tour Spots"
            entityLabel="tour spots"
            entityLabelSingular="tour spot"
            createHref="/tour-spots/create"
            createLabel="Add new Tour Spot"
            listQuery={listQuery}
            pagination={tourSpotsData?.pagination}
            isLoading={isLoading}
            isError={isError}
            itemCount={tourSpots.length}
        >
            {({ rowNumber, router }) =>
                tourSpots.map((tourSpot, index) => (
                    <TourSpotViewListTableRow
                        key={tourSpot.id}
                        id={rowNumber(index)}
                        tourSpotName={tourSpot.name || ""}
                        tourSpotLocation={tourSpot?.location?.name || "N/A"}
                        tourSpot_id={tourSpot.id}
                        tourSpotImageURL={tourSpot.images?.[0]?.url || "/image-not-found.png"}
                        tourType={tourSpot.tourType || "N/A"}
                        rating={tourSpot.rating}
                        isPopular={tourSpot.isPopular || false}
                        onClickNavigate={() => router.push(`/tour-spots/${tourSpot.id}`)}
                        onEdit={() => router.push(`/tour-spots/${tourSpot.id}/edit`)}
                        onDelete={() => {
                            showLoadingContent(true);
                            deleteTourSpotMutate(tourSpot.id);
                        }}
                    />
                ))
            }
        </AdminEntityListShell>
    );
}

export default function TourSpotListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <TourSpotListingsPage />
        </Suspense>
    );
}
