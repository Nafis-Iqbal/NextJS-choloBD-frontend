import { Trip } from "./BookmarksSection";
import { TransportBooking } from "./BookedTransportSection";
import { Transaction } from "./TransactionHistorySection";
import { Stats } from "./StatsOverview";

export const FAKE_ONGOING_TRIPS: Trip[] = [
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

export const FAKE_UPCOMING_TRIPS: Trip[] = [
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

export const FAKE_BOOKED_TRANSPORT: TransportBooking[] = [
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

export const FAKE_TRANSACTION_HISTORY: Transaction[] = [
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

export const FAKE_TRANSPORT_BOOKING_HISTORY: TransportBooking[] = [
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

export const FAKE_STATS: Stats = {
  totalTourPlans: 12,
  totalTripsUndertaken: 8,
  totalFavourites: 45,
  totalFriends: 27,
};
