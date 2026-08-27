/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HotelType, TourType, TransportServiceType } from "@/types/enums";
import { LocationApi, TourSpotApi, ActivitySpotApi, TourBuilderApi } from "@/services/api";
import { CustomSelectInput, CustomTextInput, CustomTextAreaInput, CustomDatePicker } from "@/components/custom-elements/CustomInputElements";
import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
import { PaginationControls } from "@/components/modular-components/dashboard/user/PaginationControls";
import { CardImageWithFallback } from "@/components/page-content/CardImageWithFallback";
import { TOUR_CARD_FALLBACK_IMAGE } from "@/components/page-content/pageContentFallbackImages";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { queryClient } from "@/services/apiInstance";
import {
	AddDaySegmentPanel,
	FormNavFooter,
	ItineraryStopsTabs,
	TourDaySegmentRow,
	PackageFormStepHeader,
	FormStepIntro,
	PackageFormPageHeader,
	PackageDetailsQuestion,
	PackageReviewSummary,
	DivisionSpotCountBadges,
	DETAILS_INPUT_CLASS,
	DETAILS_TEXTAREA_CLASS,
	MAX_STOPS_PER_DAY,
	READABLE_SURFACE_STYLE,
	MONEY_TEXT_CLASS,
	clampDayNumber,
	clampDaySegmentsToDuration,
	collectVisitSpotNames,
	countSpotsInDivision,
	countStopsForDay,
	createBlankSegment,
	enumToOptions,
	getSegmentFieldWarnings,
	groupStopsByDay,
	isDayAtStopLimit,
	mapSpotOptions,
	missingDurationDays,
	getDetailsContinueReason,
	getItineraryContinueReason,
	getOverBudgetReason,
	getStopTotal,
	moveStopWithinDay,
	nextSegmentOrderForDay,
	applyOvernightHotelToLastStop,
	formatTaka,
	sumStopTotals,
	toTitle,
	type TourDaySegmentFormRow,
} from "@/components/forms/TourPackageForm";

type TourFormMode = "create" | "edit";

type TourPackageFormState = {
	packageName: string;
	totalBudget: number;
	division: string;
	divisionLocationId: string;
	tourType: TourType | "";
	duration: number;
	startDate: string;
	basedOnPackageId: string;
	shortDescription: string;
	daySegments: TourDaySegmentFormRow[];
};

interface CustomTourPackageFormProps {
	mode: TourFormMode;
	tourPlan_id?: string;
	onCancel: () => void;
	className?: string;
}

const CATALOG_PAGE_SIZE = 6;

export const CustomTourPackageForm: React.FC<CustomTourPackageFormProps> = ({
	mode,
	tourPlan_id,
	onCancel,
	className,
}) => {
	const {openNotificationPopUpMessage, showLoadingContent} = useGlobalUI();
	const [tourPackageId, setTourPackageId] = useState<string>(tourPlan_id ?? "");
	const [actionTrigger, setActionTrigger] = useState(false);
	const [selectedCatalogId, setSelectedCatalogId] = useState("");
	const [catalogPage, setCatalogPage] = useState(1);
	const lastAppliedCatalogId = useRef("");

	const {data: tourPlanData} = TourBuilderApi.useGetPersonalTourPlanDetailsRQ(
		mode === "edit" ? (tourPlan_id || "") : ""
	);

	const {data: catalogToursData, isLoading: isCatalogLoading, isError: isCatalogError} =
		TourBuilderApi.useGetAllTourPlansRQ("limit=100");
	const {data: selectedCatalogData, isLoading: isCatalogDetailLoading} =
		TourBuilderApi.useGetTourPlanDetailsRQ(selectedCatalogId);

	const {data: locationsListData} = LocationApi.useGetAllLocationsRQ();
    const divisionList = useMemo(
        () => locationsListData?.data?.filter((location) => location.locationType === 'DIVISION') || [],
        [locationsListData?.data]
    );

	const {data: tourSpotsListData} = TourSpotApi.useGetAllTourSpotsRQ("limit=100");
	const {data: activitySpotsListData} = ActivitySpotApi.useGetAllActivitySpotsRQ("limit=100");

	const {mutate: createTourPackageMutate} = TourBuilderApi.useCreatePersonalTourPlanRQ(
		(responseData) => {
			if (responseData.status === "success") {
				setTourPackageId(responseData.data?.id || "");
				queryClient.invalidateQueries({ queryKey: ["personal-tour-plans"] });
			}
			else{
				finishWithMessage(`Failed to create tour package. ${responseData.message || ''}`);
			}
		},
		() => {
			finishWithMessage("Failed to create tour package. An error occurred on the server.");
		}
	);

	const {mutate: updateTourPackageMutate} = TourBuilderApi.useUpdatePersonalTourPlanRQ(
		(responseData) => {
			if (responseData.status === "success") {
				finishWithMessage(
					mode === "create"
						? "Tour package created successfully."
						: "Tour package updated successfully."
				);
				queryClient.invalidateQueries({ queryKey: ["personal-tour-plans"] });
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

	const {mutate: deleteTourPackageImagesMutate} = TourBuilderApi.useDeletePersonalTourPlanImagesRQ(
		() => console.log("Tour package images deleted."),
		() => console.log("Failed to delete tour package images.")
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
		startDate: "",
		basedOnPackageId: "",
		shortDescription: "",
		daySegments: [],
	});

	const [formStep, setFormStep] = useState(0);
	const [draftSegment, setDraftSegment] = useState<TourDaySegmentFormRow | null>(null);
	const [activeDayNumber, setActiveDayNumber] = useState<number | null>(null);
	const [activeStopId, setActiveStopId] = useState<string | null>(null);

	const inferredEndDate = useMemo(
		() => inferEndDate(formData.startDate, formData.duration),
		[formData.startDate, formData.duration]
	);

	const catalogTours = catalogToursData?.data ?? [];
	const catalogTotalPages = Math.max(1, Math.ceil(catalogTours.length / CATALOG_PAGE_SIZE));
	const pagedCatalogTours = useMemo(() => {
		const start = (catalogPage - 1) * CATALOG_PAGE_SIZE;
		return catalogTours.slice(start, start + CATALOG_PAGE_SIZE);
	}, [catalogTours, catalogPage]);

	useEffect(() => {
		if (catalogPage > catalogTotalPages) {
			setCatalogPage(catalogTotalPages);
		}
	}, [catalogPage, catalogTotalPages]);

	useEffect(() => {
		if (tourPlanData && mode === "edit") {
			const tour = tourPlanData.data;
			if (tour) {
				setFormData({
					packageName: tour.packageName || "",
					totalBudget: tour.estimatedBudget || tour.totalBudget || 0,
					division: tour.location?.name || "",
					divisionLocationId: tour.locationId || "",
					tourType: tour.tourType || "",
					duration: tour.duration || 0,
					startDate: toDateInputValue(tour.startDate),
					basedOnPackageId: tour.basedOnPackageId || tour.basedOnPackage?.id || "",
					shortDescription: tour.shortDescription || "",
					daySegments: clampDaySegmentsToDuration(
						tour.daySegments?.map((segment) => ({
							id: segment.id,
							dayNumber: segment.dayNumber,
							segmentOrder: segment.segmentOrder || 1,
							shortDescription: segment.shortDescription || "",
							tourSpotId: segment.tourSpotId || "",
							activitySpotId: segment.activitySpotId || "",
							transportOption: (segment.transportOption || "") as TransportServiceType | "",
							hotelOption: (segment.hotelOption || "") as HotelType | "",
							hotelId: segment.hotelId || "",
							activityCost: 0,
							hotelCost: 0,
							notes: segment.notes || "",
						})) || [],
						tour.duration || 0
					),
				});
			}
		}
	}, [tourPlanData, mode]);

	useEffect(() => {
		if (tourPlan_id) setTourPackageId(tourPlan_id);
	}, [tourPlan_id]);

	useEffect(() => {
		const catalog = selectedCatalogData?.data;
		if (!selectedCatalogId || !catalog || catalog.id !== selectedCatalogId) return;
		if (lastAppliedCatalogId.current === selectedCatalogId) return;
		lastAppliedCatalogId.current = selectedCatalogId;

		setFormData((prev) => ({
			...prev,
			packageName: catalog.packageName || prev.packageName,
			totalBudget: catalog.totalBudget || prev.totalBudget,
			division: catalog.location?.name || prev.division,
			divisionLocationId: catalog.locationId || prev.divisionLocationId,
			tourType: catalog.tourType || prev.tourType,
			duration: catalog.duration || prev.duration,
			basedOnPackageId: catalog.id,
			shortDescription: catalog.shortDescription || prev.shortDescription,
			daySegments: clampDaySegmentsToDuration(
				catalog.daySegments?.map((segment) => ({
					id: segment.id || `segment-${Date.now()}-${Math.random()}`,
					dayNumber: segment.dayNumber,
					segmentOrder: segment.segmentOrder || 1,
					shortDescription: segment.shortDescription || "",
					tourSpotId: segment.tourSpotId || "",
					activitySpotId: segment.activitySpotId || "",
					transportOption: (segment.transportOption || "") as TransportServiceType | "",
					hotelOption: (segment.hotelOption || "") as HotelType | "",
					hotelId: segment.hotelId || "",
					activityCost: 0,
					hotelCost: 0,
					notes: segment.notes || "",
				})) || [],
				catalog.duration || prev.duration
			),
		}));
	}, [selectedCatalogId, selectedCatalogData]);

	const setSegmentAt = (segmentId: string, updatedSegment: TourDaySegmentFormRow) => {
		setFormData((prev) => {
			const current = prev.daySegments.find((segment) => segment.id === segmentId);
			if (!current) return prev;
			const dayNumber = clampDayNumber(updatedSegment.dayNumber, prev.duration);
			const dayChanged = dayNumber !== current.dayNumber;
			const patched = {
				...updatedSegment,
				dayNumber,
				segmentOrder: dayChanged
					? nextSegmentOrderForDay(
						prev.daySegments.filter((segment) => segment.id !== segmentId),
						dayNumber
					)
					: current.segmentOrder,
			};
			return {
				...prev,
				daySegments: applyOvernightHotelToLastStop(
					prev.daySegments.map((segment) => (segment.id === segmentId ? patched : segment))
				),
			};
		});
	};

	const visibleDaySegments = useMemo(
		() => clampDaySegmentsToDuration(formData.daySegments, formData.duration)
			.sort((a, b) => a.dayNumber - b.dayNumber || a.segmentOrder - b.segmentOrder),
		[formData.daySegments, formData.duration]
	);

	const visitSpotNames = useMemo(
		() => collectVisitSpotNames(visibleDaySegments, filteredTourSpotsList),
		[visibleDaySegments, filteredTourSpotsList]
	);

	const computedPackageTotal = useMemo(
		() => sumStopTotals(visibleDaySegments),
		[visibleDaySegments]
	);

	const stopsByDay = useMemo(
		() => groupStopsByDay(visibleDaySegments),
		[visibleDaySegments]
	);

	useEffect(() => {
		if (stopsByDay.length === 0) {
			setActiveDayNumber(null);
			setActiveStopId(null);
			return;
		}
		const dayNumbers = stopsByDay.map(([dayNumber]) => dayNumber);
		const nextDay = activeDayNumber && dayNumbers.includes(activeDayNumber)
			? activeDayNumber
			: dayNumbers[0];
		const dayStops = stopsByDay.find(([dayNumber]) => dayNumber === nextDay)?.[1] || [];
		setActiveDayNumber(nextDay);
		if (!dayStops.some((stop) => stop.id === activeStopId)) {
			setActiveStopId(dayStops[0]?.id ?? null);
		}
	}, [stopsByDay, activeDayNumber, activeStopId]);

	const hasDraftSegment = draftSegment !== null;
	const hasTourSpotSelected = hasDraftSegment && draftSegment.tourSpotId.trim() !== "";
	const hasAvailableTourSpots = filteredTourSpotsList.length > 0;

	const hasDraftDescription = hasDraftSegment && draftSegment.shortDescription.trim().length >= 2;
	const draftDayStopCount = draftSegment ? countStopsForDay(formData.daySegments, draftSegment.dayNumber) : 0;
	const draftWarnings = getSegmentFieldWarnings(draftSegment, formData.daySegments);
	const canAddDraft =
		hasDraftSegment &&
		hasTourSpotSelected &&
		hasDraftDescription &&
		hasAvailableTourSpots &&
		!isDayAtStopLimit(formData.daySegments, draftSegment.dayNumber);

	const canContinueStep1 =
		formData.packageName.trim() !== "" &&
		formData.totalBudget > 0 &&
		formData.division !== "" &&
		formData.divisionLocationId !== "" &&
		formData.tourType !== "" &&
		formData.duration > 0 &&
		formData.startDate !== "" &&
		!!inferredEndDate &&
		formData.shortDescription.trim() !== "";

	const daysMissingStops = useMemo(
		() => missingDurationDays(formData.daySegments, formData.duration),
		[formData.daySegments, formData.duration]
	);

	const canContinueStep2 =
		daysMissingStops.length === 0 &&
		formData.daySegments.length > 0 &&
		formData.daySegments.every(
			(segment) => segment.tourSpotId.trim() !== "" && segment.shortDescription.trim().length >= 2
		) &&
		!(formData.totalBudget > 0 && computedPackageTotal > formData.totalBudget);

	const canSaveForm = canContinueStep1 && canContinueStep2;
	const continueDisabled = formStep === 0 ? !canContinueStep1 : !canContinueStep2;
	const continueDisabledReason =
		formStep === 0
			? getDetailsContinueReason({
				packageName: formData.packageName,
				totalBudget: formData.totalBudget,
				division: formData.division,
				tourType: formData.tourType,
				duration: formData.duration,
				shortDescription: formData.shortDescription,
				startDate: formData.startDate,
				requiresStartDate: true,
			})
			: getItineraryContinueReason(
				formData.daySegments,
				formData.duration,
				daysMissingStops,
				computedPackageTotal,
				formData.totalBudget
			);

	const onResetSegments = () => {
		setFormData((prev) => ({ ...prev, daySegments: [] }));
	}

	const onSelectCatalogTour = (tourId: string) => {
		if (mode === "edit") return;
		lastAppliedCatalogId.current = "";
		setSelectedCatalogId(tourId);
	};

	const onClearCatalogSelection = () => {
		if (mode === "edit") return;
		lastAppliedCatalogId.current = "";
		setSelectedCatalogId("");
		setFormData((prev) => ({ ...prev, basedOnPackageId: "" }));
	};

	const onAddDaySegment = () => {
		if (!draftSegment) {
			openNotificationPopUpMessage("Please fill in the segment details.");
			return;
		}
		if (!draftSegment.tourSpotId.trim()) {
			openNotificationPopUpMessage("Please select a tour spot for this segment.");
			return;
		}
		if (draftSegment.shortDescription.trim().length < 2) {
			openNotificationPopUpMessage("Please enter a short description for this day segment.");
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
		if (isDayAtStopLimit(formData.daySegments, draftSegment.dayNumber)) {
			openNotificationPopUpMessage(`Day ${draftSegment.dayNumber} already has ${MAX_STOPS_PER_DAY} stops.`);
			return;
		}
		const projectedTotal = computedPackageTotal + getStopTotal(draftSegment);
		const overBudgetReason = getOverBudgetReason(projectedTotal, formData.totalBudget);
		if (overBudgetReason) {
			openNotificationPopUpMessage(overBudgetReason);
			return;
		}

		const dayNumber = clampDayNumber(draftSegment.dayNumber, formData.duration);
		const segmentOrder = nextSegmentOrderForDay(formData.daySegments, dayNumber);
		const added = { ...draftSegment, dayNumber, segmentOrder };

		setFormData((prev) => ({
			...prev,
			daySegments: applyOvernightHotelToLastStop([...prev.daySegments, added]),
		}));
		setActiveDayNumber(dayNumber);
		setActiveStopId(added.id);

		setDraftSegment(createBlankSegment(
			dayNumber,
			nextSegmentOrderForDay([...formData.daySegments, added], dayNumber)
		));
	}

	useEffect(() => {
		setDraftSegment((prev) => {
			if (!formData.duration) return null;
			const defaultDay = prev?.dayNumber
				? clampDayNumber(prev.dayNumber, formData.duration)
				: 1;
			if (prev) {
				return {
					...prev,
					dayNumber: defaultDay,
					segmentOrder: nextSegmentOrderForDay(formData.daySegments, defaultDay),
				};
			}
			return createBlankSegment(defaultDay, nextSegmentOrderForDay(formData.daySegments, defaultDay));
		});
	}, [formData.duration, formData.daySegments.length]);

	useEffect(() => {
		if (!formData.divisionLocationId) {
			setFilteredTourSpotsList([]);
			setFilteredActivitySpotsList([]);
			return;
		}

		const districts = locationsListData?.data?.filter(
			(location) =>
				location.locationType === 'DISTRICT' &&
				location.parentLocationId === formData.divisionLocationId
		) || [];

		const districtLocationIds = districts.map((district) => district.id);

		const filteredTourSpots = tourSpotsListData?.data?.filter((spot) =>
			districtLocationIds.includes(spot.locationId)
		);

		const filteredActivitySpots = activitySpotsListData?.data?.filter((spot) =>
			districtLocationIds.includes(spot.locationId)
		);
		
		setFilteredTourSpotsList(filteredTourSpots || []);
		setFilteredActivitySpotsList(filteredActivitySpots || []);
	}, [formData.divisionLocationId, locationsListData?.data, tourSpotsListData, activitySpotsListData]);

	const selectedDivisionCounts = useMemo(() => {
		const fromLocations = countSpotsInDivision(locationsListData?.data ?? undefined, formData.divisionLocationId);
		return {
			tourSpots: fromLocations.tourSpots || filteredTourSpotsList.length,
			activitySpots: fromLocations.activitySpots || filteredActivitySpotsList.length,
		};
	}, [
		locationsListData?.data,
		formData.divisionLocationId,
		filteredTourSpotsList.length,
		filteredActivitySpotsList.length,
	]);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formStep !== 2) return;

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

		if (!formData.startDate || !inferredEndDate) {
			openNotificationPopUpMessage("Please select a tour start date.");
			return;
		}

		if (formData.daySegments.length === 0) {
			openNotificationPopUpMessage("Please add at least one stop.");
			return;
		}

		const outOfRangeSegment = formData.daySegments.find(
			(segment) => segment.dayNumber < 1 || segment.dayNumber > formData.duration
		);
		if (outOfRangeSegment) {
			openNotificationPopUpMessage(`Day numbers must be between 1 and ${formData.duration}.`);
			return;
		}

		const payloadData = {
			packageName: formData.packageName.trim(),
			totalBudget: formData.totalBudget,
			estimatedBudget: formData.totalBudget,
			shortDescription: formData.shortDescription.trim(),
			tourType: formData.tourType,
			locationId: formData.divisionLocationId,
			startDate: formData.startDate,
			endDate: inferredEndDate,
			basedOnPackageId: formData.basedOnPackageId || undefined,
			daySegments: applyOvernightHotelToLastStop(formData.daySegments).map((segment) => ({
				dayNumber: segment.dayNumber,
				segmentOrder: segment.segmentOrder,
				shortDescription: segment.shortDescription.trim(),
				tourSpotId: segment.tourSpotId,
				activitySpotId: segment.activitySpotId || undefined,
				transportOption: segment.transportOption || undefined,
				hotelOption: segment.hotelOption || undefined,
				hotelId: segment.hotelId || undefined,
				notes: segment.notes.trim() || undefined,
				estimatedCost: (segment.activityCost || 0) + (segment.hotelCost || 0),
			})),
		};

		showLoadingContent(true);
		setActionTrigger(true);

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

	const goFormNext = () => {
		if (formStep === 0 && !canContinueStep1) {
			openNotificationPopUpMessage("Please complete the package details before continuing.");
			return;
		}
		if (formStep === 1 && !canContinueStep2) {
			openNotificationPopUpMessage(
				continueDisabledReason || "Please complete the itinerary before continuing."
			);
			return;
		}
		setFormStep((prev) => Math.min(prev + 1, 2));
	};

	return (
		<div className={`flex max-w-4xl flex-col gap-4 ${className || ""}`}>
			<PackageFormPageHeader
				mode={mode}
				title={mode === "edit" ? "Edit Tour Plan" : "Build Your Tour Plan"}
				description={
					mode === "edit"
						? "Update your personal itinerary. Estimated cost is your budget cap if hotel or activity prices change."
						: "Create a personal itinerary, or start from a catalog tour. Set an estimated total so live stop prices cannot silently exceed it."
				}
			/>
			<AnimatePresence initial={false}>
			{mode === "create" && formStep === 0 && (
				<motion.section
					key="catalog-clone"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="overflow-hidden"
				>
				<section className="theme-section rounded-xl p-4 md:p-5 space-y-4">
					<div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
						<div>
							<h3 className="theme-label">Clone a catalog tour</h3>
							<p className="theme-text-muted text-sm">
								Optional. Pick an admin-made package to prefill this form.
							</p>
						</div>
						<AnimatePresence initial={false}>
						{formData.basedOnPackageId && (
							<motion.button
								key="clear-catalog"
								type="button"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="theme-card theme-text overflow-hidden rounded-lg px-3 py-1.5 text-sm font-semibold w-fit"
								onClick={onClearCatalogSelection}
							>
								Clear selection
							</motion.button>
						)}
						</AnimatePresence>
					</div>

					{isCatalogLoading ? (
						<p className="theme-text-muted text-sm">Loading catalog tours…</p>
					) : isCatalogError ? (
						<p className="theme-text-muted text-sm">Could not load catalog tours.</p>
					) : catalogTours.length === 0 ? (
						<p className="theme-text-muted text-sm">No catalog tours available.</p>
					) : (
						<>
							<p className="theme-text-subtle text-xs">
								Showing {pagedCatalogTours.length} of {catalogTours.length} catalog tours
							</p>
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
								{pagedCatalogTours.map((tour) => {
									const isSelected = formData.basedOnPackageId === tour.id;
									return (
										<button
											key={tour.id}
											type="button"
											onClick={() => onSelectCatalogTour(tour.id)}
											className={`theme-card overflow-hidden rounded-xl text-left ${
												isSelected ? "theme-outline-teal" : ""
											}`}
										>
											<CardImageWithFallback
												src={tour.images?.[0]?.url}
												fallbackSrc={TOUR_CARD_FALLBACK_IMAGE}
												alt={tour.packageName}
												className="h-32 w-full object-cover"
											/>
											<div className="space-y-1 p-3">
												<p className="theme-text font-semibold leading-snug">{tour.packageName}</p>
												<p className="theme-text-subtle text-xs">
													{tour.location?.name || "Bangladesh"} · {toTitle(tour.tourType)}
												</p>
												<p className="theme-text-muted text-sm">
													{tour.duration} day{tour.duration === 1 ? "" : "s"} ·{" "}
													<span className={MONEY_TEXT_CLASS}>
														{typeof tour.totalBudget === "number" ? formatTaka(tour.totalBudget) : "N/A"}
													</span>
												</p>
												{isSelected && (
													<p className="theme-text-teal text-xs font-semibold">
														{isCatalogDetailLoading ? "Cloning itinerary…" : "Selected"}
													</p>
												)}
											</div>
										</button>
									);
								})}
							</div>
							{catalogTotalPages > 1 && (
								<PaginationControls
									currentPage={catalogPage}
									totalPages={catalogTotalPages}
									onPageChange={setCatalogPage}
								/>
							)}
						</>
					)}
				</section>
				</motion.section>
			)}
			</AnimatePresence>

			<form onSubmit={onSubmit} className="flex flex-col gap-4">
			<PackageFormStepHeader
				stepIndex={formStep}
				onStepSelect={(index) => {
					if (index > formStep) return;
					if (index >= 2 && !canContinueStep2) return;
					setFormStep(index);
				}}
			/>

			<div className="rounded-xl p-4 md:p-6" style={READABLE_SURFACE_STYLE}>
			<AnimatePresence mode="wait" initial={false}>
			{formStep === 0 && (
			<motion.div
				key="package-details"
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
				className="flex flex-col gap-4"
			>
				<FormStepIntro
					title="Answer a few questions about this package."
					hint="The estimated total is your budget cap. Hotel and activity rates can change, so the itinerary will warn you if live costs go over."
				/>
			<div role="list" className="flex flex-col gap-6">
				<PackageDetailsQuestion
					number={1}
					title="What should we call this package?"
					hint="Travelers will see this name first, so keep it short and memorable."
				>
					<CustomTextInput
						className={DETAILS_INPUT_CLASS}
						name="packageName"
						aria-label="Package name"
						placeholderText="e.g. Cox's Bazar Weekend Getaway"
						value={formData.packageName}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, packageName: e.target.value }))
						}
					/>
				</PackageDetailsQuestion>

				<PackageDetailsQuestion
					number={2}
					title="What is the estimated total cost?"
					hint="This is your budget cap. Hotel and activity rates can change, so the itinerary will warn you if live stop costs go over this amount."
				>
					<div className="flex flex-col gap-1.5">
						<CustomTextInput
							className={DETAILS_INPUT_CLASS}
							name="totalBudget"
							type="number"
							aria-label="Estimated total cost"
							placeholderText="e.g. 15000"
							value={formData.totalBudget ? String(formData.totalBudget) : ""}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, totalBudget: e.target.value ? Number(e.target.value) : 0 }))
							}
						/>
						{formData.totalBudget > 0 ? (
							<p className={`text-sm ${MONEY_TEXT_CLASS}`}>{formatTaka(formData.totalBudget)}</p>
						) : null}
					</div>
				</PackageDetailsQuestion>

				<PackageDetailsQuestion
					number={3}
					title="Which division is this tour in?"
					hint="We'll use this to load tour spots and activities for the itinerary."
					extra={
						formData.divisionLocationId ? (
							<DivisionSpotCountBadges
								tourSpotCount={selectedDivisionCounts.tourSpots}
								activitySpotCount={selectedDivisionCounts.activitySpots}
							/>
						) : undefined
					}
				>
					<CustomSelectInput
						className={DETAILS_INPUT_CLASS}
						name="division"
						aria-label="Division"
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
				</PackageDetailsQuestion>

				<PackageDetailsQuestion
					number={4}
					title="What type of tour is this?"
					hint="This helps travelers find the right kind of trip."
				>
					<CustomSelectInput
						className={DETAILS_INPUT_CLASS}
						name="tourType"
						aria-label="Tour type"
						value={formData.tourType}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								tourType: e.target.value as TourType | "",
							}))
						}
						options={tourTypeOptions}
					/>
				</PackageDetailsQuestion>

				<AnimatePresence initial={false}>
				{formData.division && formData.divisionLocationId && formData.tourType && (
					<motion.div
						key="unlocked-package-fields"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.22, ease: "easeInOut" }}
						className="flex flex-col gap-6 overflow-hidden"
					>
						<PackageDetailsQuestion
							number={5}
							title="How many days will it last?"
							hint="Choose between 1 and 14 days. This unlocks the itinerary on the next step."
						>
							<CustomSelectInput
								className={DETAILS_INPUT_CLASS}
								name="duration"
								aria-label="Duration in days"
								value={formData.duration ? String(formData.duration) : ""}
								onChange={(e) => {
									const nextDuration = e.target.value ? Number(e.target.value) : 0;
									setFormData((prev) => ({
										...prev,
										duration: nextDuration,
										daySegments: clampDaySegmentsToDuration(prev.daySegments, nextDuration),
									}));
								}}
								options={durationOptions}
							/>
						</PackageDetailsQuestion>

						<PackageDetailsQuestion
							number={6}
							title="When does the tour start?"
							hint="We'll calculate the end date from the duration you chose."
						>
							<div className="flex w-full flex-col gap-2">
								<CustomDatePicker
									className={DETAILS_INPUT_CLASS}
									value={formData.startDate}
									onChange={(value) =>
										setFormData((prev) => ({ ...prev, startDate: value }))
									}
								/>
								<AnimatePresence initial={false}>
								{formData.duration > 0 && formData.startDate && inferredEndDate && (
									<motion.p
										key="inferred-end-date"
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="overflow-hidden text-sm theme-text-subtle"
									>
										End date: <span className="theme-text">{formatDisplayDate(inferredEndDate)}</span>
									</motion.p>
								)}
								</AnimatePresence>
							</div>
						</PackageDetailsQuestion>

						<PackageDetailsQuestion
							number={7}
							title="How would you describe this package?"
							hint="A short summary of what travelers can expect."
						>
								<CustomTextAreaInput
									className={DETAILS_TEXTAREA_CLASS}
								name="shortDescription"
								aria-label="Short description"
								placeholderText="e.g. A relaxed coastal escape with beach time, local food, and a sunset walk."
								value={formData.shortDescription}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
								}
							/>
						</PackageDetailsQuestion>
					</motion.div>
				)}
				</AnimatePresence>
			</div>
			</motion.div>
			)}

			{formStep === 1 && (
				<motion.div
					key="day-segments"
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					className="flex w-full min-w-0 flex-col gap-4"
				>
					<ItineraryStopsTabs
						stopsByDay={stopsByDay}
						activeDayNumber={activeDayNumber}
						activeStopId={activeStopId}
						totalStopCount={formData.daySegments.length}
						duration={formData.duration}
						daysMissingStops={daysMissingStops}
						packageTotal={computedPackageTotal}
						estimatedBudget={formData.totalBudget}
						onReset={onResetSegments}
						onSelectDay={(dayNumber) => {
							setActiveDayNumber(dayNumber);
							const firstStop = stopsByDay.find(([day]) => day === dayNumber)?.[1]?.[0];
							setActiveStopId(firstStop?.id ?? null);
						}}
						onSelectStop={setActiveStopId}
						onAddToActiveDay={() => {
							if (activeDayNumber == null) return;
							if (isDayAtStopLimit(formData.daySegments, activeDayNumber)) {
								openNotificationPopUpMessage(`Day ${activeDayNumber} already has ${MAX_STOPS_PER_DAY} stops.`);
								return;
							}
							setDraftSegment(createBlankSegment(
								activeDayNumber,
								nextSegmentOrderForDay(formData.daySegments, activeDayNumber)
							));
						}}
					>
						{(row, stopIndex, stops) => (
							<TourDaySegmentRow
								row={row}
								stopLabel={`Stop ${row.segmentOrder || stopIndex + 1}`}
								showHotel={stopIndex === stops.length - 1}
								warnings={getSegmentFieldWarnings(row, formData.daySegments)}
								canMoveUp={stopIndex > 0}
								canMoveDown={stopIndex < stops.length - 1}
								onMoveWithinDay={stops.length > 1 ? (direction) => {
									setFormData((prev) => ({
										...prev,
										daySegments: moveStopWithinDay(prev.daySegments, row.id, direction),
									}));
								} : undefined}
								onChange={(nextRow) => setSegmentAt(row.id, {
									...nextRow,
									dayNumber: row.dayNumber,
									segmentOrder: row.segmentOrder,
								})}
								tourSpotOptions={mapSpotOptions("-- Select a tour spot --", filteredTourSpotsList)}
								activitySpotOptions={mapSpotOptions("-- Select activities --", filteredActivitySpotsList)}
								transportOptions={transportOptions}
								hotelOptions={hotelOptions}
							/>
						)}
					</ItineraryStopsTabs>

					<AnimatePresence mode="wait" initial={false}>
				{formData.duration > 0 ? (
					<motion.div
						key="add-day-panel"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.22, ease: "easeInOut" }}
						className="overflow-hidden"
					>
					<AddDaySegmentPanel
						draftSegment={draftSegment}
						duration={formData.duration}
						canAddDraft={canAddDraft}
						warnings={draftWarnings}
						existingStopCount={draftDayStopCount}
						maxStopsPerDay={MAX_STOPS_PER_DAY}
						onAdd={onAddDaySegment}
						onChangeDraft={(nextRow) => {
							const dayNumber = clampDayNumber(nextRow.dayNumber, formData.duration);
							setDraftSegment({
								...nextRow,
								dayNumber,
								segmentOrder: nextSegmentOrderForDay(formData.daySegments, dayNumber),
							});
						}}
						tourSpotOptions={mapSpotOptions("-- Select a tour spot --", filteredTourSpotsList)}
						activitySpotOptions={mapSpotOptions("-- Select activities --", filteredActivitySpotsList)}
						transportOptions={transportOptions}
						hotelOptions={hotelOptions}
						estimatedBudget={formData.totalBudget}
						itineraryTotal={computedPackageTotal}
					/>
					</motion.div>
					) : null}
					</AnimatePresence>
				</motion.div>
			)}

			{formStep === 2 && (
			<motion.div
				key="photos"
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -8 }}
				className="flex flex-col gap-4"
			>
				<PackageReviewSummary
					packageName={formData.packageName}
					duration={formData.duration}
					tourSpotNames={visitSpotNames}
					totalBudget={computedPackageTotal}
					estimatedBudget={formData.totalBudget}
				/>
				<FormStepIntro
					title="Add cover photos"
					hint="You can skip this and update images later."
				/>
			<ImageUploadModule
				imageUploadMode={mode}
				MAX_FILES={3}
				actionTrigger={actionTrigger}
				resourceId={tourPackageId}
				resourceLabel={mode === "create" ? "Add Tour Package Images" : "Edit Tour Package Images"}
				pic_url_Builder={(resourceId) => `cholo_bd/tour-packages/${resourceId}/images`}
				updateResourceMutation={({ id, imageURLs }) =>
					updateTourPackageMutate({ id, imageURLs })
				}
				deleteResourceMutation={({ id, imageIds }) =>
					deleteTourPackageImagesMutate({ tourPackageId: id, imageIds })
				}
				oldResourceImages={tourPlanData?.data?.images || []}
			/>
			</motion.div>
			)}
			</AnimatePresence>
			</div>

			<FormNavFooter
				formStep={formStep}
				continueDisabled={continueDisabled}
				continueDisabledReason={continueDisabledReason}
				canSave={canSaveForm}
				saveLabel={mode === "create" ? "Create Tour Package" : "Save Changes"}
				onBack={() => setFormStep((prev) => Math.max(prev - 1, 0))}
				onContinue={goFormNext}
				onCancel={onCancel}
			/>
		</form>
		</div>
	);
};

const toDateInputValue = (value?: Date | string) => {
	if (!value) return "";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";
	return parsed.toISOString().slice(0, 10);
};

const inferEndDate = (startDate: string, duration: number) => {
	if (!startDate || !duration) return "";
	const parsed = new Date(`${startDate}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return "";
	parsed.setDate(parsed.getDate() + duration - 1);
	const year = parsed.getFullYear();
	const month = String(parsed.getMonth() + 1).padStart(2, "0");
	const day = String(parsed.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value: string) => {
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};
