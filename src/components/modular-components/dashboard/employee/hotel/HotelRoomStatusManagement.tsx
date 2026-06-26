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

  const getStatusColorVar = (status: HotelRoomStatus): string => {
    switch (status) {
      case HotelRoomStatus.AVAILABLE:
        return "var(--theme-green, rgb(40, 167, 69))";
      case HotelRoomStatus.BOOKED:
        return "var(--theme-yellow, rgb(255, 193, 7))";
      case HotelRoomStatus.OUT_OF_SERVICE:
        return "var(--theme-purple, rgb(102, 51, 153))";
      case HotelRoomStatus.MAINTENANCE:
        return "var(--theme-red, rgb(220, 53, 69))";
      default:
        return "var(--theme-text-muted, rgb(108, 117, 125))";
    }
  };

  const getStatusColor = (status: HotelRoomStatus) => {
    return {
      paddingLeft: '0.75rem',
      paddingRight: '0.75rem',
      paddingTop: '0.25rem',
      paddingBottom: '0.25rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500' as const,
      border: `1px solid`,
      color: getStatusColorVar(status),
    };
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
      <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--theme-text)'}}>Room Status Management</h2>
      <div className="space-y-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="rounded-lg p-4 transition-colors"
            style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg" style={{color: 'var(--theme-text)'}}>
                    Room {room.roomNumber}
                  </h3>
                  <span style={getStatusColor(selectedRoomStatus[room.id] || room.roomStatus)}>
                    {(() => {
                      const status = selectedRoomStatus[room.id] || room.roomStatus || "Fix BUG";
                      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                    })()}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{color: 'var(--theme-text-muted)'}}>
                  {room.roomType ? `${room.roomType}` : "Standard Room"}
                </p>
              </div>

              <div className="mt-3 md:mt-0">
                <button
                  onClick={() =>
                    setExpandedRoom(expandedRoom === room.id ? null : room.id)
                  }
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}
                >
                  {expandedRoom === room.id ? "Hide" : "Update"}
                </button>
              </div>
            </div>

            {expandedRoom === room.id && (
              <div className="mt-4 pt-4" style={{borderTopColor: 'var(--theme-deep-green)', borderTopWidth: '1px'}}>
                <p className="text-sm mb-3" style={{color: 'var(--theme-text-muted)'}}>Change Room Status:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[HotelRoomStatus.AVAILABLE, HotelRoomStatus.BOOKED, HotelRoomStatus.MAINTENANCE, HotelRoomStatus.OUT_OF_SERVICE].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(room.id, status)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: (selectedRoomStatus[room.id] || room.roomStatus) === status ? 'var(--theme-teal)' : 'var(--theme-section-bg)',
                        color: (selectedRoomStatus[room.id] || room.roomStatus) === status ? 'white' : 'var(--theme-text-muted)'
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                {saveError && (
                  <p className="mt-3 text-sm" style={{color: 'var(--theme-red, rgb(220, 53, 69))'}}>{saveError}</p>
                )}
                <button
                  onClick={() => handleSaveStatusChange(room.id)}
                  disabled={savingRoomId === room.id}
                  className="mt-3 w-full py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: savingRoomId === room.id ? 'var(--theme-section-bg)' : 'var(--theme-teal)',
                    color: savingRoomId === room.id ? 'var(--theme-text-subtle)' : 'white',
                    cursor: savingRoomId === room.id ? 'not-allowed' : 'pointer'
                  }}
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
