import { HotelType, TourType, TransportServiceType } from "@/types/enums";

export type TourFormMode = "create" | "edit";

export type TourDaySegmentFormRow = {
	id: string;
	dayNumber: number;
	segmentOrder: number;
	shortDescription: string;
	tourSpotId: string;
	activitySpotId: string;
	transportOption: TransportServiceType | "";
	hotelOption: HotelType | "";
	hotelId: string;
	activityCost: number;
	hotelCost: number;
	notes: string;
};

export type TourPackageFormState = {
	packageName: string;
	totalBudget: number;
	division: string;
	divisionLocationId: string;
	tourType: TourType | "";
	duration: number;
	maxGroupSize: number;
	shortDescription: string;
	daySegments: TourDaySegmentFormRow[];
};

export type TourDaySegmentFieldWarnings = {
	dayNumber?: string;
	tourSpot?: string;
	activitySpot?: string;
};

export type SpotOption = {
	label: string;
	value: string;
	locationId: string;
	rating?: number;
	cost?: number;
};

export type HotelStayPrice = {
	price: number;
	roomType: string;
};

export type SelectOption = { label: string; value: string };

export type HotelAssetSearch = {
	name: string;
	minRating: string;
	allowShiftBooking: boolean;
};
