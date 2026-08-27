import { PaginationControls } from "@/components/modular-components/dashboard/user/PaginationControls";

export function ListPaginationBar({
    entityLabel,
    from,
    to,
    total,
    currentPage,
    totalPages,
    pageSize,
    isLoading,
    isError,
    onPageChange,
    className = "",
}: {
    entityLabel: string;
    from: number;
    to: number;
    total: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    isLoading: boolean;
    isError: boolean;
    onPageChange: (page: number) => void;
    className?: string;
}) {
    const rangeText = isLoading
        ? `Loading ${entityLabel}...`
        : isError
            ? `Could not load ${entityLabel}`
            : total === 0
                ? `No ${entityLabel} to display`
                : `Showing ${from}–${to} of ${total} ${entityLabel}`;

    return (
        <div className={`flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:mr-5 ${className}`}>
            <div className="space-y-0.5">
                <p className="theme-text-muted text-sm">{rangeText}</p>
                <p className="theme-text-subtle text-xs">
                    Page {currentPage} of {totalPages} · {pageSize} per page
                </p>
            </div>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                className="mt-0"
            />
        </div>
    );
}
