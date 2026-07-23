export type BusType = "AC" | "Non-AC" | "Sleeper" | "Semi-Sleeper" | "Deluxe";

export interface Bus {
  id: string;
  busNumber: string;
  busType: BusType;
  totalSeats: number;
  operatorName: string;
  registrationNumber: string;
  isActive: boolean;
}

export interface BusRide {
  id: string;
  busId: string;
  busNumber: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  price: number;
  totalSeats: number;
  bookedSeats: number;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  operatorName: string;
}

export interface Ticket {
  id: string;
  rideId: string;
  passengerName: string;
  seatNumber: string;
  phoneNumber: string;
  price: number;
  bookingDate: string;
  status: "confirmed" | "cancelled";
}

export interface SalesReport {
  date: string;
  totalRides: number;
  completedRides: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageOccupancy: number;
  cancellations: number;
}

export interface AdminStats {
  totalBuses: number;
  activeBuses: number;
  totalRides: number;
  completedRides: number;
  scheduledRides: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageTicketPrice: number;
  occupancyRate: number;
  cancellationRate: number;
}

export const FAKE_BUSES: Bus[] = [
  {
    id: "bus-001",
    busNumber: "BD-02-1001",
    busType: "AC",
    totalSeats: 45,
    operatorName: "Greenline Transport",
    registrationNumber: "REG-001",
    isActive: true,
  },
  {
    id: "bus-002",
    busNumber: "BD-02-1002",
    busType: "Sleeper",
    totalSeats: 32,
    operatorName: "Greenline Transport",
    registrationNumber: "REG-002",
    isActive: true,
  },
  {
    id: "bus-003",
    busNumber: "BD-02-1003",
    busType: "Semi-Sleeper",
    totalSeats: 36,
    operatorName: "Pathao Coach",
    registrationNumber: "REG-003",
    isActive: true,
  },
  {
    id: "bus-004",
    busNumber: "BD-02-1004",
    busType: "Non-AC",
    totalSeats: 50,
    operatorName: "Pathao Coach",
    registrationNumber: "REG-004",
    isActive: true,
  },
  {
    id: "bus-005",
    busNumber: "BD-02-1005",
    busType: "Deluxe",
    totalSeats: 28,
    operatorName: "Royal Travels",
    registrationNumber: "REG-005",
    isActive: false,
  },
];

export const FAKE_RIDES: BusRide[] = [
  {
    id: "ride-001",
    busId: "bus-001",
    busNumber: "BD-02-1001",
    route: "Dhaka → Chittagong",
    departureTime: "6:00 PM",
    arrivalTime: "11:00 PM",
    departureDate: "Feb 2, 2026",
    price: 800,
    totalSeats: 45,
    bookedSeats: 38,
    status: "ongoing",
    operatorName: "Greenline Transport",
  },
  {
    id: "ride-002",
    busId: "bus-002",
    busNumber: "BD-02-1002",
    route: "Dhaka → Sylhet",
    departureTime: "8:00 PM",
    arrivalTime: "5:00 AM",
    departureDate: "Feb 2, 2026",
    price: 1200,
    totalSeats: 32,
    bookedSeats: 28,
    status: "scheduled",
    operatorName: "Greenline Transport",
  },
  {
    id: "ride-003",
    busId: "bus-003",
    busNumber: "BD-02-1003",
    route: "Dhaka → Khulna",
    departureTime: "10:00 AM",
    arrivalTime: "5:00 PM",
    departureDate: "Feb 2, 2026",
    price: 950,
    totalSeats: 36,
    bookedSeats: 32,
    status: "scheduled",
    operatorName: "Pathao Coach",
  },
  {
    id: "ride-004",
    busId: "bus-004",
    busNumber: "BD-02-1004",
    route: "Dhaka → Rajshahi",
    departureTime: "2:00 PM",
    arrivalTime: "9:00 PM",
    departureDate: "Feb 1, 2026",
    price: 700,
    totalSeats: 50,
    bookedSeats: 48,
    status: "completed",
    operatorName: "Pathao Coach",
  },
  {
    id: "ride-005",
    busId: "bus-001",
    busNumber: "BD-02-1001",
    route: "Dhaka → Cox's Bazar",
    departureTime: "11:00 PM",
    arrivalTime: "8:00 AM",
    departureDate: "Feb 3, 2026",
    price: 1500,
    totalSeats: 45,
    bookedSeats: 35,
    status: "scheduled",
    operatorName: "Greenline Transport",
  },
];

export const FAKE_SALES_REPORTS: SalesReport[] = [
  {
    date: "Feb 2, 2026",
    totalRides: 5,
    completedRides: 1,
    totalTicketsSold: 38,
    totalRevenue: 34500,
    averageOccupancy: 84.4,
    cancellations: 1,
  },
  {
    date: "Feb 1, 2026",
    totalRides: 4,
    completedRides: 2,
    totalTicketsSold: 45,
    totalRevenue: 38200,
    averageOccupancy: 87.5,
    cancellations: 2,
  },
  {
    date: "Jan 31, 2026",
    totalRides: 6,
    completedRides: 4,
    totalTicketsSold: 52,
    totalRevenue: 42800,
    averageOccupancy: 85.3,
    cancellations: 1,
  },
  {
    date: "Jan 30, 2026",
    totalRides: 5,
    completedRides: 5,
    totalTicketsSold: 48,
    totalRevenue: 40300,
    averageOccupancy: 86.7,
    cancellations: 0,
  },
];

export const FAKE_ADMIN_STATS: AdminStats = {
  totalBuses: 5,
  activeBuses: 4,
  totalRides: 5,
  completedRides: 1,
  scheduledRides: 3,
  totalTicketsSold: 143,
  totalRevenue: 155800,
  averageTicketPrice: 1089,
  occupancyRate: 84.4,
  cancellationRate: 2.1,
};
