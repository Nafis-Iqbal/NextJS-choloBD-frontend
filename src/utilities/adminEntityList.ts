export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface ListPagination {
    total: number;
    page: number;
    limit: number;
}

export type PaginatedListResponse<T> = ApiResponse<T[]> & {
    pagination?: ListPagination;
};

export function parsePositiveInt(value: string | null, fallback: number): number {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function clampPageSize(value: number): number {
    return Math.min(MAX_PAGE_SIZE, Math.max(1, value));
}

export function toQueryString(values: Record<string, string | number | undefined | null>): string {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        const text = String(value).trim();
        if (!text) return;
        params.set(key, text);
    });
    return params.toString();
}

export function buildListQueryString(values: {
    name: string;
    divisionId: string;
    locationId: string;
    page: number;
    limit: number;
    extras?: Record<string, string>;
}): string {
    return toQueryString({
        name: values.name,
        divisionId: values.divisionId,
        locationId: values.locationId,
        page: values.page,
        limit: values.limit,
        ...values.extras,
    });
}

export function getListRange(total: number, page: number, limit: number) {
    const currentPage = page;
    const pageSize = limit;
    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

    return { currentPage, pageSize, totalPages, from, to };
}

export function unwrapPaginatedList<T>(response: ApiResponse<unknown>): PaginatedListResponse<T> {
    const payload = response.data as
        | T[]
        | { results?: T[]; total?: number; page?: number; limit?: number }
        | null
        | undefined;

    if (payload && !Array.isArray(payload) && Array.isArray(payload.results)) {
        return {
            ...response,
            data: payload.results,
            pagination: {
                total: Number(payload.total) || 0,
                page: Number(payload.page) || 1,
                limit: Number(payload.limit) || 20,
            },
        };
    }

    const list = Array.isArray(payload) ? payload : [];
    return {
        ...response,
        data: list,
        pagination: {
            total: list.length,
            page: 1,
            limit: list.length || 20,
        },
    };
}
