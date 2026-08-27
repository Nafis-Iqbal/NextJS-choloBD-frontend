import { HotelRoomCategory, HotelType } from "@/types/enums";
import { MAX_STOPS_PER_DAY } from "./constants";
import type { HotelStayPrice, SpotOption, TourDaySegmentFieldWarnings, TourDaySegmentFormRow } from "./types";

export type DivisionSpotCounts = {
	tourSpots: number;
	activitySpots: number;
};

/** Sums `_count` from a division and its child districts (already returned by GET /locations). */
export const countSpotsInDivision = (
	locations: Location[] | null | undefined,
	divisionId: string
): DivisionSpotCounts => {
	if (!locations?.length || !divisionId) {
		return { tourSpots: 0, activitySpots: 0 };
	}

	return locations.reduce<DivisionSpotCounts>(
		(counts, location) => {
			if (location.id !== divisionId && location.parentLocationId !== divisionId) {
				return counts;
			}
			return {
				tourSpots: counts.tourSpots + (location._count?.tourSpots ?? 0),
				activitySpots: counts.activitySpots + (location._count?.activitySpots ?? 0),
			};
		},
		{ tourSpots: 0, activitySpots: 0 }
	);
};

export const toTitle = (value: string) =>
	value
		.toLowerCase()
		.split(/[_\s]+/)
		.filter(Boolean)
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(" ");

export const enumToOptions = (enumObj: Record<string, string>, emptyLabel: string) => {
	const values = Object.values(enumObj);
	return [
		{ label: emptyLabel, value: "" },
		...values.map((v) => ({ label: toTitle(v), value: v })),
	];
};

export const mapSpotOptions = (
	emptyLabel: string,
	spots: { name: string; id: string; locationId: string; rating?: number; entryCost?: number }[]
): SpotOption[] => [
	{ label: emptyLabel, value: "", locationId: "" },
	...spots.map((spot) => ({
		label: spot.name,
		value: spot.id,
		locationId: spot.locationId,
		rating: spot.rating,
		cost: typeof spot.entryCost === "number" ? spot.entryCost : undefined,
	})),
];

export const formatTaka = (amount: number) => `৳ ${Math.round(amount).toLocaleString()}`;

export const optionLabelWithCost = (label: string, cost?: number) =>
	typeof cost === "number" && cost > 0 ? `${label} · ${formatTaka(cost)}` : label;

export const toSelectOptionsWithCost = (options: SpotOption[]) =>
	options.map((option) => ({
		label: option.value ? optionLabelWithCost(option.label, option.cost) : option.label,
		value: option.value,
		locationId: option.locationId,
	}));

export const getSpotCost = (options: SpotOption[], value: string) => {
	if (!value) return 0;
	const cost = options.find((option) => option.value === value)?.cost;
	return typeof cost === "number" ? cost : 0;
};

const HOTEL_TYPE_ROOM_PREFERENCE: Record<string, HotelRoomCategory[]> = {
	[HotelType.HOSTEL]: [HotelRoomCategory.SINGLE, HotelRoomCategory.DOUBLE],
	[HotelType.GUESTHOUSE]: [HotelRoomCategory.SINGLE, HotelRoomCategory.DOUBLE],
	[HotelType.BUDGET]: [HotelRoomCategory.SINGLE, HotelRoomCategory.DOUBLE],
	[HotelType.APARTMENT]: [HotelRoomCategory.DOUBLE, HotelRoomCategory.DELUXE],
	[HotelType.BOUTIQUE]: [HotelRoomCategory.DOUBLE, HotelRoomCategory.DELUXE],
	[HotelType.RESORT]: [HotelRoomCategory.DELUXE, HotelRoomCategory.SUITE, HotelRoomCategory.DOUBLE],
	[HotelType.LUXURY]: [HotelRoomCategory.SUITE, HotelRoomCategory.DELUXE, HotelRoomCategory.DOUBLE],
};

const BUDGET_CLASS_HOTEL_TYPES = new Set<string>([
	HotelType.HOSTEL,
	HotelType.GUESTHOUSE,
	HotelType.BUDGET,
]);

const LUXURY_CLASS_HOTEL_TYPES = new Set<string>([HotelType.LUXURY, HotelType.RESORT]);

export const resolveHotelStayPrice = (
	hotel: Pick<Hotel, "roomTypes"> | null | undefined,
	hotelType?: string | null
): HotelStayPrice | null => {
	const priced = (hotel?.roomTypes || []).filter(
		(room) => typeof room.pricePerNight === "number" && room.pricePerNight >= 0
	);
	if (priced.length === 0) return null;
	if (priced.length === 1) {
		return { price: priced[0].pricePerNight, roomType: String(priced[0].roomType) };
	}

	const preferred = hotelType ? HOTEL_TYPE_ROOM_PREFERENCE[hotelType] || [] : [];
	for (const roomCategory of preferred) {
		const match = priced.find((room) => room.roomType === roomCategory);
		if (match) {
			return { price: match.pricePerNight, roomType: String(match.roomType) };
		}
	}

	const sorted = [...priced].sort((a, b) => a.pricePerNight - b.pricePerNight);
	const fallback = hotelType && LUXURY_CLASS_HOTEL_TYPES.has(hotelType)
		? sorted[sorted.length - 1]
		: hotelType && BUDGET_CLASS_HOTEL_TYPES.has(hotelType)
			? sorted[0]
			: sorted[Math.floor(sorted.length / 2)];

	return { price: fallback.pricePerNight, roomType: String(fallback.roomType) };
};

export const getStopTotal = (row: Pick<TourDaySegmentFormRow, "activityCost" | "hotelCost">) =>
	(row.activityCost || 0) + (row.hotelCost || 0);

export const sumStopTotals = (segments: Pick<TourDaySegmentFormRow, "activityCost" | "hotelCost">[]) =>
	segments.reduce((total, row) => total + getStopTotal(row), 0);

export const filterSpotOptions = (
	options: SpotOption[],
	{
		name = "",
		minRating = "",
		locationId = "",
		selectedValue = "",
	}: {
		name?: string;
		minRating?: string;
		locationId?: string;
		selectedValue?: string;
	}
): SpotOption[] => {
	const query = name.trim().toLowerCase();
	const min = minRating ? Number(minRating) : 0;
	const selectable = options.filter((option) => option.value);
	const matches = selectable.filter((option) => {
		if (locationId && option.locationId !== locationId) return false;
		if (query && !option.label.toLowerCase().includes(query)) return false;
		if (min && (option.rating ?? 0) < min) return false;
		return true;
	});
	if (selectedValue) {
		const selected = selectable.find((option) => option.value === selectedValue);
		if (selected && !matches.some((option) => option.value === selectedValue)) {
			return [selected, ...matches];
		}
	}
	return matches;
};

export const optionLabel = (options: { label: string; value: string }[], value: string) =>
	options.find((option) => option.value === value)?.label || "";

export const collectVisitSpotNames = (
	segments: { tourSpotId: string }[],
	spots: { id: string; name: string }[]
): string[] => {
	const names: string[] = [];
	const seen = new Set<string>();
	for (const segment of segments) {
		if (!segment.tourSpotId) continue;
		const name = spots.find((spot) => spot.id === segment.tourSpotId)?.name;
		if (!name || seen.has(name)) continue;
		seen.add(name);
		names.push(name);
	}
	return names;
};

export const displayOrDash = (value?: string) => (value && value.trim() ? value : "Not selected");

export const unwrapHotelList = (data: unknown): Hotel[] => {
	if (Array.isArray(data)) return data as Hotel[];
	if (data && typeof data === "object") {
		const nested = data as { results?: unknown; hotels?: unknown };
		if (Array.isArray(nested.results)) return nested.results as Hotel[];
		if (Array.isArray(nested.hotels)) return nested.hotels as Hotel[];
	}
	return [];
};

export const createBlankSegment = (dayNumber: number, segmentOrder = 1): TourDaySegmentFormRow => ({
	id: `segment-${Date.now()}-${Math.random()}`,
	dayNumber,
	segmentOrder,
	shortDescription: "",
	tourSpotId: "",
	activitySpotId: "",
	transportOption: "",
	hotelOption: "",
	hotelId: "",
	activityCost: 0,
	hotelCost: 0,
	notes: "",
});

export const clampDayNumber = (dayNumber: number, duration: number) => {
	if (!duration) return 0;
	if (!dayNumber) return 0;
	return Math.min(Math.max(dayNumber, 1), duration);
};

export const clampDaySegmentsToDuration = (
	segments: TourDaySegmentFormRow[],
	duration: number
): TourDaySegmentFormRow[] => {
	if (!duration) return [];
	return segments.filter((segment) => segment.dayNumber >= 1 && segment.dayNumber <= duration);
};

export const nextAvailableDayNumber = (
	segments: TourDaySegmentFormRow[],
	duration: number
) => {
	const used = new Set(segments.map((segment) => segment.dayNumber));
	for (let day = 1; day <= duration; day += 1) {
		if (!used.has(day)) return day;
	}
	return Math.min(duration, 1) || 1;
};

export const nextSegmentOrderForDay = (
	segments: TourDaySegmentFormRow[],
	dayNumber: number
) => {
	const orders = segments
		.filter((segment) => segment.dayNumber === dayNumber)
		.map((segment) => segment.segmentOrder || 1);
	return orders.length > 0 ? Math.max(...orders) + 1 : 1;
};

export const countStopsForDay = (
	segments: TourDaySegmentFormRow[],
	dayNumber: number
) => segments.filter((segment) => segment.dayNumber === dayNumber).length;

export const isDayAtStopLimit = (
	segments: TourDaySegmentFormRow[],
	dayNumber: number,
	limit = MAX_STOPS_PER_DAY
) => countStopsForDay(segments, dayNumber) >= limit;

export const missingDurationDays = (
	segments: TourDaySegmentFormRow[],
	duration: number
): number[] => {
	if (!duration) return [];
	const daysWithStops = new Set(segments.map((segment) => segment.dayNumber));
	const missing: number[] = [];
	for (let day = 1; day <= duration; day += 1) {
		if (!daysWithStops.has(day)) missing.push(day);
	}
	return missing;
};

export const everyDurationDayHasAStop = (
	segments: TourDaySegmentFormRow[],
	duration: number
) => duration > 0 && missingDurationDays(segments, duration).length === 0;

export const getDetailsContinueReason = ({
	packageName,
	totalBudget,
	division,
	tourType,
	duration,
	maxGroupSize,
	shortDescription,
	startDate,
	requiresStartDate = false,
}: {
	packageName: string;
	totalBudget?: number;
	division: string;
	tourType: string;
	duration: number;
	maxGroupSize?: number;
	shortDescription: string;
	startDate?: string;
	requiresStartDate?: boolean;
}): string | null => {
	const missing: string[] = [];
	if (!packageName.trim()) missing.push("package name");
	if (!(totalBudget && totalBudget > 0)) missing.push("estimated total cost");
	if (!division.trim()) missing.push("division");
	if (!tourType) missing.push("tour type");
	if (!(duration > 0)) missing.push("duration");
	if (maxGroupSize !== undefined && !(maxGroupSize > 0)) missing.push("max group size");
	if (requiresStartDate && !startDate) missing.push("start date");
	if (!shortDescription.trim()) missing.push("short description");
	if (missing.length === 0) return null;
	if (missing.length === 1) return `Add a ${missing[0]} to continue.`;
	return `Complete the following to continue: ${missing.join(", ")}.`;
};

export const isOverBudget = (computedTotal: number, estimatedBudget: number) =>
	estimatedBudget > 0 && computedTotal > estimatedBudget;

export const getOverBudgetReason = (computedTotal: number, estimatedBudget: number): string | null => {
	if (!isOverBudget(computedTotal, estimatedBudget)) return null;
	return `Current itinerary cost ${formatTaka(computedTotal)} is over the estimated budget of ${formatTaka(estimatedBudget)}. Raise the estimate or choose lower-cost stops.`;
};

export const getItineraryContinueReason = (
	segments: TourDaySegmentFormRow[],
	duration: number,
	missingDays: number[],
	computedTotal = 0,
	estimatedBudget = 0
): string | null => {
	if (!(duration > 0)) return "Select a duration before adding the itinerary.";
	if (segments.length === 0) {
		return `Add at least one stop to each of the ${duration} tour day${duration === 1 ? "" : "s"} to continue.`;
	}
	if (missingDays.length > 0) {
		return `Add at least one stop to every day. Missing: Day ${missingDays.join(", Day ")}.`;
	}
	const incomplete = segments.some(
		(segment) => !segment.tourSpotId.trim() || segment.shortDescription.trim().length < 2
	);
	if (incomplete) {
		return "Each stop needs a tour spot and a short description before you can continue.";
	}
	return getOverBudgetReason(computedTotal, estimatedBudget);
};

export const groupStopsByDay = (
	segments: TourDaySegmentFormRow[]
): Array<[number, TourDaySegmentFormRow[]]> => {
	const grouped = new Map<number, TourDaySegmentFormRow[]>();
	for (const segment of segments) {
		const list = grouped.get(segment.dayNumber) || [];
		list.push(segment);
		grouped.set(segment.dayNumber, list);
	}
	return [...grouped.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([dayNumber, stops]) => [
			dayNumber,
			[...stops].sort((a, b) => (a.segmentOrder || 1) - (b.segmentOrder || 1)),
		]);
};

export const applyOvernightHotelToLastStop = (
	segments: TourDaySegmentFormRow[]
): TourDaySegmentFormRow[] => {
	const grouped = groupStopsByDay(segments);
	const next: TourDaySegmentFormRow[] = [];
	for (const [, stops] of grouped) {
		const ordered = stops.map((stop, index) => ({ ...stop, segmentOrder: index + 1 }));
		const hotelSource = [...ordered].reverse().find((stop) => stop.hotelOption || stop.hotelId);
		ordered.forEach((stop, index) => {
			const isLast = index === ordered.length - 1;
			next.push({
				...stop,
				hotelOption: isLast ? (hotelSource?.hotelOption || "") : "",
				hotelId: isLast ? (hotelSource?.hotelId || "") : "",
				hotelCost: isLast ? (hotelSource?.hotelCost || 0) : 0,
			});
		});
	}
	return next;
};

export const moveStopWithinDay = (
	segments: TourDaySegmentFormRow[],
	stopId: string,
	direction: -1 | 1
): TourDaySegmentFormRow[] => {
	const stop = segments.find((segment) => segment.id === stopId);
	if (!stop) return segments;

	const sameDay = segments
		.filter((segment) => segment.dayNumber === stop.dayNumber)
		.sort((a, b) => (a.segmentOrder || 1) - (b.segmentOrder || 1));
	const index = sameDay.findIndex((segment) => segment.id === stopId);
	const targetIndex = index + direction;
	if (index < 0 || targetIndex < 0 || targetIndex >= sameDay.length) return segments;

	const reordered = [...sameDay];
	const current = reordered[index];
	const swapWith = reordered[targetIndex];
	if (!current || !swapWith) return segments;
	reordered[index] = swapWith;
	reordered[targetIndex] = current;

	const orderById = new Map(reordered.map((segment, i) => [segment.id, i + 1]));
	return applyOvernightHotelToLastStop(
		segments.map((segment) => {
			const nextOrder = orderById.get(segment.id);
			return nextOrder === undefined ? segment : { ...segment, segmentOrder: nextOrder };
		})
	);
};

export const getSegmentFieldWarnings = (
	row: TourDaySegmentFormRow | null,
	existing: TourDaySegmentFormRow[]
): TourDaySegmentFieldWarnings => {
	if (!row) return {};

	const others = existing.filter((segment) => segment.id !== row.id);
	const sameDay = others.filter((segment) => segment.dayNumber === row.dayNumber);
	const orderMatch = row.dayNumber > 0
		? sameDay.find((segment) => (segment.segmentOrder || 1) === (row.segmentOrder || 1))
		: undefined;
	const tourMatch = row.tourSpotId
		? sameDay.find((segment) => segment.tourSpotId === row.tourSpotId)
		: undefined;
	const activityMatch = row.activitySpotId
		? sameDay.find((segment) => segment.activitySpotId === row.activitySpotId)
		: undefined;

	return {
		dayNumber: orderMatch
			? `Day ${row.dayNumber} already has a stop with this order.`
			: undefined,
		tourSpot: tourMatch
			? `This tour spot is already used on Day ${row.dayNumber}.`
			: undefined,
		activitySpot: activityMatch
			? `This activity is already used on Day ${row.dayNumber}.`
			: undefined,
	};
};

export const buildSampleDescriptions = ({
	dayNumber,
	tourSpot,
	activity,
	transport,
	hotelType,
	hotelName,
}: {
	dayNumber: number;
	tourSpot: string;
	activity: string;
	transport: string;
	hotelType: string;
	hotelName: string;
}) => {
	const day = dayNumber || 1;
	const spot = tourSpot || "your chosen destination";
	const activityBit = activity
		? ` The day also includes ${activity}, a lively pause in the itinerary.`
		: "";
	const travelBit = transport ? ` Travel is arranged by ${transport.toLowerCase()}.` : "";
	const stayBit = hotelName
		? ` Overnight stay is at ${hotelName}${hotelType ? `, a ${hotelType.toLowerCase()} property` : ""}.`
		: hotelType
			? ` Overnight is planned at a ${hotelType.toLowerCase()} hotel.`
			: "";

	return [
		`Day ${day} unfolds at ${spot}.${activityBit}${travelBit}${stayBit} A balanced mix of exploration and rest, paced for an unhurried Bangladesh journey.`,
		`Begin Day ${day} in ${spot}${activity ? `, then enjoy ${activity}` : ""}.${travelBit}${stayBit} Expect scenic views, local flavour, and a thoughtfully planned evening.`,
		`On Day ${day}, ${spot} takes centre stage.${activityBit}${travelBit}${stayBit} This chapter of the tour is designed to feel elegant, unhurried, and memorable.`,
	];
};
