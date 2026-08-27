"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthApi, LocationApi } from "@/services/api";
import {
    PAGE_SIZE_OPTIONS,
    DEFAULT_PAGE_SIZE,
    parsePositiveInt,
    clampPageSize,
    buildListQueryString,
} from "@/utilities/adminEntityList";

const EMPTY_EXTRA_KEYS: readonly string[] = [];

export function useAdminEntityListQuery(basePath: string, extraKeys: readonly string[] = EMPTY_EXTRA_KEYS) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const appliedName = searchParams.get("name")?.trim() ?? "";
    const divisionId = searchParams.get("divisionId") ?? "";
    const locationId = searchParams.get("locationId") ?? "";
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = clampPageSize(parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE));
    const extraKeysJoined = extraKeys.join(",");

    const extraParams = useMemo(() => {
        const extras: Record<string, string> = {};
        extraKeysJoined.split(",").forEach((key) => {
            if (!key) return;
            extras[key] = searchParams.get(key) ?? "";
        });
        return extras;
    }, [searchParams, extraKeysJoined]);

    const [draftName, setDraftName] = useState(appliedName);

    useEffect(() => {
        setDraftName(appliedName);
    }, [appliedName]);

    const queryString = useMemo(
        () =>
            buildListQueryString({
                name: appliedName,
                divisionId,
                locationId,
                page,
                limit,
                extras: extraParams,
            }),
        [appliedName, divisionId, locationId, page, limit, extraParams]
    );

    const replaceListParams = useCallback(
        (patch: Partial<{
            name: string;
            divisionId: string;
            locationId: string;
            page: number;
            limit: number;
            extras: Record<string, string>;
        }>) => {
            const nextQuery = buildListQueryString({
                name: patch.name ?? appliedName,
                divisionId: patch.divisionId ?? divisionId,
                locationId: patch.locationId ?? locationId,
                page: patch.page ?? page,
                limit: patch.limit ?? limit,
                extras: { ...extraParams, ...patch.extras },
            });
            router.replace(nextQuery ? `${basePath}?${nextQuery}` : basePath, { scroll: false });
        },
        [appliedName, divisionId, locationId, page, limit, extraParams, router, basePath]
    );

    const { data: locationsListData } = LocationApi.useGetAllLocationsRQ();
    const allLocations = useMemo(() => locationsListData?.data ?? [], [locationsListData?.data]);

    const divisionOptions = useMemo(
        () =>
            allLocations
                .filter((location) => location.locationType === "DIVISION")
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((location) => ({ value: location.id, label: location.name })),
        [allLocations]
    );

    const locationOptions = useMemo(() => {
        const filtered = allLocations.filter((location) => {
            if (location.locationType === "DIVISION") return false;
            if (divisionId) return location.parentLocationId === divisionId;
            return location.locationType === "DISTRICT";
        });

        if (locationId && !filtered.some((location) => location.id === locationId)) {
            const selected = allLocations.find((location) => location.id === locationId);
            if (selected) filtered.unshift(selected);
        }

        return filtered
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((location) => ({ value: location.id, label: location.name }));
    }, [allLocations, divisionId, locationId]);

    const pageSizeOptions = useMemo(() => {
        const values = PAGE_SIZE_OPTIONS.includes(limit)
            ? PAGE_SIZE_OPTIONS
            : [...PAGE_SIZE_OPTIONS, limit].sort((a, b) => a - b);
        return values.map((size) => ({ value: String(size), label: `${size} per page` }));
    }, [limit]);

    const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        replaceListParams({ name: draftName, page: 1 });
    };

    const handleResetFilters = () => {
        setDraftName("");
        router.replace(basePath, { scroll: false });
    };

    const handleDivisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        replaceListParams({
            name: draftName,
            divisionId: event.target.value,
            locationId: "",
            page: 1,
        });
    };

    const handleLocationChange = (event: ChangeEvent<HTMLSelectElement>) => {
        replaceListParams({
            name: draftName,
            locationId: event.target.value,
            page: 1,
        });
    };

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        replaceListParams({
            name: draftName,
            limit: clampPageSize(parsePositiveInt(event.target.value, DEFAULT_PAGE_SIZE)),
            page: 1,
        });
    };

    const handlePageChange = (nextPage: number, totalPages: number) => {
        const clampedPage = Math.min(totalPages, Math.max(1, nextPage));
        replaceListParams({ page: clampedPage });
    };

    return {
        appliedName,
        draftName,
        setDraftName,
        divisionId,
        locationId,
        extraParams,
        page,
        limit,
        queryString,
        divisionOptions,
        locationOptions,
        pageSizeOptions,
        replaceListParams,
        handleApplyFilters,
        handleResetFilters,
        handleDivisionChange,
        handleLocationChange,
        handlePageSizeChange,
        handlePageChange,
    };
}

export type AdminEntityListQuery = ReturnType<typeof useAdminEntityListQuery>;

export function useMasterAdminPage() {
    const router = useRouter();
    const {
        data: authResponse,
        isPending,
        isFetching,
        isFetched,
    } = AuthApi.useGetUserAuthenticationRQ(true);

    const isAuthenticated = authResponse?.data?.isAuthenticated === true;
    const currentUserRole = authResponse?.data?.userRole;
    const isMasterAdmin = isAuthenticated && currentUserRole === "MASTER_ADMIN";

    useEffect(() => {
        if (!isFetched || isPending || isFetching) return;
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
        if (currentUserRole !== "MASTER_ADMIN") {
            router.replace("/");
        }
    }, [isFetched, isPending, isFetching, isAuthenticated, currentUserRole, router]);

    return { isMasterAdmin, router };
}
