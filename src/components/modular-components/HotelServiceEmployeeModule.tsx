"use client";

import React, { useState } from "react";

// Type Definitions
type RoomStatus = "available" | "occupied" | "maintenance" | "cleaning";

type HotelRoom = {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: RoomStatus;
  lastCleaned?: string;
  nextCheckIn?: string;
};

type RoomBooking = {
  id: string;
  roomId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: "confirmed" | "checked-in" | "checked-out" | "cancelled";
  numberOfGuests: number;
  totalAmount: number;
};

type Complaint = {
  id: string;
  bookingId: string;
  guestName: string;
  complaintType: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  reportedAt: string;
};

type MaintenanceTask = {
  id: string;
  roomId: string;
  roomNumber: string;
  taskType: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate: string;
};

type HotelMetrics = {
  occupancyRate: number;
  availableRooms: number;
  totalRooms: number;
  checkInsToday: number;
  checkOutsToday: number;
  pendingComplaints: number;
  maintenanceTasksPending: number;
  averageRating: number;
};

// Fake Data
const FAKE_ROOMS: HotelRoom[] = [
  {
    id: "room-001",
    roomNumber: "101",
    roomType: "Single",
    floor: 1,
    capacity: 1,
    pricePerNight: 3500,
    status: "available",
    lastCleaned: "Feb 2, 2026 - 9:00 AM",
  },
  {
    id: "room-002",
    roomNumber: "102",
    roomType: "Double",
    floor: 1,
    capacity: 2,
    pricePerNight: 5500,
    status: "occupied",
    nextCheckIn: "Feb 3, 2026",
  },
  {
    id: "room-003",
    roomNumber: "103",
    roomType: "Suite",
    floor: 1,
    capacity: 4,
    pricePerNight: 8500,
    status: "cleaning",
    lastCleaned: "Feb 2, 2026 - 2:00 PM",
  },
  {
    id: "room-004",
    roomNumber: "201",
    roomType: "Double",
    floor: 2,
    capacity: 2,
    pricePerNight: 5500,
    status: "available",
    lastCleaned: "Feb 2, 2026 - 10:00 AM",
  },
  {
    id: "room-005",
    roomNumber: "202",
    roomType: "Single",
    floor: 2,
    capacity: 1,
    pricePerNight: 3500,
    status: "maintenance",
  },
  {
    id: "room-006",
    roomNumber: "301",
    roomType: "Deluxe",
    floor: 3,
    capacity: 3,
    pricePerNight: 7000,
    status: "occupied",
    nextCheckIn: "Feb 4, 2026",
  },
];

const FAKE_BOOKINGS: RoomBooking[] = [
  {
    id: "booking-001",
    roomId: "room-002",
    guestName: "Ahmad Khan",
    checkInDate: "Feb 1, 2026",
    checkOutDate: "Feb 3, 2026",
    status: "checked-in",
    numberOfGuests: 2,
    totalAmount: 11000,
  },
  {
    id: "booking-002",
    roomId: "room-006",
    guestName: "Fatima Ahmed",
    checkInDate: "Feb 2, 2026",
    checkOutDate: "Feb 5, 2026",
    status: "checked-in",
    numberOfGuests: 3,
    totalAmount: 21000,
  },
  {
    id: "booking-003",
    roomId: "room-001",
    guestName: "Hassan Ali",
    checkInDate: "Feb 3, 2026",
    checkOutDate: "Feb 5, 2026",
    status: "confirmed",
    numberOfGuests: 1,
    totalAmount: 7000,
  },
  {
    id: "booking-004",
    roomId: "room-004",
    guestName: "Sophia Rahman",
    checkInDate: "Feb 4, 2026",
    checkOutDate: "Feb 7, 2026",
    status: "confirmed",
    numberOfGuests: 2,
    totalAmount: 16500,
  },
];

const FAKE_COMPLAINTS: Complaint[] = [
  {
    id: "complaint-001",
    bookingId: "booking-001",
    guestName: "Ahmad Khan",
    complaintType: "Noise",
    description: "Noise from adjacent room during night",
    status: "in-progress",
    priority: "medium",
    reportedAt: "Feb 2, 2026 - 11:30 PM",
  },
  {
    id: "complaint-002",
    bookingId: "booking-002",
    guestName: "Fatima Ahmed",
    complaintType: "Water Issue",
    description: "Hot water not available in bathroom",
    status: "pending",
    priority: "high",
    reportedAt: "Feb 2, 2026 - 10:15 AM",
  },
  {
    id: "complaint-003",
    bookingId: "booking-001",
    guestName: "Ahmad Khan",
    complaintType: "Cleanliness",
    description: "Dust on furniture and bathroom fixtures",
    status: "resolved",
    priority: "low",
    reportedAt: "Feb 1, 2026 - 3:00 PM",
  },
];

const FAKE_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: "maint-001",
    roomId: "room-005",
    roomNumber: "202",
    taskType: "HVAC Repair",
    description: "Air conditioning not cooling properly",
    status: "in-progress",
    priority: "high",
    assignedTo: "Ahmed Hassan",
    dueDate: "Feb 2, 2026",
  },
  {
    id: "maint-002",
    roomId: "room-003",
    roomNumber: "103",
    taskType: "Plumbing",
    description: "Leaky faucet in bathroom",
    status: "pending",
    priority: "medium",
    dueDate: "Feb 3, 2026",
  },
  {
    id: "maint-003",
    roomId: "room-001",
    roomNumber: "101",
    taskType: "Electrical",
    description: "Bedside lamp not working",
    status: "pending",
    priority: "low",
    dueDate: "Feb 4, 2026",
  },
  {
    id: "maint-004",
    roomId: "room-004",
    roomNumber: "201",
    taskType: "Furniture Repair",
    description: "Chair broken in living area",
    status: "completed",
    priority: "medium",
    assignedTo: "Mohammed Ali",
    dueDate: "Feb 1, 2026",
  },
];

const FAKE_METRICS: HotelMetrics = {
  occupancyRate: 66.7,
  availableRooms: 2,
  totalRooms: 6,
  checkInsToday: 2,
  checkOutsToday: 1,
  pendingComplaints: 2,
  maintenanceTasksPending: 2,
  averageRating: 4.5,
};

// Dashboard Metrics Component
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}> = ({ label, value, unit, icon, color }) => (
  <div className={`${color} rounded-lg p-4 text-white`}>
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    {unit && <div className="text-sm text-gray-200">{unit}</div>}
    <div className="text-xs text-gray-300 mt-1">{label}</div>
  </div>
);

const MetricsDashboard: React.FC<{ metrics: HotelMetrics }> = ({ metrics }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-bold text-white mb-6">Hotel Metrics Overview</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="Occupancy Rate"
        value={metrics.occupancyRate.toFixed(1)}
        unit="%"
        icon="📊"
        color="bg-gradient-to-br from-blue-600 to-blue-700"
      />
      <MetricCard
        label="Available Rooms"
        value={metrics.availableRooms}
        unit={`/ ${metrics.totalRooms}`}
        icon="🛏️"
        color="bg-gradient-to-br from-green-600 to-green-700"
      />
      <MetricCard
        label="Check-ins Today"
        value={metrics.checkInsToday}
        icon="📥"
        color="bg-gradient-to-br from-teal-600 to-teal-700"
      />
      <MetricCard
        label="Check-outs Today"
        value={metrics.checkOutsToday}
        icon="📤"
        color="bg-gradient-to-br from-purple-600 to-purple-700"
      />
      <MetricCard
        label="Pending Complaints"
        value={metrics.pendingComplaints}
        icon="⚠️"
        color="bg-gradient-to-br from-orange-600 to-orange-700"
      />
      <MetricCard
        label="Maintenance Tasks"
        value={metrics.maintenanceTasksPending}
        icon="🔧"
        color="bg-gradient-to-br from-red-600 to-red-700"
      />
      <MetricCard
        label="Average Rating"
        value={metrics.averageRating}
        unit="/ 5"
        icon="⭐"
        color="bg-gradient-to-br from-yellow-600 to-yellow-700"
      />
    </div>
  </section>
);

// Room Status Management Component
const RoomStatusManagement: React.FC<{ rooms: HotelRoom[] }> = ({ rooms }) => {
  const [selectedRoomStatus, setSelectedRoomStatus] = useState<Record<string, RoomStatus>>({});
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "available":
        return "bg-green-600/30 text-green-300 border border-green-600/50";
      case "occupied":
        return "bg-orange-600/30 text-orange-300 border border-orange-600/50";
      case "cleaning":
        return "bg-blue-600/30 text-blue-300 border border-blue-600/50";
      case "maintenance":
        return "bg-red-600/30 text-red-300 border border-red-600/50";
    }
  };

  const handleStatusUpdate = (roomId: string, newStatus: RoomStatus) => {
    setSelectedRoomStatus((prev) => ({ ...prev, [roomId]: newStatus }));
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Room Status Management</h2>
      <div className="space-y-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-semibold text-lg">
                    Room {room.roomNumber}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoomStatus[room.id] || room.status)}`}>
                    {(selectedRoomStatus[room.id] || room.status).toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {room.roomType} • Floor {room.floor} • Capacity: {room.capacity} guests
                </p>
                {room.lastCleaned && (
                  <p className="text-teal-400 text-xs mt-2">
                    Last Cleaned: {room.lastCleaned}
                  </p>
                )}
              </div>

              <div className="mt-3 md:mt-0 flex items-center gap-2">
                <button
                  onClick={() =>
                    setExpandedRoom(expandedRoom === room.id ? null : room.id)
                  }
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  {expandedRoom === room.id ? "Hide" : "Update"}
                </button>
                <span className="text-white font-semibold">৳ {room.pricePerNight}</span>
              </div>
            </div>

            {expandedRoom === room.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 text-sm mb-3">Change Room Status:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["available", "occupied", "cleaning", "maintenance"] as RoomStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(room.id, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (selectedRoomStatus[room.id] || room.status) === status
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">
                  Save Status Change
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Room Bookings Component
const RoomBookingsManagement: React.FC<{ bookings: RoomBooking[] }> = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-600/30 text-blue-300";
      case "checked-in":
        return "bg-green-600/30 text-green-300";
      case "checked-out":
        return "bg-gray-600/30 text-gray-300";
      case "cancelled":
        return "bg-red-600/30 text-red-300";
      default:
        return "bg-gray-600/30 text-gray-300";
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Room Bookings</h2>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">{booking.guestName}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Check-in: {booking.checkInDate} | Check-out: {booking.checkOutDate}
                </p>
                <p className="text-teal-400 text-sm">
                  {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? "s" : ""}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">৳ {booking.totalAmount.toLocaleString()}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status === "checked-in"
                      ? "✓ Checked In"
                      : booking.status === "checked-out"
                      ? "✓ Checked Out"
                      : booking.status === "confirmed"
                      ? "📅 Confirmed"
                      : "❌ Cancelled"}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSelectedBooking(selectedBooking === booking.id ? null : booking.id)
                  }
                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  {selectedBooking === booking.id ? "Hide" : "Actions"}
                </button>
              </div>
            </div>

            {selectedBooking === booking.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {booking.status === "confirmed" && (
                    <button className="px-4 py-2 rounded-lg bg-green-600/50 hover:bg-green-600/70 text-green-200 font-medium">
                      ✓ Check In
                    </button>
                  )}
                  {booking.status === "checked-in" && (
                    <button className="px-4 py-2 rounded-lg bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 font-medium">
                      → Check Out
                    </button>
                  )}
                  <button className="px-4 py-2 rounded-lg bg-orange-600/50 hover:bg-orange-600/70 text-orange-200 font-medium">
                    📝 Edit Details
                  </button>
                  {booking.status !== "checked-out" && (
                    <button className="px-4 py-2 rounded-lg bg-red-600/50 hover:bg-red-600/70 text-red-200 font-medium">
                      ❌ Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Complaints Management Component
const ComplaintsManagement: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
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
      <h2 className="text-2xl font-bold text-white mb-4">Guest Complaints</h2>
      <div className="space-y-3">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-white font-semibold">{complaint.guestName}</p>
                    <p className={`text-sm font-medium mt-1 ${getPriorityColor(complaint.priority)}`}>
                      🚨 {complaint.priority.toUpperCase()} - {complaint.complaintType}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaintStatus[complaint.id] || complaint.status)}`}>
                    {(complaintStatus[complaint.id] || complaint.status).toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{complaint.description}</p>
                <p className="text-gray-500 text-xs mt-2">{complaint.reportedAt}</p>
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
                <div className="flex gap-2 flex-wrap">
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
                <button className="mt-3 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">
                  Save Status Update
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Maintenance Tasks Component
const MaintenanceTasksManagement: React.FC<{ tasks: MaintenanceTask[] }> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<Record<string, MaintenanceTask["status"]>>({});

  const getStatusColor = (status: MaintenanceTask["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-600/30 text-red-300 border border-red-600/50";
      case "in-progress":
        return "bg-yellow-600/30 text-yellow-300 border border-yellow-600/50";
      case "completed":
        return "bg-green-600/30 text-green-300 border border-green-600/50";
    }
  };

  const getPriorityColor = (priority: MaintenanceTask["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-blue-600/30 text-blue-300";
      case "medium":
        return "bg-yellow-600/30 text-yellow-300";
      case "high":
        return "bg-red-600/30 text-red-300";
    }
  };

  const handleStatusUpdate = (taskId: string, status: MaintenanceTask["status"]) => {
    setTaskStatus((prev) => ({ ...prev, [taskId]: status }));
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Maintenance Tasks</h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-white font-semibold">
                      Room {task.roomNumber} - {task.taskType}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                    {task.assignedTo && (
                      <p className="text-teal-400 text-sm mt-1">👤 Assigned to: {task.assignedTo}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">Due: {task.dueDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(taskStatus[task.id] || task.status)}`}>
                      {(taskStatus[task.id] || task.status).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                className="mt-3 md:mt-0 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
              >
                {selectedTask === task.id ? "Hide" : "Update"}
              </button>
            </div>

            {selectedTask === task.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 text-sm mb-3">Update Task Status:</p>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "in-progress", "completed"] as MaintenanceTask["status"][]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(task.id, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (taskStatus[task.id] || task.status) === status
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">
                  Save Task Update
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
export const HotelServiceEmployeeModule = () => {
  return (
    <section className="flex flex-col space-y-2 mt-4 w-full bg-gray-900 text-white min-h-screen p-6" id="hotel_service_employee_module">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">Hotel Management Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Manage rooms, bookings, complaints, and maintenance tasks
          </p>
        </div>

        {/* Metrics Dashboard */}
        <MetricsDashboard metrics={FAKE_METRICS} />

        {/* Room Status Management */}
        <RoomStatusManagement rooms={FAKE_ROOMS} />

        {/* Room Bookings Management */}
        <RoomBookingsManagement bookings={FAKE_BOOKINGS} />

        {/* Complaints Management */}
        <ComplaintsManagement complaints={FAKE_COMPLAINTS} />

        {/* Maintenance Tasks Management */}
        <MaintenanceTasksManagement tasks={FAKE_MAINTENANCE_TASKS} />
      </div>
    </section>
  );
};