/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { HotelRoomCategory } from "@/types/enums";

export const RoomTypeStatsSection: React.FC<{ roomTypes: HotelRoomType[]; className?: string }> = ({ roomTypes, className }) => {
  console.log("Room types in stats section:", roomTypes);
  const roomTypeStats = useMemo(() => {
    return Object.values(HotelRoomCategory)
      .map((type: string) => {
        const roomsOfType = (roomTypes || []).filter((room: any) => room?.roomType === type);
        const totalCount = roomsOfType.reduce((sum, room: any) => sum + (room?.totalCount || 0), 0);
        const availableCount = roomsOfType.reduce((sum, room: any) => sum + (room?.availableCount || 0), 0);
        const occupiedCount = totalCount - availableCount;
        const occupancyRate = totalCount > 0 ? (occupiedCount / totalCount) * 100 : 0;

        return {
          type,
          count: totalCount,
          occupied: occupiedCount,
          available: availableCount,
          occupancyRate,
        };
      });
  }, [roomTypes]);

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold theme-text mb-6">Room Type Statistics</h2>
      <div className="theme-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-inherit" style={{ backgroundColor: 'var(--theme-section-bg)', borderBottom: '1px solid var(--theme-deep-green)' }}>
              <tr>
                <th className="px-6 py-3 theme-text font-semibold">Room Type</th>
                <th className="px-6 py-3 theme-text font-semibold">Total</th>
                <th className="px-6 py-3 theme-text font-semibold">Occupied</th>
                <th className="px-6 py-3 theme-text font-semibold">Available</th>
                <th className="px-6 py-3 theme-text font-semibold">Occupancy %</th>
              </tr>
            </thead>
            <tbody>
              {roomTypeStats.map((roomType) => (
                <tr
                  key={roomType.type}
                  className="text-center" style={{ borderBottom: '1px solid var(--theme-deep-green)' }}
                >
                  <td className="px-6 py-3 theme-text font-medium">{roomType.type}</td>
                  <td className="px-6 py-3 theme-text-muted">{roomType.count}</td>
                  <td className="px-6 py-3 theme-text-teal">{roomType.occupied}</td>
                  <td className="px-6 py-3 theme-text-teal">{roomType.available}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
                        <div
                          className="h-full"
                          style={{ width: `${roomType.occupancyRate}%`, backgroundColor: 'var(--theme-teal)' }}
                        />
                      </div>
                      <span className="theme-text text-sm font-medium">
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
};