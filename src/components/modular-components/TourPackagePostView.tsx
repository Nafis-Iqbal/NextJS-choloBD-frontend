"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
	FaBed,
	FaBus,
	FaCalendarAlt,
	FaHiking,
	FaMapMarkerAlt,
	FaRegStickyNote,
	FaRoute,
	FaUsers,
	FaWallet,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { HeroSectionFull } from "@/components/modular-components/HeroSectionFull";
import { StarRating } from "@/components/custom-elements/StarRating";
import { ScrollToTopButton } from "@/components/custom-elements/ScrollToTopButton";
import { StopInfoFact, StopInfoLabel } from "@/components/forms/tour-package/StopInfoFact";
import { HotelRatingBadge } from "@/components/forms/tour-package/HotelPicker";
import { HotelApi } from "@/services/api";
import { READABLE_BODY_STYLE } from "@/components/forms/tour-package/constants";

/* Navbar is fixed at 55px / 70px (see the DivGap spacer in the layouts). */
const STICKY_TOP_CLASS = "top-[63px] md:top-[78px]";
const ANCHOR_OFFSET_CLASS = "scroll-mt-[80px] md:scroll-mt-[100px]";
const DAY_SIDEBAR_WIDTH = 88;
const DAY_SIDEBAR_GAP = 12;

const getNavbarOffset = () =>
	typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches ? 78 : 63;

/* Long-copy surfaces stay white with dark text so theme tints cannot wash out body copy. */
const READABLE_SURFACE_CLASS = "rounded-2xl px-4 py-4 md:px-5";
const READABLE_SURFACE_STYLE: CSSProperties = {
	backgroundColor: "#FFFFFF",
	color: "#1F2937",
	boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",
	border: "1px solid rgba(0, 0, 0, 0.12)",
};
const READABLE_BODY_CLASS = "leading-relaxed";
const READABLE_MUTED_CLASS = "leading-relaxed";
const READABLE_MUTED_STYLE: CSSProperties = { color: "#4B5563" };
const READABLE_NOTE_STYLE: CSSProperties = {
	backgroundColor: "#F9FAFB",
	color: "#374151",
	boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
	border: "1px solid rgba(0, 0, 0, 0.10)",
};

function formatEnumValue(value?: string | null): string {
	if (!value) return "N/A";
	return value
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: Date | string): string {
	if (!value) return "N/A";
	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) return "N/A";
	return parsedDate.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function formatCurrency(value?: number | null): string {
	if (value === null || value === undefined) return "N/A";
	return `৳ ${value.toLocaleString()}`;
}

function toNotesList(notes?: string[] | string): string[] {
	if (!notes) return [];
	if (Array.isArray(notes)) return notes.filter(Boolean);
	return notes
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

type DayStop = NonNullable<TourPackage["daySegments"]>[number];

type ItineraryDay = {
	dayNumber: number;
	stops: DayStop[];
};

function getStopTitle(stop: DayStop, stopIndex: number): string {
	return (
		stop.tourSpotName ||
		stop.activitySpotName ||
		`Stop ${stop.segmentOrder || stopIndex + 1}`
	);
}

/* ── Small building blocks ─────────────────────────────────────────── */

const SectionHeading = ({
	title,
	subtitle,
}: {
	title: string;
	subtitle?: ReactNode;
}) => (
	<div className="flex flex-col gap-1.5">
		<div className="flex items-center gap-3">
			<span
				className="h-6 w-1 shrink-0 rounded-full"
				style={{ backgroundColor: "var(--theme-teal)" }}
				aria-hidden="true"
			/>
			<h3 className="theme-text-teal text-xl font-semibold leading-tight md:text-2xl">
				{title}
			</h3>
		</div>
		{subtitle ? (
			<p className="theme-text-muted pl-4 text-sm md:text-base">{subtitle}</p>
		) : null}
	</div>
);

const HighlightTile = ({
	icon,
	label,
	value,
	hint,
}: {
	icon: ReactNode;
	label: string;
	value: string;
	hint?: string;
}) => (
	<div className="theme-card flex flex-col gap-1 rounded-2xl px-4 py-3.5">
		<span className="theme-text-muted flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
			<span className="theme-text-teal" aria-hidden="true">
				{icon}
			</span>
			{label}
		</span>
		<span className="theme-text-teal text-xl font-bold leading-tight md:text-2xl">
			{value}
		</span>
		{hint ? <span className="theme-text-subtle text-xs">{hint}</span> : null}
	</div>
);

const FactRow = ({ label, value }: { label: string; value: ReactNode }) => (
	<div
		className="flex items-baseline justify-between gap-4 py-2.5"
		style={{ borderBottom: "1px solid var(--theme-border-subtle)" }}
	>
		<span className="theme-text-muted shrink-0 text-sm">{label}</span>
		<span className="theme-text text-right text-sm font-semibold">{value}</span>
	</div>
);

/* ── Itinerary ─────────────────────────────────────────────────────── */

const StopCard = ({
	stop,
	stopIndex,
	isLastStop,
	dayNumber,
}: {
	stop: DayStop;
	stopIndex: number;
	isLastStop: boolean;
	dayNumber: number;
}) => {
	const stopNumber = stop.segmentOrder || stopIndex + 1;
	const { data: hotelResponse } = HotelApi.useGetHotelDetailRQ(
		isLastStop ? stop.hotelId || "" : ""
	);
	const hotel = hotelResponse?.data as Hotel | undefined;
	const hotelTypeLabel = stop.hotelOption ? formatEnumValue(stop.hotelOption) : "";

	return (
		<li className="relative pl-10 md:pl-12">
			<span
				className="theme-btn-teal absolute left-0 top-4 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full text-xs font-bold"
				aria-hidden="true"
			>
				{stopNumber}
			</span>

			<article className={READABLE_SURFACE_CLASS} style={READABLE_SURFACE_STYLE}>
				<span className="rounded-full px-2.5 py-0.5 text-xs font-semibold theme-outline-teal theme-text-teal">
					Day {dayNumber} · Stop {stopNumber}
				</span>

				{stop.shortDescription?.trim() ? (
					<p className="mt-3 min-h-[6rem] text-sm leading-relaxed" style={{ color: "#1F2937" }}>
						{stop.shortDescription}
					</p>
				) : (
					<p className="mt-3 min-h-[6rem] text-sm italic" style={READABLE_MUTED_STYLE}>
						No description yet.
					</p>
				)}

				<div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
					<StopInfoFact
						icon={<FaMapMarkerAlt className="h-3 w-3" />}
						label="Tour spot"
						value={stop.tourSpotName}
					/>
					<StopInfoFact
						icon={<FaHiking className="h-3 w-3" />}
						label="Activities"
						value={stop.activitySpotName}
					/>
					<StopInfoFact
						icon={<FaBus className="h-3 w-3" />}
						label="Transport"
						value={stop.transportOption ? formatEnumValue(stop.transportOption) : ""}
					/>
					{isLastStop ? (
						<StopInfoFact
							icon={<FaBed className="h-3 w-3" />}
							label="Overnight stay"
							value={hotelTypeLabel}
						>
							{hotel?.name ? (
								<div>
									<p
										className="mt-0.5 flex min-w-0 items-center justify-between gap-2 text-sm leading-snug"
										style={READABLE_BODY_STYLE}
									>
										<span className="truncate">{hotel.name}</span>
										<HotelRatingBadge rating={hotel.rating} />
									</p>
									{hotelTypeLabel ? (
										<p className="mt-0.5 text-xs" style={READABLE_MUTED_STYLE}>
											{hotelTypeLabel}
										</p>
									) : null}
								</div>
							) : null}
						</StopInfoFact>
					) : null}
				</div>

				{stop.notes?.trim() ? (
					<div className="mt-8 md:mt-12">
						<StopInfoLabel
							icon={<FaRegStickyNote className="h-3 w-3" />}
							label="Notes"
						/>
						<p
							className="mt-0.5 rounded-xl px-3 py-2.5 text-sm leading-relaxed"
							style={READABLE_NOTE_STYLE}
						>
							{stop.notes}
						</p>
					</div>
				) : null}
			</article>
		</li>
	);
};

const ItineraryDayBlock = ({ day }: { day: ItineraryDay }) => {
	const overnightStay = day.stops[day.stops.length - 1]?.hotelOption;
	const placeList = day.stops
		.map((stop, stopIndex) => getStopTitle(stop, stopIndex))
		.join(" → ");

	return (
		<section
			id={`itinerary-day-${day.dayNumber}`}
			className={`flex flex-col gap-4 ${ANCHOR_OFFSET_CLASS}`}
		>
			<header className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<span
					className="theme-btn-teal flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl leading-none"
					aria-hidden="true"
				>
					<span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
						Day
					</span>
					<span className="text-xl font-bold">{day.dayNumber}</span>
				</span>
				<div className="min-w-0 flex-1">
					<h3 className="theme-text-teal text-xl font-bold leading-tight md:text-2xl">
						Day {day.dayNumber}
					</h3>
					<p className="theme-text-muted mt-0.5 truncate text-sm">
						{day.stops.length} stop{day.stops.length === 1 ? "" : "s"}
						{placeList ? ` · ${placeList}` : ""}
					</p>
				</div>
				{overnightStay ? (
					<span className="theme-badge inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs">
						<FaBed className="h-3 w-3" aria-hidden="true" />
						{formatEnumValue(overnightStay)}
					</span>
				) : null}
			</header>

			<ol
				className="ml-4 flex flex-col gap-4 md:ml-5"
				style={{ borderLeft: "2px solid var(--theme-border-subtle)" }}
			>
				{day.stops.map((stop, stopIndex) => (
					<StopCard
						key={stop.id || `${day.dayNumber}-${stopIndex}`}
						stop={stop}
						stopIndex={stopIndex}
						isLastStop={stopIndex === day.stops.length - 1}
						dayNumber={day.dayNumber}
					/>
				))}
			</ol>
		</section>
	);
};

const ItineraryDaySidebar = ({
	itineraryDays,
	activeDayNumber,
	visible,
	left,
}: {
	itineraryDays: ItineraryDay[];
	activeDayNumber: number | null;
	visible: boolean;
	left: number;
}) => (
	<motion.nav
		aria-label="Jump to a day"
		initial={false}
		animate={{
			x: visible ? 0 : -(left + DAY_SIDEBAR_WIDTH + 32),
			opacity: visible ? 1 : 0,
		}}
		transition={{ type: "spring", stiffness: 340, damping: 34 }}
		className={`fixed z-20 ${STICKY_TOP_CLASS}`}
		style={{
			left,
			width: DAY_SIDEBAR_WIDTH,
			maxHeight: "calc(100vh - 96px)",
			pointerEvents: visible ? "auto" : "none",
		}}
	>
		<div
			className="scrollbar-none flex max-h-full flex-col items-center gap-2 overflow-y-auto rounded-2xl p-2"
			style={READABLE_SURFACE_STYLE}
		>
			<span
				className="flex h-9 w-9 items-center justify-center rounded-xl"
				style={{ backgroundColor: "var(--theme-teal)", color: "#FFFFFF" }}
				aria-hidden="true"
			>
				<FaCalendarAlt className="h-4 w-4" />
			</span>
			{itineraryDays.map((day) => {
				const isActive = day.dayNumber === activeDayNumber;
				return (
					<button
						key={`jump-day-${day.dayNumber}`}
						type="button"
						aria-current={isActive ? "true" : undefined}
						onClick={() =>
							document
								.getElementById(`itinerary-day-${day.dayNumber}`)
								?.scrollIntoView({ behavior: "smooth", block: "start" })
						}
						className="flex flex-col items-center gap-0.5"
						style={{
							backgroundColor: "transparent",
							border: "none",
							color: "inherit",
						}}
					>
						<span
							className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl leading-none ${
								isActive ? "theme-btn-teal" : ""
							}`}
							style={
								isActive
									? { color: "#FFFFFF" }
									: {
											backgroundColor: "#FFFFFF",
											color: "#1F2937",
											boxShadow: "0 2px 8px rgba(0, 0, 0, 0.10)",
											border: "1px solid rgba(0, 0, 0, 0.12)",
									  }
							}
						>
							<span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
								Day
							</span>
							<span className="text-xl font-bold">{day.dayNumber}</span>
						</span>
						<span className="text-[10px] font-medium" style={READABLE_MUTED_STYLE}>
							{day.stops.length} stop{day.stops.length === 1 ? "" : "s"}
						</span>
					</button>
				);
			})}
		</div>
	</motion.nav>
);

/* ── Main view ─────────────────────────────────────────────────────── */

export const TourPackagePostView = ({
	tour,
	onEdit,
	onBack,
}: {
	tour: TourPackage;
	onEdit: () => void;
	onBack: () => void;
}) => {
	const itineraryDays = useMemo<ItineraryDay[]>(() => {
		const daySegments = [...(tour.daySegments ?? [])].sort(
			(a, b) => a.dayNumber - b.dayNumber || (a.segmentOrder || 1) - (b.segmentOrder || 1)
		);
		return daySegments.reduce<ItineraryDay[]>((days, segment) => {
			const existing = days.find((day) => day.dayNumber === segment.dayNumber);
			if (existing) {
				existing.stops.push(segment);
				return days;
			}
			days.push({ dayNumber: segment.dayNumber, stops: [segment] });
			return days;
		}, []);
	}, [tour.daySegments]);

	const itineraryRef = useRef<HTMLElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const [activeDayNumber, setActiveDayNumber] = useState<number | null>(null);
	const [isDayMenuVisible, setIsDayMenuVisible] = useState(false);
	const [dayMenuLeft, setDayMenuLeft] = useState(0);

	const syncDayMenu = useCallback(() => {
		const content = contentRef.current;
		if (content) {
			const contentLeft = content.getBoundingClientRect().left;
			const preferredLeft = contentLeft - DAY_SIDEBAR_WIDTH - DAY_SIDEBAR_GAP;
			// Stay in the gutter beside the page container. Only tuck inside the
			// content if that gutter is too narrow (typical on small screens).
			setDayMenuLeft(preferredLeft >= 12 ? preferredLeft : contentLeft + 8);
		}

		const firstDay = itineraryDays[0];
		if (!firstDay) {
			setIsDayMenuVisible(false);
			return;
		}
		const firstDayEl = document.getElementById(`itinerary-day-${firstDay.dayNumber}`);
		if (!firstDayEl) {
			setIsDayMenuVisible(false);
			return;
		}
		setIsDayMenuVisible(firstDayEl.getBoundingClientRect().top <= getNavbarOffset() + 8);
	}, [itineraryDays]);

	useEffect(() => {
		if (itineraryDays.length === 0) {
			setIsDayMenuVisible(false);
			return;
		}

		syncDayMenu();
		let frame = 0;
		const onScrollOrResize = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(() => {
				frame = 0;
				syncDayMenu();
			});
		};

		const firstDay = itineraryDays[0];
		const firstDayEl = firstDay
			? document.getElementById(`itinerary-day-${firstDay.dayNumber}`)
			: null;
		const observer = firstDayEl
			? new IntersectionObserver(() => syncDayMenu(), {
					root: null,
					threshold: [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1],
					rootMargin: "-70px 0px 0px 0px",
			  })
			: null;
		if (firstDayEl && observer) observer.observe(firstDayEl);

		window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
		window.addEventListener("resize", onScrollOrResize);
		document.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
		return () => {
			observer?.disconnect();
			window.removeEventListener("scroll", onScrollOrResize, true);
			window.removeEventListener("resize", onScrollOrResize);
			document.removeEventListener("scroll", onScrollOrResize, true);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, [itineraryDays, syncDayMenu]);

	useEffect(() => {
		const container = itineraryRef.current;
		if (!container || itineraryDays.length === 0) {
			setActiveDayNumber(null);
			return;
		}

		const daySections = itineraryDays
			.map((day) => document.getElementById(`itinerary-day-${day.dayNumber}`))
			.filter((element): element is HTMLElement => Boolean(element));

		if (daySections.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
				if (!visible) return;
				const dayNumber = Number(visible.target.id.replace("itinerary-day-", ""));
				if (!Number.isNaN(dayNumber)) setActiveDayNumber(dayNumber);
			},
			{ rootMargin: "-120px 0px -55% 0px", threshold: 0 }
		);

		daySections.forEach((section) => observer.observe(section));
		setActiveDayNumber(itineraryDays[0].dayNumber);

		return () => observer.disconnect();
	}, [itineraryDays]);

	const heroImages = (tour.images ?? []).map((image) => ({
		imageURL: image.url,
		imageAlt: image.altText || tour.packageName,
	}));
	const imageList =
		heroImages.length > 0
			? heroImages
			: [{ imageURL: "/image-not-found.png", imageAlt: tour.packageName }];

	const stopCount = itineraryDays.reduce((total, day) => total + day.stops.length, 0);
	const generalNotes = toNotesList(tour.generalNotes);
	const hasTripWindow = Boolean(tour.startDate || tour.endDate);
	const perDayBudget =
		tour.totalBudget && tour.duration ? Math.round(tour.totalBudget / tour.duration) : null;

	return (
		<div className="flex flex-col pb-6 font-sans theme-text md:px-2">
			{itineraryDays.length > 0 ? (
				<ItineraryDaySidebar
					itineraryDays={itineraryDays}
					activeDayNumber={activeDayNumber}
					visible={isDayMenuVisible}
					left={dayMenuLeft}
				/>
			) : null}
			<div ref={contentRef} className="flex flex-col gap-8 md:mx-6">
				{/* ── Hero ─────────────────────────────────────────────── */}
				<header className="theme-outline relative overflow-hidden rounded-none md:rounded-3xl">
					<HeroSectionFull className="h-[46vh] md:h-[60vh]" imageList={imageList} />

					<div
						className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 px-4 pb-6 pt-24 md:px-8 md:pb-8"
						style={{
							backgroundImage:
								"linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 100%)",
						}}
					>
						{tour.location?.name ? (
							<span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
								<FaMapMarkerAlt className="h-3.5 w-3.5" aria-hidden="true" />
								{tour.location.name}
							</span>
						) : null}

						<h1 className="text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-5xl">
							{tour.packageName}
						</h1>

						<div className="flex flex-wrap items-center gap-2">
							<span
								className="rounded-full px-3 py-1 text-sm font-semibold text-white"
								style={{ backgroundColor: "var(--theme-teal)" }}
							>
								{formatEnumValue(tour.tourType)}
							</span>
							<span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
								{tour.duration} Day{tour.duration === 1 ? "" : "s"}
							</span>
							{tour.isPopular ? (
								<span
									className="rounded-full px-3 py-1 text-sm font-semibold text-white"
									style={{ backgroundColor: "var(--theme-star)" }}
								>
									Popular
								</span>
							) : null}
							<span
								className="rounded-full px-3 py-1 text-sm font-semibold text-white"
								style={{
									backgroundColor: tour.isActive
										? "var(--theme-teal)"
										: "var(--theme-red, #C0392B)",
								}}
							>
								{tour.isActive ? "Active" : "Inactive"}
							</span>
							{tour.status ? (
								<span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
									{formatEnumValue(tour.status)}
								</span>
							) : null}
						</div>

						<div className="flex items-center gap-2">
							<StarRating rating={tour.rating ?? 0} />
							<span className="text-sm font-semibold text-white/90">
								{tour.rating ? tour.rating.toFixed(1) : "Not rated yet"}
							</span>
						</div>
					</div>
				</header>

				{/* ── Key numbers ──────────────────────────────────────── */}
				<div className="grid grid-cols-2 gap-3 px-3 md:px-0 lg:grid-cols-4">
					<HighlightTile
						icon={<FaCalendarAlt className="h-3.5 w-3.5" />}
						label="Duration"
						value={`${tour.duration} Day${tour.duration === 1 ? "" : "s"}`}
						hint={
							itineraryDays.length > 0
								? `${itineraryDays.length} day${itineraryDays.length === 1 ? "" : "s"} planned`
								: "Itinerary not planned yet"
						}
					/>
					<HighlightTile
						icon={<FaRoute className="h-3.5 w-3.5" />}
						label="Itinerary"
						value={`${stopCount} Stop${stopCount === 1 ? "" : "s"}`}
						hint={
							stopCount > 0
								? `Across ${itineraryDays.length} day${itineraryDays.length === 1 ? "" : "s"}`
								: "No stops added"
						}
					/>
					<HighlightTile
						icon={<FaUsers className="h-3.5 w-3.5" />}
						label={tour.participantCount ? "Travellers" : "Max Group"}
						value={`${tour.participantCount ?? tour.maxGroupSize ?? 20} People`}
						hint={tour.participantCount ? `Cap ${tour.maxGroupSize ?? 20}` : undefined}
					/>
					<HighlightTile
						icon={<FaWallet className="h-3.5 w-3.5" />}
						label="Total Budget"
						value={formatCurrency(tour.totalBudget)}
						hint={perDayBudget ? `≈ ${formatCurrency(perDayBudget)} / day` : undefined}
					/>
				</div>

				{/* ── Body ─────────────────────────────────────────────── */}
				<div className="grid grid-cols-1 gap-8 px-3 md:px-0 xl:grid-cols-[minmax(0,1fr)_20rem]">
					<main className="flex min-w-0 flex-col gap-10">
						{tour.shortDescription ? (
							<section className="flex flex-col gap-3">
								<SectionHeading title="About This Tour" />
								<div className={READABLE_SURFACE_CLASS} style={READABLE_SURFACE_STYLE}>
									<p
										className={`${READABLE_BODY_CLASS} whitespace-pre-wrap text-base md:text-lg`}
										style={{ color: "#1F2937" }}
									>
										{tour.shortDescription}
									</p>
								</div>
							</section>
						) : null}

						<section ref={itineraryRef} className="flex flex-col gap-5">
							<SectionHeading
								title="Day-by-Day Itinerary"
								subtitle={
									itineraryDays.length > 0
										? `${itineraryDays.length} day${itineraryDays.length === 1 ? "" : "s"} · ${stopCount} stop${stopCount === 1 ? "" : "s"} — follow the trail from arrival to the last stop.`
										: "No day-wise itinerary has been added to this package yet."
								}
							/>

							{itineraryDays.length > 0 ? (
								<div className="flex flex-col gap-8">
									{itineraryDays.map((day) => (
										<ItineraryDayBlock key={`day-${day.dayNumber}`} day={day} />
									))}
								</div>
							) : (
								<div
									className={`${READABLE_SURFACE_CLASS} px-5 py-8 text-center`}
									style={READABLE_SURFACE_STYLE}
								>
									<p className={READABLE_MUTED_CLASS} style={READABLE_MUTED_STYLE}>
										Add day segments to this package to show travellers what each day looks
										like.
									</p>
								</div>
							)}
						</section>

						{generalNotes.length > 0 ? (
							<section className="flex flex-col gap-3">
								<SectionHeading title="Good To Know" />
								<ul className="flex flex-col gap-2">
									{generalNotes.map((note, noteIndex) => (
										<li
											key={`note-${noteIndex}`}
											className={`${READABLE_SURFACE_CLASS} flex gap-3 rounded-xl`}
											style={READABLE_SURFACE_STYLE}
										>
											<FaRegStickyNote
												className="mt-1 h-3.5 w-3.5 shrink-0"
												style={{ color: "#6B7280" }}
												aria-hidden="true"
											/>
											<span className={READABLE_BODY_CLASS} style={{ color: "#1F2937" }}>
												{note}
											</span>
										</li>
									))}
								</ul>
							</section>
						) : null}
					</main>

					{/* ── At a glance ──────────────────────────────────── */}
					<aside className="bg-white">
						<div className={`sticky ${STICKY_TOP_CLASS} flex flex-col gap-4`}>
							<div className="theme-section rounded-2xl px-5 py-5">
								<p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wide">
									Total Budget
								</p>
								<p className="theme-text-teal text-3xl font-bold leading-tight">
									{formatCurrency(tour.totalBudget)}
								</p>

								<div className="mt-4 flex flex-col">
									<FactRow label="Location" value={tour.location?.name || "N/A"} />
									<FactRow label="Tour Type" value={formatEnumValue(tour.tourType)} />
									<FactRow
										label="Duration"
										value={`${tour.duration} Day${tour.duration === 1 ? "" : "s"}`}
									/>
									<FactRow
										label="Max Group Size"
										value={`${tour.maxGroupSize ?? 20} People`}
									/>
									{hasTripWindow ? (
										<FactRow
											label="Trip Window"
											value={`${formatDate(tour.startDate)} → ${formatDate(tour.endDate)}`}
										/>
									) : null}
									{tour.participantCount ? (
										<FactRow
											label="Travellers"
											value={`${tour.participantCount} People`}
										/>
									) : null}
									{tour.estimatedBudget ? (
										<FactRow
											label="Estimated Budget"
											value={formatCurrency(tour.estimatedBudget)}
										/>
									) : null}
									{tour.actualCost ? (
										<FactRow label="Actual Cost" value={formatCurrency(tour.actualCost)} />
									) : null}
									{tour.preferredHotelType ? (
										<FactRow
											label="Preferred Stay"
											value={formatEnumValue(tour.preferredHotelType)}
										/>
									) : null}
									{tour.preferredTransport ? (
										<FactRow
											label="Preferred Transport"
											value={formatEnumValue(tour.preferredTransport)}
										/>
									) : null}
									{tour.basedOnPackage?.packageName ? (
										<FactRow
											label="Based On"
											value={tour.basedOnPackage.packageName}
										/>
									) : null}
								</div>

								<div className="mt-5 flex flex-col gap-2">
									<button
										type="button"
										className="theme-btn-teal w-full rounded-lg px-5 py-2.5 font-semibold"
										onClick={onEdit}
									>
										Edit Tour Package
									</button>
									<button
										type="button"
										className="theme-card theme-text w-full rounded-lg px-5 py-2.5 font-semibold"
										onClick={onBack}
									>
										Back to Tour List
									</button>
								</div>

								<p className="theme-text-subtle mt-4 text-xs">
									Created {formatDate(tour.createdAt)} · Updated{" "}
									{formatDate(tour.updatedAt)}
								</p>
							</div>
						</div>
					</aside>
				</div>
			</div>

			<ScrollToTopButton />
		</div>
	);
};
