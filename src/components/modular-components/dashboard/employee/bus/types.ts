export type CoachType =
  | "AC"
  | "Non-AC"
  | "Sleeper"
  | "Semi-Sleeper"
  | "Deluxe";

export type SeatStatus = "open" | "booked" | "blocked";

export type SeatCell =
  | { kind: "seat"; id: string; label: string; status: SeatStatus }
  | { kind: "aisle" }
  | { kind: "empty" };

export interface SeatPlanLayout {
  coachType: CoachType;
  label: string;
  description: string;
  totalSeats: number;
  rows: SeatCell[][];
}

export interface BusEmployeeMetrics {
  departuresToday: number;
  boardingPending: number;
  openSeats: number;
  bookedSeats: number;
  activeBuses: number;
  maintenancePending: number;
  cancelledTicketsToday: number;
}

export interface EmployeeRide {
  id: string;
  busNumber: string;
  coachType: CoachType;
  route: string;
  departureTime: string;
  departureDate: string;
  gate: string;
  status: "boarding" | "departing-soon" | "departed" | "delayed";
  totalSeats: number;
  bookedSeats: number;
  boardedCount: number;
}

export interface BoardingTicket {
  id: string;
  passengerName: string;
  seatNumber: string;
  phoneNumber: string;
  rideId: string;
  route: string;
  departureTime: string;
  status: "pending" | "boarded" | "no-show";
}

export interface BusMaintenanceTask {
  id: string;
  busNumber: string;
  coachType: CoachType;
  taskType: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate: string;
}

const BOOKED_SEED: Record<CoachType, Set<string>> = {
  AC: new Set(["1A", "1B", "2C", "3A", "3D", "5B", "6C", "7A", "8D", "9B", "10A", "10C"]),
  "Non-AC": new Set(["1A", "1C", "2B", "4A", "4D", "5C", "7B", "8A", "9D", "11B", "12A"]),
  Sleeper: new Set(["1L", "1U", "3L", "4U", "5L", "9U", "10L", "12U"]),
  "Semi-Sleeper": new Set(["1A", "2C", "3B", "4D", "5A", "6C", "7B", "8A"]),
  Deluxe: new Set(["1A", "1D", "2B", "3C", "4A", "5D", "6B", "7A", "8C"]),
};

const BLOCKED_SEED: Record<CoachType, Set<string>> = {
  AC: new Set(["4B"]),
  "Non-AC": new Set(["6A"]),
  Sleeper: new Set(["2U"]),
  "Semi-Sleeper": new Set(["9D"]),
  Deluxe: new Set(["9B"]),
};

function seat(
  label: string,
  coachType: CoachType
): SeatCell {
  let status: SeatStatus = "open";
  if (BOOKED_SEED[coachType].has(label)) status = "booked";
  else if (BLOCKED_SEED[coachType].has(label)) status = "blocked";

  return { kind: "seat", id: `${coachType}-${label}`, label, status };
}

function buildTwoByTwoLayout(
  coachType: CoachType,
  rowCount: number
): SeatCell[][] {
  const rows: SeatCell[][] = [];
  for (let r = 1; r <= rowCount; r++) {
    rows.push([
      seat(`${r}A`, coachType),
      seat(`${r}B`, coachType),
      { kind: "aisle" },
      seat(`${r}C`, coachType),
      seat(`${r}D`, coachType),
    ]);
  }
  return rows;
}

function buildSleeperLayout(coachType: CoachType, berthPairs: number): SeatCell[][] {
  const rows: SeatCell[][] = [];
  for (let r = 1; r <= berthPairs; r++) {
    rows.push([
      seat(`${r}L`, coachType),
      seat(`${r}U`, coachType),
      { kind: "aisle" },
      seat(`${r + berthPairs}L`, coachType),
      seat(`${r + berthPairs}U`, coachType),
    ]);
  }
  return rows;
}

function countSeats(rows: SeatCell[][]): number {
  return rows.reduce(
    (sum, row) => sum + row.filter((c) => c.kind === "seat").length,
    0
  );
}

function makeLayout(
  coachType: CoachType,
  label: string,
  description: string,
  rows: SeatCell[][]
): SeatPlanLayout {
  return {
    coachType,
    label,
    description,
    totalSeats: countSeats(rows),
    rows,
  };
}

export const COACH_TYPE_OPTIONS: CoachType[] = [
  "AC",
  "Non-AC",
  "Sleeper",
  "Semi-Sleeper",
  "Deluxe",
];

export const SEAT_PLAN_LAYOUTS: Record<CoachType, SeatPlanLayout> = {
  AC: makeLayout(
    "AC",
    "AC Coach (2×2)",
    "Standard AC coach with 2 seats each side of the aisle",
    buildTwoByTwoLayout("AC", 10)
  ),
  "Non-AC": makeLayout(
    "Non-AC",
    "Non-AC Coach (2×2)",
    "High-capacity Non-AC coach with 2×2 seating",
    buildTwoByTwoLayout("Non-AC", 12)
  ),
  Sleeper: makeLayout(
    "Sleeper",
    "Sleeper Berths",
    "Lower (L) and Upper (U) berths on both sides of the aisle",
    buildSleeperLayout("Sleeper", 8)
  ),
  "Semi-Sleeper": makeLayout(
    "Semi-Sleeper",
    "Semi-Sleeper (2×2)",
    "Recliner-style semi-sleeper layout with wider pitch",
    buildTwoByTwoLayout("Semi-Sleeper", 9)
  ),
  Deluxe: makeLayout(
    "Deluxe",
    "Deluxe Coach (2×2)",
    "Premium deluxe coach with fewer rows and extra legroom",
    buildTwoByTwoLayout("Deluxe", 9)
  ),
};

export const FAKE_BUS_EMPLOYEE_METRICS: BusEmployeeMetrics = {
  departuresToday: 5,
  boardingPending: 18,
  openSeats: 62,
  bookedSeats: 143,
  activeBuses: 4,
  maintenancePending: 3,
  cancelledTicketsToday: 2,
};

export const FAKE_EMPLOYEE_RIDES: EmployeeRide[] = [
  {
    id: "ride-e-001",
    busNumber: "BD-02-1001",
    coachType: "AC",
    route: "Dhaka → Chittagong",
    departureTime: "6:00 PM",
    departureDate: "Today",
    gate: "Bay 3",
    status: "boarding",
    totalSeats: 40,
    bookedSeats: 32,
    boardedCount: 14,
  },
  {
    id: "ride-e-002",
    busNumber: "BD-02-1002",
    coachType: "Sleeper",
    route: "Dhaka → Sylhet",
    departureTime: "8:00 PM",
    departureDate: "Today",
    gate: "Bay 1",
    status: "departing-soon",
    totalSeats: 32,
    bookedSeats: 28,
    boardedCount: 0,
  },
  {
    id: "ride-e-003",
    busNumber: "BD-02-1003",
    coachType: "Semi-Sleeper",
    route: "Dhaka → Khulna",
    departureTime: "10:00 AM",
    departureDate: "Today",
    gate: "Bay 5",
    status: "departed",
    totalSeats: 36,
    bookedSeats: 32,
    boardedCount: 32,
  },
  {
    id: "ride-e-004",
    busNumber: "BD-02-1004",
    coachType: "Non-AC",
    route: "Dhaka → Rajshahi",
    departureTime: "2:00 PM",
    departureDate: "Today",
    gate: "Bay 2",
    status: "delayed",
    totalSeats: 48,
    bookedSeats: 40,
    boardedCount: 8,
  },
];

export const FAKE_BOARDING_TICKETS: BoardingTicket[] = [
  {
    id: "tk-001",
    passengerName: "Rahim Uddin",
    seatNumber: "3A",
    phoneNumber: "01711-000111",
    rideId: "ride-e-001",
    route: "Dhaka → Chittagong",
    departureTime: "6:00 PM",
    status: "pending",
  },
  {
    id: "tk-002",
    passengerName: "Nusrat Jahan",
    seatNumber: "5B",
    phoneNumber: "01822-000222",
    rideId: "ride-e-001",
    route: "Dhaka → Chittagong",
    departureTime: "6:00 PM",
    status: "boarded",
  },
  {
    id: "tk-003",
    passengerName: "Karim Ali",
    seatNumber: "1L",
    phoneNumber: "01933-000333",
    rideId: "ride-e-002",
    route: "Dhaka → Sylhet",
    departureTime: "8:00 PM",
    status: "pending",
  },
  {
    id: "tk-004",
    passengerName: "Salma Begum",
    seatNumber: "7A",
    phoneNumber: "01644-000444",
    rideId: "ride-e-001",
    route: "Dhaka → Chittagong",
    departureTime: "6:00 PM",
    status: "pending",
  },
  {
    id: "tk-005",
    passengerName: "Imran Hossain",
    seatNumber: "12A",
    phoneNumber: "01555-000555",
    rideId: "ride-e-004",
    route: "Dhaka → Rajshahi",
    departureTime: "2:00 PM",
    status: "no-show",
  },
];

export const FAKE_BUS_MAINTENANCE_TASKS: BusMaintenanceTask[] = [
  {
    id: "bm-001",
    busNumber: "BD-02-1001",
    coachType: "AC",
    taskType: "AC Unit",
    description: "Rear AC vent blowing warm air — needs coolant check",
    status: "in-progress",
    priority: "high",
    assignedTo: "Mechanic Faruk",
    dueDate: "Today",
  },
  {
    id: "bm-002",
    busNumber: "BD-02-1005",
    coachType: "Deluxe",
    taskType: "Seat Repair",
    description: "Seat 9B recliner stuck — blocked until fixed",
    status: "pending",
    priority: "medium",
    dueDate: "Tomorrow",
  },
  {
    id: "bm-003",
    busNumber: "BD-02-1002",
    coachType: "Sleeper",
    taskType: "Berth Curtain",
    description: "Replace torn privacy curtain on berth 2U",
    status: "pending",
    priority: "low",
    dueDate: "This week",
  },
  {
    id: "bm-004",
    busNumber: "BD-02-1004",
    coachType: "Non-AC",
    taskType: "Electrical",
    description: "Cabin lights flickering on left side rows 6–8",
    status: "completed",
    priority: "medium",
    assignedTo: "Electrician Rana",
    dueDate: "Yesterday",
  },
];
