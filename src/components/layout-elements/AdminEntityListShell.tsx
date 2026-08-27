"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import TableLayout from "@/components/layout-elements/TableLayout";
import { AdminEntityListFilters } from "@/components/layout-elements/AdminEntityListFilters";
import { ListPaginationBar } from "@/components/layout-elements/ListPaginationBar";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";
import { getListRange, type ListPagination } from "@/utilities/adminEntityList";
import { useMasterAdminPage, type AdminEntityListQuery } from "@/hooks/useAdminEntityListQuery";

export function AdminEntityListShell({
    title,
    entityLabel,
    entityLabelSingular,
    createHref,
    createLabel,
    listQuery,
    extraFilters,
    pagination,
    isLoading,
    isError,
    itemCount,
    children,
}: {
    title: string;
    entityLabel: string;
    entityLabelSingular: string;
    createHref: string;
    createLabel: string;
    listQuery: AdminEntityListQuery;
    extraFilters?: ReactNode;
    pagination?: ListPagination;
    isLoading: boolean;
    isError: boolean;
    itemCount: number;
    children: (ctx: { rowNumber: (index: number) => number; router: ReturnType<typeof useRouter> }) => ReactNode;
}) {
    const { isMasterAdmin, router } = useMasterAdminPage();
    const total = pagination?.total ?? 0;
    const { currentPage, pageSize, totalPages, from, to } = getListRange(
        total,
        pagination?.page ?? listQuery.page,
        pagination?.limit ?? listQuery.limit
    );

    useEffect(() => {
        if (total === 0) return;
        if (listQuery.page > totalPages) {
            listQuery.replaceListParams({ page: totalPages });
        }
    }, [listQuery.page, listQuery.replaceListParams, total, totalPages]);

    if (!isMasterAdmin) {
        return null;
    }

    const summary = isLoading
        ? `Loading ${entityLabel}...`
        : isError
            ? `Could not load ${entityLabel}.`
            : total > 0
                ? `Found ${total} matching ${total === 1 ? entityLabelSingular : entityLabel}.`
                : `No ${entityLabel} found.`;

    const paginationBar = (className: string) => (
        <ListPaginationBar
            entityLabel={entityLabel}
            from={from}
            to={to}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            isLoading={isLoading}
            isError={isError}
            onPageChange={(page) => listQuery.handlePageChange(page, totalPages)}
            className={className}
        />
    );

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="theme-label">{title}</h3>
                <p className="theme-text-muted">{summary}</p>

                <AdminEntityListFilters listQuery={listQuery} extraFilters={extraFilters} />

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
                            {isLoading ? (
                                <NoContentTableRow displayMessage="Loading Data" tdColSpan={1} />
                            ) : isError ? (
                                <NoContentTableRow displayMessage="An error occurred" tdColSpan={1} />
                            ) : itemCount <= 0 ? (
                                <NoContentTableRow displayMessage={`No ${entityLabel} found`} tdColSpan={1} />
                            ) : (
                                children({
                                    rowNumber: (index) => (currentPage - 1) * pageSize + index + 1,
                                    router,
                                })
                            )}
                        </div>
                    </div>
                </TableLayout>

                {paginationBar("mb-4")}

                <button className="green-button w-fit" onClick={() => router.push(createHref)}>
                    {createLabel}
                </button>
            </div>
        </div>
    );
}
