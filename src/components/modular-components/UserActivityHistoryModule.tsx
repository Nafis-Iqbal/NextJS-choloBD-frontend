"use client";

import React, { useState } from "react";

// Type definitions
type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  status: "ongoing" | "upcoming";
  members: number;
};

type HotelBooking = {
  id: string;
  hotelName: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  status: "ongoing" | "upcoming" | "completed";
};

type TransportBooking = {
  id: string;
  transportType: string;
  route: string;
  departureDate: string;
  price: number;
  status: "ongoing" | "upcoming" | "completed";
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  status: "completed" | "pending" | "failed";
};

type Stats = {
  totalTourPlans: number;
  totalTripsUndertaken: number;
  totalFavourites: number;
  totalFriends: number;
};

interface UserActivityHistoryModuleProps {
  ongoingTrips?: Trip[];
  upcomingTrips?: Trip[];
  bookedHotels?: HotelBooking[];
  bookedTransport?: TransportBooking[];
  transactionHistory?: Transaction[];
  hotelBookingHistory?: HotelBooking[];
  transportBookingHistory?: TransportBooking[];
  stats?: Stats;
}

// Pagination component
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-2 mt-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
    >
      Previous
    </button>
    <span className="text-sm text-gray-300">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
    >
      Next
    </button>
  </div>
);

// Stats Overview Section
const StatsOverview: React.FC<{ stats: Stats }> = ({ stats }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-bold text-white mb-6">Your Stats</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          label: "Tour Plans Built",
          value: stats.totalTourPlans,
          icon: "📋",
        },
        {
          label: "Trips Undertaken",
          value: stats.totalTripsUndertaken,
          icon: "✈️",
        },
        {
          label: "Favourites",
          value: stats.totalFavourites,
          icon: "❤️",
        },
        {
          label: "Friends",
          value: stats.totalFriends,
          icon: "👥",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="bg-gradient-to-br from-teal-900/40 to-teal-700/20 border border-teal-600/50 rounded-xl p-6 hover:border-teal-500 transition-colors"
        >
          <div className="text-4xl mb-2">{stat.icon}</div>
          <div className="text-3xl font-bold text-teal-400">{stat.value}</div>
          <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
);

// Trips Section
const TripsSection: React.FC<{
  trips: Trip[];
  title: string;
}> = ({ trips, title }) => {
  if (!trips || trips.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No {title.toLowerCase()} at the moment
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="space-y-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{trip.title}</h3>
                <p className="text-teal-400 text-sm mt-1">📍 {trip.destination}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {trip.startDate} to {trip.endDate} • {trip.members} members
                </p>
              </div>
              <div className="mt-3 md:mt-0">
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    trip.status === "ongoing"
                      ? "bg-orange-600/30 text-orange-300 border border-orange-600/50"
                      : "bg-blue-600/30 text-blue-300 border border-blue-600/50"
                  }`}
                >
                  {trip.status === "ongoing" ? "🔴 Ongoing" : "📅 Upcoming"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Booked Hotels Section
const BookedHotelsSection: React.FC<{
  hotels: HotelBooking[];
}> = ({ hotels }) => {
  const ongoingHotels = hotels?.filter((h) => h.status === "ongoing") || [];
  const upcomingHotels = hotels?.filter((h) => h.status === "upcoming") || [];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Booked Hotels</h2>
      {ongoingHotels.length === 0 && upcomingHotels.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No booked hotels
        </div>
      ) : (
        <div className="space-y-6">
          {ongoingHotels.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">
                🔴 Current Stay
              </h3>
              <div className="space-y-2">
                {ongoingHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-orange-600 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{hotel.hotelName}</p>
                      <p className="text-gray-400 text-sm">
                        {hotel.city} • {hotel.checkInDate} to {hotel.checkOutDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">৳ {hotel.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {upcomingHotels.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">
                📅 Upcoming Stays
              </h3>
              <div className="space-y-2">
                {upcomingHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-blue-600 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{hotel.hotelName}</p>
                      <p className="text-gray-400 text-sm">
                        {hotel.city} • {hotel.checkInDate} to {hotel.checkOutDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">৳ {hotel.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

// Booked Transport Section
const BookedTransportSection: React.FC<{
  transports: TransportBooking[];
}> = ({ transports }) => {
  const ongoingTransport = transports?.filter((t) => t.status === "ongoing") || [];
  const upcomingTransport = transports?.filter((t) => t.status === "upcoming") || [];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Booked Transport</h2>
      {ongoingTransport.length === 0 && upcomingTransport.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No booked transport
        </div>
      ) : (
        <div className="space-y-6">
          {ongoingTransport.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">
                🔴 Active Journey
              </h3>
              <div className="space-y-2">
                {ongoingTransport.map((transport) => (
                  <div
                    key={transport.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-orange-600 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{transport.transportType}</p>
                      <p className="text-gray-400 text-sm">
                        {transport.route} • {transport.departureDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">৳ {transport.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {upcomingTransport.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">
                📅 Upcoming Journey
              </h3>
              <div className="space-y-2">
                {upcomingTransport.map((transport) => (
                  <div
                    key={transport.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-blue-600 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{transport.transportType}</p>
                      <p className="text-gray-400 text-sm">
                        {transport.route} • {transport.departureDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">৳ {transport.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

// Transaction History with Pagination
const TransactionHistorySection: React.FC<{
  transactions: Transaction[];
  itemsPerPage?: number;
}> = ({ transactions, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!transactions || transactions.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No transactions found
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = transactions.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/70 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Description</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-3 text-gray-300 text-sm">{transaction.date}</td>
                  <td className="px-6 py-3 text-white font-medium">{transaction.type}</td>
                  <td className="px-6 py-3 text-gray-400 text-sm">{transaction.description}</td>
                  <td className="px-6 py-3 text-white font-semibold">
                    ৳ {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "completed"
                          ? "bg-green-600/30 text-green-300"
                          : transaction.status === "pending"
                          ? "bg-yellow-600/30 text-yellow-300"
                          : "bg-red-600/30 text-red-300"
                      }`}
                    >
                      {transaction.status === "completed"
                        ? "✓ Completed"
                        : transaction.status === "pending"
                        ? "⏳ Pending"
                        : "✗ Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
};

// Hotel Booking History with Pagination
const HotelBookingHistorySection: React.FC<{
  bookings: HotelBooking[];
  itemsPerPage?: number;
}> = ({ bookings, itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!bookings || bookings.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Hotel Booking History</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No hotel bookings found
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = bookings.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Hotel Booking History</h2>
      <div className="space-y-3">
        {paginatedData.map((booking) => (
          <div
            key={booking.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">{booking.hotelName}</p>
                <p className="text-gray-400 text-sm mt-1">
                  📍 {booking.city} • {booking.checkInDate} to {booking.checkOutDate}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">৳ {booking.price.toLocaleString()}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === "completed"
                      ? "bg-gray-600/30 text-gray-300"
                      : booking.status === "ongoing"
                      ? "bg-orange-600/30 text-orange-300"
                      : "bg-blue-600/30 text-blue-300"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
};

// Transport Booking History with Pagination
const TransportBookingHistorySection: React.FC<{
  bookings: TransportBooking[];
  itemsPerPage?: number;
}> = ({ bookings, itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!bookings || bookings.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Transport Booking History
        </h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No transport bookings found
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = bookings.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">
        Transport Booking History
      </h2>
      <div className="space-y-3">
        {paginatedData.map((booking) => (
          <div
            key={booking.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">{booking.transportType}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {booking.route} • {booking.departureDate}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">৳ {booking.price.toLocaleString()}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === "completed"
                      ? "bg-gray-600/30 text-gray-300"
                      : booking.status === "ongoing"
                      ? "bg-orange-600/30 text-orange-300"
                      : "bg-blue-600/30 text-blue-300"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
};

// Fake data
const FAKE_ONGOING_TRIPS: Trip[] = [
  {
    id: "trip-001",
    title: "Cox's Bazar Beach Adventure",
    startDate: "Feb 1, 2026",
    endDate: "Feb 5, 2026",
    destination: "Cox's Bazar",
    status: "ongoing",
    members: 4,
  },
];

const FAKE_UPCOMING_TRIPS: Trip[] = [
  {
    id: "trip-002",
    title: "Sylhet Tea Gardens Tour",
    startDate: "Feb 10, 2026",
    endDate: "Feb 14, 2026",
    destination: "Sylhet",
    status: "upcoming",
    members: 3,
  },
  {
    id: "trip-003",
    title: "Sundarbans Wildlife Expedition",
    startDate: "Feb 20, 2026",
    endDate: "Feb 25, 2026",
    destination: "Sundarbans",
    status: "upcoming",
    members: 5,
  },
  {
    id: "trip-004",
    title: "Chittagong Hill Tracts Trek",
    startDate: "Mar 5, 2026",
    endDate: "Mar 10, 2026",
    destination: "Rangamati",
    status: "upcoming",
    members: 6,
  },
];

const FAKE_BOOKED_HOTELS: HotelBooking[] = [
  {
    id: "hotel-001",
    hotelName: "Sea Pearl Resort",
    city: "Cox's Bazar",
    checkInDate: "Feb 1, 2026",
    checkOutDate: "Feb 5, 2026",
    price: 15000,
    status: "ongoing",
  },
  {
    id: "hotel-002",
    hotelName: "Tea Garden Resort",
    city: "Sylhet",
    checkInDate: "Feb 10, 2026",
    checkOutDate: "Feb 14, 2026",
    price: 12000,
    status: "upcoming",
  },
  {
    id: "hotel-003",
    hotelName: "Royal Sundarbans Lodge",
    city: "Sundarbans",
    checkInDate: "Feb 20, 2026",
    checkOutDate: "Feb 25, 2026",
    price: 18000,
    status: "upcoming",
  },
  {
    id: "hotel-004",
    hotelName: "Hillside Retreat",
    city: "Rangamati",
    checkInDate: "Jan 15, 2026",
    checkOutDate: "Jan 20, 2026",
    price: 9500,
    status: "completed",
  },
  {
    id: "hotel-005",
    hotelName: "Dhaka Luxury Inn",
    city: "Dhaka",
    checkInDate: "Jan 1, 2026",
    checkOutDate: "Jan 5, 2026",
    price: 11000,
    status: "completed",
  },
];

const FAKE_BOOKED_TRANSPORT: TransportBooking[] = [
  {
    id: "transport-001",
    transportType: "Flight",
    route: "Dhaka → Cox's Bazar",
    departureDate: "Feb 1, 2026 - 8:00 AM",
    price: 8500,
    status: "ongoing",
  },
  {
    id: "transport-002",
    transportType: "Bus",
    route: "Dhaka → Sylhet",
    departureDate: "Feb 10, 2026 - 6:00 PM",
    price: 1200,
    status: "upcoming",
  },
  {
    id: "transport-003",
    transportType: "Train",
    route: "Dhaka → Sundarbans",
    departureDate: "Feb 20, 2026 - 10:00 AM",
    price: 2500,
    status: "upcoming",
  },
  {
    id: "transport-004",
    transportType: "Flight",
    route: "Dhaka → Chittagong",
    departureDate: "Mar 5, 2026 - 2:00 PM",
    price: 7200,
    status: "upcoming",
  },
  {
    id: "transport-005",
    transportType: "Flight",
    route: "Cox's Bazar → Dhaka",
    departureDate: "Jan 25, 2026 - 4:00 PM",
    price: 8500,
    status: "completed",
  },
];

const FAKE_TRANSACTION_HISTORY: Transaction[] = [
  {
    id: "txn-001",
    type: "Hotel Booking",
    amount: 15000,
    date: "Feb 1, 2026",
    description: "Sea Pearl Resort - Cox's Bazar",
    status: "completed",
  },
  {
    id: "txn-002",
    type: "Flight Booking",
    amount: 8500,
    date: "Jan 28, 2026",
    description: "Dhaka to Cox's Bazar",
    status: "completed",
  },
  {
    id: "txn-003",
    type: "Wallet Top-up",
    amount: 5000,
    date: "Jan 25, 2026",
    description: "Credit card payment",
    status: "completed",
  },
  {
    id: "txn-004",
    type: "Hotel Booking",
    amount: 12000,
    date: "Jan 20, 2026",
    description: "Tea Garden Resort - Sylhet",
    status: "completed",
  },
  {
    id: "txn-005",
    type: "Bus Booking",
    amount: 2400,
    date: "Jan 18, 2026",
    description: "Dhaka to Sylhet - 2 passengers",
    status: "pending",
  },
  {
    id: "txn-006",
    type: "Refund",
    amount: 3000,
    date: "Jan 15, 2026",
    description: "Cancelled tour package",
    status: "completed",
  },
  {
    id: "txn-007",
    type: "Train Booking",
    amount: 2500,
    date: "Jan 10, 2026",
    description: "Dhaka to Sundarbans",
    status: "completed",
  },
  {
    id: "txn-008",
    type: "Hotel Booking",
    amount: 11000,
    date: "Dec 28, 2025",
    description: "Dhaka Luxury Inn",
    status: "completed",
  },
  {
    id: "txn-009",
    type: "Flight Booking",
    amount: 7200,
    date: "Dec 25, 2025",
    description: "Dhaka to Chittagong",
    status: "failed",
  },
  {
    id: "txn-010",
    type: "Wallet Top-up",
    amount: 10000,
    date: "Dec 20, 2025",
    description: "Debit card payment",
    status: "completed",
  },
  {
    id: "txn-011",
    type: "Hotel Booking",
    amount: 9500,
    date: "Dec 15, 2025",
    description: "Hillside Retreat - Rangamati",
    status: "completed",
  },
  {
    id: "txn-012",
    type: "Activity Booking",
    amount: 1500,
    date: "Dec 10, 2025",
    description: "Scuba Diving - Cox's Bazar",
    status: "completed",
  },
];

const FAKE_HOTEL_BOOKING_HISTORY: HotelBooking[] = [
  {
    id: "hotel-history-001",
    hotelName: "Dhaka Luxury Inn",
    city: "Dhaka",
    checkInDate: "Jan 1, 2026",
    checkOutDate: "Jan 5, 2026",
    price: 11000,
    status: "completed",
  },
  {
    id: "hotel-history-002",
    hotelName: "Hillside Retreat",
    city: "Rangamati",
    checkInDate: "Dec 15, 2025",
    checkOutDate: "Dec 20, 2025",
    price: 9500,
    status: "completed",
  },
  {
    id: "hotel-history-003",
    hotelName: "Beach Paradise Hotel",
    city: "Chittagong",
    checkInDate: "Dec 1, 2025",
    checkOutDate: "Dec 5, 2025",
    price: 8500,
    status: "completed",
  },
  {
    id: "hotel-history-004",
    hotelName: "Mountain View Resort",
    city: "Khagrachari",
    checkInDate: "Nov 10, 2025",
    checkOutDate: "Nov 15, 2025",
    price: 7500,
    status: "completed",
  },
  {
    id: "hotel-history-005",
    hotelName: "Riverside Palace",
    city: "Narayanganj",
    checkInDate: "Nov 1, 2025",
    checkOutDate: "Nov 3, 2025",
    price: 6000,
    status: "completed",
  },
  {
    id: "hotel-history-006",
    hotelName: "Royal Garden Resort",
    city: "Gazipur",
    checkInDate: "Oct 20, 2025",
    checkOutDate: "Oct 25, 2025",
    price: 8000,
    status: "completed",
  },
  {
    id: "hotel-history-007",
    hotelName: "Sunset Beach Hotel",
    city: "Teknaf",
    checkInDate: "Oct 5, 2025",
    checkOutDate: "Oct 10, 2025",
    price: 7200,
    status: "completed",
  },
];

const FAKE_TRANSPORT_BOOKING_HISTORY: TransportBooking[] = [
  {
    id: "transport-history-001",
    transportType: "Flight",
    route: "Dhaka → Chittagong",
    departureDate: "Jan 15, 2026 - 2:00 PM",
    price: 7200,
    status: "completed",
  },
  {
    id: "transport-history-002",
    transportType: "Bus",
    route: "Dhaka → Khulna",
    departureDate: "Dec 28, 2025 - 10:00 AM",
    price: 950,
    status: "completed",
  },
  {
    id: "transport-history-003",
    transportType: "Train",
    route: "Dhaka → Rajshahi",
    departureDate: "Dec 15, 2025 - 8:00 AM",
    price: 2000,
    status: "completed",
  },
  {
    id: "transport-history-004",
    transportType: "Flight",
    route: "Dhaka → Cox's Bazar",
    departureDate: "Dec 1, 2025 - 9:00 AM",
    price: 8500,
    status: "completed",
  },
  {
    id: "transport-history-005",
    transportType: "Bus",
    route: "Dhaka → Sylhet",
    departureDate: "Nov 20, 2025 - 6:00 PM",
    price: 1200,
    status: "completed",
  },
  {
    id: "transport-history-006",
    transportType: "Ferry",
    route: "Dhaka → Barisal",
    departureDate: "Nov 10, 2025 - 7:00 AM",
    price: 800,
    status: "completed",
  },
];

const FAKE_STATS: Stats = {
  totalTourPlans: 12,
  totalTripsUndertaken: 8,
  totalFavourites: 45,
  totalFriends: 27,
};

// Main Component
export const UserActivityHistoryModule: React.FC<UserActivityHistoryModuleProps> = ({
  ongoingTrips = FAKE_ONGOING_TRIPS,
  upcomingTrips = FAKE_UPCOMING_TRIPS,
  bookedHotels = FAKE_BOOKED_HOTELS,
  bookedTransport = FAKE_BOOKED_TRANSPORT,
  transactionHistory = FAKE_TRANSACTION_HISTORY,
  hotelBookingHistory = FAKE_HOTEL_BOOKING_HISTORY,
  transportBookingHistory = FAKE_TRANSPORT_BOOKING_HISTORY,
  stats = FAKE_STATS,
}) => {
  return (
    <div className="w-full bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">My Activity & History</h1>
          <p className="text-gray-400 mt-2">
            View your trips, bookings, and activity overview
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Active Trips */}
        <TripsSection trips={ongoingTrips} title="Ongoing Trips" />
        <TripsSection trips={upcomingTrips} title="Upcoming Trips" />

        {/* Booked Hotels and Transport */}
        <BookedHotelsSection hotels={bookedHotels} />
        <BookedTransportSection transports={bookedTransport} />

        {/* History Sections */}
        <TransactionHistorySection transactions={transactionHistory} />
        <HotelBookingHistorySection bookings={hotelBookingHistory} />
        <TransportBookingHistorySection bookings={transportBookingHistory} />
      </div>
    </div>
  );
};
