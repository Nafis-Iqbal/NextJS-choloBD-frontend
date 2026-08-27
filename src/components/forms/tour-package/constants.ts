import type { CSSProperties } from "react";
import type { TourDaySegmentFormRow, SelectOption } from "./types";

export const TOUR_FORM_CONTROL_CLASS = "w-full md:max-w-md";

export const DETAILS_INPUT_CLASS = "w-full md:max-w-[200px]";

export const DETAILS_TEXTAREA_CLASS = "w-full md:h-24 md:max-w-xl";

export const MAX_STOPS_PER_DAY = 4;

export const FIELD_LABEL_CLASS = "theme-label text-[11px] uppercase tracking-wide";

/** Price amounts should stand out from teal chrome. */
export const MONEY_TEXT_CLASS = "text-green-500 font-semibold";

export const SECTION_FOCUS_TITLE_CLASS = "theme-text-teal text-lg font-semibold leading-snug md:text-xl";

export const READABLE_SURFACE_CLASS = "rounded-2xl";
export const READABLE_SURFACE_STYLE: CSSProperties = {
	backgroundColor: "#FFFFFF",
	color: "#1F2937",
	boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",
	border: "1px solid rgba(0, 0, 0, 0.12)",
};
export const READABLE_BODY_STYLE: CSSProperties = { color: "#1F2937" };
export const READABLE_MUTED_STYLE: CSSProperties = { color: "#4B5563" };
export const READABLE_NOTE_STYLE: CSSProperties = {
	backgroundColor: "#F9FAFB",
	color: "#374151",
	boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
	border: "1px solid rgba(0, 0, 0, 0.10)",
};

export const PACKAGE_FORM_STEPS = [
	{ id: "details", label: "Package details" },
	{ id: "segments", label: "Itinerary" },
	{ id: "photos", label: "Photos" },
] as const;

export const MIN_RATING_OPTIONS: SelectOption[] = [
	{ label: "Any rating", value: "" },
	{ label: "1+ stars", value: "1" },
	{ label: "2+ stars", value: "2" },
	{ label: "3+ stars", value: "3" },
	{ label: "4+ stars", value: "4" },
	{ label: "5 stars", value: "5" },
];

export const EMPTY_SEGMENT_ROW: TourDaySegmentFormRow = {
	id: "",
	dayNumber: 0,
	segmentOrder: 1,
	shortDescription: "",
	tourSpotId: "",
	activitySpotId: "",
	transportOption: "",
	hotelOption: "",
	hotelId: "",
	activityCost: 0,
	hotelCost: 0,
	notes: "",
};

export const SEGMENT_WIZARD_STEPS = [
	{
		id: "day",
		shortLabel: "Day",
		title: "Which day is this stop for?",
		hint: "You can add up to 4 stops on the same day. They are ordered in the sequence you add them — reorder later with the arrows on each stop.",
	},
	{
		id: "tourSpot",
		shortLabel: "Tour spot",
		title: "Which tour spot will you visit?",
		hint: "Pick the tour spot for this stop.",
	},
	{
		id: "activities",
		shortLabel: "Activities",
		title: "Which activities do you want to include?",
		hint: "Optional — skip this if there is no activity for this stop.",
	},
	{
		id: "transport",
		shortLabel: "Transport",
		title: "How will they get around?",
		hint: "Optional — skip this if you do not want to recommend transport yet.",
	},
	{
		id: "stay",
		shortLabel: "Stay",
		title: "Where will they stay tonight?",
		hint: "Overnight hotel is stored once per day, on the last stop of that day.",
	},
	{
		id: "details",
		shortLabel: "Details",
		title: "How would you describe this stop?",
		hint: "A short description is required. Extra notes are optional.",
	},
] as const;

export const SAMPLE_DAY_NOTES = [
	"Carry light clothing, sunscreen, and extra drinking water for this day.",
	"Confirm pickup time with the driver the evening before departure.",
	"Keep some cash handy for local snacks, tips, and small entrance fees.",
	"Pack a power bank and store valuables in the hotel locker if available.",
	"Allow extra buffer time in case of traffic, weather, or ferry delays.",
];
