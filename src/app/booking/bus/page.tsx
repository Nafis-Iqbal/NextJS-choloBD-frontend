"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

type BusTrip = {
	id: string;
	operator: string;
	from: string;
	to: string;
	departTime: string;
	arriveTime: string;
	duration: string;
	coachType: "Economy" | "Business" | "Sleeper";
	ac: boolean;
	price: number;
	seatsLeft: number;
};

function formatDateShort(value?: string) {
	if (!value) return "";
	// keep it simple and stable (no locale surprises)
	const [y, m, d] = value.split("-");
	if (!y || !m || !d) return value;
	return `${d}-${m}-${y}`;
}

function Modal({
	title,
	open,
	onClose,
	children,
}: {
	title: string;
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape" && open) onClose();
		};
		if (open) document.addEventListener("keydown", handleEsc);
		return () => document.removeEventListener("keydown", handleEsc);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60" />
			<div className="relative w-full max-w-xl rounded-xl border border-gray-700 bg-gray-900 p-4 md:p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex items-start justify-between gap-4 sticky top-0 bg-gray-900">
					<h3 className="text-xl md:text-2xl font-semibold text-white">{title}</h3>
					<button className="green-underline-button" onClick={onClose}>
						Close
					</button>
				</div>
				<div className="mt-4 font-sans">{children}</div>
			</div>
		</div>
	);
}

function BusBookingContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const cityOptions = useMemo(() => {
		return ["Dhaka", "Chattogram", "Cox’s Bazar", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur"];
	}, []);

	const fakeTrips: BusTrip[] = useMemo(
		() => [
			{
				id: "bus-101",
				operator: "GreenLine",
				from: "Dhaka",
				to: "Cox’s Bazar",
				departTime: "07:30",
				arriveTime: "16:10",
				duration: "8h 40m",
				coachType: "Business",
				ac: true,
				price: 1600,
				seatsLeft: 18,
			},
			{
				id: "bus-102",
				operator: "Hanif",
				from: "Dhaka",
				to: "Chattogram",
				departTime: "09:00",
				arriveTime: "15:30",
				duration: "6h 30m",
				coachType: "Economy",
				ac: false,
				price: 900,
				seatsLeft: 35,
			},
			{
				id: "bus-103",
				operator: "Shohagh",
				from: "Dhaka",
				to: "Sylhet",
				departTime: "22:00",
				arriveTime: "06:00",
				duration: "8h 00m",
				coachType: "Sleeper",
				ac: true,
				price: 1700,
				seatsLeft: 9,
			},
			{
				id: "bus-104",
				operator: "Ena",
				from: "Chattogram",
				to: "Cox’s Bazar",
				departTime: "13:15",
				arriveTime: "16:45",
				duration: "3h 30m",
				coachType: "Economy",
				ac: true,
				price: 650,
				seatsLeft: 22,
			},
			{
				id: "bus-105",
				operator: "Sakura",
				from: "Khulna",
				to: "Dhaka",
				departTime: "21:00",
				arriveTime: "05:30",
				duration: "8h 30m",
				coachType: "Business",
				ac: true,
				price: 1400,
				seatsLeft: 14,
			},
			{
				id: "bus-106",
				operator: "TR Travels",
				from: "Rajshahi",
				to: "Dhaka",
				departTime: "06:45",
				arriveTime: "12:15",
				duration: "5h 30m",
				coachType: "Economy",
				ac: false,
				price: 750,
				seatsLeft: 41,
			},
		],
		[]
	);

	const [form, setForm] = useState({
		from: "Dhaka",
		to: "Chattogram",
		date: "",
		passengers: "1",
		coachType: "Any" as "Any" | BusTrip["coachType"],
		acOnly: false,
	});

	const [selectedTrip, setSelectedTrip] = useState<BusTrip | null>(null);

	// Prefill from URL
	useEffect(() => {
		const from = searchParams.get("from") || "Dhaka";
		const to = searchParams.get("to") || "Chattogram";
		const date = searchParams.get("date") || "";
		const passengers = searchParams.get("passengers") || "1";
		const coachParam = searchParams.get("coach") || "Any";
		const acOnly = (searchParams.get("ac") || "0") === "1";

		const isValidCoach = (val: string): val is "Any" | BusTrip["coachType"] => {
			return ["Any", "Economy", "Business", "Sleeper"].includes(val);
		};

		setForm((prev) => ({
			...prev,
			from: cityOptions.includes(from) ? from : prev.from,
			to: cityOptions.includes(to) ? to : prev.to,
			date,
			passengers,
			coachType: isValidCoach(coachParam) ? coachParam : "Any",
			acOnly,
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	const results = useMemo(() => {
		return fakeTrips
			.filter((t) => (form.from ? t.from === form.from : true))
			.filter((t) => (form.to ? t.to === form.to : true))
			.filter((t) => (form.coachType === "Any" ? true : t.coachType === form.coachType))
			.filter((t) => (form.acOnly ? t.ac === true : true))
			.sort((a, b) => a.price - b.price);
	}, [fakeTrips, form.acOnly, form.coachType, form.from, form.to]);

	const pushQuery = () => {
		const qs = new URLSearchParams();
		qs.set("from", form.from);
		qs.set("to", form.to);
		if (form.date) qs.set("date", form.date);
		qs.set("passengers", form.passengers);
		if (form.coachType !== "Any") qs.set("coach", form.coachType);
		if (form.acOnly) qs.set("ac", "1");

		router.push(`?${qs.toString()}`);
	};

	return (
		<div className="flex flex-col flex-1 p-3 md:p-6 mt-5 font-sans">
			<div className="flex flex-col gap-2">
				<h3 className="text-green-500 font-fredericka">Bus Tickets</h3>
				<p className="text-green-200">Search routes, compare operators, and book seats (demo data).</p>
			</div>

			<section className="mt-5 rounded-xl border border-green-900/60 bg-gray-900/40 p-4 md:p-5">
				<div className="grid grid-cols-1 md:grid-cols-6 gap-3">
					<div className="md:col-span-2">
						<label className="text-sm text-gray-200">From</label>
						<select
							value={form.from}
							onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						>
							{cityOptions.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>

					<div className="md:col-span-2">
						<label className="text-sm text-gray-200">To</label>
						<select
							value={form.to}
							onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
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
						<label className="text-sm text-gray-200">Date</label>
						<input
							type="date"
							value={form.date}
							onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						/>
					</div>

					<div className="md:col-span-1">
						<label className="text-sm text-gray-200">Passengers</label>
						<select
							value={form.passengers}
							onChange={(e) => setForm((p) => ({ ...p, passengers: e.target.value }))}
							className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
						>
							{["1", "2", "3", "4", "5", "6"].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
					<div className="flex flex-col md:flex-row gap-3 md:items-center">
						<div>
							<label className="text-sm text-gray-200">Coach Type</label>
							<select
								value={form.coachType}
								onChange={(e) => {
									const val = e.target.value;
									const isValidCoach = (v: string): v is "Any" | BusTrip["coachType"] =>
										["Any", "Economy", "Business", "Sleeper"].includes(v);
									setForm((p) => ({
										...p,
										coachType: isValidCoach(val) ? val : "Any",
									}));
								}}
								className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
							>
								<option value="Any">Any</option>
								<option value="Economy">Economy</option>
								<option value="Business">Business</option>
								<option value="Sleeper">Sleeper</option>
							</select>
						</div>

						<label className="mt-2 md:mt-6 flex items-center gap-2 text-sm text-gray-200">
							<input
								type="checkbox"
								checked={form.acOnly}
								onChange={(e) => setForm((p) => ({ ...p, acOnly: e.target.checked }))}
							/>
							AC only
						</label>
					</div>

					<div className="flex gap-2">
						<button
							className="green-button"
							onClick={() => {
								if (form.from === form.to) return;
								pushQuery();
							}}
						>
							Search
						</button>
						<button
							className="green-underline-button"
							onClick={() => {
								setForm({ from: "Dhaka", to: "Chattogram", date: "", passengers: "1", coachType: "Any", acOnly: false });
								router.push("?");
							}}
						>
							Reset
						</button>
					</div>
				</div>

				{form.from === form.to && <p className="mt-3 text-red-300 text-sm">From and To cannot be the same.</p>}
			</section>

			<section className="mt-5">
				<div className="flex items-center justify-between">
					<p className="text-gray-200">
						Showing <span className="text-white font-medium">{results.length}</span> results for{" "}
						<span className="text-white font-medium">{form.from}</span> → <span className="text-white font-medium">{form.to}</span>
						{form.date ? <span className="text-gray-400"> ( {formatDateShort(form.date)} )</span> : null}
					</p>
					<p className="text-xs text-gray-400">Tip: open with prefilled URL like `?from=Dhaka&to=Sylhet&date=2026-02-10`</p>
				</div>

				<div className="mt-3 flex flex-col gap-3">
					{results.length === 0 ? (
						<div className="rounded-xl border border-gray-700 bg-gray-900/30 p-5">
							<p className="text-gray-300">No trips found. Try changing route/filters.</p>
						</div>
					) : (
						results.map((t) => (
							<div
								key={t.id}
								className="rounded-xl border border-gray-700 bg-gray-900/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<p className="text-white font-semibold">{t.operator}</p>
										<span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{t.coachType}</span>
										<span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{t.ac ? "AC" : "Non-AC"}</span>
									</div>
									<div className="mt-1 text-sm text-gray-300">
										{t.from} → {t.to}
									</div>
									<div className="mt-1 text-sm text-gray-400">
										{t.departTime} → {t.arriveTime} • {t.duration} • Seats left: {t.seatsLeft}
									</div>
								</div>
								<div className="flex items-center justify-between md:justify-end gap-3">
									<div className="text-white font-semibold">৳ {t.price.toLocaleString()}</div>
									<button className="green-button" onClick={() => setSelectedTrip(t)}>
										Select
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</section>

			<Modal
				title={selectedTrip ? `Confirm Bus Trip (${selectedTrip.operator})` : "Confirm Bus Trip"}
				open={!!selectedTrip}
				onClose={() => setSelectedTrip(null)}
			>
				{selectedTrip && (
					<div className="flex flex-col gap-3">
						<div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
							<p className="text-gray-200">
								<span className="text-white font-medium">{selectedTrip.from}</span> → <span className="text-white font-medium">{selectedTrip.to}</span>
							</p>
							<p className="text-sm text-gray-400">
								{selectedTrip.departTime} → {selectedTrip.arriveTime} • {selectedTrip.duration}
							</p>
							<p className="text-sm text-gray-400">
								Coach: {selectedTrip.coachType} • {selectedTrip.ac ? "AC" : "Non-AC"}
							</p>
							<p className="text-sm text-gray-400">Passengers: {form.passengers}</p>
							<p className="text-sm text-gray-400">Date: {form.date ? formatDateShort(form.date) : "(not selected)"}</p>
						</div>

						<div className="flex items-center justify-between">
							<p className="text-white font-semibold">Total: ৳ {(selectedTrip.price * Number(form.passengers || 1)).toLocaleString()}</p>
							<button
								className="green-button"
								onClick={() => {
									alert("Booking confirmed (demo). Next step: payment/seat selection.");
									setSelectedTrip(null);
								}}
							>
								Confirm
							</button>
						</div>
						<p className="text-xs text-gray-500">Demo only — replace this with your real booking flow.</p>
					</div>
				)}
			</Modal>
		</div>
	);
}

export default function BusBookingPage() {
	return (
		<Suspense fallback={<SuspenseFallback loadingText="bus tickets" />}>
			<BusBookingContent />
		</Suspense>
	);
}

