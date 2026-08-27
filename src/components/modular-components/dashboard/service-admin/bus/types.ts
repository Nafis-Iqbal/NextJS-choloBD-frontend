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

export function resolveMyTransport(
  data: Transport | Transport[] | null | undefined
): Transport | undefined {
  if (!data) return undefined;
  return Array.isArray(data) ? data[0] : data;
}

export function formatTransportEnumLabel(value?: string | null): string {
  if (!value) return "N/A";
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function layoutSeatCount(layout?: TransportLayout | null): number {
  if (!layout?.compartments) return 0;
  return layout.compartments.reduce((sum, compartment) => {
    const counted = (compartment as TransportCompartment & { _count?: { seats?: number } })
      ._count?.seats;
    if (typeof counted === "number") return sum + counted;
    return sum + (compartment.seats?.length ?? 0);
  }, 0);
}

export function toDateTimeLocalValue(value?: Date | string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string): string {
  if (!value) return "";
  return new Date(value).toISOString();
}

export function deriveTripStatus(
  trip: Pick<TransportTrip, "departureDateTime" | "arrivalDateTime" | "isActive">
): "scheduled" | "ongoing" | "completed" | "inactive" {
  if (!trip.isActive) return "inactive";
  const now = Date.now();
  const departure = new Date(trip.departureDateTime).getTime();
  const arrival = new Date(trip.arrivalDateTime).getTime();
  if (now < departure) return "scheduled";
  if (now <= arrival) return "ongoing";
  return "completed";
}
