/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { CustomSelectInput, CustomDateInput } from "@/components/custom-elements/CustomInputElements";

import { AuthApi, HotelApi, LocationApi } from "@/services/api";
import { HotelBookingPanel } from "@/components/modular-components/HotelBookingModule";

// Custom variant of Hotel interface for display purposes
type HotelDisplayItem = Hotel & {
	displayPrice?: number;
};

function nightsBetween(checkIn?: string, checkOut?: string) {
	if (!checkIn || !checkOut) return 0;
	const a = new Date(checkIn);
	const b = new Date(checkOut);
	if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
	const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
	return Math.max(0, diff);
}

interface HotelCardProps {
	hotel: HotelDisplayItem;
	onBookNowClicked: (hotel: HotelDisplayItem) => void;
	onViewDetails: (hotel: HotelDisplayItem) => void;
}

interface HotelDetailsPanelProps {
	hotel: HotelDisplayItem;
	form: {
		checkIn: string;
		checkOut: string;
		guests: string;
		rooms: string;
	};
	nights: number;
	onViewPage: () => void;
	onReserve: () => void;
}

function HotelBookingContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const { data: authResponse, isLoading: isAuthLoading } = AuthApi.useGetUserAuthenticationRQ(true);
	const isAuthenticated = authResponse?.data?.isAuthenticated;
	const authUserId = authResponse?.data?.userId;
	//console.log("DashboardLayout - isAuthenticated:", isAuthenticated, " isLoading:", isAuthLoading);

	// Fetch real hotel data from API
	const { data: hotelsResponse, isLoading, error } = HotelApi.useGetAllHotelsRQ();
	const hotels: Hotel[] = useMemo(() => {
		return hotelsResponse?.data || [];
	}, [hotelsResponse]);

	// Fetch locations to construct city options
	const { data: locationsResponse, isLoading: locationsLoading, error: locationsError } = LocationApi.useGetAllLocationsRQ();

	// Extract district type locations as city options
	const cityOptions = useMemo(() => {
		const districts = (locationsResponse?.data || [])
			.filter((loc) => loc.locationType === "DISTRICT")
			.map((loc) => loc.name)
			.sort();
		return districts;
	}, [locationsResponse]);

	const [form, setForm] = useState({
		city: "",
		checkIn: "",
		checkOut: "",
		guests: "2",
		rooms: "1",
		minRating: "0",
		sort: "rating" as "rating" | "name",
	});

	const [selectedHotel, setSelectedHotel] = useState<HotelDisplayItem | null>(null);

	// Prefill from URL
	useEffect(() => {
		const city = searchParams.get("city") || "";
		const checkIn = searchParams.get("checkIn") || "";
		const checkOut = searchParams.get("checkOut") || "";
		const guests = searchParams.get("guests") || "2";
		const rooms = searchParams.get("rooms") || "1";
		const minRating = searchParams.get("minRating") || "0";
		const sort = (searchParams.get("sort") || "rating") as any;

		setForm((prev) => ({
			...prev,
			city: cityOptions.includes(city) ? city : prev.city || (cityOptions.length > 0 ? cityOptions[0] : ""),
			checkIn,
			checkOut,
			guests,
			rooms,
			minRating: ["0", "3", "4", "4.5"].includes(minRating) ? minRating : "0",
			sort: sort === "name" ? "name" : "rating",
		}));
	}, [searchParams, cityOptions]);

	const nights = useMemo(() => nightsBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);

	const results = useMemo(() => {
		const minRating = Number(form.minRating || "0");

		// Step 1: Filter by city
		const filteredByCity = form.city 
			? hotels.filter((h) => h.location?.name === form.city)
			: hotels;

		// Step 2: Filter by minimum rating
		const filteredByRating = minRating > 0
			? filteredByCity.filter((h) => h.rating >= minRating)
			: filteredByCity;

		// Step 3: Sort results by selected criteria
		const sorted = [...filteredByRating].sort((a, b) => {
			if (form.sort === "name") {
				return a.name.localeCompare(b.name);
			}
			return b.rating - a.rating;
		});

		return sorted;
	}, [hotels, form.city, form.minRating, form.sort]);

	const pushQuery = () => {
		const qs = new URLSearchParams();
		qs.set("city", form.city);
		if (form.checkIn) qs.set("checkIn", form.checkIn);
		if (form.checkOut) qs.set("checkOut", form.checkOut);
		qs.set("guests", form.guests);
		qs.set("rooms", form.rooms);
		if (form.minRating !== "0") qs.set("minRating", form.minRating);
		qs.set("sort", form.sort);

		router.push(`?${qs.toString()}`);
	};

	const invalidDates = useMemo(() => {
		if (!form.checkIn || !form.checkOut) return false;
		const a = new Date(form.checkIn);
		const b = new Date(form.checkOut);
		return b.getTime() <= a.getTime();
	}, [form.checkIn, form.checkOut]);

	if (isLoading) {
		return (
			<div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
				<div className="flex flex-col gap-2">
					<h3 className="text-green-500 font-fredericka">Hotel Booking</h3>
					<p className="text-green-200">Loading hotel data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
				<div className="flex flex-col gap-2">
					<h3 className="text-green-500 font-fredericka">Hotel Booking</h3>
					<p className="text-red-300">Failed to load hotels. Please try again.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col p-3 md:p-6 mt-5 font-sans min-h-screen">
			<div className="flex flex-col gap-2">
				<h3 className="text-green-500 font-fredericka">Hotel Booking</h3>
				<p className="text-green-200">Search hotels with flexible filters.</p>
			</div>

			{/* Filter Options */}
			<section className="flex flex-col space-y-4 md:w-[60%] mt-5 rounded-xl border border-green-900/60 bg-section p-4 md:p-5">
				<p className="text-2xl text-green-300">Hotel Filters</p>

				{/* Row 1: City */}
				<div className="grid grid-cols-1 gap-3 mb-4">
					<div>
						<CustomSelectInput
							label="City"
							labelStyle="text-green-300"
							value={form.city}
							onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
							options={cityOptions.map((c) => ({ label: c, value: c }))}
							defaultSelectText="Select a city"
							className="w-full bg-gray-800 border-gray-600 text-gray-100"
						/>
					</div>
				</div>

				{/* Row 2: Min Rating - Sort */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<div>
						<CustomSelectInput
							label="Min Rating"
							labelStyle="text-green-300"
							value={form.minRating}
							onChange={(e) => setForm((p) => ({ ...p, minRating: e.target.value }))}
							options={[
								{ label: "Any", value: "0" },
								{ label: "3.0+", value: "3" },
								{ label: "4.0+", value: "4" },
								{ label: "4.5+", value: "4.5" },
							]}
							className="w-full bg-gray-800 border-gray-600 text-gray-100"
						/>
					</div>
					<div>
						<CustomSelectInput
							label="Sort"
							labelStyle="text-green-300"
							value={form.sort}
							onChange={(e) => setForm((p) => ({ ...p, sort: e.target.value as any }))}
							options={[
								{ label: "Highest rating", value: "rating" },
								{ label: "Hotel name", value: "name" },
							]}
							className="w-full bg-gray-800 border-gray-600 text-gray-100"
						/>
					</div>
				</div>

				{/* Row 3: Check-in - Check-out */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<div>
						<CustomDateInput
							label="Check-in"
							labelStyle="text-green-300"
							value={form.checkIn}
							onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))}
							className="w-full bg-gray-800 border-gray-600 text-gray-100"
						/>
					</div>
					<div>
						<CustomDateInput
							label="Check-out"
							labelStyle="text-green-300"
							value={form.checkOut}
							onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))}
							className="w-full bg-gray-800 border-gray-600 text-gray-100"
						/>
					</div>
				</div>

				{/* Row 4: Guests - Rooms */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<div>
						<CustomSelectInput
							label="Guests"
							labelStyle="text-green-300"
							value={form.guests}
							onChange={(e) => setForm((p) => ({ ...p, guests: e.target.value }))}
							options={["1", "2", "3", "4", "5", "6"].map((n) => ({ label: n, value: n }))}
							className="w-full bg-gray-800 border-gray-600 text-gray-100"
						/>
					</div>
					<div>
						<CustomSelectInput
							label="Rooms"
							labelStyle="text-green-300"
							value={form.rooms}
							onChange={(e) => setForm((p) => ({ ...p, rooms: e.target.value }))}
							options={["1", "2", "3", "4"].map((n) => ({ label: n, value: n }))}
							className="w-full bg-gray-800 border-gray-600 text-gray-100"
						/>
					</div>
				</div>

				{/* Reset Button */}
				<div className="flex gap-3">
					<button
						className="green-underline-button"
						onClick={() => {
							setForm({
								city: cityOptions.length > 0 ? cityOptions[0] : "",
								checkIn: "",
								checkOut: "",
								guests: "2",
								rooms: "1",
								minRating: "0",
								sort: "rating",
							});
							router.push("?");
						}}
					>
						Reset
					</button>
				</div>

				{invalidDates && <p className="mt-3 text-red-300 text-sm">Check-out must be after check-in.</p>}
				{!invalidDates && nights > 0 && (
					<p className="mt-3 text-gray-300 text-sm">
						Stay length: <span className="text-white font-medium">{nights}</span> night(s)
					</p>
				)}
			</section>

			{/* Filter Results */}
			<section className="mt-5">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
					<p className="text-gray-200">
						Showing <span className="text-white font-medium">{results.length}</span> hotels{" "}
						{form.city && (
							<>
								in <span className="text-white font-medium">{form.city}</span>
							</>
						)}
					</p>
				</div>

				{results.length === 0 ? (
					<div className="mt-3 rounded-xl border border-gray-700 bg-gray-900/30 p-5">
						<p className="text-gray-300">No hotels found. Try changing filters.</p>
					</div>
				) : (
					<div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{results.map((h) => (
							<HotelCard 
								key={h.id} 
								hotel={h} 
								onViewDetails={() => router.push(`/hotels/${h.id}`)} 
								onBookNowClicked={
									() => {
										setSelectedHotel(h);
										router.push(`#hotel-booking-panel`); // Scroll to booking panel
									}
								}
							/>
						))}
					</div>
				)}
			</section>

			{/* Hotel Booking */}
			{selectedHotel && (
				<HotelBookingPanel
					hotelId={selectedHotel.id}
					userId={authUserId || "Guest"}
				/>
			)}
		</div>
	);
}

export default function HotelBookingPage() {
	return (
		<Suspense fallback={<SuspenseFallback loadingText="hotels" />}>
			<HotelBookingContent />
		</Suspense>
	);
}

function HotelCard({ hotel: h, onViewDetails, onBookNowClicked }: HotelCardProps) {
	return (
		<div key={h.id} className="rounded-xl border border-gray-700 bg-gray-900/30 overflow-hidden">
			<div className="h-28 bg-teal-700" />
			<div className="p-4">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-white font-semibold">{h.name}</p>
						<p className="text-sm text-gray-400">
							{h.location?.city || "Unknown location"}
						</p>
						{h.location?.district && (
							<p className="text-xs text-gray-500">{h.location.district}</p>
						)}
					</div>
					<div className="text-sm text-yellow-400">{"★".repeat(Math.round(h.rating))}</div>
				</div>

				<div className="mt-2 flex flex-wrap gap-2">
				{(h.amenities as any[])?.slice(0, 3).map((a: any, idx: number) => (
					<span key={idx} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">
						{a}
					</span>
				))}
				{h.hotelType && (
					<span className="text-xs px-2 py-1 rounded bg-indigo-600/20 text-indigo-300">
						{h.hotelType}
					</span>
				)}
			</div>

				<div className="mt-3 flex items-center justify-between">
					<div>
						<p className="text-white font-semibold">Rating: {h.rating}</p>
						<p className="text-xs text-gray-400">
							{h.availableRooms || 0} rooms available
						</p>
					</div>

					<div className="flex gap-2">
					<button 
						disabled={(h.availableRooms || 0) === 0}
						className={`green-button text-sm px-2 py-1 ${(h.availableRooms || 0) === 0 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
						onClick={() => onBookNowClicked(h)}
					>
							Book Now!
						</button>

						<button className="green-button text-sm px-2 py-1" onClick={() => onViewDetails(h)}>
							View Details
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}