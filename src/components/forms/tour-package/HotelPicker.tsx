"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { HotelApi } from "@/services/api";
import { MONEY_TEXT_CLASS, TOUR_FORM_CONTROL_CLASS } from "./constants";
import type { HotelAssetSearch, SpotOption, TourDaySegmentFormRow } from "./types";
import { formatTaka, resolveHotelStayPrice, unwrapHotelList } from "./utils";

export const useMatchingHotels = (
	row: TourDaySegmentFormRow,
	tourSpotOptions: SpotOption[],
	search?: HotelAssetSearch
) => {
	const tourSpotLocationId =
		tourSpotOptions.find((option) => option.value === row.tourSpotId)?.locationId || "";
	const canFetchHotels = Boolean(tourSpotLocationId && row.hotelOption);
	const hotelQueryString = useMemo(() => {
		if (!canFetchHotels || !tourSpotLocationId || !row.hotelOption) {
			return "segment-hotels-idle";
		}
		const params = new URLSearchParams({
			locationId: tourSpotLocationId,
			hotelType: row.hotelOption,
			limit: "100",
		});
		if (search?.name.trim()) params.set("name", search.name.trim());
		if (search?.minRating) params.set("minRating", search.minRating);
		if (search?.allowShiftBooking) params.set("allowShiftBooking", "true");
		return params.toString();
	}, [
		canFetchHotels,
		tourSpotLocationId,
		row.hotelOption,
		search?.name,
		search?.minRating,
		search?.allowShiftBooking,
	]);
	const { data: hotelsData, isLoading: isHotelsLoading } = HotelApi.useGetAllHotelsRQ(
		hotelQueryString,
		canFetchHotels
	);

	const matchingHotels = useMemo(
		() => unwrapHotelList(hotelsData?.data),
		[hotelsData?.data]
	);

	const hotelPlaceholder = !row.tourSpotId
		? "-- Select a tour spot first --"
		: !row.hotelOption
			? "-- Select a hotel type first --"
			: isHotelsLoading
				? "-- Loading hotels --"
				: matchingHotels.length === 0
					? "-- No matching hotels --"
					: "-- Select a hotel --";

	return { matchingHotels, isHotelsLoading, hotelPlaceholder, canFetchHotels, tourSpotLocationId };
};

const formatHotelRating = (rating?: number) => {
	if (rating === undefined || rating === null || Number.isNaN(Number(rating))) {
		return "N/A";
	}
	return Number(rating).toFixed(1);
};

export const HotelRatingBadge = ({ rating }: { rating?: number }) => (
	<span className="inline-flex items-center gap-1 shrink-0" style={{ color: "var(--theme-star)" }}>
		{formatHotelRating(rating)}
		<FaStar className="h-3.5 w-3.5" aria-hidden="true" />
	</span>
);

export const HotelSelectWithRating = ({
	value,
	hotels,
	placeholder,
	onChange,
	className,
	hideLabel = false,
	hotelType,
}: {
	value: string;
	hotels: Hotel[];
	placeholder: string;
	onChange: (hotelId: string) => void;
	className?: string;
	hideLabel?: boolean;
	hotelType?: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const selectedHotel = hotels.find((hotel) => hotel.id === value);
	const selectedStayPrice = resolveHotelStayPrice(selectedHotel, hotelType);

	useEffect(() => {
		if (!isOpen) return;

		const handleOutsideClick = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};

		document.addEventListener("mousedown", handleOutsideClick);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	return (
		<div className={`relative flex flex-col space-y-1 ${className || TOUR_FORM_CONTROL_CLASS}`} ref={containerRef}>
			{hideLabel ? null : <label style={{ color: "var(--theme-teal)" }}>Hotel</label>}
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((prev) => !prev)}
				className="w-full p-1 rounded-sm text-left focus:outline-none focus:ring-2"
				style={{
					backgroundColor: "var(--theme-input-bg)",
					color: "var(--theme-text)",
					outlineColor: "var(--theme-teal)",
					borderWidth: "1px",
					borderStyle: "solid",
					borderColor: "var(--theme-deep-green)",
					["--tw-ring-color" as string]: "var(--theme-teal)",
				}}
			>
				<span className="flex items-center justify-between gap-2 min-w-0">
					<span className="truncate">
						{selectedHotel ? selectedHotel.name : placeholder}
					</span>
					{selectedHotel && (
						<span className="flex shrink-0 items-center gap-2">
							{selectedStayPrice ? (
								<span className={`text-sm ${MONEY_TEXT_CLASS}`}>
									{formatTaka(selectedStayPrice.price)}
								</span>
							) : null}
							<HotelRatingBadge rating={selectedHotel.rating} />
						</span>
					)}
				</span>
			</button>

			<AnimatePresence initial={false}>
			{isOpen && (
				<motion.ul
					role="listbox"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.16, ease: "easeOut" }}
					className="relative z-30 mt-1 max-h-56 overflow-y-auto rounded-sm theme-dropdown shadow-md"
				>
					<li>
						<button
							type="button"
							role="option"
							aria-selected={!value}
							className="w-full px-2 py-1.5 text-left text-sm theme-text-subtle hover:opacity-80"
							style={{ backgroundColor: "transparent" }}
							onClick={() => {
								onChange("");
								setIsOpen(false);
							}}
						>
							{placeholder}
						</button>
					</li>
					{hotels.filter((hotel) => hotel?.id).map((hotel) => {
						const stayPrice = resolveHotelStayPrice(hotel, hotelType);
						return (
						<li key={hotel.id}>
							<button
								type="button"
								role="option"
								aria-selected={hotel.id === value}
								className="w-full px-2 py-1.5 text-left text-sm hover:opacity-80"
								style={{
									backgroundColor: hotel.id === value ? "var(--theme-teal-soft)" : "transparent",
									color: "var(--theme-text)",
								}}
								onClick={() => {
									onChange(hotel.id);
									setIsOpen(false);
								}}
							>
								<span className="flex items-center justify-between gap-2 min-w-0">
									<span className="truncate">{hotel.name}</span>
									<span className="flex shrink-0 items-center gap-2">
										{stayPrice ? (
											<span className={`text-sm ${MONEY_TEXT_CLASS}`}>
												{formatTaka(stayPrice.price)}
											</span>
										) : null}
										<HotelRatingBadge rating={hotel.rating} />
									</span>
								</span>
							</button>
						</li>
						);
					})}
				</motion.ul>
			)}
			</AnimatePresence>
		</div>
	);
};

export const SpotSelectWithCost = ({
	value,
	options,
	placeholder,
	onChange,
	className,
	label,
	hideLabel = false,
}: {
	value: string;
	options: SpotOption[];
	placeholder: string;
	onChange: (value: string) => void;
	className?: string;
	label?: string;
	hideLabel?: boolean;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const selectable = options.filter((option) => option.value);
	const selected = selectable.find((option) => option.value === value);

	useEffect(() => {
		if (!isOpen) return;

		const handleOutsideClick = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};

		document.addEventListener("mousedown", handleOutsideClick);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	return (
		<div className={`relative flex flex-col space-y-1 ${className || TOUR_FORM_CONTROL_CLASS}`} ref={containerRef}>
			{hideLabel || !label ? null : <label style={{ color: "var(--theme-teal)" }}>{label}</label>}
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((prev) => !prev)}
				className="w-full p-1 rounded-sm text-left focus:outline-none focus:ring-2"
				style={{
					backgroundColor: "var(--theme-input-bg)",
					color: "var(--theme-text)",
					outlineColor: "var(--theme-teal)",
					borderWidth: "1px",
					borderStyle: "solid",
					borderColor: "var(--theme-deep-green)",
					["--tw-ring-color" as string]: "var(--theme-teal)",
				}}
			>
				<span className="flex items-center justify-between gap-2 min-w-0">
					<span className="truncate">{selected ? selected.label : placeholder}</span>
					{selected && typeof selected.cost === "number" ? (
						<span className={`text-sm ${MONEY_TEXT_CLASS}`}>{formatTaka(selected.cost)}</span>
					) : null}
				</span>
			</button>

			<AnimatePresence initial={false}>
			{isOpen && (
				<motion.ul
					role="listbox"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.16, ease: "easeOut" }}
					className="relative z-30 mt-1 max-h-56 overflow-y-auto rounded-sm theme-dropdown shadow-md"
				>
					<li>
						<button
							type="button"
							role="option"
							aria-selected={!value}
							className="w-full px-2 py-1.5 text-left text-sm theme-text-subtle hover:opacity-80"
							style={{ backgroundColor: "transparent" }}
							onClick={() => {
								onChange("");
								setIsOpen(false);
							}}
						>
							{placeholder}
						</button>
					</li>
					{selectable.map((option) => (
						<li key={option.value}>
							<button
								type="button"
								role="option"
								aria-selected={option.value === value}
								className="w-full px-2 py-1.5 text-left text-sm hover:opacity-80"
								style={{
									backgroundColor: option.value === value ? "var(--theme-teal-soft)" : "transparent",
									color: "var(--theme-text)",
								}}
								onClick={() => {
									onChange(option.value);
									setIsOpen(false);
								}}
							>
								<span className="flex items-center justify-between gap-2 min-w-0">
									<span className="truncate">{option.label}</span>
									{typeof option.cost === "number" ? (
										<span className={`text-sm ${MONEY_TEXT_CLASS}`}>{formatTaka(option.cost)}</span>
									) : null}
								</span>
							</button>
						</li>
					))}
				</motion.ul>
			)}
			</AnimatePresence>
		</div>
	);
};
