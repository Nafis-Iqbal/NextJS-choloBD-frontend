import React, { useState } from "react";
import { HotelRoomStatus } from "@/types/enums";
import { HotelRoomApi } from "@/services/api";

// Room Status Management Component
export const HotelRoomStatusManagement: React.FC<{ rooms: HotelRoom[]; className?: string }> = ({ rooms, className }) => {
  const [selectedRoomStatus, setSelectedRoomStatus] = useState<Record<string, HotelRoomStatus>>({});
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [savingRoomId, setSavingRoomId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { mutate: updateRoom } = HotelRoomApi.useUpdateHotelRoomRQ(
    () => {
      setSavingRoomId(null);
      setSaveError(null);
      setExpandedRoom(null);
    },
    () => {
      setSaveError("Failed to update room status");
      setSavingRoomId(null);
    }
  );

  const getStatusColor = (status: HotelRoomStatus) => {
    switch (status) {
      case HotelRoomStatus.AVAILABLE:
        return "bg-green-600/30 text-green-300 border border-green-600/50";
      case HotelRoomStatus.BOOKED:
        return "bg-yellow-600/30 text-yellow-300 border border-yellow-600/50";
      case HotelRoomStatus.OUT_OF_SERVICE:
        return "bg-indigo-600/30 text-indigo-300 border border-indigo-600/50";
      case HotelRoomStatus.MAINTENANCE:
        return "bg-red-600/30 text-red-300 border border-red-600/50";
      default:
        return "bg-gray-600/30 text-gray-300 border border-gray-600/50";
    }
  };

  const handleStatusUpdate = (roomId: string, newStatus: HotelRoomStatus) => {
    setSelectedRoomStatus((prev) => ({ ...prev, [roomId]: newStatus }));
    setSaveError(null);
  };

  const handleSaveStatusChange = (roomId: string) => {
    const newStatus = selectedRoomStatus[roomId];
    if (!newStatus) return;

    setSavingRoomId(roomId);
    updateRoom({
      roomId,
      data: { roomStatus: newStatus },
    });
  };

  return (
    <section className={`mb-8 ${className}`}>
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoomStatus[room.id] || room.roomStatus)}`}>
                    {(() => {
                      const status = selectedRoomStatus[room.id] || room.roomStatus || "Fix BUG";
                      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                    })()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {room.roomType ? `${room.roomType}` : "Standard Room"}
                </p>
              </div>

              <div className="mt-3 md:mt-0">
                <button
                  onClick={() =>
                    setExpandedRoom(expandedRoom === room.id ? null : room.id)
                  }
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  {expandedRoom === room.id ? "Hide" : "Update"}
                </button>
              </div>
            </div>

            {expandedRoom === room.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 text-sm mb-3">Change Room Status:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[HotelRoomStatus.AVAILABLE, HotelRoomStatus.BOOKED, HotelRoomStatus.MAINTENANCE, HotelRoomStatus.OUT_OF_SERVICE].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(room.id, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (selectedRoomStatus[room.id] || room.roomStatus) === status
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                {saveError && (
                  <p className="mt-3 text-sm text-red-400">{saveError}</p>
                )}
                <button
                  onClick={() => handleSaveStatusChange(room.id)}
                  disabled={savingRoomId === room.id}
                  className={`mt-3 w-full py-2 rounded-lg font-medium transition-colors ${
                    savingRoomId === room.id
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {savingRoomId === room.id ? "Saving..." : "Save Status Change"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
