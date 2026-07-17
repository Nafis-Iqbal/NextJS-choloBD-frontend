import React, { useMemo, useState } from "react";
import { HotelRoomCategory, HotelRoomStatus } from "@/types/enums";
import { HotelRoomApi } from "@/services/api";
import { CustomSelectInput } from "@/components/custom-elements/CustomInputElements";

const formatEnumLabel = (value: string): string =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const ROOM_STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  ...Object.values(HotelRoomStatus).map((status) => ({
    label: formatEnumLabel(status),
    value: status,
  })),
];

const ROOM_TYPE_OPTIONS = [
  { label: "All Room Types", value: "" },
  ...Object.values(HotelRoomCategory).map((type) => ({
    label: formatEnumLabel(type),
    value: type,
  })),
];

// Room Status Management Component
export const HotelRoomStatusManagement: React.FC<{
  rooms: HotelRoom[];
  className?: string;
}> = ({ rooms, className }) => {
  const [selectedRoomStatus, setSelectedRoomStatus] = useState<
    Record<string, HotelRoomStatus>
  >({});
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [savingRoomId, setSavingRoomId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<HotelRoomStatus | "">("");
  const [roomTypeFilter, setRoomTypeFilter] = useState<HotelRoomCategory | "">(
    ""
  );

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
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "500" as const,
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

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const currentStatus = selectedRoomStatus[room.id] || room.roomStatus;

      if (statusFilter && currentStatus !== statusFilter) {
        return false;
      }
      if (roomTypeFilter && room.roomType !== roomTypeFilter) {
        return false;
      }
      return true;
    });
  }, [rooms, statusFilter, roomTypeFilter, selectedRoomStatus]);

  const hasActiveFilters = !!statusFilter || !!roomTypeFilter;
  const filterLabelStyle = "text-xs font-medium theme-text-teal";
  const filterControlClassName = "min-w-[140px] !h-[34px] text-xs";

  return (
    <section
      className={`mb-8 ${className || ""}`}
      id="hotel_room_status_management"
    >
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <h2
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "var(--theme-text)" }}
          >
            Room Status Management
          </h2>

          <div className="flex flex-row flex-wrap gap-2 lg:justify-end shrink-0 items-end text-xs">
            <CustomSelectInput
              label="Room Status"
              labelStyle={filterLabelStyle}
              options={ROOM_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter((e.target.value as HotelRoomStatus) || "")
              }
              className={filterControlClassName}
            />
            <CustomSelectInput
              label="Room Type"
              labelStyle={filterLabelStyle}
              options={ROOM_TYPE_OPTIONS}
              value={roomTypeFilter}
              onChange={(e) =>
                setRoomTypeFilter((e.target.value as HotelRoomCategory) || "")
              }
              className={filterControlClassName}
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("");
                  setRoomTypeFilter("");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors h-[34px]"
                style={{
                  backgroundColor: "var(--theme-section-bg)",
                  color: "var(--theme-text)",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div
          className="border rounded-xl p-6 text-center"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            borderColor: "var(--theme-deep-green)",
            color: "var(--theme-text-subtle)",
          }}
        >
          No rooms found
        </div>
      ) : filteredRooms.length === 0 ? (
        <div
          className="border rounded-xl p-6 text-center"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            borderColor: "var(--theme-deep-green)",
            color: "var(--theme-text-subtle)",
          }}
        >
          No rooms match the current filters
        </div>
      ) : (
        <div
          className="rounded-xl overflow-y-auto max-h-[80vh] min-h-[40vh] p-3 sm:p-4"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          <div className="space-y-2">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="rounded-lg p-3 sm:p-4 overflow-hidden transition-colors"
                style={{
                  backgroundColor: "var(--theme-bg)",
                  border: "1px solid var(--theme-deep-green)",
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3
                        className="font-semibold text-lg break-words"
                        style={{ color: "var(--theme-text)" }}
                      >
                        Room {room.roomNumber}
                      </h3>
                      <span
                        style={getStatusColor(
                          selectedRoomStatus[room.id] || room.roomStatus
                        )}
                      >
                        {(() => {
                          const status =
                            selectedRoomStatus[room.id] ||
                            room.roomStatus ||
                            "Fix BUG";
                          return formatEnumLabel(status);
                        })()}
                      </span>
                    </div>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      {room.roomType
                        ? formatEnumLabel(room.roomType)
                        : "Standard Room"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setExpandedRoom(
                        expandedRoom === room.id ? null : room.id
                      )
                    }
                    className="w-full md:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--theme-section-bg)",
                      color: "var(--theme-text)",
                    }}
                  >
                    {expandedRoom === room.id ? "Hide" : "Update"}
                  </button>
                </div>

                {expandedRoom === room.id && (
                  <div
                    className="mt-4 pt-4"
                    style={{
                      borderTopColor: "var(--theme-deep-green)",
                      borderTopWidth: "1px",
                    }}
                  >
                    <p
                      className="text-sm mb-3"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      Change Room Status:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        HotelRoomStatus.AVAILABLE,
                        HotelRoomStatus.BOOKED,
                        HotelRoomStatus.MAINTENANCE,
                        HotelRoomStatus.OUT_OF_SERVICE,
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(room.id, status)}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={{
                            backgroundColor:
                              (selectedRoomStatus[room.id] ||
                                room.roomStatus) === status
                                ? "var(--theme-teal)"
                                : "var(--theme-section-bg)",
                            color:
                              (selectedRoomStatus[room.id] ||
                                room.roomStatus) === status
                                ? "white"
                                : "var(--theme-text-muted)",
                          }}
                        >
                          {formatEnumLabel(status)}
                        </button>
                      ))}
                    </div>
                    {saveError && (
                      <p
                        className="mt-3 text-sm"
                        style={{
                          color: "var(--theme-red, rgb(220, 53, 69))",
                        }}
                      >
                        {saveError}
                      </p>
                    )}
                    <button
                      onClick={() => handleSaveStatusChange(room.id)}
                      disabled={savingRoomId === room.id}
                      className="mt-3 w-full py-2 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor:
                          savingRoomId === room.id
                            ? "var(--theme-section-bg)"
                            : "var(--theme-teal)",
                        color:
                          savingRoomId === room.id
                            ? "var(--theme-text-subtle)"
                            : "white",
                        cursor:
                          savingRoomId === room.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {savingRoomId === room.id
                        ? "Saving..."
                        : "Save Status Change"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
