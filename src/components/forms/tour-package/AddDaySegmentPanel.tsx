/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HotelType, TransportServiceType } from "@/types/enums";
import { CustomSelectInput, CustomTextInput, CustomTextAreaInput, CustomCheckboxInput, FieldHelpInfo } from "@/components/custom-elements/CustomInputElements";
import { SampleFillButton } from "@/components/custom-elements/UIUtilities";
import { EMPTY_SEGMENT_ROW, MAX_STOPS_PER_DAY, MIN_RATING_OPTIONS, MONEY_TEXT_CLASS, READABLE_BODY_STYLE, READABLE_MUTED_STYLE, READABLE_SURFACE_STYLE, SAMPLE_DAY_NOTES, SEGMENT_WIZARD_STEPS, TOUR_FORM_CONTROL_CLASS } from "./constants";
import { HotelSelectWithRating, SpotSelectWithCost, useMatchingHotels } from "./HotelPicker";
import { ghostButtonStyle } from "./PackageFormStepHeader";
import type { SelectOption, SpotOption, TourDaySegmentFieldWarnings, TourDaySegmentFormRow } from "./types";
import { buildSampleDescriptions, clampDayNumber, displayOrDash, filterSpotOptions, formatTaka, getOverBudgetReason, getSpotCost, getStopTotal, optionLabel, resolveHotelStayPrice, toTitle } from "./utils";

const AssetFilterBar = ({
	name,
	onNameChange,
	namePlaceholder,
	minRating,
	onMinRatingChange,
	onClear,
	isActive,
	extra,
}: {
	name: string;
	onNameChange: (value: string) => void;
	namePlaceholder: string;
	minRating: string;
	onMinRatingChange: (value: string) => void;
	onClear: () => void;
	isActive: boolean;
	extra?: React.ReactNode;
}) => (
	<div className="mb-3 w-full rounded-lg p-2 sm:p-2.5 text-sm" style={READABLE_SURFACE_STYLE}>
		<div className="mb-2 flex items-center justify-between gap-2">
			<span className="text-sm font-semibold" style={READABLE_BODY_STYLE}>
				Filters
			</span>
			<button
				type="button"
				onClick={onClear}
				disabled={!isActive}
				className="rounded-md px-2.5 py-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
				style={ghostButtonStyle}
			>
				Clear filters
			</button>
		</div>
		<div className="flex flex-wrap items-end gap-2">
			<div className="min-w-[10rem] flex-1 basis-[10rem]">
				<CustomTextInput
					className="w-full text-sm"
					label="Search by name"
					labelStyle="text-sm"
					name="assetNameSearch"
					placeholderText={namePlaceholder}
					value={name}
					onChange={(e) => onNameChange(e.target.value)}
				/>
			</div>
			<div className="min-w-[8.5rem] flex-1 basis-[8.5rem]">
				<CustomSelectInput
					className="w-full text-sm"
					label="Minimum rating"
					labelStyle="text-sm"
					name="assetMinRating"
					value={minRating}
					onChange={(e) => onMinRatingChange(e.target.value)}
					options={MIN_RATING_OPTIONS}
				/>
			</div>
			{extra ? (
				<div className="flex min-w-[11rem] flex-1 basis-[11rem] items-end pb-0.5 text-sm">
					{extra}
				</div>
			) : null}
		</div>
	</div>
);

const EmptyAssetNotice = ({ message }: { message: string }) => (
	<p className={`${TOUR_FORM_CONTROL_CLASS} rounded-md px-3 py-2.5 text-sm`} style={READABLE_SURFACE_STYLE}>
		{message}
	</p>
);

export const AddDaySegmentPanel = ({
	draftSegment,
	duration,
	canAddDraft,
	warnings,
	existingStopCount = 0,
	maxStopsPerDay = MAX_STOPS_PER_DAY,
	onAdd,
	onChangeDraft,
	tourSpotOptions,
	activitySpotOptions,
	transportOptions,
	hotelOptions,
	estimatedBudget = 0,
	itineraryTotal = 0,
}: {
	draftSegment: TourDaySegmentFormRow | null;
	duration: number;
	canAddDraft: boolean;
	warnings?: TourDaySegmentFieldWarnings;
	existingStopCount?: number;
	maxStopsPerDay?: number;
	onAdd: () => void;
	onChangeDraft: (next: TourDaySegmentFormRow) => void;
	tourSpotOptions: SpotOption[];
	activitySpotOptions: SpotOption[];
	transportOptions: SelectOption[];
	hotelOptions: SelectOption[];
	estimatedBudget?: number;
	itineraryTotal?: number;
}) => {
	const [stepIndex, setStepIndex] = useState(0);
	const [highestStepReached, setHighestStepReached] = useState(0);
	const [tourSpotNameQuery, setTourSpotNameQuery] = useState("");
	const [tourSpotMinRating, setTourSpotMinRating] = useState("");
	const [activityNameQuery, setActivityNameQuery] = useState("");
	const [activityMinRating, setActivityMinRating] = useState("");
	const [hotelNameInput, setHotelNameInput] = useState("");
	const [hotelNameQuery, setHotelNameQuery] = useState("");
	const [hotelMinRating, setHotelMinRating] = useState("");
	const [hotelShiftMode, setHotelShiftMode] = useState(false);
	const descriptionSampleIndex = useRef(0);
	const notesSampleIndex = useRef(0);
	const lastStepIndex = SEGMENT_WIZARD_STEPS.length - 1;
	const currentStep = SEGMENT_WIZARD_STEPS[stepIndex];
	const row = draftSegment ?? EMPTY_SEGMENT_ROW;

	useEffect(() => {
		const timer = window.setTimeout(() => setHotelNameQuery(hotelNameInput), 300);
		return () => window.clearTimeout(timer);
	}, [hotelNameInput]);

	const { matchingHotels, isHotelsLoading, hotelPlaceholder, canFetchHotels } =
		useMatchingHotels(row, tourSpotOptions, {
			name: hotelNameQuery,
			minRating: hotelMinRating,
			allowShiftBooking: hotelShiftMode,
		});

	const onChangeRef = useRef(onChangeDraft);
	const rowRef = useRef(row);
	onChangeRef.current = onChangeDraft;
	rowRef.current = row;

	useEffect(() => {
		setStepIndex(0);
		setHighestStepReached(0);
		descriptionSampleIndex.current = 0;
		notesSampleIndex.current = 0;
		setTourSpotNameQuery("");
		setTourSpotMinRating("");
		setActivityNameQuery("");
		setActivityMinRating("");
		setHotelNameInput("");
		setHotelNameQuery("");
		setHotelMinRating("");
		setHotelShiftMode(false);
	}, [draftSegment?.id]);

	useEffect(() => {
		const currentRow = rowRef.current;
		if (!currentRow.hotelId || !canFetchHotels || isHotelsLoading) return;
		if (!matchingHotels.some((hotel) => hotel.id === currentRow.hotelId)) {
			onChangeRef.current({ ...currentRow, hotelId: "", hotelCost: 0 });
		}
	}, [canFetchHotels, isHotelsLoading, matchingHotels]);

	const selectedHotel = matchingHotels.find((hotel) => hotel.id === row.hotelId);
	const activityCost = getSpotCost(activitySpotOptions, row.activitySpotId);
	const hotelStayPrice = resolveHotelStayPrice(selectedHotel, row.hotelOption);
	const hotelCostReady = !row.hotelId || (!isHotelsLoading && Boolean(selectedHotel));
	const hotelCost = hotelStayPrice?.price ?? 0;

	useEffect(() => {
		if (!draftSegment) return;
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
	}, [activityCost, hotelCost, hotelCostReady, draftSegment]);

	const nextStopOrder = existingStopCount + 1;
	const isSelectedDayFull = row.dayNumber >= 1 && existingStopCount >= maxStopsPerDay;

	const canContinueFromStep = (index: number) => {
		if (!draftSegment) return false;
		if (index === 0) {
			return draftSegment.dayNumber >= 1 && !warnings?.dayNumber && !isSelectedDayFull;
		}
		if (index === 1) return draftSegment.tourSpotId.trim() !== "";
		if (index === lastStepIndex) return canAddDraft;
		return true;
	};

	const goToStep = (index: number) => {
		if (index < 0 || index > lastStepIndex) return;
		if (index > highestStepReached) return;
		for (let previous = 0; previous < index; previous += 1) {
			if (!canContinueFromStep(previous)) return;
		}
		setStepIndex(index);
	};

	const goNext = () => {
		if (!canContinueFromStep(stepIndex) || stepIndex >= lastStepIndex) return;
		const nextIndex = stepIndex + 1;
		setStepIndex(nextIndex);
		setHighestStepReached((prev) => Math.max(prev, nextIndex));
	};

	const tourSpotName = optionLabel(tourSpotOptions, row.tourSpotId);
	const activityName = optionLabel(activitySpotOptions, row.activitySpotId);
	const transportName = row.transportOption ? toTitle(row.transportOption) : "";
	const hotelTypeName = row.hotelOption ? toTitle(row.hotelOption) : "";
	const hotelName = selectedHotel?.name || "";
	const stopTotal = getStopTotal({
		activityCost,
		hotelCost: hotelCostReady ? hotelCost : (row.hotelCost || 0),
	});
	const projectedPackageTotal = itineraryTotal + stopTotal;
	const overBudgetReason = getOverBudgetReason(projectedPackageTotal, estimatedBudget);
	const selectedTourSpotLocationId =
		tourSpotOptions.find((option) => option.value === row.tourSpotId)?.locationId || "";

	const selectableTourSpots = tourSpotOptions.filter((option) => option.value);
	const filteredTourSpots = filterSpotOptions(tourSpotOptions, {
		name: tourSpotNameQuery,
		minRating: tourSpotMinRating,
		selectedValue: row.tourSpotId,
	});
	const hasTourSpotFilters = Boolean(tourSpotNameQuery.trim() || tourSpotMinRating);

	const selectableActivities = activitySpotOptions.filter(
		(option) => option.value && (!selectedTourSpotLocationId || option.locationId === selectedTourSpotLocationId)
	);
	const filteredActivities = filterSpotOptions(activitySpotOptions, {
		name: activityNameQuery,
		minRating: activityMinRating,
		locationId: selectedTourSpotLocationId,
		selectedValue: row.activitySpotId,
	});
	const hasActivityFilters = Boolean(activityNameQuery.trim() || activityMinRating);
	const hasHotelFilters = Boolean(hotelNameQuery.trim() || hotelMinRating || hotelShiftMode);

	const fillSampleDescription = () => {
		const samples = buildSampleDescriptions({
			dayNumber: row.dayNumber,
			tourSpot: tourSpotName,
			activity: activityName,
			transport: transportName,
			hotelType: hotelTypeName,
			hotelName,
		});
		const next = samples[descriptionSampleIndex.current % samples.length];
		descriptionSampleIndex.current += 1;
		onChangeDraft({ ...row, shortDescription: next });
	};

	const fillSampleNotes = () => {
		const next = SAMPLE_DAY_NOTES[notesSampleIndex.current % SAMPLE_DAY_NOTES.length];
		notesSampleIndex.current += 1;
		onChangeDraft({ ...row, notes: next });
	};

	const reviewItems = [
		{ label: "Day", value: row.dayNumber ? `Day ${row.dayNumber}` : "" },
		{ label: "Tour spot", value: tourSpotName },
		{ label: "Activities", value: activityName, cost: row.activitySpotId ? activityCost : undefined },
		{ label: "Transport", value: transportName },
		{ label: "Hotel type", value: hotelTypeName },
		{
			label: "Hotel",
			value: hotelStayPrice && hotelName
				? `${hotelName} · ${toTitle(hotelStayPrice.roomType)}`
				: hotelName,
			cost: hotelName ? hotelCost : undefined,
		},
		{ label: "Stop total", value: formatTaka(stopTotal) },
	];

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="w-full min-w-0 rounded-xl p-2 sm:p-3 md:p-5"
			style={READABLE_SURFACE_STYLE}
		>
			<div className="mb-0.5 text-xs font-semibold sm:text-sm md:text-base" style={READABLE_BODY_STYLE}>Add a stop</div>
			<p className="mb-2 text-[11px] leading-snug sm:mb-3 sm:text-sm" style={READABLE_MUTED_STYLE}>
				Answer one question at a time. Several stops can share the same day; overnight hotel sits on the last stop.
			</p>

			<AnimatePresence mode="wait" initial={false}>
			{!draftSegment ? (
				<motion.p
					key="draft-empty"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="overflow-hidden text-sm"
					style={READABLE_MUTED_STYLE}
				>
					Start adding segments by filling Day 1.
				</motion.p>
			) : (
				<motion.div
					key="draft-wizard"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className={currentStep.id === "stay" ? "overflow-visible" : "overflow-hidden"}
				>
					<div className="mb-2 flex flex-wrap gap-1 sm:mb-3 sm:gap-1.5 md:mb-4">
						{SEGMENT_WIZARD_STEPS.map((step, index) => {
							const isCurrent = index === stepIndex;
							const isReachable = index <= highestStepReached;
							return (
								<button
									key={step.id}
									type="button"
									disabled={!isReachable}
									onClick={() => goToStep(index)}
									className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium disabled:opacity-40 sm:px-2.5 sm:py-1 sm:text-xs ${
										isCurrent ? "theme-btn-teal" : ""
									}`}
									style={isCurrent ? { color: "white" } : ghostButtonStyle}
									aria-label={`Step ${index + 1}: ${step.title}`}
									aria-current={isCurrent ? "step" : undefined}
								>
									{index + 1}. {step.shortLabel}
								</button>
							);
						})}
					</div>

					<AnimatePresence mode="wait" initial={false}>
						<motion.div
							key={currentStep.id}
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className={currentStep.id === "stay" ? "overflow-visible" : "overflow-hidden"}
						>
							<p className="text-sm font-semibold leading-snug sm:text-base" style={READABLE_BODY_STYLE}>{currentStep.title}</p>
							<p className="mt-0.5 mb-2.5 text-[11px] leading-snug sm:mt-1 sm:mb-4 sm:text-sm" style={READABLE_MUTED_STYLE}>{currentStep.hint}</p>

							{stepIndex === 0 && (
								<div className="flex flex-col gap-3">
									<div className="flex items-end gap-2">
										<CustomTextInput
											className="w-28"
											label="Day number"
											name="dayNumber"
											type="number"
											placeholderText="1"
											value={String(row.dayNumber || "")}
											onChange={(e) => {
												const val = e.target.value;
												if (val === "") {
													onChangeDraft({ ...row, dayNumber: 0 });
													return;
												}
												const num = parseInt(val, 10);
												if (!isNaN(num)) {
													onChangeDraft({
														...row,
														dayNumber: clampDayNumber(num, duration),
													});
												}
											}}
										/>
										<AnimatePresence initial={false}>
										{warnings?.dayNumber && (
											<motion.span
												key="day-warning"
												initial={{ opacity: 0, scale: 0.85 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.85 }}
											>
												<FieldHelpInfo helpInfo={warnings.dayNumber} openOnHover />
											</motion.span>
										)}
										</AnimatePresence>
										<span className="pb-2 text-xs" style={READABLE_MUTED_STYLE}>
											Day 1–{duration || 1}
										</span>
									</div>
									{row.dayNumber >= 1 ? (
										isSelectedDayFull ? (
											<p className="rounded-lg px-3 py-2.5 text-sm" style={READABLE_SURFACE_STYLE}>
												Day {row.dayNumber} already has {maxStopsPerDay} stops. Choose another day.
											</p>
										) : (
											<div className="rounded-lg px-3 py-2.5" style={READABLE_SURFACE_STYLE}>
												<p className="text-xs font-semibold uppercase tracking-wide" style={READABLE_MUTED_STYLE}>
													Stop order
												</p>
												<p className="mt-1 text-sm" style={READABLE_BODY_STYLE}>
													This will be Stop {nextStopOrder} of Day {row.dayNumber}
												</p>
												<p className="mt-0.5 text-xs" style={READABLE_MUTED_STYLE}>
													{existingStopCount} of {maxStopsPerDay} stops already added on this day.
												</p>
											</div>
										)
									) : null}
								</div>
							)}

							{stepIndex === 1 && (
								<div className="relative">
									{selectableTourSpots.length === 0 ? (
										<EmptyAssetNotice message="No tour spots available for this division." />
									) : (
										<>
											<AssetFilterBar
												name={tourSpotNameQuery}
												onNameChange={setTourSpotNameQuery}
												namePlaceholder="Search tour spots"
												minRating={tourSpotMinRating}
												onMinRatingChange={setTourSpotMinRating}
												isActive={hasTourSpotFilters}
												onClear={() => {
													setTourSpotNameQuery("");
													setTourSpotMinRating("");
												}}
											/>
											{filteredTourSpots.length === 0 ? (
												<EmptyAssetNotice
													message={
														hasTourSpotFilters
															? "No tour spots match these filters."
															: "No tour spots available for this division."
													}
												/>
											) : (
												<CustomSelectInput
													className={TOUR_FORM_CONTROL_CLASS}
													label="Tour spot"
													name="tourSpotId"
													value={row.tourSpotId}
													onChange={(e) =>
														onChangeDraft({
															...row,
															tourSpotId: e.target.value as string | "",
															activitySpotId: "",
															activityCost: 0,
															hotelId: "",
															hotelCost: 0,
														})
													}
													options={[
														{ label: "-- Select a tour spot --", value: "", locationId: "" },
														...filteredTourSpots,
													]}
												/>
											)}
										</>
									)}
									<AnimatePresence initial={false}>
									{warnings?.tourSpot && (
										<motion.div
											key="tour-spot-warning"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="absolute right-0 top-0"
										>
											<FieldHelpInfo helpInfo={warnings.tourSpot} openOnHover />
										</motion.div>
									)}
									</AnimatePresence>
								</div>
							)}

							{stepIndex === 2 && (
								<div className="relative">
									{selectableActivities.length === 0 ? (
										<EmptyAssetNotice message="No activities available for this tour spot." />
									) : (
										<>
											<AssetFilterBar
												name={activityNameQuery}
												onNameChange={setActivityNameQuery}
												namePlaceholder="Search activities"
												minRating={activityMinRating}
												onMinRatingChange={setActivityMinRating}
												isActive={hasActivityFilters}
												onClear={() => {
													setActivityNameQuery("");
													setActivityMinRating("");
												}}
											/>
											{filteredActivities.length === 0 ? (
												<EmptyAssetNotice
													message={
														hasActivityFilters
															? "No activities match these filters."
															: "No activities available for this tour spot."
													}
												/>
											) : (
												<SpotSelectWithCost
													className={TOUR_FORM_CONTROL_CLASS}
													label="Activities"
													placeholder="-- Select activities --"
													value={row.activitySpotId}
													options={filteredActivities}
													onChange={(activitySpotId) =>
														onChangeDraft({
															...row,
															activitySpotId,
														})
													}
												/>
											)}
										</>
									)}
									<AnimatePresence initial={false}>
									{warnings?.activitySpot && (
										<motion.div
											key="activity-warning"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="absolute right-0 top-0"
										>
											<FieldHelpInfo helpInfo={warnings.activitySpot} openOnHover />
										</motion.div>
									)}
									</AnimatePresence>
								</div>
							)}

							{stepIndex === 3 && (
								<CustomSelectInput
									className={TOUR_FORM_CONTROL_CLASS}
									label="Transport option"
									name="transportOption"
									value={row.transportOption}
									onChange={(e) =>
										onChangeDraft({
											...row,
											transportOption: e.target.value as TransportServiceType | "",
										})
									}
									options={transportOptions}
								/>
							)}

							{stepIndex === 4 && (
								<div className="flex flex-col gap-3 sm:gap-4">
									<CustomSelectInput
										className={TOUR_FORM_CONTROL_CLASS}
										label="Hotel type"
										name="hotelOption"
										value={row.hotelOption}
										onChange={(e) =>
											onChangeDraft({
												...row,
												hotelOption: e.target.value as HotelType | "",
												hotelId: "",
												hotelCost: 0,
											})
										}
										options={hotelOptions}
									/>
									<AnimatePresence initial={false}>
										{row.hotelOption && (
											<motion.div
												key="hotel-picker"
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.2, ease: "easeInOut" }}
												className="overflow-visible"
											>
												<AssetFilterBar
													name={hotelNameInput}
													onNameChange={setHotelNameInput}
													namePlaceholder="Search hotels"
													minRating={hotelMinRating}
													onMinRatingChange={setHotelMinRating}
													isActive={hasHotelFilters}
													onClear={() => {
														setHotelNameInput("");
														setHotelNameQuery("");
														setHotelMinRating("");
														setHotelShiftMode(false);
													}}
													extra={
														<CustomCheckboxInput
															label="Shift-mode hotels only"
															labelStyle="text-sm"
															helpInfo="Only show hotels that allow shift-based booking."
															checked={hotelShiftMode}
															onChange={(e) => setHotelShiftMode(e.target.checked)}
															className="w-fit"
														/>
													}
												/>
												{isHotelsLoading ? (
													<p className={`${TOUR_FORM_CONTROL_CLASS} text-sm`} style={READABLE_MUTED_STYLE}>
														Loading hotels…
													</p>
												) : matchingHotels.length === 0 ? (
													<EmptyAssetNotice
														message={
															hasHotelFilters
																? "No hotels match these filters."
																: "No hotels available for this tour spot."
														}
													/>
												) : (
													<HotelSelectWithRating
														value={row.hotelId}
														hotels={matchingHotels}
														placeholder={hotelPlaceholder}
														hotelType={row.hotelOption}
														onChange={(hotelId) => onChangeDraft({ ...row, hotelId })}
													/>
												)}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							)}

							{stepIndex === 5 && (
								<div className="flex flex-col gap-3 sm:gap-4">
									<div className="rounded-lg p-2 sm:p-3" style={READABLE_SURFACE_STYLE}>
										<p className="mb-1.5 text-xs font-semibold sm:mb-2 sm:text-sm" style={READABLE_BODY_STYLE}>Your day at a glance</p>
										<dl className="overflow-hidden rounded-md" style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}>
											{reviewItems.map((item, index) => {
												const hasValue = Boolean(item.value?.trim());
												const isTotal = item.label === "Stop total";
												return (
													<div
														key={item.label}
														className="flex items-baseline gap-2 px-2 py-1.5 min-w-0 sm:px-2.5 sm:py-2"
														style={
															index < reviewItems.length - 1
																? { borderBottom: "1px solid rgba(0, 0, 0, 0.10)" }
																: undefined
														}
													>
														<dt className="w-[4.75rem] shrink-0 text-[11px] font-medium sm:w-24 sm:text-sm" style={READABLE_MUTED_STYLE}>
															{item.label}
														</dt>
														<dd
															className={`flex min-w-0 flex-1 items-baseline justify-between gap-2 text-[11px] leading-snug sm:text-sm ${
																hasValue ? "" : "italic"
															}`}
															style={hasValue ? READABLE_BODY_STYLE : READABLE_MUTED_STYLE}
														>
															<span className={`min-w-0 truncate ${isTotal ? MONEY_TEXT_CLASS : ""}`}>
																{displayOrDash(item.value)}
															</span>
															{typeof item.cost === "number" && !isTotal ? (
																<span className={`shrink-0 text-sm ${MONEY_TEXT_CLASS}`}>
																	{formatTaka(item.cost)}
																</span>
															) : null}
														</dd>
													</div>
												);
											})}
										</dl>
									</div>

									<div>
										<div className={`mb-1 flex items-center justify-between gap-2 ${TOUR_FORM_CONTROL_CLASS}`}>
											<span className="text-xs font-semibold sm:text-sm" style={READABLE_BODY_STYLE}>Short description</span>
											<SampleFillButton
												label="Insert an example description"
												onClick={fillSampleDescription}
											/>
										</div>
										<CustomTextAreaInput
											className={`${TOUR_FORM_CONTROL_CLASS} h-20 sm:h-24`}
											name="segmentShortDescription"
											placeholderText="What happens on this day?"
											value={row.shortDescription}
											onChange={(e) =>
												onChangeDraft({
													...row,
													shortDescription: e.target.value,
												})
											}
										/>
									</div>

									<div>
										<div className={`mb-1 flex items-center justify-between gap-2 ${TOUR_FORM_CONTROL_CLASS}`}>
											<span className="text-xs font-semibold sm:text-sm" style={READABLE_BODY_STYLE}>Notes (optional)</span>
											<SampleFillButton
												label="Insert an example note"
												onClick={fillSampleNotes}
											/>
										</div>
										<CustomTextAreaInput
											className={`${TOUR_FORM_CONTROL_CLASS} h-16 sm:h-20`}
											name="notes"
											placeholderText="Anything else to remember for this day"
											value={row.notes}
											onChange={(e) => onChangeDraft({ ...row, notes: e.target.value })}
										/>
									</div>
								</div>
							)}
						</motion.div>
					</AnimatePresence>

					<AnimatePresence initial={false}>
					{!canContinueFromStep(stepIndex) && (
						<motion.div
							key={`hint-${stepIndex}`}
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="overflow-hidden text-xs"
							style={READABLE_MUTED_STYLE}
						>
							<div className="mt-2 sm:mt-3">
							{stepIndex === 0 && (warnings?.dayNumber || "Choose a day number between 1 and the tour duration.")}
							{stepIndex === 1 && "Select a tour spot to continue."}
							{stepIndex === lastStepIndex && (
								<>
									Enter a short description (at least 2 characters) to add this stop.
								</>
							)}
							</div>
						</motion.div>
					)}
					</AnimatePresence>

					{overBudgetReason ? (
						<p className="mt-3 rounded-lg px-3 py-2 text-xs font-medium sm:text-sm" style={{ color: "#DC2626", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
							{overBudgetReason}
						</p>
					) : null}

					<div className="mt-3 flex items-center justify-start gap-2 sm:mt-5">
						<AnimatePresence initial={false}>
							{stepIndex > 0 && (
								<motion.button
									key="wizard-back"
									type="button"
									initial={{ opacity: 0, x: -8 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -8 }}
									className="text-xs px-2.5 py-1 rounded-md font-medium sm:text-sm sm:px-3 sm:py-1.5"
									style={ghostButtonStyle}
									onClick={() => goToStep(stepIndex - 1)}
								>
									Back
								</motion.button>
							)}
						</AnimatePresence>
						<AnimatePresence mode="wait" initial={false}>
						{stepIndex < lastStepIndex ? (
							<motion.button
								key="wizard-next"
								type="button"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="text-xs px-2.5 py-1 rounded-md theme-btn-teal disabled:opacity-50 disabled:cursor-not-allowed font-medium sm:text-sm sm:px-3 sm:py-1.5"
								disabled={!canContinueFromStep(stepIndex)}
								onClick={goNext}
							>
								Next
							</motion.button>
						) : (
							<motion.button
								key="wizard-add"
								type="button"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="text-xs px-2.5 py-1 rounded-md theme-btn-teal disabled:opacity-50 disabled:cursor-not-allowed font-medium sm:text-sm sm:px-3 sm:py-1.5"
								disabled={!canAddDraft || Boolean(overBudgetReason)}
								onClick={onAdd}
							>
								Add Stop
							</motion.button>
						)}
						</AnimatePresence>
					</div>
				</motion.div>
			)}
			</AnimatePresence>
		</motion.div>
	);
};
