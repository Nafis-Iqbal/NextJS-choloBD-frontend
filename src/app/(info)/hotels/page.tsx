"use client";

import { Suspense, type ChangeEvent } from "react";
import { HotelApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { useAdminEntityListQuery } from "@/hooks/useAdminEntityListQuery";
import { AdminEntityListShell } from "@/components/layout-elements/AdminEntityListShell";
import { CustomSelectInput } from "@/components/custom-elements/CustomInputElements";
import { HotelViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

const HOTEL_LIST_EXTRA_KEYS = ["allowShiftBooking"] as const;

function HotelListingsPage() {
    const listQuery = useAdminEntityListQuery("/hotels", HOTEL_LIST_EXTRA_KEYS);
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {
        data: hotelsData,
        isLoading,
        isError,
        refetch,
    } = HotelApi.useGetAllHotelsRQ(listQuery.queryString);
    const hotels = hotelsData?.data ?? [];

    const { mutate: deleteHotelMutate } = HotelApi.useDeleteHotelRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Hotel deleted successfully.");
                queryClient.invalidateQueries({ queryKey: ["hotels"] });
                refetch();
            } else {
                finishWithMessage(`Failed to delete the hotel. ${responseData.message || ""}`);
            }
        },
        () => finishWithMessage("Failed to delete the hotel. An error occured on the server.")
    );

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <AdminEntityListShell
            title="Hotels"
            entityLabel="hotels"
            entityLabelSingular="hotel"
            createHref="/hotels/create"
            createLabel="Add new Hotel"
            listQuery={listQuery}
            extraFilters={
                <CustomSelectInput
                    options={[
                        { value: "", label: "-- All hotels --" },
                        { value: "true", label: "Shift booking allowed" },
                        { value: "false", label: "Shift booking not allowed" },
                    ]}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        listQuery.replaceListParams({
                            name: listQuery.draftName,
                            extras: { allowShiftBooking: event.target.value },
                            page: 1,
                        })
                    }
                    value={listQuery.extraParams.allowShiftBooking ?? ""}
                    name="allowShiftBooking"
                    label="Shift booking"
                    className="min-w-[180px]"
                />
            }
            pagination={hotelsData?.pagination}
            isLoading={isLoading}
            isError={isError}
            itemCount={hotels.length}
        >
            {({ rowNumber, router }) =>
                hotels.map((hotel, index) => (
                    <HotelViewListTableRow
                        key={hotel.id}
                        id={rowNumber(index)}
                        hotelName={hotel.name || ""}
                        hotelLocation={hotel.location?.name || "N/A"}
                        hotel_id={hotel.id}
                        hotelImageURL={hotel.images?.[0]?.url || "/image-not-found.png"}
                        hotelType={hotel.hotelType || "N/A"}
                        rating={hotel.rating || 0}
                        totalRooms={hotel.totalRooms}
                        onClickNavigate={() => router.push(`/hotels/${hotel.id}`)}
                        onEdit={() => router.push(`/hotels/${hotel.id}/edit`)}
                        onDelete={() => {
                            showLoadingContent(true);
                            deleteHotelMutate(hotel.id);
                        }}
                    />
                ))
            }
        </AdminEntityListShell>
    );
}

export default function HotelListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <HotelListingsPage />
        </Suspense>
    );
}
