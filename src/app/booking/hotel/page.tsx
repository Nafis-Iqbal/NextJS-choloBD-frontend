/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import {
	CustomSelectInput,
	CustomDateInput,
} from "@/components/custom-elements/CustomInputElements";
import { RoomShift } from "@/types/enums";

import { AuthApi, HotelApi, LocationApi } from "@/services/api";
import { HotelBookingModule } from "@/components/modular-components/HotelBookingModule";

type HotelDisplayItem = Hotel & {
	displayPrice?: number;
};

interface HotelCardProps {
	hotel: HotelDisplayItem;
	onBookNowClicked: (hotel: HotelDisplayItem) => void;
	onViewDetails: (hotel: HotelDisplayItem) => void;
}

type HotelFilterForm = {
	city: string;
	checkIn: string;
	checkOut: string;
	guests: string;
	rooms: string;
	minRating: string;
	shift: keyof typeof RoomShift;
	sort: "rating" | "name";
};

function nightsBetween(checkIn?: string, checkOut?: string) {
	if (!checkIn || !checkOut) return 0;
	const a = new Date(checkIn);
	const b = new Date(checkOut);
	if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
	const diff = Math.round(
		(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
	);
	return Math.max(0, diff);
}

function buildFilterSearchParams(
	form: HotelFilterForm,
	extra?: { hotelId?: string | null }
): URLSearchParams {
	const params = new URLSearchParams();

	if (form.city) params.set("city", form.city);
	if (form.checkIn) params.set("checkIn", form.checkIn);
	if (form.checkOut) params.set("checkOut", form.checkOut);
	if (form.guests) params.set("guests", form.guests);
	if (form.rooms) params.set("rooms", form.rooms);
	if (form.minRating && form.minRating !== "0") {
		params.set("minRating", form.minRating);
	}
	if (form.shift && form.shift !== "ALL_DAY") {
		params.set("shift", form.shift);
	}
	if (form.sort && form.sort !== "rating") {
		params.set("sort", form.sort);
	}
	if (extra?.hotelId) {
		params.set("hotelId", extra.hotelId);
	}

	return params;
}

function searchParamsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
	const aKeys = Array.from(a.keys()).sort();
	const bKeys = Array.from(b.keys()).sort();
	if (aKeys.length !== bKeys.length) return false;
	return aKeys.every(
		(key, index) => key === bKeys[index] && a.get(key) === b.get(key)
	);
}

/** Match URL/form district names to DISTRICT options only (case-insensitive, trimmed). */
function resolveDistrictName(raw: string, districtNames: string[]): string {
	const needle = raw.trim();
	if (!needle || districtNames.length === 0) return "";

	const exact = districtNames.find((name) => name === needle);
	if (exact) return exact;

	const lower = needle.toLowerCase();
	return (
		districtNames.find((name) => name.toLowerCase() === lower) || ""
	);
}

function HotelBookingContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
	const authUserId = authResponse?.data?.userId;

	const {
		data: locationsResponse,
		isLoading: locationsLoading,
		isFetched: locationsFetched,
	} = LocationApi.useGetAllLocationsRQ();

	// Hotel filters use DISTRICT locations only — CITY-type locations are ignored.
	const districtLocations = useMemo(() => {
		return (locationsResponse?.data || [])
			.filter((loc) => loc.locationType === "DISTRICT")
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [locationsResponse]);

	const districtOptions = useMemo(
		() => districtLocations.map((loc) => loc.name),
		[districtLocations]
	);

	const locationNameToIdMap = useMemo(() => {
		const map: Record<string, string> = {};
		for (const loc of districtLocations) {
			map[loc.name] = loc.id;
		}
		return map;
	}, [districtLocations]);

	const districtSelectOptions = useMemo(
		() => [
			{ label: "Select a city", value: "" },
			...districtOptions.map((name) => ({ label: name, value: name })),
		],
		[districtOptions]
	);

	const [form, setForm] = useState<HotelFilterForm>({
		city: "",
		checkIn: "",
		checkOut: "",
		guests: "2",
		rooms: "1",
		minRating: "0",
		shift: "ALL_DAY",
		sort: "rating",
	});
	const [filtersHydrated, setFiltersHydrated] = useState(false);

	const updateForm = (patch: Partial<HotelFilterForm>) => {
		setForm((prev) => ({ ...prev, ...patch }));
	};

	const apiQueryString = useMemo(() => {
		const params = new URLSearchParams();

		if (form.city && locationNameToIdMap[form.city]) {
			params.append("locationId", locationNameToIdMap[form.city]);
		}

		if (form.minRating && form.minRating !== "0") {
			params.append("minRating", form.minRating);
		}

		if (form.shift && form.shift !== "ALL_DAY") {
			params.append("shift", form.shift);
		}

		if (form.checkIn) {
			params.append("checkInDate", form.checkIn);
		}

		if (form.checkOut) {
			params.append("checkOutDate", form.checkOut);
		}

		params.append("isActive", "true");

		return params.toString();
	}, [
		form.city,
		form.minRating,
		form.shift,
		form.checkIn,
		form.checkOut,
		locationNameToIdMap,
	]);

	const {
		data: hotelsResponse,
		isLoading,
		isFetching,
		error,
	} = HotelApi.useGetAllHotelsRQ(apiQueryString);

	const hotels: Hotel[] = useMemo(() => {
		return hotelsResponse?.data || [];
	}, [hotelsResponse]);

	const [selectedHotel, setSelectedHotel] = useState<HotelDisplayItem | null>(
		null
	);

	const hotelIdParam = searchParams.get("hotelId") || "";
	const { data: hotelDetailResponse } =
		HotelApi.useGetHotelDetailRQ(hotelIdParam);

	// Prefill filters from URL only after DISTRICT options are available.
	// Avoids rewriting URL with an empty/wrong city before locations load.
	useEffect(() => {
		if (locationsLoading || !locationsFetched) return;

		const cityFromUrl =
			searchParams.get("city") || searchParams.get("location") || "";
		const checkIn = searchParams.get("checkIn") || "";
		const checkOut = searchParams.get("checkOut") || "";
		const guests = searchParams.get("guests") || "2";
		const rooms = searchParams.get("rooms") || "1";
		const minRating = searchParams.get("minRating") || "0";
		const shift = (searchParams.get("shift") ||
			"ALL_DAY") as keyof typeof RoomShift;
		const sort = (searchParams.get("sort") || "rating") as "rating" | "name";

		const resolvedDistrict = resolveDistrictName(
			cityFromUrl,
			districtOptions
		);

		setForm({
			// Never fall back to districtOptions[0] — that silently selected Bagerhat.
			city: resolvedDistrict,
			checkIn,
			checkOut,
			guests: ["1", "2", "3", "4", "5", "6"].includes(guests)
				? guests
				: "2",
			rooms: ["1", "2", "3", "4"].includes(rooms) ? rooms : "1",
			minRating: ["0", "3", "4", "4.5"].includes(minRating)
				? minRating
				: "0",
			shift: Object.keys(RoomShift).includes(shift) ? shift : "ALL_DAY",
			sort: sort === "name" ? "name" : "rating",
		});
		setFiltersHydrated(true);
	}, [searchParams, districtOptions, locationsLoading, locationsFetched]);

	// Keep URL in sync when filters change (only after district hydration).
	useEffect(() => {
		if (!filtersHydrated) return;

		const nextParams = buildFilterSearchParams(form, {
			hotelId: hotelIdParam || null,
		});

		if (!searchParamsEqual(nextParams, searchParams)) {
			const nextQs = nextParams.toString();
			router.replace(nextQs ? `?${nextQs}` : "?", { scroll: false });
		}
	}, [form, filtersHydrated, hotelIdParam, router, searchParams]);

	useEffect(() => {
		if (!hotelIdParam) {
			return;
		}

		const matchedHotel =
			hotels.find((hotel) => hotel.id === hotelIdParam) ||
			hotelDetailResponse?.data;

		if (!matchedHotel) {
			return;
		}

		setSelectedHotel(matchedHotel);
		requestAnimationFrame(() => {
			document
				.getElementById("hotel-booking-panel")
				?.scrollIntoView({ behavior: "smooth" });
		});
	}, [hotelIdParam, hotels, hotelDetailResponse]);

	const nights = useMemo(
		() => nightsBetween(form.checkIn, form.checkOut),
		[form.checkIn, form.checkOut]
	);

	const results = useMemo(() => {
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
			if (!form.checkIn || !form.checkOut) return true;
			return form.checkOut !== form.checkIn;
		}

		if (!form.checkIn || !form.checkOut) return false;
		const a = new Date(form.checkIn);
		const b = new Date(form.checkOut);
		return b.getTime() <= a.getTime();
	}, [form.checkIn, form.checkOut, form.shift]);

	const showInitialLoading =
		locationsLoading ||
		!filtersHydrated ||
		(isLoading && !hotelsResponse);

	if (showInitialLoading) {
		return <SuspenseFallback loadingText="hotels" />;
	}

	if (error && !hotelsResponse) {
		return (
			<div className="flex flex-1 flex-col p-3 md:p-6 mt-5 font-sans">
				<div className="flex flex-col gap-2">
					<h3 className="theme-text-teal font-fredericka">
						Hotel Booking
					</h3>
					<p className="text-red-400">
						Failed to load hotels. Please try again.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col flex-1 p-3 md:p-6 mt-5 font-sans">
			<div className="flex flex-col gap-2">
				<h3 className="theme-text-teal font-fredericka">Hotel Booking</h3>
				<p className="theme-text-muted">
					Search hotels with flexible filters.
				</p>
			</div>

			<section className="flex flex-col space-y-4 md:w-[60%] mt-5 rounded-xl theme-outline bg-section p-4 md:p-5">
				<p className="text-2xl theme-text-teal">Hotel Filters</p>

				<div className="grid grid-cols-1 gap-3 mb-4">
					<CustomSelectInput
						label="City"
						labelStyle="theme-text-teal"
						value={form.city}
						onChange={(e) => updateForm({ city: e.target.value })}
						options={districtSelectOptions}
						defaultSelectText="Select a city"
						className="w-full"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<CustomSelectInput
						label="Min Rating"
						labelStyle="theme-text-teal"
						value={form.minRating}
						onChange={(e) =>
							updateForm({ minRating: e.target.value })
						}
						options={[
							{ label: "Any", value: "0" },
							{ label: "3.0+", value: "3" },
							{ label: "4.0+", value: "4" },
							{ label: "4.5+", value: "4.5" },
						]}
						className="w-full"
					/>
					<CustomSelectInput
						label="Sort"
						labelStyle="theme-text-teal"
						value={form.sort}
						onChange={(e) =>
							updateForm({
								sort: e.target.value as "rating" | "name",
							})
						}
						options={[
							{ label: "Highest rating", value: "rating" },
							{ label: "Hotel name", value: "name" },
						]}
						className="w-full"
					/>
				</div>

				<div className="grid grid-cols-1 gap-3 mb-4">
					<CustomSelectInput
						label="Room Shift"
						labelStyle="theme-text-teal"
						value={form.shift}
						onChange={(e) => {
							const shift = e.target
								.value as keyof typeof RoomShift;
							updateForm({
								shift,
								...(shift !== "ALL_DAY" && form.checkIn
									? { checkOut: form.checkIn }
									: {}),
							});
						}}
						options={[
							{ label: "All Day", value: "ALL_DAY" },
							{ label: "Morning (8AM - 3PM)", value: "MORNING" },
							{
								label: "Afternoon (3PM - 10PM)",
								value: "AFTERNOON",
							},
							{ label: "Night (10PM - 8AM)", value: "NIGHT" },
						]}
						className="w-full"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<CustomDateInput
						label="Check-in"
						labelStyle="theme-text-teal"
						value={form.checkIn}
						onChange={(e) => {
							const checkIn = e.target.value;
							updateForm({
								checkIn,
								...(form.shift !== "ALL_DAY"
									? { checkOut: checkIn }
									: {}),
							});
						}}
						className="w-full"
					/>
					<CustomDateInput
						label="Check-out"
						labelStyle="theme-text-teal"
						value={form.checkOut}
						onChange={(e) =>
							updateForm({ checkOut: e.target.value })
						}
						className="w-full"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					<CustomSelectInput
						label="Guests"
						labelStyle="theme-text-teal"
						value={form.guests}
						onChange={(e) => updateForm({ guests: e.target.value })}
						options={["1", "2", "3", "4", "5", "6"].map((n) => ({
							label: n,
							value: n,
						}))}
						className="w-full"
					/>
					<CustomSelectInput
						label="Rooms"
						labelStyle="theme-text-teal"
						value={form.rooms}
						onChange={(e) => updateForm({ rooms: e.target.value })}
						options={["1", "2", "3", "4"].map((n) => ({
							label: n,
							value: n,
						}))}
						className="w-full"
					/>
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						className="green-underline-button"
						onClick={() => {
							const resetForm: HotelFilterForm = {
								city: "",
								checkIn: "",
								checkOut: "",
								guests: "2",
								rooms: "1",
								minRating: "0",
								shift: "ALL_DAY",
								sort: "rating",
							};
							setForm(resetForm);
							router.replace("?", { scroll: false });
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
						Stay length:{" "}
						<span className="theme-text font-medium">{nights}</span>{" "}
						night(s)
					</p>
				)}
			</section>

			<section className="mt-5">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
					<p className="theme-text-muted">
						Showing{" "}
						<span className="theme-text font-medium">
							{results.length}
						</span>{" "}
						hotels{" "}
						{form.city && (
							<>
								in{" "}
								<span className="theme-text font-medium">
									{form.city}
								</span>
							</>
						)}
						{isFetching && (
							<span className="theme-text-subtle ml-2">
								Updating…
							</span>
						)}
					</p>
				</div>

				{results.length === 0 ? (
					<div className="mt-3 rounded-xl theme-outline bg-sub-section p-5">
						<p className="theme-text-subtle">
							No hotels found. Try changing filters.
						</p>
					</div>
				) : (
					<div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{results.map((h) => (
							<HotelCard
								key={h.id}
								hotel={h}
								onViewDetails={() =>
									router.push(`/hotels/${h.id}`)
								}
								onBookNowClicked={() => {
									setSelectedHotel(h);
									const params = buildFilterSearchParams(
										form,
										{ hotelId: h.id }
									);
									router.push(`?${params.toString()}`, {
										scroll: false,
									});
									requestAnimationFrame(() => {
										document
											.getElementById(
												"hotel-booking-panel"
											)
											?.scrollIntoView({
												behavior: "smooth",
											});
									});
								}}
							/>
						))}
					</div>
				)}
			</section>

			{selectedHotel && (
				<HotelBookingModule
					hotelName={selectedHotel.name}
					hotelId={selectedHotel.id}
					userId={authUserId || "Guest"}
					initialCheckIn={form.checkIn}
					initialCheckOut={form.checkOut}
					initialGuests={parseInt(form.guests, 10)}
					initialRooms={parseInt(form.rooms, 10)}
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

function HotelCard({
	hotel: h,
	onViewDetails,
	onBookNowClicked,
}: HotelCardProps) {
	return (
		<div className="rounded-xl theme-outline bg-sub-section overflow-hidden">
			<div className="h-28 bg-teal-700" />
			<div className="p-4">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="theme-text font-semibold">{h.name}</p>
						<p className="text-sm theme-text-subtle">
							{h.location?.city || "Unknown location"}
						</p>
						{h.location?.district && (
							<p className="text-xs theme-text-subtle">
								{h.location.district}
							</p>
						)}
					</div>
					<div className="text-sm theme-star">
						{"★".repeat(Math.round(h.rating))}
					</div>
				</div>

				<div className="mt-2 flex flex-wrap gap-2">
					{(h.amenities as any[])?.slice(0, 3).map((a: any, idx: number) => (
						<span
							key={idx}
							className="text-xs px-2 py-1 rounded bg-sub-section theme-text-subtle"
						>
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
						<p className="theme-text font-semibold">
							Rating: {h.rating}
						</p>
						<p className="text-xs theme-text-subtle">
							Rooms available
						</p>
					</div>

					<div className="flex gap-2">
						<button
							type="button"
							className="green-button text-sm px-2 py-1"
							onClick={() => onBookNowClicked(h)}
						>
							Book Now!
						</button>

						<button
							type="button"
							className="green-button text-sm px-2 py-1"
							onClick={() => onViewDetails(h)}
						>
							View Details
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
