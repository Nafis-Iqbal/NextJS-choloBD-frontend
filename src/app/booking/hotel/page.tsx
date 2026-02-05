/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

type HotelItem = {
	id: string;
	name: string;
	city: string;
	area: string;
	rating: number;
	pricePerNight: number;
	tags: string[];
	availableRooms: number;
	refundable: boolean;
};

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

	const cityOptions = useMemo(() => {
		return ["Dhaka", "Chattogram", "Cox’s Bazar", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur"];
	}, []);

	const fakeHotels: HotelItem[] = useMemo(
		() => [
			{
				id: "h-001",
				name: "Sky Nest Hotel",
				city: "Dhaka",
				area: "Gulshan",
				rating: 4.4,
				pricePerNight: 5200,
				tags: ["Business", "Breakfast", "City View"],
				availableRooms: 12,
				refundable: true,
			},
			{
				id: "h-002",
				name: "River Pearl",
				city: "Dhaka",
				area: "Dhanmondi",
				rating: 4.1,
				pricePerNight: 3800,
				tags: ["Family", "Near Food"],
				availableRooms: 6,
				refundable: false,
			},
			{
				id: "h-003",
				name: "Blue Bay Resort",
				city: "Cox’s Bazar",
				area: "Kolatoli",
				rating: 4.6,
				pricePerNight: 6900,
				tags: ["Beach", "Pool", "Breakfast"],
				availableRooms: 18,
				refundable: true,
			},
			{
				id: "h-004",
				name: "Sea Breeze Inn",
				city: "Cox’s Bazar",
				area: "Sugandha",
				rating: 4.0,
				pricePerNight: 4200,
				tags: ["Beach", "Budget"],
				availableRooms: 9,
				refundable: false,
			},
			{
				id: "h-005",
				name: "Tea Leaf Stay",
				city: "Sylhet",
				area: "Zindabazar",
				rating: 4.2,
				pricePerNight: 3100,
				tags: ["City", "Budget"],
				availableRooms: 10,
				refundable: true,
			},
			{
				id: "h-006",
				name: "Forest Den Lodge",
				city: "Khulna",
				area: "Sonadanga",
				rating: 3.9,
				pricePerNight: 2800,
				tags: ["Quiet", "Local"],
				availableRooms: 7,
				refundable: false,
			},
			{
				id: "h-007",
				name: "Heritage Courtyard",
				city: "Rajshahi",
				area: "Boalia",
				rating: 4.3,
				pricePerNight: 3600,
				tags: ["Heritage", "Breakfast"],
				availableRooms: 11,
				refundable: true,
			},
			{
				id: "h-008",
				name: "Portside Comfort",
				city: "Chattogram",
				area: "Agrabad",
				rating: 4.2,
				pricePerNight: 4500,
				tags: ["Business", "City"],
				availableRooms: 13,
				refundable: true,
			},
		],
		[]
	);

	const [form, setForm] = useState({
		city: "Cox’s Bazar",
		checkIn: "",
		checkOut: "",
		guests: "2",
		rooms: "1",
		minPrice: "",
		maxPrice: "",
		minRating: "0",
		refundableOnly: false,
		sort: "price" as "price" | "rating",
	});

	const [selectedHotel, setSelectedHotel] = useState<HotelItem | null>(null);

	// Prefill from URL
	useEffect(() => {
		const city = searchParams.get("city") || "Cox’s Bazar";
		const checkIn = searchParams.get("checkIn") || "";
		const checkOut = searchParams.get("checkOut") || "";
		const guests = searchParams.get("guests") || "2";
		const rooms = searchParams.get("rooms") || "1";
		const minPrice = searchParams.get("minPrice") || "";
		const maxPrice = searchParams.get("maxPrice") || "";
		const minRating = searchParams.get("minRating") || "0";
		const refundableOnly = (searchParams.get("refundable") || "0") === "1";
		const sort = (searchParams.get("sort") || "price") as any;

		setForm((prev) => ({
			...prev,
			city: cityOptions.includes(city) ? city : prev.city,
			checkIn,
			checkOut,
			guests,
			rooms,
			minPrice,
			maxPrice,
			minRating: ["0", "3", "4", "4.5"].includes(minRating) ? minRating : "0",
			refundableOnly,
			sort: sort === "rating" ? "rating" : "price",
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const nights = useMemo(() => nightsBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);

	const results = useMemo(() => {
		const minP = form.minPrice ? Number(form.minPrice) : undefined;
		const maxP = form.maxPrice ? Number(form.maxPrice) : undefined;
		const minR = Number(form.minRating || "0");

		const filtered = fakeHotels
			.filter((h) => (form.city ? h.city === form.city : true))
			.filter((h) => (typeof minP === "number" && !Number.isNaN(minP) ? h.pricePerNight >= minP : true))
			.filter((h) => (typeof maxP === "number" && !Number.isNaN(maxP) ? h.pricePerNight <= maxP : true))
			.filter((h) => (minR > 0 ? h.rating >= minR : true))
			.filter((h) => (form.refundableOnly ? h.refundable === true : true));

		filtered.sort((a, b) => {
			if (form.sort === "rating") return b.rating - a.rating;
			return a.pricePerNight - b.pricePerNight;
		});

		return filtered;
	}, [fakeHotels, form.city, form.maxPrice, form.minPrice, form.minRating, form.refundableOnly, form.sort]);

	const pushQuery = () => {
		const qs = new URLSearchParams();
		qs.set("city", form.city);
		if (form.checkIn) qs.set("checkIn", form.checkIn);
		if (form.checkOut) qs.set("checkOut", form.checkOut);
		qs.set("guests", form.guests);
		qs.set("rooms", form.rooms);
		if (form.minPrice) qs.set("minPrice", form.minPrice);
		if (form.maxPrice) qs.set("maxPrice", form.maxPrice);
		if (form.minRating !== "0") qs.set("minRating", form.minRating);
		if (form.refundableOnly) qs.set("refundable", "1");
		qs.set("sort", form.sort);

		router.push(`?${qs.toString()}`);
	};

	const invalidDates = useMemo(() => {
		if (!form.checkIn || !form.checkOut) return false;
		const a = new Date(form.checkIn);
		const b = new Date(form.checkOut);
		return b.getTime() <= a.getTime();
	}, [form.checkIn, form.checkOut]);

	return (
		<div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
			<div className="flex flex-col gap-2">
				<h3 className="text-green-500 font-fredericka">Hotel Booking</h3>
				<p className="text-green-200">Search stays with flexible prefilled URLs (demo data).</p>
			</div>

			<section className="mt-5 rounded-xl border border-green-900/60 bg-gray-900/40 p-4 md:p-5">
				<div className="grid grid-cols-1 md:grid-cols-6 gap-3">
					<div className="md:col-span-2">
						<label className="text-sm text-gray-200">City</label>
						<select
							value={form.city}
							onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						>
							{cityOptions.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>

					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Check-in</label>
						<input
							type="date"
							value={form.checkIn}
							onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						/>
					</div>

					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Check-out</label>
						<input
							type="date"
							value={form.checkOut}
							onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						/>
					</div>

					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Guests</label>
						<select
							value={form.guests}
							onChange={(e) => setForm((p) => ({ ...p, guests: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						>
							{["1", "2", "3", "4", "5", "6"].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</div>

					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Rooms</label>
						<select
							value={form.rooms}
							onChange={(e) => setForm((p) => ({ ...p, rooms: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						>
							{["1", "2", "3", "4"].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Min ৳</label>
						<input
							value={form.minPrice}
							onChange={(e) => setForm((p) => ({ ...p, minPrice: e.target.value.replace(/[^0-9]/g, "") }))}
							placeholder="0"
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						/>
					</div>
					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Max ৳</label>
						<input
							value={form.maxPrice}
							onChange={(e) => setForm((p) => ({ ...p, maxPrice: e.target.value.replace(/[^0-9]/g, "") }))}
							placeholder="99999"
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						/>
					</div>
					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Min Rating</label>
						<select
							value={form.minRating}
							onChange={(e) => setForm((p) => ({ ...p, minRating: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						>
							<option value="0">Any</option>
							<option value="3">3.0+</option>
							<option value="4">4.0+</option>
							<option value="4.5">4.5+</option>
						</select>
					</div>
					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Sort</label>
						<select
							value={form.sort}
							onChange={(e) => setForm((p) => ({ ...p, sort: e.target.value as any }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						>
							<option value="price">Lowest price</option>
							<option value="rating">Highest rating</option>
						</select>
					</div>
					<div className="md:col-span-2 flex items-end justify-between gap-3">
						<label className="flex items-center gap-2 text-sm text-gray-200">
							<input
								type="checkbox"
								checked={form.refundableOnly}
								onChange={(e) => setForm((p) => ({ ...p, refundableOnly: e.target.checked }))}
							/>
							Refundable only
						</label>

						<div className="flex gap-2">
							<button className="green-button" onClick={pushQuery}>
								Search
							</button>
							<button
								className="green-underline-button"
								onClick={() => {
									setForm({
										city: "Cox’s Bazar",
										checkIn: "",
										checkOut: "",
										guests: "2",
										rooms: "1",
										minPrice: "",
										maxPrice: "",
										minRating: "0",
										refundableOnly: false,
										sort: "price",
									});
									router.push("?");
								}}
							>
								Reset
							</button>
						</div>
					</div>
				</div>

				{invalidDates && <p className="mt-3 text-red-300 text-sm">Check-out must be after check-in.</p>}
				{!invalidDates && nights > 0 && (
					<p className="mt-3 text-gray-300 text-sm">
						Stay length: <span className="text-white font-medium">{nights}</span> night(s)
					</p>
				)}
			</section>

			<section className="mt-5">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
					<p className="text-gray-200">
						Showing <span className="text-white font-medium">{results.length}</span> hotels in{" "}
						<span className="text-white font-medium">{form.city}</span>
					</p>
					<p className="text-xs text-gray-400">Tip: open with URL like `?city=Cox%E2%80%99s%20Bazar&guests=2&rooms=1`</p>
				</div>

				{results.length === 0 ? (
					<div className="mt-3 rounded-xl border border-gray-700 bg-gray-900/30 p-5">
						<p className="text-gray-300">No hotels found. Try changing filters.</p>
					</div>
				) : (
					<div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{results.map((h) => (
							<div key={h.id} className="rounded-xl border border-gray-700 bg-gray-900/30 overflow-hidden">
								<div className="h-28 bg-teal-700" />
								<div className="p-4">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-white font-semibold">{h.name}</p>
											<p className="text-sm text-gray-400">
												{h.area}, {h.city}
											</p>
										</div>
										<div className="text-sm text-yellow-400">{"★".repeat(Math.round(h.rating))}</div>
									</div>

									<div className="mt-2 flex flex-wrap gap-2">
										{h.tags.slice(0, 3).map((t) => (
											<span key={t} className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">
												{t}
											</span>
										))}
										<span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">
											{h.refundable ? "Refundable" : "Non-refundable"}
										</span>
									</div>

									<div className="mt-3 flex items-center justify-between">
										<div>
											<p className="text-white font-semibold">৳ {h.pricePerNight.toLocaleString()}</p>
											<p className="text-xs text-gray-400">per night • rooms left: {h.availableRooms}</p>
										</div>

										<div className="flex gap-2">
											<button className="green-button text-sm" onClick={() => setSelectedHotel(h)}>
												View Details
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{selectedHotel && (
				<section className="mt-8 rounded-xl border border-green-900/60 bg-gray-900/40 p-4 md:p-6">
					<div className="flex items-start justify-between gap-4 mb-5">
						<h2 className="text-2xl md:text-3xl font-semibold text-white">Hotel Details</h2>
						<button className="green-underline-button" onClick={() => setSelectedHotel(null)}>
							Back to List
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="md:col-span-2 rounded-xl border border-gray-700 bg-gray-800/40 overflow-hidden">
							<div className="h-40 bg-teal-700" />
							<div className="p-5">
								<h3 className="text-2xl font-semibold text-white">{selectedHotel.name}</h3>
								<p className="text-gray-300 mt-1">
									{selectedHotel.area}, {selectedHotel.city}
								</p>
								<div className="flex items-center gap-3 mt-3">
									<div className="text-lg text-yellow-400">{"★".repeat(Math.round(selectedHotel.rating))} ({selectedHotel.rating})</div>
									<span className="text-sm text-gray-400">{selectedHotel.availableRooms} rooms available</span>
								</div>

								<div className="mt-4 flex flex-wrap gap-2">
									{selectedHotel.tags.map((t) => (
										<span key={t} className="text-sm px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-600/30">
											{t}
										</span>
									))}
									<span className="text-sm px-3 py-1 rounded-lg bg-gray-700 text-gray-200">
										{selectedHotel.refundable ? "✓ Refundable" : "Non-refundable"}
									</span>
								</div>

								<div className="mt-5 p-4 rounded-lg bg-gray-900 border border-gray-700">
									<p className="text-gray-300 text-sm mb-2">
										<span className="font-medium">Dates:</span> {form.checkIn || "Not selected"} → {form.checkOut || "Not selected"}
									</p>
									<p className="text-gray-300 text-sm">
										<span className="font-medium">Guests:</span> {form.guests} • <span className="font-medium">Rooms:</span> {form.rooms}
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-green-900/60 bg-gray-900/40 p-5 h-fit">
							<h4 className="text-lg font-semibold text-white mb-4">Booking Summary</h4>

							<div className="space-y-3 pb-4 border-b border-gray-700">
								<div className="flex items-center justify-between">
									<p className="text-gray-300">Price per night:</p>
									<p className="text-white font-medium">৳ {selectedHotel.pricePerNight.toLocaleString()}</p>
								</div>
								{nights > 0 && (
									<>
										<div className="flex items-center justify-between">
											<p className="text-gray-300">Number of nights:</p>
											<p className="text-white font-medium">{nights}</p>
										</div>
										<div className="flex items-center justify-between pt-2 border-t border-gray-700">
											<p className="text-white font-semibold">Estimated Total:</p>
											<p className="text-white font-bold text-lg">৳ {(selectedHotel.pricePerNight * nights).toLocaleString()}</p>
										</div>
									</>
								)}
								{nights === 0 && (
									<p className="text-sm text-gray-400 italic">Please select check-in and check-out dates</p>
								)}
							</div>

							<button
								className="w-full green-button mt-4"
								onClick={() => {
									alert("Reservation confirmed (demo). Next step: payment & guest details.");
									setSelectedHotel(null);
								}}
							>
								Reserve Now
							</button>

							<p className="text-xs text-gray-500 mt-3">Demo only — connect to real booking system</p>
						</div>
					</div>
				</section>
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

