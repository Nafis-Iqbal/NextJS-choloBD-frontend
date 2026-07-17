/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { HotelRoomCategory } from "@/types/enums";

interface RoomTypeStat {
  type: string;
  count: number;
  occupied: number;
  available: number;
  occupancyRate: number;
}

const RoomTypeStatCard: React.FC<{ stat: RoomTypeStat }> = ({ stat }) => {
  const occupancyColor =
    stat.occupancyRate >= 80
      ? "var(--theme-red, #dc2626)"
      : stat.occupancyRate >= 50
      ? "var(--theme-star)"
      : "var(--theme-teal)";

  return (
    <div
      className="rounded-xl p-4 sm:p-5 overflow-hidden"
      style={{
        backgroundColor: "var(--theme-card-bg)",
        border: "1px solid var(--theme-deep-green)",
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between min-w-0 mb-3">
        <h3 className="theme-text text-lg sm:text-xl font-bold break-words">
          {stat.type}
        </h3>
        <p className="theme-text-subtle text-base">
          <span className="theme-text font-semibold">{stat.count}</span> total
          <span className="mx-1.5">·</span>
          <span className="theme-star font-semibold">{stat.occupied}</span> occupied
          <span className="mx-1.5">·</span>
          <span className="theme-text-teal font-semibold">{stat.available}</span> available
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--theme-section-bg)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(stat.occupancyRate, 100)}%`,
              backgroundColor: occupancyColor,
            }}
          />
        </div>
        <span className="theme-text text-base font-semibold shrink-0 tabular-nums">
          {stat.occupancyRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export const RoomTypeStatsSection: React.FC<{
  roomTypes: HotelRoomType[];
  className?: string;
}> = ({ roomTypes, className }) => {
  const roomTypeStats = useMemo(() => {
    return Object.values(HotelRoomCategory)
      .map((type: string) => {
        const roomsOfType = (roomTypes || []).filter(
          (room: any) => room?.roomType === type
        );
        const totalCount = roomsOfType.reduce(
          (sum, room: any) => sum + (room?.totalCount || 0),
          0
        );
        const availableCount = roomsOfType.reduce(
          (sum, room: any) => sum + (room?.availableCount || 0),
          0
        );
        const occupiedCount = totalCount - availableCount;
        const occupancyRate =
          totalCount > 0 ? (occupiedCount / totalCount) * 100 : 0;

        return {
          type,
          count: totalCount,
          occupied: occupiedCount,
          available: availableCount,
          occupancyRate,
        };
      })
      .filter((stat) => stat.count > 0);
  }, [roomTypes]);

  const summary = useMemo(() => {
    const total = roomTypeStats.reduce((sum, s) => sum + s.count, 0);
    const occupied = roomTypeStats.reduce((sum, s) => sum + s.occupied, 0);
    const available = roomTypeStats.reduce((sum, s) => sum + s.available, 0);
    const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
    return { total, occupied, available, occupancyRate };
  }, [roomTypeStats]);

  return (
    <section className={`mb-8 ${className || ""}`}>
      <h2 className="text-2xl sm:text-3xl font-bold theme-text mb-4 sm:mb-6">
        Room Type Statistics
      </h2>

      {roomTypeStats.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          <p className="theme-text-subtle text-base">
            No room types configured yet. Add room types to see statistics.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 sm:mb-6">
            <div
              className="rounded-xl p-3 sm:p-4"
              style={{
                backgroundColor: "var(--theme-card-bg)",
                border: "1px solid var(--theme-deep-green)",
              }}
            >
              <p className="theme-text text-2xl sm:text-3xl font-bold">{summary.total}</p>
              <p className="theme-text-subtle text-sm mt-1">Total Rooms</p>
            </div>
            <div
              className="rounded-xl p-3 sm:p-4"
              style={{
                backgroundColor: "var(--theme-card-bg)",
                border: "1px solid var(--theme-deep-green)",
              }}
            >
              <p className="theme-star text-2xl sm:text-3xl font-bold">
                {summary.occupied}
              </p>
              <p className="theme-text-subtle text-sm mt-1">Occupied</p>
            </div>
            <div
              className="rounded-xl p-3 sm:p-4"
              style={{
                backgroundColor: "var(--theme-card-bg)",
                border: "1px solid var(--theme-deep-green)",
              }}
            >
              <p className="theme-text-teal text-2xl sm:text-3xl font-bold">
                {summary.available}
              </p>
              <p className="theme-text-subtle text-sm mt-1">Available</p>
            </div>
            <div
              className="rounded-xl p-3 sm:p-4"
              style={{
                backgroundColor: "var(--theme-card-bg)",
                border: "1px solid var(--theme-deep-green)",
              }}
            >
              <p className="theme-text-teal text-2xl sm:text-3xl font-bold">
                {summary.occupancyRate.toFixed(1)}%
              </p>
              <p className="theme-text-subtle text-sm mt-1">Overall Occupancy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {roomTypeStats.map((stat) => (
              <RoomTypeStatCard key={stat.type} stat={stat} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
