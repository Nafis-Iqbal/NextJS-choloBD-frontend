"use client";

import { useParams, useRouter } from "next/navigation";
import { TourBuilderApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { StarRating } from "@/components/custom-elements/StarRating";
import { EditButton } from "@/components/custom-elements/Buttons";

function TourDetailContent() {
    const params = useParams();
    const router = useRouter();
    const tourId = params.tour_id as string;

    const { data: tourResponse, isLoading, isError, error } = TourBuilderApi.useGetTourPlanDetailsRQ(tourId);
    const tour = tourResponse?.data;

    if (isLoading) {
        return <SuspenseFallback />;
    }

    if (isError) {
        return (
            <div className="flex flex-col p-6 font-sans mt-5">
                <div className="md:ml-6 flex flex-col space-y-4">
                    <h3 className="text-red-500">Error Loading Tour</h3>
                    <p className="text-red-400">{error?.message || "Failed to load tour details"}</p>
                    <button
                        className="green-button w-fit"
                        onClick={() => router.back()}
                    >
                        Back to Tours
                    </button>
                </div>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="flex flex-col p-6 font-sans mt-5">
                <div className="md:ml-6 flex flex-col space-y-4">
                    <h3 className="text-yellow-500">No Tour Found</h3>
                    <p className="text-gray-300">The tour package you're looking for doesn't exist.</p>
                    <button
                        className="green-button w-fit"
                        onClick={() => router.back()}
                    >
                        Back to Tours
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-4 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-6 md:mr-5">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col space-y-2">
                        <h2 className="text-green-500 text-2xl font-bold">{tour.packageName}</h2>
                        <p className="text-gray-400 text-sm">Package ID: {tour.id}</p>
                    </div>
                    <div className="flex space-x-3">
                        <EditButton
                            className="scale-100 hover:scale-110"
                            onClick={() => router.push(`/tour-builder/tours/${tour.id}/edit`)}
                        />
                        <button
                            className="green-button"
                            onClick={() => router.back()}
                        >
                            Back
                        </button>
                    </div>
                </div>

                {/* Short Description */}
                {tour.shortDescription && (
                    <div className="bg-gray-700 p-4 border-l-4 border-green-500 rounded">
                        <p className="text-gray-200">{tour.shortDescription}</p>
                    </div>
                )}

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Location</p>
                        <p className="text-white text-lg">{tour.location?.name || "N/A"}</p>
                    </div>
                    <div className="bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Tour Type</p>
                        <p className="text-white text-lg">{tour.tourType}</p>
                    </div>
                    <div className="bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Duration</p>
                        <p className="text-white text-lg">{tour.duration} Days</p>
                    </div>
                    <div className="bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Max Group Size</p>
                        <p className="text-white text-lg">{tour.maxGroupSize} People</p>
                    </div>
                    <div className="bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Total Budget</p>
                        <p className="text-white text-lg">৳ {tour.totalBudget?.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Rating</p>
                        <div className="flex items-center space-x-2">
                            <StarRating rating={tour.rating} />
                            <span className="text-white text-lg">{tour.rating?.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Status Information */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Status</p>
                        <div className="flex space-x-2 mt-2">
                            <span className={`px-3 py-1 rounded text-sm font-semibold ${tour.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                {tour.isActive ? "Active" : "Inactive"}
                            </span>
                            {tour.isPopular && (
                                <span className="px-3 py-1 rounded text-sm font-semibold bg-yellow-600 text-white">
                                    Popular
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Created</p>
                        <p className="text-white mt-2">{new Date(tour.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex-1 bg-gray-700 p-4 border border-green-800 rounded">
                        <p className="text-green-300 text-sm font-semibold">Last Updated</p>
                        <p className="text-white mt-2">{new Date(tour.updatedAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Day Segments Section */}
                {tour.daySegments && tour.daySegments.length > 0 ? (
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-green-500 text-xl font-bold">Day-wise Itinerary</h3>
                        <div className="flex flex-col space-y-3">
                            {tour.daySegments.map((segment, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-700 p-4 border-l-4 border-green-500 rounded"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-green-300 font-bold text-lg">
                                            Day {segment.dayNumber}
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {segment.tourSpotName && (
                                            <div>
                                                <p className="text-gray-400 text-xs font-semibold">Tour Spot</p>
                                                <p className="text-white mt-1">{segment.tourSpotName}</p>
                                            </div>
                                        )}
                                        {segment.activitySpotName && (
                                            <div>
                                                <p className="text-gray-400 text-xs font-semibold">Activity</p>
                                                <p className="text-white mt-1">{segment.activitySpotName}</p>
                                            </div>
                                        )}
                                        {segment.transportOption && (
                                            <div>
                                                <p className="text-gray-400 text-xs font-semibold">Transport</p>
                                                <p className="text-white mt-1 capitalize">{segment.transportOption.toLowerCase()}</p>
                                            </div>
                                        )}
                                        {segment.hotelOption && (
                                            <div>
                                                <p className="text-gray-400 text-xs font-semibold">Hotel Type</p>
                                                <p className="text-white mt-1 capitalize">{segment.hotelOption.toLowerCase()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-700 p-4 border-l-4 border-yellow-500 rounded">
                        <p className="text-yellow-300">No day-wise itinerary added yet.</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-3 mb-5 md:mb-10">
                    <button
                        className="green-button flex-1"
                        onClick={() => router.push(`/tour-builder/tours/${tour.id}/edit`)}
                    >
                        Edit Tour Package
                    </button>
                    <button
                        className="gray-button flex-1"
                        onClick={() => router.back()}
                    >
                        Back to Tour List
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function TourDetailPage() {
    return (
        <div>
            <TourDetailContent />
        </div>
    );
}