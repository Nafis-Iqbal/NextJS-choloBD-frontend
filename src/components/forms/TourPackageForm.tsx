/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HotelType, TourType, TransportServiceType } from "@/types/enums";
import { LocationApi, TourSpotApi, ActivitySpotApi, TourBuilderApi } from "@/services/api";
import { CustomSelectInput, CustomTextInput, CustomTextAreaInput } from "@/components/custom-elements/CustomInputElements";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { queryClient } from "@/services/apiInstance";

type TourFormMode = "create" | "edit";

type TourDaySegmentFormRow = {
	id: string;
	dayNumber: number;
	tourSpotId: string;
	activitySpotId: string;
	transportOption: TransportServiceType | "";
	hotelOption: HotelType | "";
	notes: string;
};

type TourPackageFormState = {
	packageName: string;
	totalBudget: number;
	division: string;
	divisionLocationId: string;
	tourType: TourType | "";
	duration: number;
	shortDescription: string;
	daySegments: TourDaySegmentFormRow[];
};

interface TourPackageFormProps {
	mode: TourFormMode;
	tourPlan_id?: string;
	onCancel: () => void;
	className?: string;
}

export const TourPackageForm: React.FC<TourPackageFormProps> = ({
	mode,
	tourPlan_id,
	onCancel,
	className,
}) => {
	const {openNotificationPopUpMessage, showLoadingContent} = useGlobalUI();

	// Fetch tour data for edit mode
	const {data: tourPlanData} = TourBuilderApi.useGetTourPlanDetailsRQ(tourPlan_id || "");

	const {data: locationsListData} = LocationApi.useGetAllLocationsRQ();
    const divisionList = useMemo(
        () => locationsListData?.data?.filter((location) => location.locationType === 'DIVISION') || [],
        [locationsListData?.data]
    );

	const {data: tourSpotsListData} = TourSpotApi.useGetAllTourSpotsRQ();
	const {data: activitySpotsListData} = ActivitySpotApi.useGetAllActivitySpotsRQ();

	// Create mutation
	const {mutate: createTourPackageMutate} = TourBuilderApi.useCreateTourPlanRQ(
		(responseData) => {
			if (responseData.status === "success") {
				finishWithMessage("Tour package created successfully.");
				queryClient.invalidateQueries({ queryKey: ["tour-plans"] });
				onCancel();
			}
			else{
				finishWithMessage(`Failed to create tour package. ${responseData.message || ''}`);
			}
		},
		() => {
			finishWithMessage("Failed to create tour package. An error occurred on the server.");
		}
	);

	// Update mutation
	const {mutate: updateTourPackageMutate} = TourBuilderApi.useUpdateTourPlanRQ(
		(responseData) => {
			if (responseData.status === "success") {
				finishWithMessage("Tour package updated successfully.");
				queryClient.invalidateQueries({ queryKey: ["tour-plans"] });
				onCancel();
			}
			else{
				finishWithMessage(`Failed to update tour package. ${responseData.message || ''}`);
			}
		},
		() => {
			finishWithMessage("Failed to update tour package. An error occurred on the server.");
		}
	);

	const [filteredTourSpotsList, setFilteredTourSpotsList] = useState(tourSpotsListData?.data || []);
	const [filteredActivitySpotsList, setFilteredActivitySpotsList] = useState(activitySpotsListData?.data || []);

	const tourTypeOptions = useMemo(
		() => enumToOptions(TourType as any, "-- Select a tour type --"),
		[]
	);

	const divisionOptions = useMemo(
		() => [
			{ label: "-- Select a division --", value: "" },
			...divisionList.map((division) => ({ label: division.name, value: division.name })),
		],
		[divisionList]
	);

	const transportOptions = useMemo(
		() =>
			enumToOptions(
				TransportServiceType as any,
				"-- Select a transport option --"
			),
		[]
	);

	const hotelOptions = useMemo(
		() => enumToOptions(HotelType as any, "-- Select a hotel option --"),
		[]
	);

	const durationOptions = useMemo(() => {
		const base = [{ label: "-- Select duration (days) --", value: "" }];
		const days = Array.from({ length: 14 }, (_, idx) => idx + 1).map((d) => ({
			label: `${d} day${d > 1 ? "s" : ""}`,
			value: String(d),
		}));
		return [...base, ...days];
	}, []);

	const [formData, setFormData] = useState<TourPackageFormState>({
		packageName: "",
		totalBudget: 0,
		division: "",
		divisionLocationId: "",
		tourType: "",
		duration: 0,
		shortDescription: "",
		daySegments: [],
	});

	const [draftSegment, setDraftSegment] = useState<TourDaySegmentFormRow | null>(null);

	// Populate form data on edit mode
	useEffect(() => {
		if (tourPlanData && mode === "edit") {
			const tour = tourPlanData.data;
			if (tour) {
				setFormData({
					packageName: tour.packageName || "",
					totalBudget: tour.totalBudget || 0,
					division: tour.location?.name || "",
					divisionLocationId: tour.locationId || "",
					tourType: tour.tourType || "",
					duration: tour.duration || 0,
					shortDescription: tour.shortDescription || "",
					daySegments: tour.daySegments?.map((segment) => ({
						id: segment.id,
						dayNumber: segment.dayNumber,
						tourSpotId: segment.tourSpotId,
						activitySpotId: segment.activitySpotId || "",
						transportOption: (segment.transportOption || "") as TransportServiceType | "",
						hotelOption: (segment.hotelOption || "") as HotelType | "",
						notes: "",
					})) || [],
				});
			}
		}
	}, [tourPlanData, mode]);

	const setSegmentAt = (index: number, updatedSegment: TourDaySegmentFormRow) => {
		console.log("setSegmentAt:", index, updatedSegment);
		setFormData((prev) => ({
			...prev,
			daySegments: prev.daySegments.map((segment, i) => i === index ? updatedSegment : segment)
		}));
	};

	const hasDraftSegment = draftSegment !== null;
	const hasTourSpotSelected = hasDraftSegment && draftSegment.tourSpotId.trim() !== "";
	const hasAvailableTourSpots = filteredTourSpotsList.length > 0;

	const canAddDraft = hasDraftSegment && hasTourSpotSelected && hasAvailableTourSpots;

	const canSaveForm = 
		formData.packageName.trim() !== "" &&
		formData.totalBudget > 0 &&
		formData.division !== "" && 
		formData.divisionLocationId !== "" &&
		formData.tourType !== "" &&
		formData.duration > 0 &&
		formData.shortDescription.trim() !== "" &&
		formData.daySegments.length > 0;

	const onResetSegments = () => {
		setFormData((prev) => ({ ...prev, daySegments: [] }));
	}

	const onAddDaySegment = () => {
		if (!draftSegment) {
			openNotificationPopUpMessage("Please fill in the segment details.");
			return;
		}
		if (!draftSegment.tourSpotId.trim()) {
			openNotificationPopUpMessage("Please select a tour spot for this segment.");
			return;
		}
		if (draftSegment.dayNumber < 1) {
			openNotificationPopUpMessage("Day number must be at least 1.");
			return;
		}
		if (draftSegment.dayNumber > formData.duration) {
			openNotificationPopUpMessage(`Day number cannot exceed the tour duration of ${formData.duration} days.`);
			return;
		}

		setFormData((prev) => {
			return {
				...prev,
				daySegments: [...prev.daySegments, draftSegment],
			};
		});

		setDraftSegment(createBlankSegment(1));
	}

	useEffect(() => {
		setDraftSegment((prev) => {
			if (!formData.duration) return null;
			// Keep existing draft segment if present
			if (prev) return prev;
			// Initialize new draft segment with day 1
			return createBlankSegment(1);
		});
	}, [formData.duration]);

	// When division changes, update district IDs and filter tour/activity spots
	useEffect(() => {
		if (!formData.divisionLocationId) {
			setFilteredTourSpotsList([]);
			setFilteredActivitySpotsList([]);
			return;
		}

		// Get all districts under this division
		const districts = locationsListData?.data?.filter(
			(location) =>
				location.locationType === 'DISTRICT' &&
				location.parentLocationId === formData.divisionLocationId
		) || [];

		const districtLocationIds = districts.map((district) => district.id);

		// Filter tour spots
		const filteredTourSpots = tourSpotsListData?.data?.filter((spot) =>
			districtLocationIds.includes(spot.locationId)
		);

		// Filter activity spots
		const filteredActivitySpots = activitySpotsListData?.data?.filter((spot) =>
			districtLocationIds.includes(spot.locationId)
		);
		
		setFilteredTourSpotsList(filteredTourSpots || []);
		setFilteredActivitySpotsList(filteredActivitySpots || []);
	}, [formData.divisionLocationId, locationsListData?.data, tourSpotsListData, activitySpotsListData]);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.packageName.trim()) {
			openNotificationPopUpMessage("Please enter a package name.");
			return;
		}

		if (!formData.division || !formData.divisionLocationId) {
			openNotificationPopUpMessage("Please select a division.");
			return;
		}

		if (!formData.tourType) {
			openNotificationPopUpMessage("Please select a tour type.");
			return;
		}

		if (!formData.duration || formData.duration <= 0) {
			openNotificationPopUpMessage("Please select a valid duration.");
			return;
		}

		if (formData.daySegments.length === 0) {
			openNotificationPopUpMessage("Please add at least one day segment.");
			return;
		}

		// Transform data for API
		const payloadData = {
			packageName: formData.packageName.trim(),
			totalBudget: formData.totalBudget,
			shortDescription: formData.shortDescription.trim(),
			tourType: formData.tourType,
			duration: formData.duration,
			locationId: formData.divisionLocationId,
			daySegments: formData.daySegments.map((segment) => ({
				dayNumber: segment.dayNumber,
				tourSpotId: segment.tourSpotId,
				activitySpotId: segment.activitySpotId || undefined,
				transportOption: segment.transportOption || undefined,
				hotelOption: segment.hotelOption || undefined,
			})),
		};

		// Show loading and submit
		showLoadingContent(true);

		if (mode === "create") {
			createTourPackageMutate(payloadData as any);
		} else {
			if (tourPlan_id) {
				updateTourPackageMutate({
					id: tourPlan_id,
					...payloadData,
				} as any);
			}
		}
	};

	const finishWithMessage = (message: string) => {
		showLoadingContent(false);
		openNotificationPopUpMessage(message);
	};

	return (
		<form onSubmit={onSubmit} className={`flex flex-col space-y-6 ${className}`}>
			<div className="flex flex-col space-y-6">
				<CustomTextInput
					className="w-full md:w-[500px] bg-gray-700 text-white"
					label="Package Name"
					name="packageName"
					placeholderText="Enter package name"
					value={formData.packageName}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, packageName: e.target.value }))
					}
				/>

				<CustomTextInput
					className="w-full md:w-[500px] bg-gray-700 text-white"
					label="Total Budget"
					name="totalBudget"
					type="number"
					placeholderText="Enter total budget"
					value={formData.totalBudget ? String(formData.totalBudget) : ""}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, totalBudget: e.target.value ? Number(e.target.value) : 0 }))
					}
				/>

				<CustomSelectInput
					className="w-full md:w-[500px] bg-gray-700 text-white"
					label="Division"
					name="division"
					value={formData.division}
					onChange={(e) => {
						const selectedDivisionName = e.target.value;
						const selectedDivision = divisionList.find((d) => d.name === selectedDivisionName);
						setFormData((prev) => ({
							...prev,
							division: selectedDivisionName,
							divisionLocationId: selectedDivision?.id || "",
						}));
					}}
					options={divisionOptions}
				/>

				<CustomSelectInput
					className="w-full md:w-[500px] bg-gray-700 text-white"
					label="Tour Type"
					name="tourType"
					value={formData.tourType}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							tourType: e.target.value as TourType | "",
						}))
					}
					options={tourTypeOptions}
				/>

				{formData.division && formData.divisionLocationId && formData.tourType && (
					<>
						<CustomSelectInput
							className="w-full md:w-[500px] bg-gray-700 text-white"
							label="Duration (1–14 days)"
							name="duration"
							value={formData.duration ? String(formData.duration) : ""}
							onChange={(e) => {
								const nextDuration = e.target.value ? Number(e.target.value) : 0;
								setFormData((prev) => {
									if (!nextDuration) return { ...prev, duration: 0, daySegments: [] };
								return {
									...prev,
									duration: nextDuration,
									};
								});
							}}
							options={durationOptions}
						/>

						<CustomTextAreaInput
							className="w-full md:w-[500px] md:h-24 bg-gray-700 text-white"
							label="Short Description"
							name="shortDescription"
							placeholderText="Enter a brief description of the tour package"
							value={formData.shortDescription}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
							}
						/>
					</>
				)}
			</div>

			{formData.duration > 0 && (
				<motion.section
					layout
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 8 }}
					className="flex w-full min-w-0 flex-col space-y-3 mt-10"
				>
					<div className="flex items-center justify-between">
						<h3 className="text-green-300 font-semibold">
							Day Segments ({formData.duration})
						</h3>
						<button
							type="button"
							className="text-sm px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
							onClick={onResetSegments}
						>
							Reset Segments
						</button>
					</div>

					<AnimatePresence initial={false}>
					{[...formData.daySegments].sort((a, b) => a.dayNumber - b.dayNumber).map((row) => (
							<motion.div
								key={row.id}
								layout
								initial={{ opacity: 0, y: 10, height: 0 }}
								animate={{ opacity: 1, y: 0, height: "auto" }}
								exit={{ opacity: 0, y: -10, height: 0 }}
								transition={{ duration: 0.2 }}
								className="w-full min-w-0"
							>
								<TourDaySegmentRow
									row={row}
									onChange={(nextRow) => {
										const idx = formData.daySegments.findIndex(s => s.id === row.id);
										setSegmentAt(idx, nextRow);
									}}

									tourSpotOptions={[
										{ label: "-- Select a tour spot --", value: "", locationId: "" },
										...filteredTourSpotsList.map(
											(tourSpot) => ({ label: tourSpot.name, value: tourSpot.id, locationId: tourSpot.locationId })
										),
									]}

									activitySpotOptions={[
										{ label: "-- Select an activity spot --", value: "", locationId: "" },
										...filteredActivitySpotsList.map(
											(activitySpot) => ({ label: activitySpot.name, value: activitySpot.id, locationId: activitySpot.locationId })
										),
									]}

									transportOptions={transportOptions}
									hotelOptions={hotelOptions}
								/>
							</motion.div>
						))}
					</AnimatePresence>

				{(
					<motion.div
						layout
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="w-full min-w-0 rounded-md border border-dashed border-gray-600 bg-gray-900/40 p-3 mt-10"
					>
						<div className="mb-3 flex items-center justify-between">
							<div className="text-white text-xl font-semibold">
								Add Day Segments
								</div>
								<button
									type="button"
									className="text-sm px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white"
									disabled={!canAddDraft}
									onClick={() => onAddDaySegment()}
								>
									Add Segment
								</button>
							</div>

							{draftSegment ? (
								<TourDaySegmentRow
									row={draftSegment}
									onChange={(nextRow) => {
										setDraftSegment(nextRow)
									}}

									tourSpotOptions={[
										{ label: "-- Select a tour spot --", value: "", locationId: "" },
										...filteredTourSpotsList.map(
											(tourSpot) => ({ label: tourSpot.name, value: tourSpot.id, locationId: tourSpot.locationId })
										),
									]}

									activitySpotOptions={[
										{ label: "-- Select an activity spot --", value: "", locationId: "" },
										...filteredActivitySpotsList.map(
											(activitySpot) => ({ label: activitySpot.name, value: activitySpot.id, locationId: activitySpot.locationId })
										),
									]}

									transportOptions={transportOptions}
									hotelOptions={hotelOptions}
								/>
							) : (
								<div className="text-sm text-gray-300">
									Start adding segments by filling Day 1.
								</div>
							)}

							{!canAddDraft && (
								<div className="mt-2 text-xs text-gray-400">
									Enter at least a <span className="text-gray-200">Tour Spot Id</span> to enable Add.
								</div>
							)}
						</motion.div>
					)}
				</motion.section>
			)}

			<div className="flex items-center gap-3">
				<button
					type="submit"
					className="px-5 py-2 rounded bg-green-700 hover:bg-green-600 disabled:bg-gray-400 
					disabled:cursor-not-allowed text-white font-semibold"
					disabled={!canSaveForm}
				>
				{mode === "create" ? "Create Tour Package" : "Save Changes"}
			</button>
			<button
				type="button"
				className="px-5 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white font-semibold"
				onClick={onCancel}
			>
				Cancel
			</button>
				<div className="text-xs text-gray-400">
					This form builds a TourPackage + {" "}
					<span className="text-gray-300">TourDaySegment</span> rows.
				</div>
			</div>
		</form>
	);
};

const TourDaySegmentRow = ({
	row,
	onChange,
	tourSpotOptions,
	activitySpotOptions,
	transportOptions,
	hotelOptions,
}: {
	row: TourDaySegmentFormRow;
	onChange: (next: TourDaySegmentFormRow) => void; 
	tourSpotOptions: { label: string; value: string, locationId: string }[];
	activitySpotOptions: { label: string; value: string , locationId: string}[];
	transportOptions: { label: string; value: string }[];
	hotelOptions: { label: string; value: string }[];
}) => {

	return (
		<div className="w-full max-w-full min-w-0 overflow-x-hidden rounded-md border border-gray-700 bg-gray-800 p-3">
			<div className="flex items-center justify-between mb-3">
				<CustomTextInput
					className="w-20 bg-gray-700 text-white"
					label="Day"
					name="dayNumber"
					type="number"
					placeholderText="1"
					value={String(row.dayNumber)}
					onChange={(e) => {
						const val = e.target.value;
						if (val === "") {
							// Allow empty string while typing
							onChange({
								...row,
								dayNumber: 0,
							});
						} else {
							const num = parseInt(val, 10);
							if (!isNaN(num)) {
								onChange({
									...row,
									dayNumber: num,
								});
							}
						}
					}}
				/>
				<div className="text-xs text-gray-400">TourDaySegment</div>
			</div>

			<div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
				<CustomSelectInput
					className="w-full bg-gray-700 text-white"
					label="Tour Spot"
					name="tourSpotId"
					value={row.tourSpotId}
					onChange={(e) => {
							console.log("baal - CustomSelectInput onChange fired");
							const updatedRow = {
								...row,
								tourSpotId: e.target.value as string | "",
							};
							console.log("About to call TourDaySegmentRow onChange with:", updatedRow);
							onChange(updatedRow);
						}
					}
					options={tourSpotOptions.length > 0 ? tourSpotOptions : [{ label: "N/A", value: "" }]}
				/>

				<CustomSelectInput
					className="w-full bg-gray-700 text-white"
					label="Activity Spot"
					name="activitySpotId"
					value={row.activitySpotId}
					onChange={(e) =>
						onChange({
							...row,
							activitySpotId: e.target.value as string | "",
						})
					}
					options={activitySpotOptions.length > 0 ? activitySpotOptions : [{ label: "N/A", value: "" }]}
				/>

				<CustomSelectInput
					className="w-full bg-gray-700 text-white"
					label="Transport Option"
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

				<CustomSelectInput
					className="w-full bg-gray-700 text-white"
					label="Hotel Option"
					name="hotelOption"
					value={row.hotelOption}
					onChange={(e) =>
						onChange({ ...row, hotelOption: e.target.value as HotelType | "" })
					}
					options={hotelOptions}
				/>
			</div>

			<div className="mt-3">
				<CustomTextAreaInput
					className="w-full md:h-20"
					label="Notes"
					name="notes"
					placeholderText="Optional notes for this day segment"
					value={row.notes}
					onChange={(e) => onChange({ ...row, notes: e.target.value })}
				/>
			</div>
		</div>
	);
};

const toTitle = (value: string) =>
	value
		.toLowerCase()
		.split(/[_\s]+/)
		.filter(Boolean)
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(" ");

const enumToOptions = (enumObj: Record<string, string>, emptyLabel: string) => {
	const values = Object.values(enumObj);
	return [
		{ label: emptyLabel, value: "" },
		...values.map((v) => ({ label: toTitle(v), value: v })),
	];
};

const createBlankSegment = (dayNumber: number): TourDaySegmentFormRow => ({
	id: `segment-${Date.now()}-${Math.random()}`,
	dayNumber,
	tourSpotId: "",
	activitySpotId: "",
	transportOption: "",
	hotelOption: "",
	notes: "",
});

const normalizeSegments = (segments: TourDaySegmentFormRow[]) =>
	segments.map((s, idx) => ({ ...s, dayNumber: idx + 1 }));