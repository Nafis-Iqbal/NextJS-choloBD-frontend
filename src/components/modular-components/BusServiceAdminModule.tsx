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
  <div className="rounded-lg p-4" style={{backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text)'}}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-2xl font-bold" style={{color: 'var(--theme-teal)'}}>{value}</div>
        {unit && <div className="text-xs mt-1" style={{color: 'var(--theme-text-muted)'}}>{unit}</div>}
        <div className="text-xs mt-2" style={{color: 'var(--theme-text-subtle)'}}>{label}</div>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

// Admin Stats Dashboard
const AdminStatsDashboard: React.FC<{ stats: AdminStats }> = ({ stats }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--theme-text)'}}>Bus Service Statistics</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Buses"
        value={stats.totalBuses}
        unit={`${stats.activeBuses} active`}
        icon="🚌"
        color=""
      />
      <StatCard
        label="Total Rides"
        value={stats.totalRides}
        unit={`${stats.completedRides} completed`}
        icon="🛣️"
        color=""
      />
      <StatCard
        label="Tickets Sold"
        value={stats.totalTicketsSold}
        unit="This month"
        icon="🎫"
        color=""
      />
      <StatCard
        label="Total Revenue"
        value={`৳ ${(stats.totalRevenue / 1000).toFixed(0)}K`}
        icon="💰"
        color=""
      />
      <StatCard
        label="Avg Ticket Price"
        value={`৳ ${stats.averageTicketPrice}`}
        icon="💳"
        color=""
      />
      <StatCard
        label="Occupancy Rate"
        value={stats.occupancyRate.toFixed(1)}
        unit="%"
        icon="📊"
        color=""
      />
      <StatCard
        label="Cancellation Rate"
        value={stats.cancellationRate.toFixed(1)}
        unit="%"
        icon="⚠️"
        color=""
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
        <h2 className="text-2xl font-bold" style={{color: 'var(--theme-text)'}}>Bus Management</h2>
        <button
          onClick={() => setIsAddingBus(!isAddingBus)}
          className="px-4 py-2 rounded-lg font-medium"
          style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}
        >
          {isAddingBus ? "Cancel" : "+ Add Bus"}
        </button>
      </div>

      {isAddingBus && (
        <div className="rounded-xl p-6 mb-6" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-teal)', borderWidth: '1px'}}>
          <h3 className="font-semibold mb-4" style={{color: 'var(--theme-text)'}}>Add New Bus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Bus Number (e.g., BD-02-1006)"
              className="px-4 py-2 rounded-lg theme-input"
              style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            />
            <select className="px-4 py-2 rounded-lg theme-input" style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}>
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
              className="px-4 py-2 rounded-lg theme-input"
              style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            />
            <input
              type="text"
              placeholder="Operator Name"
              className="px-4 py-2 rounded-lg theme-input"
              style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            />
            <input
              type="text"
              placeholder="Registration Number"
              className="px-4 py-2 rounded-lg theme-input"
              style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            />
          </div>
          <button className="mt-4 w-full py-2 rounded-lg font-medium" style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}>
            Add Bus
          </button>
        </div>
      )}

      <div className="space-y-3">
        {buses.map((bus) => (
          <div
            key={bus.id}
            className="rounded-lg p-4 transition-colors"
            style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="font-semibold" style={{color: 'var(--theme-text)'}}>
                  {bus.busNumber} - {bus.busType}
                </h3>
                <p className="text-sm mt-1" style={{color: 'var(--theme-text-muted)'}}>
                  Operator: {bus.operatorName} • Seats: {bus.totalSeats}
                </p>
                <p className="text-xs mt-1" style={{color: 'var(--theme-text-subtle)'}}>Reg: {bus.registrationNumber}</p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{backgroundColor: bus.isActive ? 'rgba(42, 157, 143, 0.3)' : 'rgba(220, 53, 69, 0.3)', color: bus.isActive ? 'var(--theme-teal)' : 'var(--theme-red)'}}
                >
                  {bus.isActive ? "✓ Active" : "✗ Inactive"}
                </span>
                <button
                  onClick={() => setExpandedBus(expandedBus === bus.id ? null : bus.id)}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}
                >
                  {expandedBus === bus.id ? "Hide" : "Manage"}
                </button>
              </div>
            </div>

            {expandedBus === bus.id && (
              <div className="mt-4 pt-4" style={{borderTopColor: 'var(--theme-deep-green)', borderTopWidth: '1px'}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button className="px-4 py-2 rounded-lg font-medium" style={{backgroundColor: 'rgba(0, 123, 255, 0.3)', color: 'var(--theme-teal)'}}>
                    ✎ Edit Details
                  </button>
                  <button className="px-4 py-2 rounded-lg font-medium" style={{backgroundColor: 'rgba(255, 193, 7, 0.3)', color: 'var(--theme-text)'}}>
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
    const baseStyle = {
      paddingLeft: '0.75rem',
      paddingRight: '0.75rem',
      paddingTop: '0.25rem',
      paddingBottom: '0.25rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      whiteSpace: 'nowrap' as const,
      border: `1px solid`,
    };
    switch (status) {
      case "scheduled":
        return { ...baseStyle, backgroundColor: 'rgba(0, 123, 255, 0.3)', color: 'rgb(0, 123, 255)', borderColor: 'rgba(0, 123, 255, 0.5)' };
      case "ongoing":
        return { ...baseStyle, backgroundColor: 'rgba(255, 165, 0, 0.3)', color: 'rgb(255, 165, 0)', borderColor: 'rgba(255, 165, 0, 0.5)' };
      case "completed":
        return { ...baseStyle, backgroundColor: 'rgba(40, 167, 69, 0.3)', color: 'rgb(40, 167, 69)', borderColor: 'rgba(40, 167, 69, 0.5)' };
      case "cancelled":
        return { ...baseStyle, backgroundColor: 'rgba(220, 53, 69, 0.3)', color: 'rgb(220, 53, 69)', borderColor: 'rgba(220, 53, 69, 0.5)' };
    }
  };

  const handleStatusUpdate = (rideId: string, status: BusRide["status"]) => {
    setRideStatus((prev) => ({ ...prev, [rideId]: status }));
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{color: 'var(--theme-text)'}}>Ride Management</h2>
        <button
          onClick={() => setIsAddingRide(!isAddingRide)}
          className="px-4 py-2 rounded-lg font-medium"
          style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}
        >
          {isAddingRide ? "Cancel" : "+ Create Ride"}
        </button>
      </div>

      {isAddingRide && (
        <div className="rounded-xl p-6 mb-6" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-teal)', borderWidth: '1px'}}>
          <h3 className="font-semibold mb-4" style={{color: 'var(--theme-text)'}}>Create New Ride</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="px-4 py-2 rounded-lg theme-input" style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}>
              <option>Select Bus</option>
              {FAKE_BUSES.map((bus) => (
                <option key={bus.id}>{bus.busNumber}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Route (e.g., Dhaka → Chittagong)"
              className="px-4 py-2 rounded-lg theme-input"
              style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            />
            <input
              type="datetime-local"
              placeholder="Departure Time"
              className="px-4 py-2 rounded-lg theme-input"
              style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            />
            <input
              type="datetime-local"
              placeholder="Arrival Time"
              className="px-4 py-2 rounded-lg theme-input"
              style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            />
            <input
              type="number"
              placeholder="Ticket Price"
              className="px-4 py-2 rounded-lg theme-input"
              style={{backgroundColor: 'var(--theme-input-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            />
          </div>
          <button className="mt-4 w-full py-2 rounded-lg font-medium" style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}>
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
              className="rounded-lg p-4 transition-colors"
              style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold" style={{color: 'var(--theme-text)'}}>{ride.route}</p>
                      <p className="text-sm mt-1" style={{color: 'var(--theme-text-muted)'}}>
                        {ride.busNumber} • {ride.departureDate} - {ride.departureTime} to{" "}
                        {ride.arrivalTime}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <div>
                          <p className="text-xs" style={{color: 'var(--theme-text-muted)'}}>Occupancy</p>
                          <div className="w-24 h-2 rounded-full overflow-hidden mt-1" style={{backgroundColor: 'var(--theme-section-bg)'}}>
                            <div
                              className="h-full"
                              style={{backgroundColor: 'var(--theme-teal)', width: `${occupancyPercent}%`}}
                            />
                          </div>
                          <p className="text-xs mt-1" style={{color: 'var(--theme-teal)'}}>
                            {ride.bookedSeats}/{ride.totalSeats} (
                            {occupancyPercent.toFixed(0)}%)
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold" style={{color: 'var(--theme-text)'}}>৳ {ride.price}</p>
                          <p className="text-xs" style={{color: 'var(--theme-text-muted)'}}>per seat</p>
                        </div>
                      </div>
                    </div>
                    <span style={getStatusColor(rideStatus[ride.id] || ride.status)}>
                      {(rideStatus[ride.id] || ride.status).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedRide(expandedRide === ride.id ? null : ride.id)}
                  className="mt-3 md:mt-0 px-4 py-2 rounded-lg text-sm"
                  style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}
                >
                  {expandedRide === ride.id ? "Hide" : "Manage"}
                </button>
              </div>

              {expandedRide === ride.id && (
                <div className="mt-4 pt-4" style={{borderTopColor: 'var(--theme-deep-green)', borderTopWidth: '1px'}}>
                  <p className="text-sm mb-3" style={{color: 'var(--theme-text-muted)'}}>Update Ride Status:</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {(["scheduled", "ongoing", "completed", "cancelled"] as BusRide["status"][]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(ride.id, status)}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: (rideStatus[ride.id] || ride.status) === status ? 'var(--theme-teal)' : 'var(--theme-section-bg)',
                          color: (rideStatus[ride.id] || ride.status) === status ? 'white' : 'var(--theme-text-muted)'
                        }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button className="px-4 py-2 rounded-lg font-medium" style={{backgroundColor: 'rgba(255, 165, 0, 0.3)', color: 'var(--theme-text)'}}>
                      ✎ Edit Ride
                    </button>
                    {(rideStatus[ride.id] || ride.status) !== "cancelled" && (
                      <button className="px-4 py-2 rounded-lg font-medium" style={{backgroundColor: 'rgba(220, 53, 69, 0.3)', color: 'var(--theme-text)'}}>
                        ❌ Cancel Ride
                      </button>
                    )}
                  </div>
                  <button className="mt-3 w-full py-2 rounded-lg font-medium" style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}>
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
      <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--theme-text)'}}>Ticket Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-teal)', borderWidth: '1px'}}>
          <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>Total Tickets</p>
          <p className="text-3xl font-bold mt-2" style={{color: 'var(--theme-teal)'}}>{tickets.length}</p>
        </div>
        <div className="rounded-xl p-4" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-teal)', borderWidth: '1px'}}>
          <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>Confirmed Tickets</p>
          <p className="text-3xl font-bold mt-2" style={{color: 'var(--theme-teal)'}}>{confirmedTickets.length}</p>
        </div>
        <div className="rounded-xl p-4" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-red)', borderWidth: '1px'}}>
          <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>Cancelled Tickets</p>
          <p className="text-3xl font-bold mt-2" style={{color: 'var(--theme-red)'}}>{cancelledTickets.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-lg p-4 transition-colors"
            style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="font-semibold" style={{color: 'var(--theme-text)'}}>{ticket.passengerName}</p>
                <p className="text-sm mt-1" style={{color: 'var(--theme-text-muted)'}}>
                  Seat: {ticket.seatNumber} • Phone: {ticket.phoneNumber}
                </p>
                <p className="text-sm" style={{color: 'var(--theme-teal)'}}>
                  ৳ {ticket.price} • Booked: {ticket.bookingDate}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: ticket.status === "confirmed" ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)',
                    color: ticket.status === "confirmed" ? 'rgb(40, 167, 69)' : 'rgb(220, 53, 69)'
                  }}
                >
                  {ticket.status === "confirmed" ? "✓ Confirmed" : "❌ Cancelled"}
                </span>
                {ticket.status === "confirmed" && (
                  <button
                    onClick={() =>
                      setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)
                    }
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}
                  >
                    {selectedTicket === ticket.id ? "Hide" : "Actions"}
                  </button>
                )}
              </div>
            </div>

            {selectedTicket === ticket.id && (
              <div className="mt-4 pt-4" style={{borderTopColor: 'var(--theme-deep-green)', borderTopWidth: '1px'}}>
                <button className="w-full px-4 py-2 rounded-lg font-medium" style={{backgroundColor: 'rgba(220, 53, 69, 0.3)', color: 'var(--theme-text)'}}>
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
      <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--theme-text)'}}>Sales Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-teal)', borderWidth: '1px'}}>
          <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>Total Revenue</p>
          <p className="text-3xl font-bold mt-2" style={{color: 'var(--theme-teal)'}}>
            ৳ {(totalRevenue / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="rounded-xl p-4" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-teal)', borderWidth: '1px'}}>
          <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>Total Tickets Sold</p>
          <p className="text-3xl font-bold mt-2" style={{color: 'var(--theme-teal)'}}>{totalTickets}</p>
        </div>
        <div className="rounded-xl p-4" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-teal)', borderWidth: '1px'}}>
          <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>Avg Occupancy</p>
          <p className="text-3xl font-bold mt-2" style={{color: 'var(--theme-teal)'}}>{avgOccupancy}%</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{backgroundColor: 'var(--theme-section-bg)', borderBottomColor: 'var(--theme-deep-green)', borderBottomWidth: '1px'}}>
              <tr>
                <th className="px-6 py-3 text-left font-semibold" style={{color: 'var(--theme-text)'}}>Date</th>
                <th className="px-6 py-3 text-left font-semibold" style={{color: 'var(--theme-text)'}}>Total Rides</th>
                <th className="px-6 py-3 text-left font-semibold" style={{color: 'var(--theme-text)'}}>Completed</th>
                <th className="px-6 py-3 text-left font-semibold" style={{color: 'var(--theme-text)'}}>Tickets Sold</th>
                <th className="px-6 py-3 text-left font-semibold" style={{color: 'var(--theme-text)'}}>Revenue</th>
                <th className="px-6 py-3 text-left font-semibold" style={{color: 'var(--theme-text)'}}>Occupancy</th>
                <th className="px-6 py-3 text-left font-semibold" style={{color: 'var(--theme-text)'}}>Cancellations</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, idx) => (
                <tr
                  key={idx}
                  style={{borderBottomColor: 'var(--theme-deep-green)', borderBottomWidth: '1px'}}
                >
                  <td className="px-6 py-3" style={{color: 'var(--theme-text)'}}>{report.date}</td>
                  <td className="px-6 py-3" style={{color: 'var(--theme-text-muted)'}}>{report.totalRides}</td>
                  <td className="px-6 py-3" style={{color: 'var(--theme-teal)'}}>{report.completedRides}</td>
                  <td className="px-6 py-3" style={{color: 'var(--theme-teal)'}}>{report.totalTicketsSold}</td>
                  <td className="px-6 py-3 font-semibold" style={{color: 'var(--theme-text)'}}>
                    ৳ {report.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-3" style={{color: 'var(--theme-teal)'}}>{report.averageOccupancy.toFixed(1)}%</td>
                  <td className="px-6 py-3" style={{color: 'var(--theme-text-muted)'}}>{report.cancellations}</td>
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
    <section className="flex flex-col space-y-2 mt-4 w-full min-h-screen p-6" id="bus_service_admin_module" style={{backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)'}}>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold" style={{color: 'var(--theme-text)'}}>Bus Service Admin Dashboard</h1>
          <p className="mt-2" style={{color: 'var(--theme-text-muted)'}}>Manage buses, rides, tickets, and generate sales reports</p>
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