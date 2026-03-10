"use client";

import { useState, useMemo } from "react";
import { HotelBookingApi, HotelApi, PaymentApi, WalletApi } from "@/services/api";
import { createHotelRoomBookingSchema } from "@/validators/hotelBookingValidators";
import { produceValidationErrorMessage } from "@/utilities/utilities";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { queryClient } from "@/services/apiInstance";
import { ServiceType } from "@/types/enums";

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
}

interface HotelBookingPanelProps {
	hotelId: string;
	userId: string;
	onBookingSuccess?: () => void;
	onCancel?: () => void;
}

interface RoomCardProps {
	roomType: HotelRoomType;
	roomCount: number;
	nights: number;
	onRoomSelection: (roomTypeId: string, quantity: number) => void;
}

export function HotelBookingPanel({ hotelId, userId, onBookingSuccess, onCancel }: HotelBookingPanelProps) {
	const {data: hotelData, isLoading, error, status} = HotelApi.useGetHotelDetailRQ(hotelId);
	const hotelInfo = hotelData?.data as Hotel | undefined;
	const { openNotificationPopUpMessage } = useGlobalUI();
	
	const [bookingState, setBookingState] = useState<BookingState>({
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
	});

	const [isProcessing, setIsProcessing] = useState(false);
	const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
	const [bookingId, setBookingId] = useState<string | null>(null);
	const [payingForBooking, setPayingForBooking] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(null);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	// API Hooks
	const { mutate: createBookingMutation } = HotelBookingApi.useCreateBookingRQ(
		(responseData) => {
			setIsProcessing(false);
			if (responseData.status === "success") {
				setConfirmationCode(responseData.data?.confirmationCode || "BOOKING_CREATED");
				setBookingId(responseData.data?.id || null);
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
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}, [bookingState.checkInDate, bookingState.checkOutDate]);

	// Get available room types - filter by availableCount
	const availableRooms = useMemo(() => {
		if (!hotelInfo?.roomTypes) return [];
		return hotelInfo.roomTypes.filter((roomType: HotelRoomType) => roomType.availableCount > 0);
	}, [hotelInfo?.roomTypes]);

	// Calculate total cost
	const totalCost = useMemo(() => {
		let total = 0;
		bookingState.selectedRooms.forEach((quantity, roomTypeId) => {
				const roomType = hotelInfo?.roomTypes?.find((rt: HotelRoomType) => rt.id === roomTypeId);
			if (roomType?.pricePerNight) {
				total += roomType.pricePerNight * nights * quantity;
			}
		});
		return total;
	}, [bookingState.selectedRooms, hotelInfo?.roomTypes, nights]);

	// Validation checks
	const isDateValid = nights > 0 && bookingState.checkInDate < bookingState.checkOutDate;
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
		if (!canBook || !userId || !hotelInfo) return;

		setIsProcessing(true);

		// Convert selectedRooms Map to Record
		const selectedRoomsRecord: Record<string, number> = {};
		bookingState.selectedRooms.forEach((qty, roomTypeId) => {
			selectedRoomsRecord[roomTypeId] = qty;
		});

		// Build booking data matching CreateHotelRoomBookingInput shape
		const bookingData = {
			hotelId: hotelInfo.id,
			userId,
			checkInDate: bookingState.checkInDate,
			checkOutDate: bookingState.checkOutDate,
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
		});
		setConfirmationCode(null);
		setBookingId(null);
		setPayingForBooking(false);
		setPaymentMethod(null);
	};

	// Early return if hotel data not loaded
	if (!hotelInfo) {
		return (
			<section className="mt-8 rounded-xl border border-green-900/60 bg-gray-900/40 p-4 md:p-6">
				{isLoading && <p className="text-gray-300">Loading hotel information...</p>}
				{error && <p className="text-red-300">Failed to load hotel. Please try again.</p>}
				{!isLoading && !error && <p className="text-yellow-300">No hotel data available</p>}
			</section>
		);
	}

	return (
		<section className="mt-8 rounded-xl border border-green-900/60 bg-gray-900/40 p-4 md:p-6" id="hotel-booking-panel">
			<h2 className="text-3xl font-semibold text-white mb-2">{hotelInfo.name}</h2>
			<p className="text-gray-400 text-sm mb-6">Complete your hotel room booking</p>

			{confirmationCode ? (
				<div className="bg-green-900/20 border max-w-2xl mx-auto border-green-700/50 rounded-lg p-6">
					<h3 className="text-green-400 font-semibold text-lg mb-2 text-center">Booking Confirmed!</h3>
					<p className="text-gray-300 mb-4 text-center">Confirmation Code: <span className="font-bold text-green-400">{confirmationCode}</span></p>
					
					{/* Booking Summary with Payment Option */}
					<div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 mb-4">
						<div className="flex justify-between items-center mb-4">
							<span className="text-gray-300 font-medium">Total Amount:</span>
							<span className="text-green-400 text-xl font-bold">৳ {totalCost.toLocaleString()}</span>
						</div>
						
						<div className="flex space-x-2 w-full">
							<button
								onClick={() => {
									setPayingForBooking(!payingForBooking);
									setPaymentMethod(null);
								}}
								className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
							>
								Pay Now
							</button>
							<button
								onClick={handleReset}
								className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium transition-all"
							>
								Book Another Room
							</button>
						</div>

						{/* Payment Method Selection */}
						{payingForBooking && (
							<div className="mt-4 p-3 bg-gray-700/50 border border-gray-600 rounded-lg mx-auto">
								<p className="text-gray-200 text-xs font-semibold mb-3">Select Payment Method</p>
								<div className="space-y-2 mb-3">
									<label className="flex items-center gap-3 p-2 bg-gray-800/50 rounded border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
										<input
											type="radio"
											name="payment-method"
											value="wallet"
											checked={paymentMethod === "wallet"}
											onChange={() => setPaymentMethod("wallet")}
											className="w-4 h-4"
										/>
										<div className="flex-1">
											<p className="text-white text-xs font-medium">💰 Wallet</p>
											<p className="text-gray-400 text-xs">Pay using your wallet balance</p>
										</div>
									</label>

									<label className="flex items-center gap-3 p-2 bg-gray-800/50 rounded border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
										<input
											type="radio"
											name="payment-method"
											value="card"
											checked={paymentMethod === "card"}
											onChange={() => setPaymentMethod("card")}
											className="w-4 h-4"
										/>
										<div className="flex-1">
											<p className="text-white text-xs font-medium">💳 Card</p>
											<p className="text-gray-400 text-xs">Pay using credit or debit card</p>
										</div>
									</label>
								</div>

								<div className="flex gap-2">
									<button
										disabled={!paymentMethod || isProcessingPayment}
										onClick={onProceedPaymentClicked}
										className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded font-medium transition-colors"
									>
										{isProcessingPayment ? "Processing..." : "Proceed Payment"}
									</button>
									<button
										onClick={() => {
											setPayingForBooking(false);
											setPaymentMethod(null);
										}}
										disabled={isProcessingPayment}
										className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs rounded font-medium transition-colors"
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
					<div className="bg-gray-800/40 rounded-lg border border-gray-700 p-5 mb-6">
						<h3 className="text-white font-semibold mb-4">Step 1: Select Dates & Guests</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<label className="text-gray-400 text-xs font-semibold uppercase">Check-in Date</label>
								<input
									type="date"
									value={bookingState.checkInDate}
									onChange={(e) => handleDateChange("checkInDate", e.target.value)}
									className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-green-500"
								/>
							</div>
							<div>
								<label className="text-gray-400 text-xs font-semibold uppercase">Check-out Date</label>
								<input
									type="date"
									value={bookingState.checkOutDate}
									onChange={(e) => handleDateChange("checkOutDate", e.target.value)}
									className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-green-500"
								/>
							</div>
							<div>
								<label className="text-gray-400 text-xs font-semibold uppercase">Number of Guests</label>
								<input
									type="number"
									min="1"
									value={bookingState.numberOfGuests}
									onChange={(e) => handleGuestInfoChange("numberOfGuests", parseInt(e.target.value))}
									className="w-full mt-2 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:outline-none focus:border-green-500"
								/>
							</div>

						</div>
						{!isDateValid && bookingState.checkInDate && bookingState.checkOutDate && (
							<p className="text-red-300 text-xs mt-3">⚠️ Check-out date must be after check-in date</p>
						)}
						{isDateValid && (
							<p className="text-green-300 text-xs mt-3">✓ {nights} night{nights !== 1 ? "s" : ""}</p>
						)}
					</div>

					{/* Step 2: Room Selection */}
					{isDateValid ? (
					<div className="bg-gray-800/40 rounded-lg border border-gray-700 p-5 mb-6">
						<h3 className="text-white font-semibold mb-4">Step 2: Select Rooms</h3>
						{availableRooms.length === 0 ? (
							<div className="bg-red-900/20 border border-red-700/30 rounded-lg p-5">
								<p className="text-red-300 text-sm">No available rooms for these dates at this hotel</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{availableRooms.map((roomType: HotelRoomType) => {
									const roomCount = bookingState.selectedRooms.get(roomType.id) || 0;
									return (
										<RoomCard
											key={roomType.id}
											roomType={roomType}
											roomCount={roomCount}
											nights={nights}
											onRoomSelection={handleRoomSelection}
										/>
									);
								})}
							</div>
						)}
					</div>
				) : (
					<div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-5 mb-6">
						<p className="text-yellow-300 text-sm">Please select valid dates to see available rooms</p>
					</div>
				)}

					{/* Step 3: Guest Information */}
					{hasRoomsSelected && (
						<div className="bg-gray-800/40 rounded-lg border border-gray-700 p-5 mb-6">
							<h3 className="text-white font-semibold mb-4">Step 3: Guest Information</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<input
									type="text"
									placeholder="Full Name"
									value={bookingState.guestName}
									onChange={(e) => handleGuestInfoChange("guestName", e.target.value)}
									className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded placeholder-gray-400 focus:outline-none focus:border-green-500"
								/>
								<input
									type="email"
									placeholder="Email Address"
									value={bookingState.guestEmail}
									onChange={(e) => handleGuestInfoChange("guestEmail", e.target.value)}
									className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded placeholder-gray-400 focus:outline-none focus:border-green-500"
								/>
								<input
									type="tel"
									placeholder="Phone Number"
									value={bookingState.guestPhoneNumber}
									onChange={(e) => handleGuestInfoChange("guestPhoneNumber", e.target.value)}
									className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded placeholder-gray-400 focus:outline-none focus:border-green-500"
								/>
							</div>
							<textarea
								placeholder="Special Requests (Optional)"
								value={bookingState.specialRequests}
								onChange={(e) => handleGuestInfoChange("specialRequests", e.target.value)}
								className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none"
								rows={3}
							/>
						</div>
					)}

					{/* Booking Summary */}
					{hasRoomsSelected && (
						<div className="bg-linear-to-r from-green-900/20 to-teal-900/20 border border-green-800/40 rounded-lg p-5 mb-6">
							<h3 className="text-white font-semibold mb-4">Booking Summary</h3>
							<div className="space-y-2 mb-4">
								{Array.from(bookingState.selectedRooms.entries()).map(([roomTypeId, quantity]) => {
									const roomType = hotelInfo.roomTypes?.find((rt: HotelRoomType) => rt.id === roomTypeId);
									const pricePerNight = roomType?.pricePerNight || 0;
									const subtotal = pricePerNight * nights * quantity;
									return (
										<div key={roomTypeId} className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
											<span className="text-gray-300">
												{roomType?.roomType} × {quantity} room{quantity > 1 ? "s" : ""} × {nights} night{nights !== 1 ? "s" : ""}
											</span>
											<span className="text-white">৳ {subtotal.toLocaleString()}</span>
										</div>
									);
								})}
							</div>
							<div className="border-t border-gray-700 pt-4">
								<div className="flex justify-between items-center">
									<span className="text-white font-semibold">Total Amount:</span>
									<span className="text-green-400 text-2xl font-bold">৳ {totalCost.toLocaleString()}</span>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					{hasRoomsSelected && (
						<div className="flex gap-3">
							<button
								className={`flex-1 py-3 px-4 rounded font-medium transition-all ${
									canBook && !isProcessing
										? "bg-green-600 hover:bg-green-700 text-white"
										: "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
								}`}
								disabled={!canBook || isProcessing}
								onClick={handleBookingSubmit}
							>
								{isProcessing ? "Processing Booking..." : "Complete Booking"}
							</button>
							<button
								className="px-6 py-3 rounded border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white transition-all"
								onClick={handleReset}
								disabled={isProcessing}
							>
								Reset Form
							</button>
							{onCancel && (
								<button
									className="px-6 py-3 rounded border border-red-600 text-red-300 hover:border-red-500 hover:text-red-200 transition-all"
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

function RoomCard({ roomType, roomCount, nights, onRoomSelection }: RoomCardProps) {
	// Extract pricing and bed info from roomType
	const pricePerNight = roomType.pricePerNight || 0;
	const singleBedCount = roomType.singleBedCount || 0;
	const doubleBedCount = roomType.doubleBedCount || 0;
	const roomTypeLabel = roomType.roomType || "Room";
	const roomTotal = pricePerNight * nights * roomCount;
	const maxGuests = (singleBedCount * 1) + (doubleBedCount * 2);
	const availableCount = roomType.availableCount || 0;
	const totalCount = roomType.totalCount || 0;

	// Check if this roomType is selected
	const isSelected = roomCount > 0;

	const handleSelect = () => {
		// Start with quantity 1 when selected
		onRoomSelection(roomType.id, 1);
	};

	const handleCancel = () => {
		// Deselect by setting quantity to 0
		onRoomSelection(roomType.id, 0);
	};

	return (
		<div
			key={roomType.id}
			className="rounded-lg border-2 border-gray-700 bg-gray-800/50 p-5 hover:border-green-600/40 hover:shadow-lg transition-all"
		>
			{/* Room Type Header */}
			<div className="mb-4">
				<div className="flex items-start justify-between mb-2">
					<div className="flex items-center gap-2">
						<h4 className="text-white font-bold text-lg">
							{roomTypeLabel?.charAt(0).toUpperCase() + roomTypeLabel?.slice(1).toLowerCase()}
						</h4>
						{isSelected && (
							<span className="text-xs bg-green-600/30 text-green-300 px-2 py-1 rounded border border-green-600">Selected</span>
						)}
					</div>
					<span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded border border-green-700/50">{availableCount} Available</span>
				</div>
				<p className="text-gray-400 text-sm">
					{singleBedCount > 0 && `${singleBedCount} Single Bed`}
					{singleBedCount > 0 && doubleBedCount > 0 && " + "}
					{doubleBedCount > 0 && `${doubleBedCount} Double Bed`}
				</p>
				<p className="text-gray-500 text-xs mt-2">Sleeps up to {maxGuests} guests • {totalCount} rooms total</p>
			</div>

			{/* Price Section */}
			<div className="bg-gray-900/40 rounded-lg p-3 mb-4 border border-gray-700/50">
				<p className="text-gray-400 text-xs uppercase font-semibold mb-1">Price per Night</p>
				<p className="text-green-400 font-bold text-xl">৳ {pricePerNight.toLocaleString()}</p>
			</div>

			{/* Quantity Selector - only show if selected */}
			{isSelected && (
				<div className="mb-4">
					<label className="text-gray-400 text-xs uppercase font-semibold block mb-2">Quantity</label>
					<div className="flex items-center gap-3 bg-gray-800/60 rounded-lg p-3 border border-gray-600">
						<button
							className="w-8 h-8 rounded bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex items-center justify-center"
							onClick={() => onRoomSelection(roomType.id, Math.max(1, roomCount - 1))}
						>
							−
						</button>
						<span className="px-4 py-2 text-white font-bold text-lg min-w-12 text-center bg-gray-900 border border-gray-700 rounded">
							{roomCount}
						</span>
						<button
							disabled={roomCount >= availableCount}
							className="w-8 h-8 rounded bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center"
							onClick={() => onRoomSelection(roomType.id, Math.min(availableCount, roomCount + 1))}
						>
							+
						</button>
					</div>
					<p className="text-gray-500 text-xs mt-2">Max available: {availableCount} room{availableCount !== 1 ? "s" : ""}</p>
				</div>
			)}

			{/* Subtotal - only show if selected */}
			{isSelected && (
				<div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 text-sm mb-4">
					<p className="text-gray-300 mb-1">{roomCount} room{roomCount > 1 ? "s" : ""} × {nights} night{nights !== 1 ? "s" : ""}</p>
					<p className="text-green-400 font-bold text-lg">Total: ৳{roomTotal.toLocaleString()}</p>
				</div>
			)}

			{/* Select/Cancel Button */}
			<div>
				{isSelected ? (
					<button
						className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-all"
						onClick={handleCancel}
					>
						Cancel
					</button>
				) : (
					<button
						className="green-button w-full rounded font-medium transition-all"
						onClick={handleSelect}
					>
						Select
					</button>
				)}
			</div>
		</div>
	);
}