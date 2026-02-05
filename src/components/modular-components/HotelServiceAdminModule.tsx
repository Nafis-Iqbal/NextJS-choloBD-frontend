"use client";

import React, { useState } from "react";

// Type Definitions
type RoomType = "Single" | "Double" | "Suite" | "Deluxe" | "Family";

type HotelRoom = {
  id: string;
  roomNumber: string;
  roomType: RoomType;
  floor: number;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  description: string;
  isActive: boolean;
};

type HotelProfile = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  website?: string;
  address: string;
  city: string;
  totalRooms: number;
  checkInTime: string;
  checkOutTime: string;
  description: string;
  amenities: string[];
  policies: string[];
  averageRating: number;
  totalReviews: number;
};

type EarningsRecord = {
  id: string;
  bookingId: string;
  guestName: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  amount: number;
  status: "completed" | "pending" | "refunded";
  date: string;
};

type RoomTypeStats = {
  type: RoomType;
  count: number;
  occupied: number;
  available: number;
  occupancyRate: number;
};

type Complaint = {
  id: string;
  bookingId: string;
  guestName: string;
  email: string;
  complaintType: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  reportedAt: string;
  resolution?: string;
};

type AdminStats = {
  totalEarnings: number;
  monthlyEarnings: number;
  totalBookings: number;
  activeBookings: number;
  averageRoomPrice: number;
  occupancyRate: number;
  customerSatisfaction: number;
  totalComplaints: number;
};

// Fake Data
const FAKE_HOTEL_PROFILE: HotelProfile = {
  id: "hotel-001",
  name: "Grand Palace Hotel",
  email: "info@grandpalace.com",
  phoneNumber: "+880 1700 123456",
  website: "www.grandpalace.com",
  address: "123 Main Street, Cox's Bazar",
  city: "Cox's Bazar",
  totalRooms: 50,
  checkInTime: "2:00 PM",
  checkOutTime: "11:00 AM",
  description:
    "Luxury hotel with world-class amenities located on the beautiful beaches of Cox's Bazar",
  amenities: [
    "Free WiFi",
    "Swimming Pool",
    "Restaurant",
    "Spa",
    "Gym",
    "24/7 Room Service",
    "Parking",
    "Conference Hall",
  ],
  policies: [
    "No smoking in rooms",
    "Pets allowed with additional fee",
    "Cancellation: 48 hours before check-in",
    "Valid ID required at check-in",
  ],
  averageRating: 4.6,
  totalReviews: 287,
};

const FAKE_ROOMS: HotelRoom[] = [
  {
    id: "room-001",
    roomNumber: "101",
    roomType: "Single",
    floor: 1,
    capacity: 1,
    pricePerNight: 3500,
    amenities: ["WiFi", "AC", "Flat TV", "Bathroom"],
    description: "Cozy single room with modern amenities",
    isActive: true,
  },
  {
    id: "room-002",
    roomNumber: "102",
    roomType: "Double",
    floor: 1,
    capacity: 2,
    pricePerNight: 5500,
    amenities: ["WiFi", "AC", "Flat TV", "Bathroom", "Mini Bar"],
    description: "Spacious double room with sea view",
    isActive: true,
  },
  {
    id: "room-003",
    roomNumber: "103",
    roomType: "Suite",
    floor: 1,
    capacity: 4,
    pricePerNight: 8500,
    amenities: [
      "WiFi",
      "AC",
      "Flat TV",
      "Bathroom",
      "Jacuzzi",
      "Living Area",
      "Mini Bar",
    ],
    description: "Luxurious suite with premium amenities",
    isActive: true,
  },
  {
    id: "room-004",
    roomNumber: "201",
    roomType: "Double",
    floor: 2,
    capacity: 2,
    pricePerNight: 5500,
    amenities: ["WiFi", "AC", "Flat TV", "Bathroom", "Mini Bar"],
    description: "Double room with balcony",
    isActive: true,
  },
  {
    id: "room-005",
    roomNumber: "202",
    roomType: "Deluxe",
    floor: 2,
    capacity: 3,
    pricePerNight: 7000,
    amenities: [
      "WiFi",
      "AC",
      "Flat TV",
      "Bathroom",
      "Mini Bar",
      "Work Desk",
      "Bathrobe",
    ],
    description: "Deluxe room with premium furnishings",
    isActive: true,
  },
  {
    id: "room-006",
    roomNumber: "301",
    roomType: "Family",
    floor: 3,
    capacity: 4,
    pricePerNight: 9500,
    amenities: [
      "WiFi",
      "AC",
      "Multiple TVs",
      "2 Bathrooms",
      "Kitchen",
      "Living Area",
    ],
    description: "Spacious family room suitable for 4 guests",
    isActive: true,
  },
];

const FAKE_ROOM_TYPE_STATS: RoomTypeStats[] = [
  {
    type: "Single",
    count: 8,
    occupied: 6,
    available: 2,
    occupancyRate: 75,
  },
  {
    type: "Double",
    count: 16,
    occupied: 12,
    available: 4,
    occupancyRate: 75,
  },
  {
    type: "Suite",
    count: 8,
    occupied: 5,
    available: 3,
    occupancyRate: 62.5,
  },
  {
    type: "Deluxe",
    count: 12,
    occupied: 7,
    available: 5,
    occupancyRate: 58.3,
  },
  {
    type: "Family",
    count: 6,
    occupied: 4,
    available: 2,
    occupancyRate: 66.7,
  },
];

const FAKE_EARNINGS: EarningsRecord[] = [
  {
    id: "earning-001",
    bookingId: "booking-001",
    guestName: "Ahmad Khan",
    roomType: "Double",
    checkInDate: "Feb 1, 2026",
    checkOutDate: "Feb 3, 2026",
    nights: 2,
    amount: 11000,
    status: "completed",
    date: "Feb 3, 2026",
  },
  {
    id: "earning-002",
    bookingId: "booking-002",
    guestName: "Fatima Ahmed",
    roomType: "Deluxe",
    checkInDate: "Feb 2, 2026",
    checkOutDate: "Feb 5, 2026",
    nights: 3,
    amount: 21000,
    status: "completed",
    date: "Feb 2, 2026",
  },
  {
    id: "earning-003",
    bookingId: "booking-003",
    guestName: "Hassan Ali",
    roomType: "Single",
    checkInDate: "Feb 3, 2026",
    checkOutDate: "Feb 5, 2026",
    nights: 2,
    amount: 7000,
    status: "pending",
    date: "Feb 3, 2026",
  },
  {
    id: "earning-004",
    bookingId: "booking-004",
    guestName: "Sophia Rahman",
    roomType: "Suite",
    checkInDate: "Feb 1, 2026",
    checkOutDate: "Feb 2, 2026",
    nights: 1,
    amount: 8500,
    status: "completed",
    date: "Feb 2, 2026",
  },
  {
    id: "earning-005",
    bookingId: "booking-005",
    guestName: "Mohammed Hassan",
    roomType: "Family",
    checkInDate: "Jan 28, 2026",
    checkOutDate: "Jan 31, 2026",
    nights: 3,
    amount: 28500,
    status: "completed",
    date: "Jan 31, 2026",
  },
  {
    id: "earning-006",
    bookingId: "booking-006",
    guestName: "Ayesha Khan",
    roomType: "Double",
    checkInDate: "Jan 25, 2026",
    checkOutDate: "Jan 28, 2026",
    nights: 3,
    amount: 16500,
    status: "refunded",
    date: "Jan 30, 2026",
  },
];

const FAKE_COMPLAINTS: Complaint[] = [
  {
    id: "complaint-001",
    bookingId: "booking-001",
    guestName: "Ahmad Khan",
    email: "ahmad@example.com",
    complaintType: "Noise",
    description: "Excessive noise from neighboring rooms during night hours",
    status: "resolved",
    priority: "medium",
    reportedAt: "Feb 2, 2026 - 11:30 PM",
    resolution: "Moved guest to quieter room on different floor",
  },
  {
    id: "complaint-002",
    bookingId: "booking-002",
    guestName: "Fatima Ahmed",
    email: "fatima@example.com",
    complaintType: "Water Issue",
    description: "Hot water not available in bathroom, only cold water",
    status: "in-progress",
    priority: "high",
    reportedAt: "Feb 2, 2026 - 10:15 AM",
  },
  {
    id: "complaint-003",
    bookingId: "booking-003",
    guestName: "Hassan Ali",
    email: "hassan@example.com",
    complaintType: "Service Quality",
    description: "Slow room service and unprofessional staff behavior",
    status: "pending",
    priority: "high",
    reportedAt: "Feb 2, 2026 - 8:45 AM",
  },
  {
    id: "complaint-004",
    bookingId: "booking-004",
    guestName: "Sophia Rahman",
    email: "sophia@example.com",
    complaintType: "Cleanliness",
    description: "Room not properly cleaned, dust on surfaces",
    status: "resolved",
    priority: "medium",
    reportedAt: "Feb 1, 2026 - 3:00 PM",
    resolution: "Room deep cleaned, compensation offered",
  },
  {
    id: "complaint-005",
    bookingId: "booking-005",
    guestName: "Mohammed Hassan",
    email: "mohammed@example.com",
    complaintType: "WiFi Issue",
    description: "WiFi disconnects frequently throughout the stay",
    status: "in-progress",
    priority: "low",
    reportedAt: "Jan 29, 2026 - 6:30 PM",
  },
];

const FAKE_ADMIN_STATS: AdminStats = {
  totalEarnings: 2042000,
  monthlyEarnings: 325000,
  totalBookings: 45,
  activeBookings: 8,
  averageRoomPrice: 6508,
  occupancyRate: 66.7,
  customerSatisfaction: 4.6,
  totalComplaints: 5,
};

// Stats Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
  trend?: string;
}> = ({ label, value, unit, icon, color, trend }) => (
  <div className={`${color} rounded-lg p-4 text-white`}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {unit && <div className="text-xs text-gray-200 mt-1">{unit}</div>}
        <div className="text-xs text-gray-300 mt-2">{label}</div>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
    {trend && (
      <div className="mt-2 text-xs text-green-200">📈 {trend}</div>
    )}
  </div>
);

// Admin Stats Dashboard Component
const AdminStatsDashboard: React.FC<{ stats: AdminStats }> = ({ stats }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-bold text-white mb-6">Admin Statistics</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Earnings"
        value={`৳ ${(stats.totalEarnings / 100000).toFixed(1)}L`}
        icon="💰"
        color="bg-gradient-to-br from-green-600 to-green-700"
        trend="↑ 12% this month"
      />
      <StatCard
        label="Monthly Earnings"
        value={`৳ ${(stats.monthlyEarnings / 1000).toFixed(0)}K`}
        icon="📊"
        color="bg-gradient-to-br from-blue-600 to-blue-700"
        trend="↑ 8% vs last month"
      />
      <StatCard
        label="Active Bookings"
        value={stats.activeBookings}
        unit={`/ ${stats.totalBookings} total`}
        icon="📅"
        color="bg-gradient-to-br from-purple-600 to-purple-700"
      />
      <StatCard
        label="Occupancy Rate"
        value={stats.occupancyRate.toFixed(1)}
        unit="%"
        icon="🛏️"
        color="bg-gradient-to-br from-teal-600 to-teal-700"
      />
      <StatCard
        label="Avg Room Price"
        value={`৳ ${stats.averageRoomPrice.toLocaleString()}`}
        icon="💳"
        color="bg-gradient-to-br from-orange-600 to-orange-700"
      />
      <StatCard
        label="Customer Satisfaction"
        value={stats.customerSatisfaction}
        unit="/ 5"
        icon="⭐"
        color="bg-gradient-to-br from-yellow-600 to-yellow-700"
      />
      <StatCard
        label="Total Complaints"
        value={stats.totalComplaints}
        icon="⚠️"
        color="bg-gradient-to-br from-red-600 to-red-700"
      />
    </div>
  </section>
);

// Hotel Profile Section
const HotelProfileSection: React.FC<{ profile: HotelProfile }> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Hotel Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium"
        >
          {isEditing ? "✓ Done" : "✎ Edit"}
        </button>
      </div>

      <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{profile.name}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className={`text-white ${isEditing ? "p-2 bg-gray-700 rounded" : ""}`}>
                  {profile.email}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone Number</p>
                <p className={`text-white ${isEditing ? "p-2 bg-gray-700 rounded" : ""}`}>
                  {profile.phoneNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Website</p>
                <p className={`text-teal-400 ${isEditing ? "p-2 bg-gray-700 rounded" : ""}`}>
                  {profile.website || "Not set"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Address</p>
                <p className={`text-white ${isEditing ? "p-2 bg-gray-700 rounded" : ""}`}>
                  {profile.address}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-sm">Check-in Time</p>
                  <p className={`text-white ${isEditing ? "p-2 bg-gray-700 rounded" : ""}`}>
                    {profile.checkInTime}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Check-out Time</p>
                  <p className={`text-white ${isEditing ? "p-2 bg-gray-700 rounded" : ""}`}>
                    {profile.checkOutTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Description</p>
          <p className="text-gray-300">{profile.description}</p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-white font-semibold mb-3">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {profile.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-3 py-1 rounded-full bg-teal-600/30 text-teal-300 text-sm"
              >
                ✓ {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-white font-semibold mb-3">Policies</p>
          <ul className="space-y-2">
            {profile.policies.map((policy) => (
              <li key={policy} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span>{policy}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Hotel Rating</p>
            <p className="text-white font-bold">
              ⭐ {profile.averageRating} ({profile.totalReviews} reviews)
            </p>
          </div>
          {isEditing && (
            <button className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium">
              Save Changes
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

// Room Type Statistics Section
const RoomTypeStatsSection: React.FC<{ roomTypes: RoomTypeStats[] }> = ({ roomTypes }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-bold text-white mb-6">Room Type Statistics</h2>
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/70 border-b border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-white font-semibold">Room Type</th>
              <th className="px-6 py-3 text-left text-white font-semibold">Total</th>
              <th className="px-6 py-3 text-left text-white font-semibold">Occupied</th>
              <th className="px-6 py-3 text-left text-white font-semibold">Available</th>
              <th className="px-6 py-3 text-left text-white font-semibold">Occupancy %</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map((roomType) => (
              <tr
                key={roomType.type}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-3 text-white font-medium">{roomType.type}</td>
                <td className="px-6 py-3 text-gray-300">{roomType.count}</td>
                <td className="px-6 py-3 text-orange-400">{roomType.occupied}</td>
                <td className="px-6 py-3 text-green-400">{roomType.available}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500"
                        style={{ width: `${roomType.occupancyRate}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {roomType.occupancyRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

// Room Management Section
const RoomManagementSection: React.FC<{ rooms: HotelRoom[] }> = ({ rooms }) => {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Hotel Rooms Management</h2>
        <button
          onClick={() => setIsAddingRoom(!isAddingRoom)}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          {isAddingRoom ? "Cancel" : "+ Add Room"}
        </button>
      </div>

      {isAddingRoom && (
        <div className="bg-gray-800/70 border border-teal-600 rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Add New Room</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Room Number"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <select className="px-4 py-2 rounded-lg bg-gray-700 text-white">
              <option>Select Room Type</option>
              <option>Single</option>
              <option>Double</option>
              <option>Suite</option>
              <option>Deluxe</option>
              <option>Family</option>
            </select>
            <input
              type="number"
              placeholder="Floor"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Capacity"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Price Per Night"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <button className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
            Add Room
          </button>
        </div>
      )}

      <div className="space-y-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold">
                  Room {room.roomNumber} - {room.roomType}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Floor {room.floor} • Capacity: {room.capacity} guests • ৳ {room.pricePerNight}
                </p>
                <p className="text-gray-500 text-xs mt-2">{room.description}</p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    room.isActive
                      ? "bg-green-600/30 text-green-300"
                      : "bg-red-600/30 text-red-300"
                  }`}
                >
                  {room.isActive ? "✓ Active" : "✗ Inactive"}
                </span>
                <button
                  onClick={() =>
                    setExpandedRoom(expandedRoom === room.id ? null : room.id)
                  }
                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  {expandedRoom === room.id ? "Hide" : "Edit"}
                </button>
              </div>
            </div>

            {expandedRoom === room.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 text-sm mb-3">Amenities:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 rounded text-xs bg-teal-600/30 text-teal-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button className="px-4 py-2 rounded-lg bg-orange-600/50 hover:bg-orange-600/70 text-orange-200 font-medium">
                    ✎ Edit Details
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 font-medium">
                    {room.isActive ? "🔴 Deactivate" : "🟢 Activate"}
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

// Earnings Summary Section
const EarningsSummarySection: React.FC<{ earnings: EarningsRecord[] }> = ({ earnings }) => {
  const totalEarnings = earnings
    .filter((e) => e.status === "completed")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600/30 text-green-300";
      case "pending":
        return "bg-yellow-600/30 text-yellow-300";
      case "refunded":
        return "bg-red-600/30 text-red-300";
      default:
        return "bg-gray-600/30 text-gray-300";
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Earnings Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-900/40 to-green-700/20 border border-green-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Total Completed</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            ৳ {totalEarnings.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-700/20 border border-yellow-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Pending Amount</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            ৳ {pendingEarnings.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/20 border border-blue-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{earnings.length}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/70 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">Guest Name</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Room Type</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Check-in</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Check-out</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Nights</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((earning) => (
                <tr
                  key={earning.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-3 text-white">{earning.guestName}</td>
                  <td className="px-6 py-3 text-gray-300">{earning.roomType}</td>
                  <td className="px-6 py-3 text-gray-300 text-sm">{earning.checkInDate}</td>
                  <td className="px-6 py-3 text-gray-300 text-sm">{earning.checkOutDate}</td>
                  <td className="px-6 py-3 text-gray-300">{earning.nights}</td>
                  <td className="px-6 py-3 text-white font-semibold">
                    ৳ {earning.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        earning.status
                      )}`}
                    >
                      {earning.status === "completed"
                        ? "✓ Completed"
                        : earning.status === "pending"
                        ? "⏳ Pending"
                        : "↶ Refunded"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// Customer Complaints Section
const CustomerComplaintsSection: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [complaintStatus, setComplaintStatus] = useState<Record<string, Complaint["status"]>>({});

  const getStatusColor = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-600/30 text-red-300 border border-red-600/50";
      case "in-progress":
        return "bg-yellow-600/30 text-yellow-300 border border-yellow-600/50";
      case "resolved":
        return "bg-green-600/30 text-green-300 border border-green-600/50";
    }
  };

  const getPriorityColor = (priority: Complaint["priority"]) => {
    switch (priority) {
      case "low":
        return "text-blue-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
    }
  };

  const handleStatusUpdate = (complaintId: string, status: Complaint["status"]) => {
    setComplaintStatus((prev) => ({ ...prev, [complaintId]: status }));
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Customer Complaints</h2>
      <div className="space-y-3">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{complaint.guestName}</p>
                    <p className="text-gray-400 text-xs">{complaint.email}</p>
                    <p className={`text-sm font-medium mt-2 ${getPriorityColor(complaint.priority)}`}>
                      🚨 {complaint.priority.toUpperCase()} - {complaint.complaintType}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{complaint.description}</p>
                    {complaint.resolution && (
                      <p className="text-teal-400 text-sm mt-2">
                        ✓ Resolution: {complaint.resolution}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">{complaint.reportedAt}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(complaintStatus[complaint.id] || complaint.status)}`}>
                    {(complaintStatus[complaint.id] || complaint.status).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  setSelectedComplaint(selectedComplaint === complaint.id ? null : complaint.id)
                }
                className="mt-3 md:mt-0 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
              >
                {selectedComplaint === complaint.id ? "Hide" : "Update"}
              </button>
            </div>

            {selectedComplaint === complaint.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 text-sm mb-3">Update Status:</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {(["pending", "in-progress", "resolved"] as Complaint["status"][]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(complaint.id, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (complaintStatus[complaint.id] || complaint.status) === status
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Add resolution notes..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 text-sm"
                  rows={3}
                />
                <button className="mt-3 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">
                  Save Update
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Main Module Component
export const HotelServiceAdminModule = () => {
  return (
    <section className="flex flex-col space-y-2 mt-4 w-full bg-gray-900 text-white min-h-screen p-6" id="hotel_service_admin_module">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">Hotel Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Manage hotel profile, rooms, earnings, and customer complaints
          </p>
        </div>

        {/* Admin Statistics */}
        <AdminStatsDashboard stats={FAKE_ADMIN_STATS} />

        {/* Hotel Profile */}
        <HotelProfileSection profile={FAKE_HOTEL_PROFILE} />

        {/* Room Type Statistics */}
        <RoomTypeStatsSection roomTypes={FAKE_ROOM_TYPE_STATS} />

        {/* Room Management */}
        <RoomManagementSection rooms={FAKE_ROOMS} />

        {/* Earnings Summary */}
        <EarningsSummarySection earnings={FAKE_EARNINGS} />

        {/* Customer Complaints */}
        <CustomerComplaintsSection complaints={FAKE_COMPLAINTS} />
      </div>
    </section>
  );
};
