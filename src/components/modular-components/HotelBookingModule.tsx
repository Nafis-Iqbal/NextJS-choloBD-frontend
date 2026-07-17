"use client";

import { useState, useMemo, useEffect } from "react";
import { HotelBookingApi, HotelApi, PaymentApi, WalletApi } from "@/services/api";
import { createHotelRoomBookingSchema } from "@/validators/hotelBookingValidators";
import { produceValidationErrorMessage } from "@/utilities/utilities";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { queryClient } from "@/services/apiInstance";
import { ServiceType, RoomShift, PaymentStatus } from "@/types/enums";
import {
	CustomDateInput,
	CustomSelectInput,
	CustomTextInput,
	CustomTextAreaInput,
} from "@/components/custom-elements/CustomInputElements";
import { FaCheckCircle } from "react-icons/fa";

interface BookingState {
	checkInDate: string;
	checkOutDate: string;
	numberOfGuests: number;
	numberOfRooms: number;
	selectedRooms: Map<string, number>;
	guestName: string;
	guestEmail: string;
	guestPhoneNumber: string;
	paymentMethod: string;
	specialRequests: string;
	shift: keyof typeof RoomShift;
}

interface HotelBookingPanelProps {
	hotelName: string;
	hotelId: string;
	userId: string;
	onBookingSuccess?: () => void;
	onCancel?: () => void;
	initialCheckIn?: string;
	initialCheckOut?: string;
	initialGuests?: number;
	initialRooms?: number;
	initialShift?: keyof typeof RoomShift;
}

interface RoomCardProps {
	roomData: AvailableRoomType;
	roomCount: number;
	nights: number;
	onRoomSelection: (roomTypeId: string, quantity: number) => void;
	shift: keyof typeof RoomShift;
}

interface AvailableRoomType {
	roomTypeId: string;
	roomType: string;
	totalRooms: number;
	availableRooms: number;
	basePrice: number;
	nightShiftPrice: number;
	morningShiftPrice: number;
	afternoonShiftPrice: number;
	allowShiftBooking: boolean;
}

interface HotelRoomAvailabilityResponse {
	isAvailable: boolean;
	totalRoomsNeeded: number;
	totalAvailableRooms: number;
	bookingType: 'DATE_RANGE' | 'SHIFT';
	shift?: keyof typeof RoomShift;
	availableRoomsByType: AvailableRoomType[];
	message: string;
}

export function HotelBookingModule({ 
	hotelName,
	hotelId, 
	userId, 
	onBookingSuccess, 
	onCancel,
	initialCheckIn,
	initialCheckOut,
	initialGuests,
	initialRooms,
	initialShift,
}: HotelBookingPanelProps) {
	const { openNotificationPopUpMessage } = useGlobalUI();
	
	const [bookingState, setBookingState] = useState<BookingState>({
		checkInDate: initialCheckIn || new Date().toISOString().split('T')[0],
		checkOutDate: initialCheckOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
		numberOfGuests: initialGuests || 1,
		numberOfRooms: initialRooms || 1,
		selectedRooms: new Map(),
		guestName: "",
		guestEmail: "",
		guestPhoneNumber: "",
		paymentMethod: "sslcommerz",
		specialRequests: "",
		shift: initialShift || "ALL_DAY",
	});

	const [isProcessing, setIsProcessing] = useState(false);
	const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
	const [bookingId, setBookingId] = useState<string | null>(null);
	const [payingForBooking, setPayingForBooking] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(null);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [isPaymentComplete, setIsPaymentComplete] = useState(false);

	// Validation checks - must come before availabilityQueryString
	const isDateValid = useMemo(() => {
		if (bookingState.shift !== "ALL_DAY") {
			// For non-ALL_DAY shifts, checkout must equal checkin
			if (!bookingState.checkInDate || !bookingState.checkOutDate) return false;
			return bookingState.checkOutDate === bookingState.checkInDate;
		} else {
			// For ALL_DAY, checkout must be after checkin
			if (!bookingState.checkInDate || !bookingState.checkOutDate) return false;
			const a = new Date(bookingState.checkInDate);
			const b = new Date(bookingState.checkOutDate);
			return b.getTime() > a.getTime();
		}
	}, [bookingState.checkInDate, bookingState.checkOutDate, bookingState.shift]);

	// Build querystring for availability check
	const availabilityQueryString = useMemo(() => {
		if (!isDateValid || !bookingState.numberOfRooms) return undefined;
		const params = new URLSearchParams();
		params.append("numberOfRooms", String(bookingState.numberOfRooms));
		params.append("checkInDate", bookingState.checkInDate);
		params.append("checkOutDate", bookingState.checkOutDate);
		params.append("shift", bookingState.shift);
		return params.toString();
	}, [bookingState.numberOfRooms, bookingState.checkInDate, bookingState.checkOutDate, bookingState.shift, isDateValid]);

	const {data: availabilityData, isLoading, error, status} = HotelApi.useGetHotelRoomAvailabilityRQ(hotelId, availabilityQueryString);
	const availabilityInfo = availabilityData?.data as HotelRoomAvailabilityResponse | undefined;

	// API Hooks
	const { mutate: createBookingMutation } = HotelBookingApi.useCreateBookingRQ(
		(responseData) => {
			setIsProcessing(false);
			if (responseData.status === "success") {
				setConfirmationCode(responseData.data?.confirmationCode || "BOOKING_CREATED");
				setBookingId(responseData.data?.id || null);
				const alreadyPaid =
					responseData.data?.paymentStatus === PaymentStatus.PAID;
				setIsPaymentComplete(alreadyPaid);
				setPayingForBooking(false);
				setTimeout(() => onBookingSuccess?.(), 2000);
			}
			else {
				openNotificationPopUpMessage(
					responseData.message || "Failed to create Booking. Please try again."
				);
			}
		},
		(error) => {
			setIsProcessing(false);
			const errorMessage = error.message || "Failed to create booking. Please try again.";
			openNotificationPopUpMessage(errorMessage);
		}
	);

	// Initialize payment mutation for card payment
	const { mutate: initializePaymentMutation } = PaymentApi.useInitializePaymentRQ(
		(responseData) => {
			setIsProcessingPayment(false);
			
			if (responseData.status === "success" && responseData.data?.gatewayPageURL) {
				// Redirect to payment gateway for card payment
				window.location.assign(responseData.data.gatewayPageURL);
			} else {
				openNotificationPopUpMessage(
					responseData.message || "Payment initialization failed"
				);
			}
		},
		(error) => {
			setIsProcessingPayment(false);
			openNotificationPopUpMessage(
				error?.message || "Failed to initialize payment"
			);
		}
	);

	// Charge wallet credits mutation for wallet payment
	const { mutate: chargeWalletMutation } = WalletApi.useChargeWalletCreditsRQ(
		(responseData) => {
			setIsProcessingPayment(false);
			if (responseData.status === "success") {
				queryClient.invalidateQueries({queryKey:["myWallet"]});
				queryClient.invalidateQueries({queryKey:["hotelBookings"]});
				openNotificationPopUpMessage(
					responseData.message || "Payment completed successfully"
				);
				setIsPaymentComplete(true);
				setPayingForBooking(false);
				setPaymentMethod(null);
				setTimeout(() => onBookingSuccess?.(), 2000);
			} else {
				openNotificationPopUpMessage(
					responseData.message || "Failed to charge wallet"
				);
			}
		},
		(error) => {
			setIsProcessingPayment(false);
			openNotificationPopUpMessage(
				error?.message || "Failed to process wallet payment"
			);
		}
	);

	// Calculate nights
	const nights = useMemo(() => {
		const checkIn = new Date(bookingState.checkInDate);
		const checkOut = new Date(bookingState.checkOutDate);
		const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
		let calculatedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		// For shift-based bookings (same day), count as 1 unit
		if (bookingState.shift !== "ALL_DAY" && calculatedNights === 0) {
			calculatedNights = 1;
		}
		
		return calculatedNights;
	}, [bookingState.checkInDate, bookingState.checkOutDate, bookingState.shift]);

	// Get available room types from availability response
	const availableRooms = useMemo(() => {
		if (!availabilityInfo?.availableRoomsByType) return [];
		return availabilityInfo.availableRoomsByType.filter((roomType: AvailableRoomType) => roomType.availableRooms > 0);
	}, [availabilityInfo?.availableRoomsByType]);

	// Helper function to get price based on shift (from new response structure)
	const getPriceByShift = (roomData: AvailableRoomType, shift: keyof typeof RoomShift): number => {
		switch (shift) {
			case "MORNING":
				return roomData.morningShiftPrice ?? 0;
			case "AFTERNOON":
				return roomData.afternoonShiftPrice ?? 0;
			case "NIGHT":
				return roomData.nightShiftPrice ?? 0;
			case "ALL_DAY":
			default:
				return roomData.basePrice ?? 0;
		}
	};

	// Calculate total cost based on selected shift
	const totalCost = useMemo(() => {
		let total = 0;
		bookingState.selectedRooms.forEach((quantity, roomTypeId) => {
			const roomData = availabilityInfo?.availableRoomsByType?.find((rt: AvailableRoomType) => rt.roomTypeId === roomTypeId);
			if (roomData) {
				const price = getPriceByShift(roomData, bookingState.shift);
				total += price * nights * quantity;
			}
		});
		return total;
	}, [bookingState.selectedRooms, availabilityInfo?.availableRoomsByType, nights, bookingState.shift]);

	const isGuestInfoComplete =
		bookingState.guestName.trim() &&
		bookingState.guestEmail.trim() &&
		bookingState.guestPhoneNumber.trim();
	const hasRoomsSelected = bookingState.selectedRooms.size > 0;
	const canBook = isDateValid && isGuestInfoComplete && hasRoomsSelected;

	const handleDateChange = (field: "checkInDate" | "checkOutDate", value: string) => {
		setBookingState((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleGuestInfoChange = (field: keyof BookingState, value: string | number) => {
		setBookingState((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleRoomSelection = (roomId: string, quantity: number) => {
		const newSelectedRooms = new Map(bookingState.selectedRooms);
		if (quantity <= 0) {
			newSelectedRooms.delete(roomId);
		} else {
			newSelectedRooms.set(roomId, quantity);
		}
		setBookingState((prev) => ({
			...prev,
			selectedRooms: newSelectedRooms,
		}));
	};

	const handleBookingSubmit = async () => {
		if (!canBook || !userId) return;

		setIsProcessing(true);

		// Convert selectedRooms Map to Record
		const selectedRoomsRecord: Record<string, number> = {};
		bookingState.selectedRooms.forEach((qty, roomTypeId) => {
			selectedRoomsRecord[roomTypeId] = qty;
		});

		// Build booking data matching CreateHotelRoomBookingInput shape
		const bookingData = {
			hotelId: hotelId,
			userId,
			checkInDate: bookingState.checkInDate,
			checkOutDate: bookingState.checkOutDate,
			shift: bookingState.shift,
			totalPrice: totalCost,
			paymentMethod: bookingState.paymentMethod || undefined,
			specialRequests: bookingState.specialRequests || undefined,
			selectedRoomsMap: selectedRoomsRecord,
			guestName: bookingState.guestName,
			guestEmail: bookingState.guestEmail,
			guestPhoneNumber: bookingState.guestPhoneNumber,
		};

		// Validate booking data against schema
		const result = createHotelRoomBookingSchema.safeParse(bookingData);
		console.log("Booking Data Validation Result:", result);
		if (!result.success) {
			const message = produceValidationErrorMessage(result);
			openNotificationPopUpMessage(`Validation Failed: ${message}. Try Again.`);
			setIsProcessing(false);
			return;
		}

		// Call mutation with validated and properly typed data
		createBookingMutation(result.data);
	};

	const onProceedPaymentClicked = () => {
		if (!paymentMethod || !bookingId) return;
		
		setIsProcessingPayment(true);

		if (paymentMethod === "card") {
			// Initialize payment for card payment
			initializePaymentMutation({
				serviceType: ServiceType.HOTEL_BOOKING,
				serviceTypeId: bookingId,
				userId: userId,
				userName: bookingState.guestName || undefined,
				phone: bookingState.guestPhoneNumber || undefined,
				email: bookingState.guestEmail || undefined,
				paymentAmount: totalCost,
			});
		} else if (paymentMethod === "wallet") {
			// Charge wallet credits for wallet payment
			const creditsAmount = Math.floor(totalCost * 0.8);
			chargeWalletMutation({
				serviceType: ServiceType.HOTEL_BOOKING,
				serviceTypeId: bookingId,
				paymentAmount: creditsAmount,
			});
		}
	};

	const handleReset = () => {
		setBookingState({
			checkInDate: new Date().toISOString().split('T')[0],
			checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
			numberOfGuests: 1,
			numberOfRooms: 1,
			selectedRooms: new Map(),
			guestName: "",
			guestEmail: "",
			guestPhoneNumber: "",
			paymentMethod: "sslcommerz",
			specialRequests: "",
			shift: "ALL_DAY",
		});
		setConfirmationCode(null);
		setBookingId(null);
		setPayingForBooking(false);
		setPaymentMethod(null);
		setIsPaymentComplete(false);
	};

	// Early return if availability data not loaded
	if (!availabilityInfo && isDateValid) {
		return (
			<section className="mt-8 rounded-xl theme-outline bg-sub-section p-4 md:p-6" id="hotel-booking-panel">
				{isLoading && <p className="theme-text-muted">Loading room availability...</p>}
				{error && <p className="text-red-400">Failed to load availability. Please try again.</p>}
				{!isLoading && !error && <p className="theme-text-subtle">No availability data</p>}
			</section>
		);
	}

	return (
		<section className="mt-8 rounded-xl theme-outline bg-sub-section p-4 md:p-6" id="hotel-booking-panel">
			<h2 className="text-3xl font-semibold theme-text-teal mb-2">Hotel Room Booking</h2>
			<p className="theme-text-muted text-sm mb-6">Complete your hotel room booking</p>

			<h3 className="theme-text-teal font-semibold mb-6">{hotelName}</h3>

			{confirmationCode ? (
				<div className="theme-outline bg-sub-section rounded-lg p-6 max-w-2xl mx-auto">
					<h3 className="theme-text font-semibold text-lg mb-2 text-center">
						{isPaymentComplete ? "Booking Paid Successfully!" : "Booking Confirmed!"}
					</h3>
					<p className="theme-text-muted mb-4 text-center">Confirmation Code: <span className="font-bold theme-text">{confirmationCode}</span></p>
					
					{/* Booking Summary with Payment Option */}
					<div className="bg-section rounded-lg p-4 mb-4">
						<div className="flex justify-between items-center mb-4">
							<span className="theme-text font-medium">Total Amount:</span>
							<span className="theme-text-teal text-xl font-bold">৳ {totalCost.toLocaleString()}</span>
						</div>
						
						<div className="flex space-x-2 w-full items-stretch">
							{isPaymentComplete ? (
								<div
									className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-semibold"
									style={{
										backgroundColor: "var(--theme-teal)",
										color: "white",
									}}
									aria-label="Payment completed"
								>
									<FaCheckCircle className="w-4 h-4" />
									Paid
								</div>
							) : (
								<button
									onClick={() => {
										setPayingForBooking(!payingForBooking);
										setPaymentMethod(null);
									}}
									className="flex-1 px-3 py-2 theme-btn-teal text-sm rounded font-medium transition-colors"
								>
									Pay Now
								</button>
							)}
							<button
								onClick={handleReset}
								className="flex-1 px-3 py-2 green-button text-sm rounded font-medium transition-all"
							>
								Book Another Room
							</button>
						</div>

						{/* Payment Method Selection — unpaid bookings only */}
						{!isPaymentComplete && payingForBooking && (
							<div className="mt-4 p-3 bg-section rounded-lg mx-auto">
								<p className="theme-text-muted text-xs font-semibold mb-3">Select Payment Method</p>
								<div className="space-y-2 mb-3">
									<label className="flex items-center gap-3 p-2 bg-sub-section rounded theme-outline cursor-pointer hover:border-2 hover:border-teal-500/60 transition-colors">
										<input
											type="radio"
											name="payment-method"
											value="wallet"
											checked={paymentMethod === "wallet"}
											onChange={() => setPaymentMethod("wallet")}
											className="w-4 h-4"
										/>
										<div className="flex-1">
											<p className="theme-text text-xs font-medium">💰 Wallet</p>
											<p className="theme-text-subtle text-xs">Pay using your wallet balance</p>
										</div>
									</label>

									<label className="flex items-center gap-3 p-2 bg-sub-section rounded theme-outline cursor-pointer hover:border-2 hover:border-teal-500/60 transition-colors">
										<input
											type="radio"
											name="payment-method"
											value="card"
											checked={paymentMethod === "card"}
											onChange={() => setPaymentMethod("card")}
											className="w-4 h-4"
										/>
										<div className="flex-1">
											<p className="theme-text text-xs font-medium">💳 Card</p>
											<p className="theme-text-subtle text-xs">Pay using credit or debit card</p>
										</div>
									</label>
								</div>

								<div className="flex gap-2">
									<button
										disabled={!paymentMethod || isProcessingPayment}
										onClick={onProceedPaymentClicked}
										className="flex-1 px-3 py-2 theme-btn-teal text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isProcessingPayment ? "Processing..." : "Proceed Payment"}
									</button>
									<button
										onClick={() => {
											setPayingForBooking(false);
											setPaymentMethod(null);
										}}
										disabled={isProcessingPayment}
										className="px-3 py-2 bg-section theme-outline text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed theme-text hover:theme-text-teal"
									>
										Close
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			) : (
				<>
					{/* Step 1: Date & Guest Selection */}
					<div className="bg-sub-section rounded-lg theme-outline p-5 mb-6">
					<h3 className="theme-text-teal font-semibold mb-4">Step 1: Select Dates, Shift & Guests</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<CustomDateInput
									label="Check-in Date"
									labelStyle="theme-text-teal"
									value={bookingState.checkInDate}
									onChange={(e) => handleDateChange("checkInDate", e.target.value)}
									className="w-full"
								/>
							</div>
							<div>
								<CustomDateInput
									label="Check-out Date"
									labelStyle="theme-text-teal"
									value={bookingState.checkOutDate}
									onChange={(e) => handleDateChange("checkOutDate", e.target.value)}
									className="w-full"
								/>
							</div>
							<div>
								<CustomSelectInput
									label="Room Shift"
									labelStyle="theme-text-teal"
									value={bookingState.shift}
									onChange={(e) => handleGuestInfoChange("shift", e.target.value as keyof typeof RoomShift)}
									options={[
										{ label: "All Day", value: "ALL_DAY" },
										{ label: "Morning (8AM - 3PM)", value: "MORNING" },
										{ label: "Afternoon (3PM - 10PM)", value: "AFTERNOON" },
										{ label: "Night (10PM - 8AM)", value: "NIGHT" },
									]}
									className="w-full"
								/>
							</div>
							<div>
								<CustomSelectInput
									label="Number of Guests"
									labelStyle="theme-text-teal"
									value={bookingState.numberOfGuests.toString()}
									onChange={(e) => handleGuestInfoChange("numberOfGuests", parseInt(e.target.value))}
									options={["1", "2", "3", "4", "5", "6"].map((n) => ({ label: n, value: n }))}
									className="w-full"
								/>
							</div>
							<div>
								<CustomSelectInput
									label="Number of Rooms"
									labelStyle="theme-text-teal"
									value={bookingState.numberOfRooms.toString()}
									onChange={(e) => handleGuestInfoChange("numberOfRooms", parseInt(e.target.value))}
									options={["1", "2", "3", "4"].map((n) => ({ label: n, value: n }))}
									className="w-full"
								/>
							</div>
						</div>
						{!isDateValid && bookingState.checkInDate && bookingState.checkOutDate && (
							<p className="text-red-400 text-xs mt-3">⚠️ {bookingState.shift !== "ALL_DAY" 
								? "For this shift, check-out must be the same as check-in date." 
								: "Check-out must be after check-in."}</p>
						)}
						{isDateValid && (
							<p className="theme-text-teal text-xs mt-3">✓ {nights} night{nights !== 1 ? "s" : ""}</p>
						)}
					</div>

					{/* Step 2: Room Selection */}
					{isDateValid ? (
					<div className="bg-sub-section rounded-lg theme-outline p-5 mb-6">
					<h3 className="theme-text-teal font-semibold mb-4">Step 2: Select Rooms</h3>
						{availableRooms.length === 0 ? (
							<div className="bg-sub-section theme-outline rounded-lg p-5">
								<p className="text-red-400 text-sm">No available rooms for these dates at this hotel</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{availableRooms.map((roomData: AvailableRoomType) => {
									const roomCount = bookingState.selectedRooms.get(roomData.roomTypeId) || 0;
									return (
										<RoomCard
											key={roomData.roomTypeId}
											roomData={roomData}
											roomCount={roomCount}
											nights={nights}
											shift={bookingState.shift}
											onRoomSelection={handleRoomSelection}
										/>
									);
								})}
							</div>
						)}
					</div>
				) : (
					<div className="bg-sub-section theme-outline rounded-lg p-5 mb-6">
						<p className="theme-text-muted text-sm">Please select valid dates to see available rooms</p>
					</div>
				)}

					{/* Step 3: Guest Information */}
					{hasRoomsSelected && (
						<div className="bg-sub-section rounded-lg theme-outline p-5 mb-6">
						<h3 className="theme-text-teal font-semibold mb-4">Step 3: Guest Information</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<CustomTextInput
									type="text"
									label="Full Name"
									name="guestName"
									placeholderText="Enter full name"
									value={bookingState.guestName}
									onChange={(e) => handleGuestInfoChange("guestName", e.target.value)}
									className="w-full"
								/>
								<CustomTextInput
									type="email"
									label="Email Address"
									name="guestEmail"
									placeholderText="Enter email address"
									value={bookingState.guestEmail}
									onChange={(e) => handleGuestInfoChange("guestEmail", e.target.value)}
									className="w-full"
								/>
								<CustomTextInput
									type="tel"
									label="Phone Number"
									name="guestPhoneNumber"
									placeholderText="Enter phone number"
									value={bookingState.guestPhoneNumber}
									onChange={(e) => handleGuestInfoChange("guestPhoneNumber", e.target.value)}
									className="w-full"
								/>
							</div>
							<CustomTextAreaInput
								label="Special Requests (Optional)"
								name="specialRequests"
								placeholderText="Any special requests for your stay"
								value={bookingState.specialRequests}
								onChange={(e) => handleGuestInfoChange("specialRequests", e.target.value)}
								className="w-full resize-none"
								rows={3}
							/>
						</div>
					)}

					{/* Booking Summary */}
				{hasRoomsSelected && isGuestInfoComplete && (
						<div className="bg-section rounded-lg theme-outline p-5 mb-6">
						<h3 className="theme-text-teal font-semibold mb-4">Booking Summary</h3>
							<div className="space-y-2 mb-4">
								{Array.from(bookingState.selectedRooms.entries()).map(([roomTypeId, quantity]) => {
								const roomData = availabilityInfo?.availableRoomsByType?.find((rt: AvailableRoomType) => rt.roomTypeId === roomTypeId);
									const pricePerUnit = getPriceByShift(roomData!, bookingState.shift);
									const isPriceAvailable = pricePerUnit > 0;
									const subtotal = pricePerUnit * nights * quantity;
								const unitLabel = bookingState.shift === "ALL_DAY" ? `night${nights !== 1 ? "s" : ""}` : `${bookingState.shift.toLowerCase()} shift`;
								return (
									<div key={roomTypeId} className="flex justify-between items-center text-sm pb-2" style={{ borderBottom: '1px solid var(--theme-deep-green)' }}>
										<span className="theme-text-muted">
											{roomData?.roomType} × {quantity} room{quantity > 1 ? "s" : ""} × {bookingState.shift === "ALL_DAY" ? nights : 1} {unitLabel}
											</span>
											{isPriceAvailable ? (
												<span className="theme-text">৳ {subtotal.toLocaleString()}</span>
											) : (
												<span className="text-red-400">Not Available</span>
											)}
										</div>
									);
								})}
							</div>
							<div style={{ borderTop: '1px solid var(--theme-deep-green)' }} className="pt-4">
								<div className="flex justify-between items-center">
									<span className="theme-text font-semibold">Total Amount:</span>
									<span className="theme-text-teal text-2xl font-bold">৳ {totalCost.toLocaleString()}</span>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
				{hasRoomsSelected && isGuestInfoComplete && (
						<div className="flex gap-3">
							<button
								className={`flex-1 py-3 px-4 rounded font-medium transition-all ${
									canBook && !isProcessing
										? "theme-btn-teal"
										: "opacity-50 cursor-not-allowed"
								}`}
								disabled={!canBook || isProcessing}
								onClick={handleBookingSubmit}
							>
								{isProcessing ? "Processing Booking..." : "Complete Booking"}
							</button>
							<button
								className="px-6 py-3 rounded theme-btn-teal hover:theme-text-teal transition-all"
								onClick={handleReset}
								disabled={isProcessing}
							>
								Reset Form
							</button>
							{onCancel && (
								<button
									className="px-6 py-3 rounded border-2 text-red-400 hover:text-red-300 border-red-700 hover:border-red-600 transition-all"
									onClick={onCancel}
									disabled={isProcessing}
								>
									Cancel
								</button>
							)}
						</div>
					)}
				</>
			)}
		</section>
	);
}

function RoomCard({ roomData, roomCount, nights, shift, onRoomSelection }: RoomCardProps) {
	// Helper function to get price based on shift
	const getPriceByShift = (roomData: AvailableRoomType, shift: keyof typeof RoomShift): number => {
		switch (shift) {
			case "MORNING":
				return roomData.morningShiftPrice ?? 0;
			case "AFTERNOON":
				return roomData.afternoonShiftPrice ?? 0;
			case "NIGHT":
				return roomData.nightShiftPrice ?? 0;
			case "ALL_DAY":
			default:
				return roomData.basePrice ?? 0;
		}
	};

	// Helper function to get price title based on shift
	const getShiftLabel = (shift: keyof typeof RoomShift): string => {
		switch (shift) {
			case "MORNING":
				return "Price (Morning 8AM-3PM)";
			case "AFTERNOON":
				return "Price (Afternoon 3PM-10PM)";
			case "NIGHT":
				return "Price (Night 10PM-8AM)";
			case "ALL_DAY":
			default:
				return "Price per Night";
		}
	};

	// Extract pricing info from roomData
	const pricePerUnit = getPriceByShift(roomData, shift);
	const roomTypeLabel = roomData.roomType || "Room";
	const roomTotal = pricePerUnit * nights * roomCount;
	const availableCount = roomData.availableRooms || 0;
	const totalCount = roomData.totalRooms || 0;

	// Check if price is available (not negative or zero)
	const isPriceAvailable = pricePerUnit > 0;

	// Check if this roomType is selected
	const isSelected = roomCount > 0;

	const handleSelect = () => {
		// Start with quantity 1 when selected
		onRoomSelection(roomData.roomTypeId, 1);
	};

	const handleCancel = () => {
		// Deselect by setting quantity to 0
		onRoomSelection(roomData.roomTypeId, 0);
	};

	return (
		<div
			key={roomData.roomTypeId}
			className="rounded-lg theme-outline bg-sub-section p-5 transition-all"
			style={{ 
				boxShadow: 'none',
				borderWidth: '2px'
			}}
		>
			{/* Room Type Header */}
			<div className="mb-4">
				<div className="flex items-start justify-between mb-2">
					<div className="flex items-center gap-2">
						<h4 className="theme-text font-bold text-lg">
							{roomTypeLabel?.charAt(0).toUpperCase() + roomTypeLabel?.slice(1).toLowerCase()}
						</h4>
						{isSelected && (
							<span className="text-xs bg-teal-600/30 theme-text-teal px-2 py-1 rounded border-2 border-teal-700/60">Selected</span>
						)}
					</div>
					<span className="text-xs theme-text-teal px-2 py-1 rounded border border-teal-700/50">{availableCount} Available</span>
				</div>
				<p className="theme-text-subtle text-xs mt-2">Sleeps multiple guests • {totalCount} rooms total</p>
			</div>

			{/* Price Section */}
			<div className="bg-section rounded-lg p-3 mb-4 theme-outline">
				<p className="theme-text-subtle text-xs uppercase font-semibold mb-1">{getShiftLabel(shift)}</p>
				{isPriceAvailable ? (
					<p className="theme-text-teal font-bold text-xl">৳ {pricePerUnit.toLocaleString()}</p>
				) : (
					<p className="text-red-400 font-bold text-xl">Not Available</p>
				)}
			</div>

			{/* Quantity Selector - only show if selected */}
			{isSelected && (
				<div className="mb-4">
					<label className="theme-text-subtle text-xs uppercase font-semibold block mb-2">Quantity</label>
					<div className="flex items-center gap-3 p-3 rounded-lg theme-outline" style={{ backgroundColor: 'var(--theme-input-bg)' }}>
						<button
							className="w-8 h-8 rounded text-red-400 font-bold transition-colors flex items-center justify-center"
							style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--theme-deep-green)' }}
							onClick={() => onRoomSelection(roomData.roomTypeId, Math.max(1, roomCount - 1))}
						>
							−
						</button>
						<span className="px-4 py-2 theme-text font-bold text-lg min-w-12 text-center rounded" style={{ backgroundColor: 'var(--theme-section-bg)', border: '1px solid var(--theme-deep-green)' }}>
							{roomCount}
						</span>
						<button
							disabled={roomCount >= availableCount}
							className="w-8 h-8 rounded font-bold transition-colors flex items-center justify-center"
							style={{ 
								color: roomCount >= availableCount ? '#999' : 'var(--theme-teal)',
								backgroundColor: roomCount >= availableCount ? 'rgba(100, 100, 100, 0.2)' : 'rgba(20, 184, 166, 0.2)',
								border: '1px solid var(--theme-deep-green)',
								cursor: roomCount >= availableCount ? 'not-allowed' : 'pointer'
							}}
							onClick={() => onRoomSelection(roomData.roomTypeId, Math.min(availableCount, roomCount + 1))}
						>
							+
						</button>
					</div>
					<p className="theme-text-subtle text-xs mt-2">Max available: {availableCount} room{availableCount !== 1 ? "s" : ""}</p>
				</div>
			)}

			{/* Subtotal - only show if selected */}
			{isSelected && (
				<div className="theme-outline bg-section rounded-lg p-3 text-sm mb-4">
					{isPriceAvailable ? (
						<p className="theme-text-muted mb-1">
							{roomCount} room{roomCount > 1 ? "s" : ""} × {shift === "ALL_DAY" ? nights : 1} {shift === "ALL_DAY" ? `night${nights !== 1 ? "s" : ""}` : `${shift.toLowerCase()} shift`}
						</p>
					) : (
						<p className="text-red-400 font-bold text-lg">Not Available</p>
					)}
				</div>
			)}

			{/* Select/Cancel Button */}
			<div>
				{isSelected ? (
					<button
						className="w-full py-2 px-4 rounded font-medium transition-all"
						style={{ backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#ff7070', border: '1px solid #dc2626' }}
						onClick={handleCancel}
					>
						Cancel
					</button>
				) : (
					<button
						disabled={!isPriceAvailable}
						className="green-button w-full rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={handleSelect}
					>
						{isPriceAvailable ? "Select" : "Not Available"}
					</button>
				)}
			</div>
		</div>
	);
}