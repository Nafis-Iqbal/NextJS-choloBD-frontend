"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { LocationApi, TourBuilderApi, TourSpotApi } from "@/services/api";
import { useMasterAdminPage } from "@/hooks/useAdminEntityListQuery";
import {
    PAGE_SIZE_OPTIONS,
    DEFAULT_PAGE_SIZE,
    parsePositiveInt,
    clampPageSize,
    toQueryString,
    getListRange,
} from "@/utilities/adminEntityList";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import TableLayout from "@/components/layout-elements/TableLayout";
import FilterSectionLayout from "@/components/layout-elements/FilterSectionLayout";
import { CustomSelectInput, CustomTextInput } from "@/components/custom-elements/CustomInputElements";
import { ListPaginationBar } from "@/components/layout-elements/ListPaginationBar";
import { TourPackageViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";

function TourPackageListingsPage() {
    const { isMasterAdmin, router } = useMasterAdminPage();
    const searchParams = useSearchParams();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const divisionId = searchParams.get("divisionId") ?? "";
    const tourSpotId = searchParams.get("tourSpotId") ?? "";
    const minBudget = searchParams.get("minBudget") ?? "";
    const maxBudget = searchParams.get("maxBudget") ?? "";
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = clampPageSize(parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE));

    const [draftMinBudget, setDraftMinBudget] = useState(minBudget);
    const [draftMaxBudget, setDraftMaxBudget] = useState(maxBudget);

    useEffect(() => {
        setDraftMinBudget(minBudget);
        setDraftMaxBudget(maxBudget);
    }, [minBudget, maxBudget]);

    const queryString = useMemo(
        () =>
            toQueryString({
                divisionId,
                tourSpotId,
                minBudget,
                maxBudget,
                page,
                limit,
            }),
        [divisionId, tourSpotId, minBudget, maxBudget, page, limit]
    );

    const replaceListParams = useCallback(
        (patch: Partial<{
            divisionId: string;
            tourSpotId: string;
            minBudget: string;
            maxBudget: string;
            page: number;
            limit: number;
        }>) => {
            const nextQuery = toQueryString({
                divisionId: patch.divisionId ?? divisionId,
                tourSpotId: patch.tourSpotId ?? tourSpotId,
                minBudget: patch.minBudget ?? minBudget,
                maxBudget: patch.maxBudget ?? maxBudget,
                page: patch.page ?? page,
                limit: patch.limit ?? limit,
            });
            router.replace(nextQuery ? `/tour-builder/platform/tours?${nextQuery}` : "/tour-builder/platform/tours", {
                scroll: false,
            });
        },
        [divisionId, tourSpotId, minBudget, maxBudget, page, limit, router]
    );

    const { data: locationsListData } = LocationApi.useGetAllLocationsRQ();
    const divisionOptions = useMemo(
        () =>
            (locationsListData?.data ?? [])
                .filter((location) => location.locationType === "DIVISION")
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((location) => ({ value: location.id, label: location.name })),
        [locationsListData?.data]
    );

    const { data: tourSpotsData } = TourSpotApi.useGetAllTourSpotsRQ("limit=100");
    const tourSpotOptions = useMemo(
        () =>
            (tourSpotsData?.data ?? [])
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((spot) => ({ value: spot.id, label: spot.name })),
        [tourSpotsData?.data]
    );

    const pageSizeOptions = useMemo(() => {
        const values = PAGE_SIZE_OPTIONS.includes(limit)
            ? PAGE_SIZE_OPTIONS
            : [...PAGE_SIZE_OPTIONS, limit].sort((a, b) => a - b);
        return values.map((size) => ({ value: String(size), label: `${size} per page` }));
    }, [limit]);

    const {
        data: tourPackagesData,
        isLoading: isFetchLoading,
        isError: isFetchError,
        refetch: refetchTourPackages,
    } = TourBuilderApi.useGetAllTourPlansRQ(queryString);
    const tourPackages = tourPackagesData?.data ?? [];
    const total = tourPackagesData?.pagination?.total ?? 0;
    const { currentPage, pageSize, totalPages, from, to } = getListRange(
        total,
        tourPackagesData?.pagination?.page ?? page,
        tourPackagesData?.pagination?.limit ?? limit
    );

    const { mutate: deleteTourPackageMutate } = TourBuilderApi.useDeleteTourPlanRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Tour package deleted successfully.");
                refetchTourPackages();
            } else {
                finishWithMessage(`Failed to delete the tour package. ${responseData.message || ""}`);
            }
        },
        () => finishWithMessage("Failed to delete the tour package. An error occurred on the server.")
    );

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        replaceListParams({ minBudget: draftMinBudget, maxBudget: draftMaxBudget, page: 1 });
    };

    useEffect(() => {
        if (total === 0) return;
        if (page > totalPages) {
            replaceListParams({ page: totalPages });
        }
    }, [page, total, totalPages, replaceListParams]);

    if (!isMasterAdmin) {
        return null;
    }

    const paginationBar = (className: string) => (
        <ListPaginationBar
            entityLabel="tour packages"
            from={from}
            to={to}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            isLoading={isFetchLoading}
            isError={isFetchError}
            onPageChange={(nextPage) => replaceListParams({ page: nextPage })}
            className={className}
        />
    );

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="theme-label">Tour Packages</h3>
                <p className="theme-text-muted">
                    {isFetchLoading
                        ? "Loading tour packages..."
                        : isFetchError
                            ? "Could not load tour packages."
                            : total > 0
                                ? `Found ${total} matching tour package${total === 1 ? "" : "s"}.`
                                : "No tour packages found."}
                </p>

                <FilterSectionLayout className="mt-3 md:mr-5" onSubmit={handleApplyFilters}>
                    <div className="flex flex-wrap gap-4 md:gap-8 items-end">
                        <CustomTextInput
                            placeholderText="Min total cost"
                            type="number"
                            min={0}
                            onChange={(event) => setDraftMinBudget(event.target.value)}
                            value={draftMinBudget}
                            name="minBudget"
                            label="Min total cost"
                            className="w-[140px] md:w-auto"
                        />
                        <CustomTextInput
                            placeholderText="Max total cost"
                            type="number"
                            min={0}
                            onChange={(event) => setDraftMaxBudget(event.target.value)}
                            value={draftMaxBudget}
                            name="maxBudget"
                            label="Max total cost"
                            className="w-[140px] md:w-auto"
                        />
                        <CustomSelectInput
                            options={[{ value: "", label: "-- All Divisions --" }, ...divisionOptions]}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                replaceListParams({
                                    minBudget: draftMinBudget,
                                    maxBudget: draftMaxBudget,
                                    divisionId: event.target.value,
                                    page: 1,
                                })
                            }
                            value={divisionId}
                            name="divisionId"
                            label="Division"
                            className="min-w-[160px]"
                        />
                        <CustomSelectInput
                            options={[{ value: "", label: "-- All Tour Spots --" }, ...tourSpotOptions]}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                replaceListParams({
                                    minBudget: draftMinBudget,
                                    maxBudget: draftMaxBudget,
                                    tourSpotId: event.target.value,
                                    page: 1,
                                })
                            }
                            value={tourSpotId}
                            name="tourSpotId"
                            label="Tour spot"
                            className="min-w-[180px]"
                        />
                        <CustomSelectInput
                            options={pageSizeOptions}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                replaceListParams({
                                    minBudget: draftMinBudget,
                                    maxBudget: draftMaxBudget,
                                    limit: clampPageSize(parsePositiveInt(event.target.value, DEFAULT_PAGE_SIZE)),
                                    page: 1,
                                })
                            }
                            value={String(limit)}
                            name="limit"
                            label="Page length"
                            className="min-w-[140px]"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4">
                        <button
                            className="flex self-end items-center px-2 py-1 theme-btn-teal text-base md:text-lg rounded-sm mt-2"
                            type="submit"
                        >
                            Apply Filters
                        </button>
                        <button
                            className="flex self-end items-center px-2 py-1 theme-btn-teal text-base md:text-lg rounded-sm mt-2"
                            type="button"
                            onClick={() => {
                                setDraftMinBudget("");
                                setDraftMaxBudget("");
                                router.replace("/tour-builder/platform/tours", { scroll: false });
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                </FilterSectionLayout>

                {paginationBar("mt-4")}

                <TableLayout className="mt-3 md:mr-5 mb-3">
                    <div className="w-full">
                        <div
                            className="block rounded-sm md:rounded-md border-0 md:border px-0 py-1 md:p-2"
                            style={{
                                backgroundColor: "var(--theme-card-bg)",
                                borderColor: "var(--theme-deep-green)",
                            }}
                        >
                            {isFetchLoading ? (
                                <NoContentTableRow displayMessage="Loading Data" tdColSpan={1} />
                            ) : isFetchError ? (
                                <NoContentTableRow displayMessage="An error occurred" tdColSpan={1} />
                            ) : tourPackages.length <= 0 ? (
                                <NoContentTableRow displayMessage="No tour packages found" tdColSpan={1} />
                            ) : (
                                tourPackages.map((tourPackage, index) => (
                                    <TourPackageViewListTableRow
                                        key={tourPackage.id}
                                        id={(currentPage - 1) * pageSize + index + 1}
                                        packageName={tourPackage.packageName || ""}
                                        packageImageURL={tourPackage.images?.[0]?.url}
                                        shortDescription={tourPackage.shortDescription}
                                        totalBudget={tourPackage.totalBudget}
                                        rating={tourPackage.rating}
                                        duration={tourPackage.duration}
                                        daySegments={(tourPackage.daySegments ?? []).map((segment) => ({
                                            dayNumber: segment.dayNumber,
                                            tourSpotName: segment.tourSpotName,
                                            activitySpotName: segment.activitySpotName,
                                            transportOption: segment.transportOption,
                                            hotelOption: segment.hotelOption,
                                        }))}
                                        onClickNavigate={() =>
                                            router.push(`/tour-builder/platform/tours/${tourPackage.id}`)
                                        }
                                        onEdit={() =>
                                            router.push(`/tour-builder/platform/tours/${tourPackage.id}/edit`)
                                        }
                                        onDelete={() => {
                                            showLoadingContent(true);
                                            deleteTourPackageMutate(tourPackage.id);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </TableLayout>

                {paginationBar("mb-4")}

                <button className="green-button w-fit" onClick={() => router.push("/tour-builder/platform")}>
                    Create New Tour Package
                </button>
            </div>
        </div>
    );
}

export default function TourPackageListPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <TourPackageListingsPage />
        </Suspense>
    );
}
