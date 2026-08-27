"use client";

import React, { useEffect, useState } from "react";
import { FaBed, FaBus, FaCheck, FaChevronDown, FaChevronUp, FaEdit, FaHiking, FaMapMarkerAlt, FaRegStickyNote } from "react-icons/fa";
import { HotelType, TransportServiceType } from "@/types/enums";
import { CustomSelectInput, CustomTextAreaInput } from "@/components/custom-elements/CustomInputElements";
import { MONEY_TEXT_CLASS, READABLE_BODY_STYLE, READABLE_MUTED_STYLE, READABLE_NOTE_STYLE, READABLE_SURFACE_STYLE } from "./constants";
import { HotelRatingBadge, HotelSelectWithRating, SpotSelectWithCost, useMatchingHotels } from "./HotelPicker";
import { ghostButtonStyle } from "./PackageFormStepHeader";
import { NameWithCost, StopInfoFact, StopInfoLabel } from "./StopInfoFact";
import type { SelectOption, SpotOption, TourDaySegmentFieldWarnings, TourDaySegmentFormRow } from "./types";
import { formatTaka, getSpotCost, getStopTotal, optionLabel, resolveHotelStayPrice, toTitle } from "./utils";

export const TourDaySegmentRow = ({
	row,
	onChange,
	warnings,
	tourSpotOptions,
	activitySpotOptions,
	transportOptions,
	hotelOptions,
	showHotel = true,
	stopLabel,
	canMoveUp = false,
	canMoveDown = false,
	onMoveWithinDay,
}: {
	row: TourDaySegmentFormRow;
	onChange: (next: TourDaySegmentFormRow) => void;
	maxDayNumber?: number;
	warnings?: TourDaySegmentFieldWarnings;
	tourSpotOptions: SpotOption[];
	activitySpotOptions: SpotOption[];
	transportOptions: SelectOption[];
	hotelOptions: SelectOption[];
	showHotel?: boolean;
	stopLabel?: string;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
	onMoveWithinDay?: (direction: -1 | 1) => void;
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const { matchingHotels, isHotelsLoading, hotelPlaceholder, canFetchHotels } =
		useMatchingHotels(row, tourSpotOptions);

	const onChangeRef = React.useRef(onChange);
	const rowRef = React.useRef(row);
	onChangeRef.current = onChange;
	rowRef.current = row;

	useEffect(() => {
		const currentRow = rowRef.current;
		if (!currentRow.hotelId || !canFetchHotels || isHotelsLoading) return;
		if (!matchingHotels.some((hotel) => hotel.id === currentRow.hotelId)) {
			onChangeRef.current({ ...currentRow, hotelId: "", hotelCost: 0 });
		}
	}, [canFetchHotels, isHotelsLoading, matchingHotels]);

	const selectedHotel = matchingHotels.find((hotel) => hotel.id === row.hotelId);
	const activityCost = getSpotCost(activitySpotOptions, row.activitySpotId);
	const hotelStayPrice = showHotel ? resolveHotelStayPrice(selectedHotel, row.hotelOption) : null;
	const hotelCostReady = !showHotel || !row.hotelId || (!isHotelsLoading && Boolean(selectedHotel));
	const hotelCost = hotelStayPrice?.price ?? 0;

	useEffect(() => {
		const currentRow = rowRef.current;
		const nextHotelCost = hotelCostReady ? hotelCost : (currentRow.hotelCost || 0);
		if ((currentRow.activityCost || 0) === activityCost && (currentRow.hotelCost || 0) === nextHotelCost) {
			return;
		}
		onChangeRef.current({
			...currentRow,
			activityCost,
			hotelCost: nextHotelCost,
		});
	}, [activityCost, hotelCost, hotelCostReady]);

	const tourSpotLabel = row.tourSpotId ? optionLabel(tourSpotOptions, row.tourSpotId) : "";
	const activityLabel = row.activitySpotId ? optionLabel(activitySpotOptions, row.activitySpotId) : "";
	const transportLabel = row.transportOption
		? optionLabel(transportOptions, row.transportOption) || toTitle(row.transportOption)
		: "";
	const hotelTypeLabel = row.hotelOption
		? optionLabel(hotelOptions, row.hotelOption) || toTitle(row.hotelOption)
		: "";
	const hotelValue = selectedHotel?.name || hotelTypeLabel;
	const stopTotal = getStopTotal({
		activityCost,
		hotelCost: hotelCostReady ? hotelCost : (row.hotelCost || 0),
	});

	const iconButtonClass =
		"inline-flex h-8 w-8 items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-30";
	const compactFieldClass = "w-full text-sm";

	return (
		<div className="w-full max-w-full min-w-0 overflow-x-hidden rounded-xl p-4" style={READABLE_SURFACE_STYLE}>
			<div className="mb-3 flex items-start justify-between gap-3">
				<span className="rounded-full px-2.5 py-0.5 text-xs font-semibold theme-outline-teal theme-text-teal">
					Day {row.dayNumber || "—"}{stopLabel ? ` · ${stopLabel}` : ""}
				</span>
				<div className="flex shrink-0 items-center gap-1">
					{onMoveWithinDay && (
						<>
							<button
								type="button"
								aria-label="Move stop earlier in the day"
								title="Move earlier"
								disabled={!canMoveUp}
								className={iconButtonClass}
								style={ghostButtonStyle}
								onClick={() => onMoveWithinDay(-1)}
							>
								<FaChevronUp className="h-3 w-3" />
							</button>
							<button
								type="button"
								aria-label="Move stop later in the day"
								title="Move later"
								disabled={!canMoveDown}
								className={iconButtonClass}
								style={ghostButtonStyle}
								onClick={() => onMoveWithinDay(1)}
							>
								<FaChevronDown className="h-3 w-3" />
							</button>
						</>
					)}
					<button
						type="button"
						aria-label={isEditing ? "Done editing stop" : "Edit stop"}
						className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium"
						style={ghostButtonStyle}
						onClick={() => setIsEditing((prev) => !prev)}
					>
						{isEditing ? (
							<>
								<FaCheck className="h-3 w-3" />
								Done
							</>
						) : (
							<>
								<FaEdit className="h-3 w-3" />
								Edit
							</>
						)}
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				{isEditing ? (
					<CustomTextAreaInput
						className="w-full min-h-[6rem] text-sm leading-relaxed"
						name="segmentShortDescription"
						placeholderText="Describe this stop"
						value={row.shortDescription}
						onChange={(e) =>
							onChange({
								...row,
								shortDescription: e.target.value,
							})
						}
					/>
				) : row.shortDescription.trim() ? (
					<p className="min-h-[6rem] text-sm leading-relaxed" style={READABLE_BODY_STYLE}>
						{row.shortDescription}
					</p>
				) : (
					<p className="min-h-[6rem] text-sm italic" style={READABLE_MUTED_STYLE}>No description yet.</p>
				)}

				<div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
					<StopInfoFact
						icon={<FaMapMarkerAlt className="h-3 w-3" />}
						label="Tour spot"
						value={tourSpotLabel}
						warning={warnings?.tourSpot}
					>
						{isEditing ? (
							<CustomSelectInput
								className={compactFieldClass}
								name="tourSpotId"
								value={row.tourSpotId}
								onChange={(e) => {
									onChange({
										...row,
										tourSpotId: e.target.value as string | "",
										hotelId: "",
										hotelCost: 0,
									});
								}}
								options={tourSpotOptions.length > 0 ? tourSpotOptions : [{ label: "N/A", value: "" }]}
							/>
						) : null}
					</StopInfoFact>

					<StopInfoFact
						icon={<FaHiking className="h-3 w-3" />}
						label="Activities"
						value={activityLabel}
						cost={row.activitySpotId ? activityCost : null}
						warning={warnings?.activitySpot}
					>
						{isEditing ? (
							<SpotSelectWithCost
								hideLabel
								className={compactFieldClass}
								label="Activities"
								placeholder="-- Select activities --"
								value={row.activitySpotId}
								options={activitySpotOptions}
								onChange={(activitySpotId) =>
									onChange({
										...row,
										activitySpotId,
									})
								}
							/>
						) : null}
					</StopInfoFact>

					<StopInfoFact
						icon={<FaBus className="h-3 w-3" />}
						label="Transport"
						value={transportLabel}
					>
						{isEditing ? (
							<CustomSelectInput
								className={compactFieldClass}
								name="transportOption"
								value={row.transportOption}
								onChange={(e) =>
									onChange({
										...row,
										transportOption: e.target.value as TransportServiceType | "",
									})
								}
								options={transportOptions}
							/>
						) : null}
					</StopInfoFact>

					{showHotel && (
						<StopInfoFact
							icon={<FaBed className="h-3 w-3" />}
							label="Overnight stay"
							value={hotelValue}
							cost={selectedHotel ? hotelCost : null}
						>
							{isEditing ? (
								<div className="flex flex-col gap-2">
									<CustomSelectInput
										className={compactFieldClass}
										name="hotelOption"
										value={row.hotelOption}
										onChange={(e) =>
											onChange({
												...row,
												hotelOption: e.target.value as HotelType | "",
												hotelId: "",
												hotelCost: 0,
											})
										}
										options={hotelOptions}
									/>
									{row.hotelOption ? (
										<HotelSelectWithRating
											hideLabel
											className="w-full"
											value={row.hotelId}
											hotels={matchingHotels}
											placeholder={hotelPlaceholder}
											hotelType={row.hotelOption}
											onChange={(hotelId) => onChange({ ...row, hotelId })}
										/>
									) : null}
								</div>
							) : selectedHotel ? (
								<div>
									<NameWithCost name={selectedHotel.name} cost={hotelCost} />
									<p className="mt-0.5 flex items-center justify-between gap-2 text-xs" style={READABLE_MUTED_STYLE}>
										<span>{hotelTypeLabel}{hotelStayPrice ? ` · ${toTitle(hotelStayPrice.roomType)}` : ""}</span>
										<HotelRatingBadge rating={selectedHotel.rating} />
									</p>
								</div>
							) : null}
						</StopInfoFact>
					)}
				</div>

				{(row.activitySpotId || (showHotel && Boolean(selectedHotel))) ? (
					<div className="flex items-baseline justify-between gap-2 rounded-lg px-3 py-2" style={READABLE_NOTE_STYLE}>
						<p className="text-xs font-semibold uppercase tracking-wide" style={READABLE_MUTED_STYLE}>
							Stop total
						</p>
						<p className={`text-sm ${MONEY_TEXT_CLASS}`}>{formatTaka(stopTotal)}</p>
					</div>
				) : null}

				{(isEditing || row.notes.trim()) ? (
					<div>
						<StopInfoLabel
							icon={<FaRegStickyNote className="h-3 w-3" />}
							label="Notes"
						/>
						{isEditing ? (
							<div className="mt-1">
								<CustomTextAreaInput
									className="w-full min-h-[4.5rem] text-sm leading-relaxed"
									name="notes"
									placeholderText="Optional notes for this stop"
									value={row.notes}
									onChange={(e) => onChange({ ...row, notes: e.target.value })}
								/>
							</div>
						) : (
							<p
								className="mt-0.5 rounded-xl px-3 py-2.5 text-sm leading-relaxed"
								style={READABLE_NOTE_STYLE}
							>
								{row.notes}
							</p>
						)}
					</div>
				) : null}
			</div>
		</div>
	);
};
