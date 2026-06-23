/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { CustomSelectInput, CustomDateInput } from "@/components/custom-elements/CustomInputElements";
import { RoomShift } from "@/types/enums";

import { AuthApi, HotelApi, LocationApi } from "@/services/api";
import { HotelBookingPanel } from "@/components/modular-components/HotelBookingModule";

// Custom variant of Hotel interface for display purposes
type HotelDisplayItem = Hotel & {
	displayPrice?: number;
};

interface HotelCardProps {
	hotel: HotelDisplayItem;
	onBookNowClicked: (hotel: HotelDisplayItem) => void;
	onViewDetails: (hotel: HotelDisplayItem) => void;
}

function nightsBetween(checkIn?: string, checkOut?: string) {
	if (!checkIn || !checkOut) return 0;
	const a = new Date(checkIn);
	const b = new Date(checkOut);
	if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
	const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
	return Math.max(0, diff);
}

function HotelBookingContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const { data: authResponse, isLoading: isAuthLoading } = AuthApi.useGetUserAuthenticationRQ(true);
	const isAuthenticated = authResponse?.data?.isAuthenticated;
	const authUserId = authResponse?.data?.userId;

	// Fetch locations to construct city options
	const { data: locationsResponse, isLoading: locationsLoading, error: locationsError } = LocationApi.useGetAllLocationsRQ();

	// Extract district type locations as city options with ID mapping
	const cityOptions = useMemo(() => {
		const districts = (locationsResponse?.data || [])
			.filter((loc) => loc.locationType === "CITY")
			.map((loc) => loc.name)
			.sort();
		return districts;
	}, [locationsResponse]);

	// Map location names to IDs for API queries
	const locationNameToIdMap = useMemo(() => {
		const map: Record<string, string> = {};
		(locationsResponse?.data || [])
			.filter((loc) => loc.locationType === "CITY")
			.forEach((loc) => {
				map[loc.name] = loc.id;
			});
		return map;
	}, [locationsResponse]);

	const [form, setForm] = useState({
		city: "",
		checkIn: "",
		checkOut: "",
		guests: "2",
		rooms: "1",
		minRating: "0",
		shift: "ALL_DAY" as keyof typeof RoomShift,
		sort: "rating" as "rating" | "name",
	});

	// Build API query string based on form filters
	const apiQueryString = useMemo(() => {
		const params = new URLSearchParams();
		console.log(form);
		// Add locationId if city is selected
		if (form.city && locationNameToIdMap[form.city]) {
			params.append("locationId", locationNameToIdMap[form.city]);
		}

		// Add rating filters
		if (form.minRating && form.minRating !== "0") {
			params.append("minRating", form.minRating);
		}

		// Add shift filter
		if (form.shift && form.shift !== "ALL_DAY") {
			params.append("shift", form.shift);
		}

		// Add check-in date
		if (form.checkIn) {
			params.append("checkInDate", form.checkIn);
		}

		// Add check-out date
		if (form.checkOut) {
			params.append("checkOutDate", form.checkOut);
		}

		// Add isActive filter (default to true for user-facing queries)
		params.append("isActive", "true");

		return params.toString();
	}, [form.city, form.minRating, form.shift, form.checkIn, form.checkOut, locationNameToIdMap]);

	// Fetch real hotel data from API
	const { data: hotelsResponse, isLoading, error } = HotelApi.useGetAllHotelsRQ(apiQueryString);
	const hotels: Hotel[] = useMemo(() => {
		return hotelsResponse?.data || [];
	}, [hotelsResponse]);

	const [selectedHotel, setSelectedHotel] = useState<HotelDisplayItem | null>(null);

	// Prefill from URL
	useEffect(() => {
		const city = searchParams.get("city") || "";
		const checkIn = searchParams.get("checkIn") || "";
		const checkOut = searchParams.get("checkOut") || "";
		const guests = searchParams.get("guests") || "2";
		const rooms = searchParams.get("rooms") || "1";
		const minRating = searchParams.get("minRating") || "0";
		const shift = (searchParams.get("shift") || "ALL_DAY") as keyof typeof RoomShift;
		const sort = (searchParams.get("sort") || "rating") as any;

		setForm((prev) => ({
			...prev,
			city: cityOptions.includes(city) ? city : prev.city || (cityOptions.length > 0 ? cityOptions[0] : ""),
			checkIn,
			checkOut,
			guests,
			rooms,
			minRating: ["0", "3", "4", "4.5"].includes(minRating) ? minRating : "0",
			shift: Object.keys(RoomShift).includes(shift) ? shift : "ALL_DAY",
			sort: sort === "name" ? "name" : "rating",
		}));
	}, [searchParams, cityOptions]);

	const nights = useMemo(() => nightsBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);

	const results = useMemo(() => {
		// API has already filtered by city, rating, shift, and dates
		// Only need to do client-side sorting
		const sorted = [...hotels].sort((a, b) => {
			if (form.sort === "name") {
				return a.name.localeCompare(b.name);
			}
			return b.rating - a.rating;
		});

		return sorted;
	}, [hotels, form.sort]);

	const invalidDates = useMemo(() => {
		if (form.shift !== "ALL_DAY") {
			// For non-ALL_DAY shifts, checkout must equal checkin
			if (!form.checkIn || !form.checkOut) return true;
			return form.checkOut !== form.checkIn;
		} else {
			// For ALL_DAY, checkout must be after checkin
			if (!form.checkIn || !form.checkOut) return false;
			const a = new Date(form.checkIn);
			const b = new Date(form.checkOut);
			return b.getTime() <= a.getTime();
		}
	}, [form.checkIn, form.checkOut, form.shift]);

	if (isLoading) {
		return (
			<div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
				<div className="flex flex-col gap-2">
					<h3 className="theme-text-teal font-fredericka">Hotel Booking</h3>
					<p className="theme-text-muted">Loading hotel data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
				<div className="flex flex-col gap-2">
					<h3 className="theme-text-teal font-fredericka">Hotel Booking</h3>
					<p className="text-red-400">Failed to load hotels. Please try again.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col p-3 md:p-6 mt-5 font-sans min-h-screen">
			<div className="flex flex-col gap-2">
				<h3 className="theme-text-teal font-fredericka">Hotel Booking</h3>
				<p className="theme-text-muted">Search hotels with flexible filters.</p>
			</div>

			{/* Filter Options */}
			<section className="flex flex-col space-y-4 md:w-[60%] mt-5 rounded-xl theme-outline bg-section p-4 md:p-5">
				<p className="text-2xl theme-text-teal">Hotel Filters</p>

				{/* Row 1: City */}
				<div className="grid grid-cols-1 gap-3 mb-4">
					<div>
						<CustomSelectInput
							label="City"
							labelStyle="theme-text-teal"
							value={form.city}
							onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
							options={cityOptions.map((c) => ({ label: c, value: c }))}
							defaultSelectText="Select a city"
							className="w-full"
						/>
					</div>
				</div>

				{/* Row 2: Min Rating - Sort */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<div>
						<CustomSelectInput
							label="Min Rating"
							labelStyle="theme-text-teal"
							value={form.minRating}
							onChange={(e) => setForm((p) => ({ ...p, minRating: e.target.value }))}
							options={[
								{ label: "Any", value: "0" },
								{ label: "3.0+", value: "3" },
								{ label: "4.0+", value: "4" },
								{ label: "4.5+", value: "4.5" },
							]}
							className="w-full"
						/>
					</div>
					<div>
						<CustomSelectInput
							label="Sort"
							labelStyle="theme-text-teal"
							value={form.sort}
							onChange={(e) => setForm((p) => ({ ...p, sort: e.target.value as any }))}
							options={[
								{ label: "Highest rating", value: "rating" },
								{ label: "Hotel name", value: "name" },
							]}
							className="w-full"
						/>
					</div>
				</div>

				{/* Row 3: Shift */}
				<div className="grid grid-cols-1 gap-3 mb-4">
					<div>
						<CustomSelectInput
							label="Room Shift"
							labelStyle="theme-text-teal"
							value={form.shift}
							onChange={(e) => setForm((p) => ({ ...p, shift: e.target.value as keyof typeof RoomShift }))}
							options={[
								{ label: "All Day", value: "ALL_DAY" },
								{ label: "Morning (8AM - 3PM)", value: "MORNING" },
								{ label: "Afternoon (3PM - 10PM)", value: "AFTERNOON" },
								{ label: "Night (10PM - 8AM)", value: "NIGHT" },
							]}
							className="w-full"
						/>
					</div>
				</div>

				{/* Row 4: Check-in - Check-out */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<div>
						<CustomDateInput
							label="Check-in"
							labelStyle="theme-text-teal"
							value={form.checkIn}
							onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))}
							className="w-full"
						/>
					</div>
					<div>
						<CustomDateInput
							label="Check-out"
							labelStyle="theme-text-teal"
							value={form.checkOut}
							onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))}
							className="w-full"
						/>
					</div>
				</div>

				{/* Row 5: Guests - Rooms */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<div>
						<CustomSelectInput
							label="Guests"
							labelStyle="theme-text-teal"
							value={form.guests}
							onChange={(e) => setForm((p) => ({ ...p, guests: e.target.value }))}
							options={["1", "2", "3", "4", "5", "6"].map((n) => ({ label: n, value: n }))}
							className="w-full"
						/>
					</div>
					<div>
						<CustomSelectInput
							label="Rooms"
							labelStyle="theme-text-teal"
							value={form.rooms}
							onChange={(e) => setForm((p) => ({ ...p, rooms: e.target.value }))}
							options={["1", "2", "3", "4"].map((n) => ({ label: n, value: n }))}
							className="w-full"
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
								shift: "ALL_DAY",
								sort: "rating",
							});
							router.push("?");
						}}
					>
						Reset
					</button>
				</div>

				{invalidDates && (
					<p className="mt-3 text-red-400 text-sm">
						{form.shift !== "ALL_DAY" 
							? "For this shift, check-out must be the same as check-in date." 
							: "Check-out must be after check-in."}
					</p>
				)}
				{!invalidDates && nights > 0 && (
					<p className="mt-3 theme-text-muted text-sm">
						Stay length: <span className="theme-text font-medium">{nights}</span> night(s)
					</p>
				)}
			</section>

			{/* Filter Results */}
			<section className="mt-5">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
					<p className="theme-text-muted">
						Showing <span className="theme-text font-medium">{results.length}</span> hotels{" "}
						{form.city && (
							<>
								in <span className="theme-text font-medium">{form.city}</span>
							</>
						)}
					</p>
				</div>

				{results.length === 0 ? (
					<div className="mt-3 rounded-xl theme-outline bg-sub-section p-5">
						<p className="theme-text-subtle">No hotels found. Try changing filters.</p>
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
					initialCheckIn={form.checkIn}
					initialCheckOut={form.checkOut}
					initialGuests={parseInt(form.guests)}
					initialRooms={parseInt(form.rooms)}
					initialShift={form.shift}
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
		<div key={h.id} className="rounded-xl theme-outline bg-sub-section overflow-hidden">
			<div className="h-28 bg-teal-700" />
			<div className="p-4">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="theme-text font-semibold">{h.name}</p>
						<p className="text-sm theme-text-subtle">
							{h.location?.city || "Unknown location"}
						</p>
						{h.location?.district && (
							<p className="text-xs theme-text-subtle">{h.location.district}</p>
						)}
					</div>
					<div className="text-sm theme-star">{"★".repeat(Math.round(h.rating))}</div>
				</div>

				<div className="mt-2 flex flex-wrap gap-2">
				{(h.amenities as any[])?.slice(0, 3).map((a: any, idx: number) => (
					<span key={idx} className="text-xs px-2 py-1 rounded bg-sub-section theme-text-subtle">
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
						<p className="theme-text font-semibold">Rating: {h.rating}</p>
						<p className="text-xs theme-text-subtle">
							Rooms are  available
						</p>
					</div>

					<div className="flex gap-2">
					<button 
						className="green-button text-sm px-2 py-1"
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