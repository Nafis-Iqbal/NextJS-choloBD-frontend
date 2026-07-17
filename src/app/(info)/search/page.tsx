/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocationApi, SearchApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { SearchResultBlock, type SearchAssetType } from "@/components/data-elements/DataTableRowElements";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";
import { PaginationControls } from "@/components/modular-components/dashboard/user/PaginationControls";

type AssetTypeParam = "tourSpot" | "activitySpot" | "hotel" | "guide" | "";

interface SearchResultItem {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    location?: { name?: string };
    images?: { url?: string }[];
    rating?: number;
    specializations?: string[];
    pricePerDay?: number;
    hotelType?: string;
    totalRooms?: number;
    activityType?: string;
    entryCost?: number;
    tourType?: string;
    isPopular?: boolean;
}

const ASSET_TYPE_OPTIONS: { value: AssetTypeParam; label: string; queryKey: string }[] = [
    { value: "tourSpot", label: "Tour Spots", queryKey: "tourSpot" },
    { value: "activitySpot", label: "Activity Spots", queryKey: "activity-spots" },
    { value: "hotel", label: "Hotels", queryKey: "hotels" },
    { value: "guide", label: "Guides", queryKey: "guides" },
];

function parseAssetTypeFromParams(params: URLSearchParams): AssetTypeParam {
    if (params.get("tourSpot") === "true" || params.get("tour-spots") === "true") return "tourSpot";
    if (params.get("activitySpot") === "true" || params.get("activity-spots") === "true") return "activitySpot";
    if (params.get("hotel") === "true" || params.get("hotels") === "true") return "hotel";
    if (params.get("guide") === "true" || params.get("guides") === "true") return "guide";
    return "";
}

function buildSearchQueryString(opts: {
    assetType: AssetTypeParam;
    locationId: string;
    name: string;
    page: number;
}): string {
    const params = new URLSearchParams();

    if (opts.assetType) {
        const option = ASSET_TYPE_OPTIONS.find((o) => o.value === opts.assetType);
        if (option) params.set(option.queryKey, "true");
    }
    if (opts.locationId) params.set("locationId", opts.locationId);
    if (opts.name.trim()) params.set("name", opts.name.trim());
    if (opts.page > 1) params.set("page", String(opts.page));

    return params.toString();
}

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [assetType, setAssetType] = useState<AssetTypeParam>("");
    const [locationId, setLocationId] = useState("");
    const [name, setName] = useState("");
    const [page, setPage] = useState(1);
    const [apiQueryString, setApiQueryString] = useState("");

    const { data: locationsData, isLoading: isLocationsLoading } = LocationApi.useGetAllLocationsRQ();
    const locations = Array.isArray(locationsData?.data)
        ? locationsData.data
        : (locationsData?.data as { results?: Location[] } | undefined)?.results ?? [];

    // Sync React state from URL whenever search params change (inbound links included)
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        setAssetType(parseAssetTypeFromParams(params));
        setLocationId(params.get("locationId") || "");
        setName(params.get("name") || "");
        const pageParam = parseInt(params.get("page") || "1", 10);
        setPage(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);
    }, [searchParams]);

    // Keep API query string in sync with state (uses backend-compatible flags)
    useEffect(() => {
        if (!assetType) {
            setApiQueryString("");
            return;
        }

        const params = new URLSearchParams();
        if (assetType === "tourSpot") params.set("tourSpot", "true");
        else if (assetType === "activitySpot") params.set("activitySpot", "true");
        else if (assetType === "hotel") params.set("hotel", "true");
        else if (assetType === "guide") params.set("guide", "true");

        if (locationId) params.set("locationId", locationId);
        if (name.trim()) params.set("name", name.trim());
        params.set("page", String(page));

        // Need at least name or locationId for a valid backend request
        if (!locationId && !name.trim()) {
            setApiQueryString("");
            return;
        }

        setApiQueryString(params.toString());
    }, [assetType, locationId, name, page]);

    const {
        data: searchData,
        isLoading: isSearchLoading,
        isError: isSearchError,
    } = SearchApi.useGetSearchByTypeResultRQ({
        queryString: apiQueryString,
        enabled: !!apiQueryString,
    });

    const results = (searchData?.data?.results ?? []) as SearchResultItem[];
    const total = searchData?.data?.total ?? 0;
    const limit = searchData?.data?.limit ?? 50;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const updateUrl = (next: {
        assetType?: AssetTypeParam;
        locationId?: string;
        name?: string;
        page?: number;
    }) => {
        const qs = buildSearchQueryString({
            assetType: next.assetType ?? assetType,
            locationId: next.locationId ?? locationId,
            name: next.name ?? name,
            page: next.page ?? page,
        });
        router.replace(qs ? `/search?${qs}` : "/search");
    };

    const resultBlocks = useMemo(() => {
        if (!Array.isArray(results) || results.length === 0) return null;

        return results.map((item: SearchResultItem, index: number) => {
            const mappedType: SearchAssetType =
                assetType === "tourSpot" ? "tourSpot" :
                assetType === "activitySpot" ? "activitySpot" :
                assetType === "hotel" ? "hotel" : "guide";

            if (mappedType === "guide") {
                const title = `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Guide";
                return (
                    <SearchResultBlock
                        key={item.id || index}
                        assetType="guide"
                        title={title}
                        subtitle={item.location?.name || "Location N/A"}
                        imageUrl={item.images?.[0]?.url}
                        rating={item.rating}
                        metaLeft={(item.specializations || []).join(", ") || undefined}
                        metaRight={item.pricePerDay != null ? `৳${item.pricePerDay}/day` : undefined}
                        href={`/guides/${item.id}`}
                    />
                );
            }

            if (mappedType === "hotel") {
                return (
                    <SearchResultBlock
                        key={item.id || index}
                        assetType="hotel"
                        title={item.name || "Hotel"}
                        subtitle={item.location?.name || "Location N/A"}
                        imageUrl={item.images?.[0]?.url}
                        rating={item.rating}
                        metaLeft={item.hotelType || undefined}
                        metaRight={item.totalRooms != null ? `${item.totalRooms} rooms` : undefined}
                        href={`/hotels/${item.id}`}
                    />
                );
            }

            if (mappedType === "activitySpot") {
                return (
                    <SearchResultBlock
                        key={item.id || index}
                        assetType="activitySpot"
                        title={item.name || "Activity"}
                        subtitle={item.location?.name || "Location N/A"}
                        imageUrl={item.images?.[0]?.url}
                        rating={item.rating}
                        metaLeft={item.activityType || undefined}
                        metaRight={item.entryCost != null ? `৳${item.entryCost}` : undefined}
                        href={`/activity-spots/${item.id}`}
                    />
                );
            }

            return (
                <SearchResultBlock
                    key={item.id || index}
                    assetType="tourSpot"
                    title={item.name || "Tour Spot"}
                    subtitle={item.location?.name || "Location N/A"}
                    imageUrl={item.images?.[0]?.url}
                    rating={item.rating}
                    metaLeft={item.tourType || undefined}
                    metaRight={item.isPopular ? "Popular" : undefined}
                    href={`/tour-spots/${item.id}`}
                />
            );
        });
    }, [results, assetType]);

    return (
        <div className="flex flex-col p-3 md:p-6 font-sans mt-3 md:mt-5 max-w-5xl mx-auto w-full">
            <h1 className="theme-label text-xl md:text-2xl mb-1">Search</h1>
            <p className="theme-text-muted text-sm mb-4">
                Filter by asset type and location. Results stay in sync with the URL.
            </p>

            <div className="theme-section theme-outline rounded-md p-3 md:p-4 flex flex-col gap-3 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="theme-label text-sm">Asset type</span>
                        <select
                            className="theme-input theme-outline rounded-md px-3 py-2 w-full"
                            value={assetType}
                            onChange={(e) => {
                                const nextType = e.target.value as AssetTypeParam;
                                setAssetType(nextType);
                                setPage(1);
                                updateUrl({ assetType: nextType, page: 1 });
                            }}
                        >
                            <option value="">Select type…</option>
                            {ASSET_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="theme-label text-sm">Location</span>
                        <select
                            className="theme-input theme-outline rounded-md px-3 py-2 w-full"
                            value={locationId}
                            disabled={isLocationsLoading}
                            onChange={(e) => {
                                const nextLocationId = e.target.value;
                                setLocationId(nextLocationId);
                                setPage(1);
                                updateUrl({ locationId: nextLocationId, page: 1 });
                            }}
                        >
                            <option value="">
                                {isLocationsLoading ? "Loading locations…" : "All locations"}
                            </option>
                            {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <label className="flex flex-col gap-1">
                    <span className="theme-label text-sm">Name (optional if location is set)</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="search"
                            className="theme-input theme-outline rounded-md px-3 py-2 w-full"
                            placeholder="Search by name…"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setPage(1);
                                    updateUrl({ name, page: 1 });
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="theme-btn-teal text-white px-4 py-2 rounded-md shrink-0"
                            onClick={() => {
                                setPage(1);
                                updateUrl({ name, page: 1 });
                            }}
                        >
                            Search
                        </button>
                    </div>
                </label>
            </div>

            <div className="mb-3">
                {!assetType ? (
                    <p className="theme-text-muted text-sm">Select an asset type to begin.</p>
                ) : !apiQueryString ? (
                    <p className="theme-text-muted text-sm">
                        Choose a location and/or enter a name to search.
                    </p>
                ) : (
                    <p className="theme-text-muted text-sm">
                        {isSearchLoading
                            ? "Searching…"
                            : `Showing ${results.length} of ${total} result${total === 1 ? "" : "s"}.`}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-3 mb-6">
                {!assetType || !apiQueryString ? null : isSearchLoading ? (
                    <NoContentTableRow displayMessage="Loading results…" tdColSpan={1} />
                ) : isSearchError ? (
                    <NoContentTableRow displayMessage="An error occurred while searching" tdColSpan={1} />
                ) : results.length === 0 ? (
                    <NoContentTableRow displayMessage="No results found" tdColSpan={1} />
                ) : (
                    resultBlocks
                )}
            </div>

            {apiQueryString && totalPages > 1 && (
                <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(nextPage) => {
                        setPage(nextPage);
                        updateUrl({ page: nextPage });
                    }}
                    className="mb-8"
                />
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <SearchPageContent />
        </Suspense>
    );
}
