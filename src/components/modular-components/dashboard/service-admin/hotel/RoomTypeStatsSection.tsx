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
      <h2 className="text-2xl font-bold text-white mb-6">Room Type Statistics</h2>
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/70 border-b border-gray-600">
              <tr className="">
                <th className="px-6 py-3  text-white font-semibold">Room Type</th>
                <th className="px-6 py-3  text-white font-semibold">Total</th>
                <th className="px-6 py-3  text-white font-semibold">Occupied</th>
                <th className="px-6 py-3  text-white font-semibold">Available</th>
                <th className="px-6 py-3  text-white font-semibold">Occupancy %</th>
              </tr>
            </thead>
            <tbody>
              {roomTypeStats.map((roomType) => (
                <tr
                  key={roomType.type}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors text-center"
                >
                  <td className="px-6 py-3 text-white font-medium">{roomType.type}</td>
                  <td className="px-6 py-3 text-gray-300">{roomType.count}</td>
                  <td className="px-6 py-3 text-orange-400">{roomType.occupied}</td>
                  <td className="px-6 py-3 text-green-400">{roomType.available}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-2">
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
};