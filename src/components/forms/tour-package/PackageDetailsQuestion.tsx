"use client";

import React from "react";
import { READABLE_BODY_STYLE, READABLE_MUTED_STYLE, READABLE_SURFACE_STYLE } from "./constants";

export const PackageDetailsQuestion = ({
	number,
	title,
	hint,
	children,
	extra,
}: {
	number: number;
	title: string;
	hint?: string;
	children: React.ReactNode;
	extra?: React.ReactNode;
}) => (
	<div role="listitem" className="rounded-2xl px-3 py-3 sm:px-4 sm:py-4" style={READABLE_SURFACE_STYLE}>
		<div className="flex gap-3 sm:gap-4">
			<span
				className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold theme-btn-teal"
				aria-hidden
			>
				{number}
			</span>
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div>
					<p className="text-base font-semibold leading-snug" style={READABLE_BODY_STYLE}>
						{title}
					</p>
					{hint ? (
						<p className="mt-0.5 text-sm leading-snug" style={READABLE_MUTED_STYLE}>
							{hint}
						</p>
					) : null}
				</div>
				<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
					<div className="min-w-0 flex-1">{children}</div>
					{extra ? <div className="shrink-0">{extra}</div> : null}
				</div>
			</div>
		</div>
	</div>
);

export const DivisionSpotCountBadges = ({
	tourSpotCount,
	activitySpotCount,
}: {
	tourSpotCount: number;
	activitySpotCount: number;
}) => (
	<div className="flex flex-wrap items-center gap-2" aria-live="polite">
		<span
			className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
			style={READABLE_SURFACE_STYLE}
		>
			{tourSpotCount} tour spot{tourSpotCount === 1 ? "" : "s"}
		</span>
		<span
			className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
			style={READABLE_SURFACE_STYLE}
		>
			{activitySpotCount} activity spot{activitySpotCount === 1 ? "" : "s"}
		</span>
	</div>
);
