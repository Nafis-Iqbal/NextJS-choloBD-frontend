import type { ReactNode } from "react";
import FilterSectionLayout from "@/components/layout-elements/FilterSectionLayout";
import { CustomSelectInput, CustomTextInput } from "@/components/custom-elements/CustomInputElements";
import type { AdminEntityListQuery } from "@/hooks/useAdminEntityListQuery";

export function AdminEntityListFilters({
    listQuery,
    extraFilters,
}: {
    listQuery: AdminEntityListQuery;
    extraFilters?: ReactNode;
}) {
    return (
        <FilterSectionLayout className="mt-3 md:mr-5" onSubmit={listQuery.handleApplyFilters}>
            <div className="flex flex-wrap gap-4 md:gap-8 items-end">
                <CustomTextInput
                    placeholderText="Search by name"
                    onChange={(event) => listQuery.setDraftName(event.target.value)}
                    value={listQuery.draftName}
                    name="name"
                    label="Name"
                    className="w-[180px] md:w-auto"
                />

                <CustomSelectInput
                    options={[{ value: "", label: "-- All Divisions --" }, ...listQuery.divisionOptions]}
                    onChange={listQuery.handleDivisionChange}
                    value={listQuery.divisionId}
                    name="divisionId"
                    label="Division"
                    className="min-w-[160px]"
                />

                <CustomSelectInput
                    options={[{ value: "", label: "-- All Locations --" }, ...listQuery.locationOptions]}
                    onChange={listQuery.handleLocationChange}
                    value={listQuery.locationId}
                    name="locationId"
                    label="Location"
                    className="min-w-[160px]"
                />

                {extraFilters}

                <CustomSelectInput
                    options={listQuery.pageSizeOptions}
                    onChange={listQuery.handlePageSizeChange}
                    value={String(listQuery.limit)}
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
                    onClick={listQuery.handleResetFilters}
                >
                    Reset Filters
                </button>
            </div>
        </FilterSectionLayout>
    );
}
