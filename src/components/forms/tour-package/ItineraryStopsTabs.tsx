"use client";

import React from "react";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { 
	MONEY_TEXT_CLASS, 
	READABLE_MUTED_STYLE, 
	READABLE_SURFACE_STYLE, 
	SECTION_FOCUS_TITLE_CLASS, 
	MAX_STOPS_PER_DAY
} from "./constants";
import { ghostButtonStyle } from "./PackageFormStepHeader";
import type { TourDaySegmentFormRow } from "./types";
import { formatTaka } from "./utils";

const TabButton = ({
	selected,
	onClick,
	icon,
	label,
	compact = false,
}: {
	selected: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	compact?: boolean;
}) => (
	<button
		type="button"
		role="tab"
		aria-selected={selected}
		onClick={onClick}
		className={`inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition-all ${
			compact
				? "h-8 w-[6.25rem] rounded-md px-2 text-xs"
				: "h-9 w-[6.75rem] rounded-lg px-2 text-xs md:text-sm"
		} ${selected ? "theme-btn-teal" : "theme-text-muted"}`}
		style={selected ? undefined : ghostButtonStyle}
	>
		<span className="shrink-0" aria-hidden="true">
			{icon}
		</span>
		<span className="truncate">{label}</span>
	</button>
);

export const ItineraryStopsTabs = ({
	stopsByDay,
	activeDayNumber,
	activeStopId,
	onSelectDay,
	onSelectStop,
	onAddToActiveDay,
	onReset,
	totalStopCount,
	duration = 0,
	daysMissingStops = [],
	packageTotal = 0,
	estimatedBudget = 0,
	children,
}: {
	stopsByDay: Array<[number, TourDaySegmentFormRow[]]>;
	activeDayNumber: number | null;
	activeStopId: string | null;
	onSelectDay: (dayNumber: number) => void;
	onSelectStop: (stopId: string) => void;
	onAddToActiveDay: () => void;
	onReset: () => void;
	totalStopCount: number;
	duration?: number;
	daysMissingStops?: number[];
	packageTotal?: number;
	estimatedBudget?: number;
	children: (row: TourDaySegmentFormRow, stopIndex: number, stops: TourDaySegmentFormRow[]) => React.ReactNode;
}) => {
	const activeDayStops =
		stopsByDay.find(([dayNumber]) => dayNumber === activeDayNumber)?.[1] || [];
	const activeRow =
		activeDayStops.find((stop) => stop.id === activeStopId) || activeDayStops[0] || null;
	const activeStopIndex = activeRow
		? activeDayStops.findIndex((stop) => stop.id === activeRow.id)
		: -1;
	const canAddToActiveDay =
		activeDayNumber !== null && activeDayStops.length < MAX_STOPS_PER_DAY;

	return (
		<div className="flex w-full min-w-0 flex-col gap-4">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className={SECTION_FOCUS_TITLE_CLASS}>
						{`Each day is a tab, with up to ${MAX_STOPS_PER_DAY} stops inside.`} 
					</p>
					<p className="mt-1 text-sm leading-relaxed" style={READABLE_MUTED_STYLE}>
						{daysMissingStops.length > 0
							? `Still need a stop on Day ${daysMissingStops.join(", Day ")}.`
							: `Use the arrows to reorder a day’s stops.`}
					</p>
					{totalStopCount > 0 ? (
						<div className="mt-3 space-y-1 md:mt-4">
							<p className="text-xl md:text-2xl">
								<span className="theme-label">Current cost</span>{" "}
								<span className={MONEY_TEXT_CLASS}>{formatTaka(packageTotal)}</span>
							</p>
							{estimatedBudget > 0 ? (
								<p className="text-sm" style={READABLE_MUTED_STYLE}>
									Estimated budget{" "}
									<span className={MONEY_TEXT_CLASS}>{formatTaka(estimatedBudget)}</span>
									{packageTotal > estimatedBudget ? (
										<span className="ml-1 font-semibold" style={{ color: "#DC2626" }}>
											· over budget
										</span>
									) : null}
								</p>
							) : null}
						</div>
					) : null}
				</div>
				<button
					type="button"
					className="rounded-md px-3 py-1.5 text-sm font-medium"
					style={ghostButtonStyle}
					onClick={onReset}
				>
					Reset
				</button>
			</div>

			{stopsByDay.length === 0 ? (
				<p
					className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
					style={READABLE_SURFACE_STYLE}
				>
					No stops yet. Add the first one below.
				</p>
			) : (
				<div className="overflow-hidden rounded-xl" style={READABLE_SURFACE_STYLE}>
					<div
						className="flex flex-wrap justify-start gap-1.5 p-2 md:p-3"
						style={{
							borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
							backgroundColor: "#F9FAFB",
						}}
						role="tablist"
						aria-label="Tour days"
					>
						{stopsByDay.map(([dayNumber]) => (
							<TabButton
								key={`day-tab-${dayNumber}`}
								selected={dayNumber === activeDayNumber}
								onClick={() => onSelectDay(dayNumber)}
								icon={<FaCalendarAlt className="h-3 w-3" />}
								label={`Day ${dayNumber}`}
							/>
						))}
					</div>

					<div className="p-3 md:p-5" role="tabpanel">
						<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
							<h4 className="text-sm font-semibold md:text-base" style={{ color: "#111827" }}>
								Day {activeDayNumber} · {activeDayStops.length} of {MAX_STOPS_PER_DAY} stops
							</h4>
							<button
								type="button"
								className="rounded-md px-2.5 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
								style={ghostButtonStyle}
								disabled={!canAddToActiveDay}
								onClick={onAddToActiveDay}
							>
								{canAddToActiveDay
									? `Add stop to Day ${activeDayNumber}`
									: `Day ${activeDayNumber} is full`}
							</button>
						</div>

						{activeDayStops.length > 0 && (
							<div
								className="mb-4 flex flex-wrap justify-start gap-1.5 rounded-lg p-1.5"
								style={{
									backgroundColor: "#F9FAFB",
									border: "1px solid rgba(0, 0, 0, 0.10)",
								}}
								role="tablist"
								aria-label={`Stops for day ${activeDayNumber}`}
							>
								{activeDayStops.map((stop, stopIndex) => (
									<TabButton
										key={stop.id}
										compact
										selected={stop.id === (activeRow?.id || null)}
										onClick={() => onSelectStop(stop.id)}
										icon={<FaMapMarkerAlt className="h-3 w-3" />}
										label={`Stop ${stop.segmentOrder || stopIndex + 1}`}
									/>
								))}
							</div>
						)}

						{activeRow && activeStopIndex >= 0
							? children(activeRow, activeStopIndex, activeDayStops)
							: null}
					</div>
				</div>
			)}
		</div>
	);
};
