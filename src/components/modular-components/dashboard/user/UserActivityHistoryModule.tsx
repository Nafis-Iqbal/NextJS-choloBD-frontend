"use client";

import React from "react";
import { AuthApi, HotelBookingApi } from "@/services/api";
import { StatsOverview, type Stats } from "./StatsOverview";
import { TripsSection, type Trip } from "./TripsSection";
import { BookedHotelsSection } from "./BookedHotelsSection";
import { BookedTransportSection, type TransportBooking } from "./BookedTransportSection";
import { TransactionHistorySection, type Transaction } from "./TransactionHistorySection";
import { HotelBookingHistorySection } from "./HotelBookingHistorySection";
import { TransportBookingHistorySection } from "./TransportBookingHistorySection";
import {
  FAKE_ONGOING_TRIPS,
  FAKE_UPCOMING_TRIPS,
  FAKE_BOOKED_TRANSPORT,
  FAKE_TRANSPORT_BOOKING_HISTORY,
  FAKE_STATS,
} from "./fakeUserActivityData";

interface UserActivityHistoryModuleProps {
  userId?: string;
  ongoingTrips?: Trip[];
  upcomingTrips?: Trip[];
  bookedHotels?: HotelRoomBooking[];
  bookedTransport?: TransportBooking[];
  transactionHistory?: Transaction[];
  hotelBookingHistory?: HotelRoomBooking[];
  transportBookingHistory?: TransportBooking[];
  stats?: Stats;
}

// Main Component
export const UserActivityHistoryModule: React.FC<UserActivityHistoryModuleProps> = ({
  userId,
  ongoingTrips = FAKE_ONGOING_TRIPS,
  upcomingTrips = FAKE_UPCOMING_TRIPS,
  bookedHotels,
  bookedTransport = FAKE_BOOKED_TRANSPORT,
  transactionHistory,
  hotelBookingHistory,
  transportBookingHistory = FAKE_TRANSPORT_BOOKING_HISTORY,
  stats = FAKE_STATS,
}) => {
  // Fetch hotel bookings
  const { data: bookingsResponse, isLoading: isBookingsLoading } = HotelBookingApi.useGetBookingsRQ(userId);

  // Transform API response for hotel bookings
  const fetchedHotelBookings = React.useMemo(() => {
    if (!bookingsResponse?.data) {
      return [];
    }

    // Handle both array and paginated responses
    return Array.isArray(bookingsResponse.data)
      ? bookingsResponse.data
      : bookingsResponse.data.data || [];
  }, [bookingsResponse?.data]);

  // Use prop bookings if provided, otherwise use fetched bookings
  const finalBookedHotels = bookedHotels || fetchedHotelBookings;
  return (
    <div className="w-full bg-gray-900 text-white min-h-screen p-6" id="activity_history">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">My Activity & History</h1>
          <p className="text-gray-400 mt-2">
            View your trips, bookings, and activity overview
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} className="p-3 rounded-md"/>

        {/* Active Trips */}
        <TripsSection trips={ongoingTrips} title="Ongoing Trips" className="p-3 rounded-md"/>

        <TripsSection trips={upcomingTrips} title="Bookmarked Trips" className="p-3 rounded-md"/>

        {/* Booked Hotels and Transport */}
        <BookedHotelsSection hotels={finalBookedHotels} className="p-3 rounded-md"/>

        <BookedTransportSection transports={bookedTransport} className="p-3 rounded-md"/>

        {/* History Sections */}
        <TransactionHistorySection transactions={transactionHistory} className="p-3 rounded-md"/>

        <HotelBookingHistorySection userId={userId} bookings={hotelBookingHistory || fetchedHotelBookings} className="p-3 rounded-md"/>

        <TransportBookingHistorySection bookings={transportBookingHistory} className="p-3 rounded-md"/>
      </div>
    </div>
  );
};
