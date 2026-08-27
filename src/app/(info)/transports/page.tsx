"use client";

import { Suspense } from "react";
import { TransportApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { useAdminEntityListQuery } from "@/hooks/useAdminEntityListQuery";
import { AdminEntityListShell } from "@/components/layout-elements/AdminEntityListShell";
import { TransportViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

function TransportListingsPage() {
    const listQuery = useAdminEntityListQuery("/transports");
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {
        data: transportsData,
        isLoading,
        isError,
        refetch,
    } = TransportApi.useGetAllTransportsRQ(listQuery.queryString);
    const transports = transportsData?.data ?? [];

    const { mutate: deleteTransportMutate } = TransportApi.useDeleteTransportRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Transport deleted successfully.");
                queryClient.invalidateQueries({ queryKey: ["transports"] });
                refetch();
            } else {
                finishWithMessage(`Failed to delete the transport. ${responseData.message || ""}`);
            }
        },
        () => finishWithMessage("Failed to delete the transport. An error occured on the server.")
    );

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <AdminEntityListShell
            title="Transports"
            entityLabel="transports"
            entityLabelSingular="transport"
            createHref="/transports/create"
            createLabel="Add new Transport"
            listQuery={listQuery}
            pagination={transportsData?.pagination}
            isLoading={isLoading}
            isError={isError}
            itemCount={transports.length}
        >
            {({ rowNumber, router }) =>
                transports.map((transport, index) => (
                    <TransportViewListTableRow
                        key={transport.id}
                        id={rowNumber(index)}
                        transportName={transport.name || ""}
                        transportLocation={transport.location?.name || "N/A"}
                        transport_id={transport.id}
                        transportImageURL={transport.images?.[0]?.url || "/image-not-found.png"}
                        transportType={transport.transportType || "N/A"}
                        rating={transport.rating || 0}
                        vehicleCount={transport.vehicleCount}
                        isVerified={transport.isVerified}
                        onClickNavigate={() => router.push(`/transports/${transport.id}`)}
                        onEdit={() => router.push(`/transports/${transport.id}/edit`)}
                        onDelete={() => {
                            showLoadingContent(true);
                            deleteTransportMutate(transport.id);
                        }}
                    />
                ))
            }
        </AdminEntityListShell>
    );
}

export default function TransportListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <TransportListingsPage />
        </Suspense>
    );
}
