"use client";

import React, { useState, useEffect } from "react";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import HotelRoomUpdateModal from "@/components/modals/HotelRoomUpdateModal";

export const RoomTypeManagementSection: React.FC<{ hotelId: string; hotelDetail: Hotel; className?: string }> = ({ hotelId, hotelDetail, className }) => {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | undefined>();
  const [roomTypes, setRoomTypes] = useState<HotelRoomType[]>([]);
  const { openNotificationPopUpMessage } = useGlobalUI();

  useEffect(() => {
    if (hotelDetail?.roomTypes) {
      setRoomTypes(hotelDetail.roomTypes);
    }
  }, [hotelDetail]);

  const handleAddRoom = () => {
    setModalMode("create");
    setSelectedRoomTypeId(undefined);
    setIsModalVisible(true);
  };

  const handleEditRoom = (roomTypeId: string) => {
    setModalMode("edit");
    setSelectedRoomTypeId(roomTypeId);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRoomTypeId(undefined);
  };

  return (
    <>
      <section className={`mb-8 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold theme-text">Room Types Management</h2>
          <button
            onClick={handleAddRoom}
            className="px-4 py-2 rounded-lg theme-btn-teal font-medium"
          >
            + Add Room Type
          </button>
        </div>

        <div className="space-y-3">
          {roomTypes && roomTypes.length > 0 ? (
            roomTypes.map((roomType: HotelRoomType) => (
              <div
                key={roomType.id}
                className="theme-card rounded-lg p-4 transition-colors"
                style={{ borderColor: 'var(--theme-teal)' }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="theme-text font-semibold">
                      {roomType.roomType} Room
                    </h3>
                    <p className="theme-text-subtle text-sm mt-1">
                      {roomType.singleBedCount > 0 && `${roomType.singleBedCount} Single Bed${roomType.singleBedCount > 1 ? 's' : ''}`}
                      {roomType.singleBedCount > 0 && roomType.doubleBedCount > 0 && ' • '}
                      {roomType.doubleBedCount > 0 && `${roomType.doubleBedCount} Double Bed${roomType.doubleBedCount > 1 ? 's' : ''}`}
                      {(roomType.singleBedCount > 0 || roomType.doubleBedCount > 0) && ' • '}
                      ৳ {roomType.pricePerNight}/night
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center gap-2">
                    <div className="text-right">
                      <p className="theme-text-muted text-sm font-semibold">{roomType.availableCount}/{roomType.totalCount}</p>
                      <p className="theme-text-subtle text-xs">available</p>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedRoom(expandedRoom === roomType.id ? null : roomType.id)
                      }
                      className="px-3 py-2 rounded-lg theme-text text-sm"
                      style={{ backgroundColor: 'var(--theme-card-bg)' }}
                    >
                      {expandedRoom === roomType.id ? "Hide" : "Details"}
                    </button>
                  </div>
                </div>

                {expandedRoom === roomType.id && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--theme-deep-green)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {/* Bed Configuration */}
                      <div className="theme-card rounded-lg p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">Bed Configuration</p>
                        <p className="theme-text text-lg font-semibold">{roomType.singleBedCount} Single</p>
                        <p className="theme-text text-lg font-semibold">{roomType.doubleBedCount} Double</p>
                      </div>

                      {/* Price Per Night */}
                      <div className="theme-card rounded-lg p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">Price Per Night</p>
                        <p style={{ color: 'var(--theme-star)' }} className="text-2xl font-bold">৳ {roomType.pricePerNight.toLocaleString()}</p>
                      </div>

                      {/* Total Rooms */}
                      <div className="theme-card rounded-lg p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">Total Rooms</p>
                        <p className="theme-text-teal text-2xl font-bold">{roomType.totalCount}</p>
                      </div>

                      {/* Available Rooms */}
                      <div className="theme-card rounded-lg p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">Available Rooms</p>
                        <p className="theme-text-teal text-2xl font-bold">{roomType.availableCount}</p>
                      </div>

                      {/* Occupied Rooms */}
                      <div className="theme-card rounded-lg p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">Occupied Rooms</p>
                        <p className="theme-text text-2xl font-bold">{roomType.totalCount - roomType.availableCount}</p>
                      </div>

                      {/* Occupancy Rate */}
                      <div className="theme-card rounded-lg p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">Occupancy Rate</p>
                        <p className="theme-text-teal text-2xl font-bold">
                          {roomType.totalCount > 0
                            ? Math.round(((roomType.totalCount - roomType.availableCount) / roomType.totalCount) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="mb-6 theme-card rounded-lg p-4">
                      <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">Created On</p>
                      <p className="theme-text text-base">
                        {new Date(roomType.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRoom(roomType.id)}
                        className="px-4 py-3 rounded-lg theme-btn-teal font-semibold transition-all shadow-lg"
                      >
                        ✎ Edit Room Type
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="theme-card rounded-lg p-6 text-center">
              <p className="theme-text-subtle">No room types available. Click "Add Room Type" to create one.</p>
            </div>
          )}
        </div>
      </section>

      <HotelRoomUpdateModal
        isVisible={isModalVisible}
        mode={modalMode}
        hotelId={hotelId}
        roomTypeId={selectedRoomTypeId}
        onCancel={handleCloseModal}
      />
    </>
  );
};