"use client";

import React from "react";
import { FaCalendarAlt, FaClipboardList, FaMapMarkerAlt, FaTag } from "react-icons/fa";
import { MONEY_TEXT_CLASS, READABLE_BODY_STYLE, READABLE_MUTED_STYLE, READABLE_NOTE_STYLE, SECTION_FOCUS_TITLE_CLASS } from "./constants";
import { StopInfoFact } from "./StopInfoFact";
import { formatTaka } from "./utils";

export const PackageReviewSummary = ({
	packageName,
	duration,
	tourSpotNames,
	totalBudget,
	estimatedBudget,
}: {
	packageName: string;
	duration: number;
	tourSpotNames: string[];
	totalBudget: number;
	estimatedBudget?: number;
}) => {
	const daysLabel = duration > 0
		? `${duration} day${duration === 1 ? "" : "s"}`
		: "Not selected";
	const overBudget = Boolean(estimatedBudget && estimatedBudget > 0 && totalBudget > estimatedBudget);

	return (
		<section className="rounded-2xl p-4" style={READABLE_NOTE_STYLE} aria-label="Package summary">
			<p className={SECTION_FOCUS_TITLE_CLASS}>Package summary</p>
			<p className="mt-1 text-sm leading-relaxed" style={READABLE_MUTED_STYLE}>
				Review the package before adding cover photos. Current cost is the live sum of activity and hotel prices. Estimated budget is the cap you set on the details step.
			</p>
			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<StopInfoFact
					icon={<FaClipboardList className="h-3 w-3" />}
					label="Package name"
					value={packageName}
				/>
				<StopInfoFact
					icon={<FaCalendarAlt className="h-3 w-3" />}
					label="Duration"
					value={daysLabel}
				/>
				<div className="sm:col-span-2">
					<StopInfoFact
						icon={<FaMapMarkerAlt className="h-3 w-3" />}
						label="Tour spots to visit"
					>
						{tourSpotNames.length > 0 ? (
							<ol className="list-decimal space-y-0.5 pl-4 text-sm leading-snug" style={READABLE_BODY_STYLE}>
								{tourSpotNames.map((name, index) => (
									<li key={`${name}-${index}`}>{name}</li>
								))}
							</ol>
						) : (
							<p className="text-sm leading-snug" style={READABLE_BODY_STYLE}>
								Not selected
							</p>
						)}
					</StopInfoFact>
				</div>
				<StopInfoFact
					icon={<FaTag className="h-3 w-3" />}
					label="Current itinerary cost"
				>
					<p className={`mt-0.5 text-sm ${MONEY_TEXT_CLASS}`}>
						{totalBudget > 0 ? formatTaka(totalBudget) : "Not set"}
					</p>
				</StopInfoFact>
				<StopInfoFact
					icon={<FaTag className="h-3 w-3" />}
					label="Estimated budget"
				>
					<div className="mt-0.5">
						<p className={`text-sm ${MONEY_TEXT_CLASS}`}>
							{estimatedBudget && estimatedBudget > 0 ? formatTaka(estimatedBudget) : "Not set"}
						</p>
						{overBudget ? (
							<p className="mt-0.5 text-xs font-semibold" style={{ color: "#DC2626" }}>
								Itinerary is over the estimated budget.
							</p>
						) : null}
					</div>
				</StopInfoFact>
			</div>
		</section>
	);
};
