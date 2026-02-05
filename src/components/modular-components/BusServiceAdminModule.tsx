"use client";

import React, { useState } from "react";

// Type Definitions
type BusType = "AC" | "Non-AC" | "Sleeper" | "Semi-Sleeper" | "Deluxe";

type Bus = {
  id: string;
  busNumber: string;
  busType: BusType;
  totalSeats: number;
  operatorName: string;
  registrationNumber: string;
  isActive: boolean;
};

type BusRide = {
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
};

type Ticket = {
  id: string;
  rideId: string;
  passengerName: string;
  seatNumber: string;
  phoneNumber: string;
  price: number;
  bookingDate: string;
  status: "confirmed" | "cancelled";
};

type SalesReport = {
  date: string;
  totalRides: number;
  completedRides: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageOccupancy: number;
  cancellations: number;
};

type AdminStats = {
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
};

// Fake Data
const FAKE_BUSES: Bus[] = [
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

const FAKE_RIDES: BusRide[] = [
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

const FAKE_TICKETS: Ticket[] = [
  {
    id: "ticket-001",
    rideId: "ride-001",
    passengerName: "Ahmad Khan",
    seatNumber: "A1",
    phoneNumber: "+880 1700 123456",
    price: 800,
    bookingDate: "Feb 1, 2026",
    status: "confirmed",
  },
  {
    id: "ticket-002",
    rideId: "ride-001",
    passengerName: "Fatima Ahmed",
    seatNumber: "A2",
    phoneNumber: "+880 1700 123457",
    price: 800,
    bookingDate: "Feb 1, 2026",
    status: "confirmed",
  },
  {
    id: "ticket-003",
    rideId: "ride-002",
    passengerName: "Hassan Ali",
    seatNumber: "B5",
    phoneNumber: "+880 1700 123458",
    price: 1200,
    bookingDate: "Feb 2, 2026",
    status: "confirmed",
  },
  {
    id: "ticket-004",
    rideId: "ride-002",
    passengerName: "Sophia Rahman",
    seatNumber: "B6",
    phoneNumber: "+880 1700 123459",
    price: 1200,
    bookingDate: "Feb 2, 2026",
    status: "cancelled",
  },
  {
    id: "ticket-005",
    rideId: "ride-003",
    passengerName: "Mohammed Hassan",
    seatNumber: "C3",
    phoneNumber: "+880 1700 123460",
    price: 950,
    bookingDate: "Feb 1, 2026",
    status: "confirmed",
  },
];

const FAKE_SALES_REPORTS: SalesReport[] = [
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

const FAKE_ADMIN_STATS: AdminStats = {
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

// Stats Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}> = ({ label, value, unit, icon, color }) => (
  <div className={`${color} rounded-lg p-4 text-white`}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {unit && <div className="text-xs text-gray-200 mt-1">{unit}</div>}
        <div className="text-xs text-gray-300 mt-2">{label}</div>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

// Admin Stats Dashboard
const AdminStatsDashboard: React.FC<{ stats: AdminStats }> = ({ stats }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-bold text-white mb-6">Bus Service Statistics</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Buses"
        value={stats.totalBuses}
        unit={`${stats.activeBuses} active`}
        icon="🚌"
        color="bg-gradient-to-br from-blue-600 to-blue-700"
      />
      <StatCard
        label="Total Rides"
        value={stats.totalRides}
        unit={`${stats.completedRides} completed`}
        icon="🛣️"
        color="bg-gradient-to-br from-green-600 to-green-700"
      />
      <StatCard
        label="Tickets Sold"
        value={stats.totalTicketsSold}
        unit="This month"
        icon="🎫"
        color="bg-gradient-to-br from-purple-600 to-purple-700"
      />
      <StatCard
        label="Total Revenue"
        value={`৳ ${(stats.totalRevenue / 1000).toFixed(0)}K`}
        icon="💰"
        color="bg-gradient-to-br from-teal-600 to-teal-700"
      />
      <StatCard
        label="Avg Ticket Price"
        value={`৳ ${stats.averageTicketPrice}`}
        icon="💳"
        color="bg-gradient-to-br from-orange-600 to-orange-700"
      />
      <StatCard
        label="Occupancy Rate"
        value={stats.occupancyRate.toFixed(1)}
        unit="%"
        icon="📊"
        color="bg-gradient-to-br from-yellow-600 to-yellow-700"
      />
      <StatCard
        label="Cancellation Rate"
        value={stats.cancellationRate.toFixed(1)}
        unit="%"
        icon="⚠️"
        color="bg-gradient-to-br from-red-600 to-red-700"
      />
    </div>
  </section>
);

// Bus Management Section
const BusManagementSection: React.FC<{ buses: Bus[] }> = ({ buses }) => {
  const [expandedBus, setExpandedBus] = useState<string | null>(null);
  const [isAddingBus, setIsAddingBus] = useState(false);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Bus Management</h2>
        <button
          onClick={() => setIsAddingBus(!isAddingBus)}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          {isAddingBus ? "Cancel" : "+ Add Bus"}
        </button>
      </div>

      {isAddingBus && (
        <div className="bg-gray-800/70 border border-teal-600 rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Add New Bus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Bus Number (e.g., BD-02-1006)"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <select className="px-4 py-2 rounded-lg bg-gray-700 text-white">
              <option>Select Bus Type</option>
              <option>AC</option>
              <option>Non-AC</option>
              <option>Sleeper</option>
              <option>Semi-Sleeper</option>
              <option>Deluxe</option>
            </select>
            <input
              type="number"
              placeholder="Total Seats"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Operator Name"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Registration Number"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <button className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
            Add Bus
          </button>
        </div>
      )}

      <div className="space-y-3">
        {buses.map((bus) => (
          <div
            key={bus.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold">
                  {bus.busNumber} - {bus.busType}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Operator: {bus.operatorName} • Seats: {bus.totalSeats}
                </p>
                <p className="text-gray-500 text-xs mt-1">Reg: {bus.registrationNumber}</p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bus.isActive
                      ? "bg-green-600/30 text-green-300"
                      : "bg-red-600/30 text-red-300"
                  }`}
                >
                  {bus.isActive ? "✓ Active" : "✗ Inactive"}
                </span>
                <button
                  onClick={() => setExpandedBus(expandedBus === bus.id ? null : bus.id)}
                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  {expandedBus === bus.id ? "Hide" : "Manage"}
                </button>
              </div>
            </div>

            {expandedBus === bus.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button className="px-4 py-2 rounded-lg bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 font-medium">
                    ✎ Edit Details
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-orange-600/50 hover:bg-orange-600/70 text-orange-200 font-medium">
                    {bus.isActive ? "🔴 Deactivate" : "🟢 Activate"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Ride Management Section
const RideManagementSection: React.FC<{ rides: BusRide[] }> = ({ rides }) => {
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<Record<string, BusRide["status"]>>({});
  const [isAddingRide, setIsAddingRide] = useState(false);

  const getStatusColor = (status: BusRide["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-600/30 text-blue-300 border border-blue-600/50";
      case "ongoing":
        return "bg-orange-600/30 text-orange-300 border border-orange-600/50";
      case "completed":
        return "bg-green-600/30 text-green-300 border border-green-600/50";
      case "cancelled":
        return "bg-red-600/30 text-red-300 border border-red-600/50";
    }
  };

  const handleStatusUpdate = (rideId: string, status: BusRide["status"]) => {
    setRideStatus((prev) => ({ ...prev, [rideId]: status }));
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Ride Management</h2>
        <button
          onClick={() => setIsAddingRide(!isAddingRide)}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          {isAddingRide ? "Cancel" : "+ Create Ride"}
        </button>
      </div>

      {isAddingRide && (
        <div className="bg-gray-800/70 border border-teal-600 rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Create New Ride</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="px-4 py-2 rounded-lg bg-gray-700 text-white">
              <option>Select Bus</option>
              {FAKE_BUSES.map((bus) => (
                <option key={bus.id}>{bus.busNumber}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Route (e.g., Dhaka → Chittagong)"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="datetime-local"
              placeholder="Departure Time"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="datetime-local"
              placeholder="Arrival Time"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Ticket Price"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <button className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
            Create Ride
          </button>
        </div>
      )}

      <div className="space-y-3">
        {rides.map((ride) => {
          const occupancyPercent = (ride.bookedSeats / ride.totalSeats) * 100;
          return (
            <div
              key={ride.id}
              className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{ride.route}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {ride.busNumber} • {ride.departureDate} - {ride.departureTime} to{" "}
                        {ride.arrivalTime}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <div>
                          <p className="text-gray-400 text-xs">Occupancy</p>
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-teal-500"
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                          <p className="text-teal-400 text-xs mt-1">
                            {ride.bookedSeats}/{ride.totalSeats} (
                            {occupancyPercent.toFixed(0)}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-white font-semibold">৳ {ride.price}</p>
                          <p className="text-gray-400 text-xs">per seat</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(rideStatus[ride.id] || ride.status)}`}>
                      {(rideStatus[ride.id] || ride.status).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedRide(expandedRide === ride.id ? null : ride.id)}
                  className="mt-3 md:mt-0 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  {expandedRide === ride.id ? "Hide" : "Manage"}
                </button>
              </div>

              {expandedRide === ride.id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-300 text-sm mb-3">Update Ride Status:</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {(["scheduled", "ongoing", "completed", "cancelled"] as BusRide["status"][]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(ride.id, status)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          (rideStatus[ride.id] || ride.status) === status
                            ? "bg-teal-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button className="px-4 py-2 rounded-lg bg-orange-600/50 hover:bg-orange-600/70 text-orange-200 font-medium">
                      ✎ Edit Ride
                    </button>
                    {(rideStatus[ride.id] || ride.status) !== "cancelled" && (
                      <button className="px-4 py-2 rounded-lg bg-red-600/50 hover:bg-red-600/70 text-red-200 font-medium">
                        ❌ Cancel Ride
                      </button>
                    )}
                  </div>
                  <button className="mt-3 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">
                    Save Status Update
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Ticket Management Section
const TicketManagementSection: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const confirmedTickets = tickets.filter((t) => t.status === "confirmed");
  const cancelledTickets = tickets.filter((t) => t.status === "cancelled");

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Ticket Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-900/40 to-green-700/20 border border-green-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Total Tickets</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{tickets.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/20 border border-blue-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Confirmed Tickets</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{confirmedTickets.length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-900/40 to-red-700/20 border border-red-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Cancelled Tickets</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{cancelledTickets.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">{ticket.passengerName}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Seat: {ticket.seatNumber} • Phone: {ticket.phoneNumber}
                </p>
                <p className="text-teal-400 text-sm">
                  ৳ {ticket.price} • Booked: {ticket.bookingDate}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === "confirmed"
                      ? "bg-green-600/30 text-green-300"
                      : "bg-red-600/30 text-red-300"
                  }`}
                >
                  {ticket.status === "confirmed" ? "✓ Confirmed" : "❌ Cancelled"}
                </span>
                {ticket.status === "confirmed" && (
                  <button
                    onClick={() =>
                      setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)
                    }
                    className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                  >
                    {selectedTicket === ticket.id ? "Hide" : "Actions"}
                  </button>
                )}
              </div>
            </div>

            {selectedTicket === ticket.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button className="w-full px-4 py-2 rounded-lg bg-red-600/50 hover:bg-red-600/70 text-red-200 font-medium">
                  Cancel Ticket & Refund
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Sales Report Section
const SalesReportSection: React.FC<{ reports: SalesReport[] }> = ({ reports }) => {
  const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalTickets = reports.reduce((sum, r) => sum + r.totalTicketsSold, 0);
  const avgOccupancy = (reports.reduce((sum, r) => sum + r.averageOccupancy, 0) / reports.length).toFixed(1);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Sales Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-900/40 to-green-700/20 border border-green-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            ৳ {(totalRevenue / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/20 border border-blue-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Total Tickets Sold</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{totalTickets}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-900/40 to-teal-700/20 border border-teal-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Avg Occupancy</p>
          <p className="text-3xl font-bold text-teal-400 mt-2">{avgOccupancy}%</p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/70 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Total Rides</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Completed</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Tickets Sold</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Revenue</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Occupancy</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Cancellations</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-3 text-white">{report.date}</td>
                  <td className="px-6 py-3 text-gray-300">{report.totalRides}</td>
                  <td className="px-6 py-3 text-green-400">{report.completedRides}</td>
                  <td className="px-6 py-3 text-teal-400">{report.totalTicketsSold}</td>
                  <td className="px-6 py-3 text-white font-semibold">
                    ৳ {report.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-yellow-400">{report.averageOccupancy.toFixed(1)}%</td>
                  <td className="px-6 py-3 text-red-400">{report.cancellations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// Main Module Component
export const BusServiceAdminModule = () => {
  return (
    <section className="flex flex-col space-y-2 mt-4 w-full bg-gray-900 text-white min-h-screen p-6" id="bus_service_admin_module">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">Bus Service Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Manage buses, rides, tickets, and generate sales reports
          </p>
        </div>

        {/* Admin Statistics */}
        <AdminStatsDashboard stats={FAKE_ADMIN_STATS} />

        {/* Bus Management */}
        <BusManagementSection buses={FAKE_BUSES} />

        {/* Ride Management */}
        <RideManagementSection rides={FAKE_RIDES} />

        {/* Ticket Management */}
        <TicketManagementSection tickets={FAKE_TICKETS} />

        {/* Sales Report */}
        <SalesReportSection reports={FAKE_SALES_REPORTS} />
      </div>
    </section>
  );
};