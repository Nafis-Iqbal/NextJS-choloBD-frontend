/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { TransportApi } from "@/services/api";
import { ReviewType } from "@/types/enums";

import { StarRating } from "@/components/custom-elements/StarRating";
import { ScrollToTopButton } from "@/components/custom-elements/ScrollToTopButton";
import { HeroSectionFull } from "@/components/modular-components/HeroSectionFull";
import { ReviewModule } from "@/components/modular-components/ReviewModule";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";

function formatEnumLabel(value?: string) {
    if (!value) return "N/A";
    return value
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");
}

export default async function TransportDetailPage({
    params,
}: {
    params: Promise<{ transport_id: string }>;
}) {
    const { transport_id } = await params;

    if (transport_id === "favicon.ico") {
        return null;
    }

    let transportDetailsData;
    try {
        transportDetailsData = await TransportApi.getTransportDetail(transport_id);
    } catch (error) {
        console.error("Failed to fetch Transport Details. Error: ", error);
        notFound();
    }

    const transportDetails = transportDetailsData?.data;
    if (!transportDetails) {
        notFound();
    }

    const transportImages = transportDetails.images ?? [];
    const tripCount = transportDetails._count?.trips ?? 0;
    const vehicleCount = transportDetails._count?.vehicles ?? transportDetails.vehicleCount;

    return (
        <div className="flex flex-col md:px-2 pb-2 font-sans theme-text">
            <div className="md:mx-6 md:mb-6 flex flex-col space-y-5">
                <div className="flex flex-col w-full space-y-2 pb-3 theme-outline">
                    <HeroSectionFull
                        className="h-[50vh] md:h-[65vh]"
                        imageList={transportImages.map((image: any) => ({
                            imageURL: image.url,
                            imageAlt: image.altText || transportDetails.name,
                        }))}
                    />

                    <div className="px-3 flex flex-col space-y-2 my-10">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="theme-text-teal">{transportDetails.name ?? "N/A"}</h2>
                            {transportDetails.isVerified && (
                                <span className="theme-badge px-3 py-1 rounded-full text-sm font-medium">
                                    Verified Operator
                                </span>
                            )}
                            {!transportDetails.isActive && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-300">
                                    Inactive
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <h4 className="theme-text-muted">Rating:</h4>
                            <StarRating rating={transportDetails.rating ?? 0} />
                        </div>
                    </div>

                    <HorizontalDivider className="mx-3 theme-outline" />

                    <div className="px-3 flex flex-col md:flex-row md:justify-between space-x-0 md:space-x-4 space-y-4 md:space-y-0 w-full">
                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            <div className="flex justify-between">
                                <span className="theme-label">Type:</span>
                                <span className="theme-text">{formatEnumLabel(transportDetails.transportType)}</span>
                            </div>
                            {transportDetails.location?.name && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Location:</span>
                                    <span className="theme-text">{transportDetails.location.name}</span>
                                </div>
                            )}
                            {transportDetails.phoneNumber && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Phone:</span>
                                    <span className="theme-text">{transportDetails.phoneNumber}</span>
                                </div>
                            )}
                            {transportDetails.contactEmail && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Email:</span>
                                    <span className="theme-text">{transportDetails.contactEmail}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-4 md:w-[50%]">
                            {transportDetails.website && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Website:</span>
                                    <a
                                        href={transportDetails.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="theme-text-teal hover:underline"
                                    >
                                        {transportDetails.website}
                                    </a>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="theme-label">Vehicles:</span>
                                <span className="theme-text">{vehicleCount ?? "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="theme-label">Active Trips:</span>
                                <span className="theme-text">{tripCount}</span>
                            </div>
                            {transportDetails.capacity != null && (
                                <div className="flex justify-between">
                                    <span className="theme-label">Capacity:</span>
                                    <span className="theme-text">{transportDetails.capacity}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <label className="px-3 mt-15 theme-label text-2xl">Description</label>
                    <p className="px-3 min-h-[100px] md:min-h-[160px] theme-text">
                        {transportDetails.description ?? "N/A"}
                    </p>

                    <div className="px-3 mt-6 space-y-3">
                        <div className="flex flex-col space-y-2">
                            <span className="theme-label">Operating Routes:</span>
                            <div className="flex flex-wrap gap-2">
                                {transportDetails.operatingRoutes?.length > 0 ? (
                                    transportDetails.operatingRoutes.map((route) => (
                                        <span key={route} className="theme-badge px-4 py-2 rounded-full text-sm">
                                            {route}
                                        </span>
                                    ))
                                ) : (
                                    <span className="theme-text">N/A</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <span className="theme-label">Amenities:</span>
                            <div className="flex flex-wrap gap-2">
                                {transportDetails.amenities?.length > 0 ? (
                                    transportDetails.amenities.map((amenity) => (
                                        <span key={amenity} className="theme-badge px-4 py-2 rounded-full text-sm">
                                            {amenity}
                                        </span>
                                    ))
                                ) : (
                                    <span className="theme-text">N/A</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <span className="theme-label">Policies:</span>
                            <div className="flex flex-wrap gap-2">
                                {transportDetails.policies?.length > 0 ? (
                                    transportDetails.policies.map((policy) => (
                                        <span key={policy} className="theme-badge px-4 py-2 rounded-full text-sm">
                                            {policy}
                                        </span>
                                    ))
                                ) : (
                                    <span className="theme-text">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <ReviewModule
                    pageAssetType={ReviewType.TRANSPORT}
                    assetId={transportDetails.id ?? ""}
                    assetName={transportDetails.name ?? "N/A"}
                />

                <div className="flex flex-wrap gap-4 text-sm px-3">
                    <Link href="/transports" className="theme-text-teal font-medium">
                        ← Transport listings
                    </Link>
                    <Link href={`/transports/${transport_id}/edit`} className="theme-text-muted font-medium">
                        Edit
                    </Link>
                </div>

                <ScrollToTopButton className="mt-2" />
            </div>
        </div>
    );
}
