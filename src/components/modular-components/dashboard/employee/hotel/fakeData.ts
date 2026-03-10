import { Complaint } from "./ComplaintsManagement";
import { MaintenanceTask } from "./HotelMaintenanceTasksManagement";
import { HotelMetrics } from "./HotelMetricsDashboard";

export const FAKE_COMPLAINTS: Complaint[] = [
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

export const FAKE_MAINTENANCE_TASKS: MaintenanceTask[] = [
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

export const FAKE_METRICS: HotelMetrics = {
  occupancyRate: 66.7,
  availableRooms: 2,
  totalRooms: 6,
  checkInsToday: 2,
  checkOutsToday: 1,
  pendingComplaints: 2,
  maintenanceTasksPending: 2,
  averageRating: 4.5,
};
