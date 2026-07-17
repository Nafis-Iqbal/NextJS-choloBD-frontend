"use client";

import React, { useMemo, useState } from "react";
import HotelRoomUpdateModal from "@/components/modals/HotelRoomUpdateModal";
import { ImageViewerModule } from "@/components/modular-components/ImageViewerModule";

function getRoomTypeImageUrl(image: Image): string {
  const raw = image?.url || (image as Image & { imageURL?: string }).imageURL || "";
  return typeof raw === "string" ? raw.trim() : "";
}

function toRoomTypeImageList(roomType: HotelRoomType, hotelImages?: Image[]) {
  const fromRoomType = roomType.images || [];
  const fromHotel =
    (hotelImages || []).filter(
      (image) =>
        (image as Image & { hotelRoomTypeId?: string }).hotelRoomTypeId === roomType.id
    );

  const source = fromRoomType.length > 0 ? fromRoomType : fromHotel;

  return source
    .map((image) => {
      const imageURL = getRoomTypeImageUrl(image);
      if (!imageURL) return null;
      return {
        imageURL,
        imageAlt: image.altText || `${roomType.roomType} room type image`,
        imageStyle: "object-cover object-center",
      };
    })
    .filter((image): image is { imageURL: string; imageAlt: string; imageStyle: string } => !!image);
}

export const RoomTypeManagementSection: React.FC<{ hotelId: string; hotelDetail: Hotel; className?: string }> = ({ hotelId, hotelDetail, className }) => {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | undefined>();

  const roomTypes = useMemo(
    () => hotelDetail?.roomTypes || [],
    [hotelDetail?.roomTypes]
  );

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold theme-text">Room Types Management</h2>
          <button
            onClick={handleAddRoom}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg theme-btn-teal font-medium"
          >
            + Add Room Type
          </button>
        </div>

        <div className="space-y-3">
          {roomTypes && roomTypes.length > 0 ? (
            roomTypes.map((roomType: HotelRoomType) => {
              const roomTypeImages = toRoomTypeImageList(roomType, hotelDetail?.images);

              return (
              <div
                key={roomType.id}
                className="theme-card rounded-lg p-3 sm:p-4 transition-colors"
                style={{ borderColor: "var(--theme-teal)" }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between min-w-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="theme-text font-semibold break-words">
                      {roomType.roomType} Room
                    </h3>
                    <div className="theme-text-subtle text-sm mt-1 flex flex-col gap-0.5 md:block">
                      {(roomType.singleBedCount > 0 || roomType.doubleBedCount > 0) && (
                        <span>
                          {roomType.singleBedCount > 0 &&
                            `${roomType.singleBedCount} Single Bed${roomType.singleBedCount > 1 ? "s" : ""}`}
                          {roomType.singleBedCount > 0 &&
                            roomType.doubleBedCount > 0 &&
                            " • "}
                          {roomType.doubleBedCount > 0 &&
                            `${roomType.doubleBedCount} Double Bed${roomType.doubleBedCount > 1 ? "s" : ""}`}
                        </span>
                      )}
                      {(roomType.singleBedCount > 0 || roomType.doubleBedCount > 0) && (
                        <span className="hidden md:inline"> • </span>
                      )}
                      <span>৳ {roomType.pricePerNight}/night</span>
                      {roomType.allowShiftBooking && (
                        <>
                          <span className="hidden md:inline"> • </span>
                          <span className="theme-text-teal">Shift booking enabled</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 shrink-0">
                    <div className="text-left md:text-right">
                      <p className="theme-text-muted text-sm font-semibold">
                        {roomType.availableCount}/{roomType.totalCount}
                      </p>
                      <p className="theme-text-subtle text-xs">available</p>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedRoom(expandedRoom === roomType.id ? null : roomType.id)
                      }
                      className="px-3 py-2 rounded-lg theme-text text-sm shrink-0"
                      style={{ backgroundColor: "var(--theme-card-bg)" }}
                    >
                      {expandedRoom === roomType.id ? "Hide" : "Details"}
                    </button>
                  </div>
                </div>

                {expandedRoom === roomType.id && (
                  <div
                    className="mt-4 pt-4 border-t"
                    style={{ borderColor: "var(--theme-deep-green)" }}
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      <div className="theme-card rounded-lg p-3 sm:p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">
                          Bed Configuration
                        </p>
                        <p className="theme-text text-base sm:text-lg font-semibold">
                          {roomType.singleBedCount} Single
                        </p>
                        <p className="theme-text text-base sm:text-lg font-semibold">
                          {roomType.doubleBedCount} Double
                        </p>
                      </div>

                      <div className="theme-card rounded-lg p-3 sm:p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">
                          Price Per Night
                        </p>
                        <p
                          style={{ color: "var(--theme-star)" }}
                          className="text-xl sm:text-2xl font-bold"
                        >
                          ৳ {roomType.pricePerNight.toLocaleString()}
                        </p>
                      </div>

                      <div className="theme-card rounded-lg p-3 sm:p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">
                          Total Rooms
                        </p>
                        <p className="theme-text-teal text-xl sm:text-2xl font-bold">
                          {roomType.totalCount}
                        </p>
                      </div>

                      <div className="theme-card rounded-lg p-3 sm:p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">
                          Available Rooms
                        </p>
                        <p className="theme-text-teal text-xl sm:text-2xl font-bold">
                          {roomType.availableCount}
                        </p>
                      </div>

                      <div className="theme-card rounded-lg p-3 sm:p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">
                          Occupied Rooms
                        </p>
                        <p className="theme-text text-xl sm:text-2xl font-bold">
                          {roomType.totalCount - roomType.availableCount}
                        </p>
                      </div>

                      <div className="theme-card rounded-lg p-3 sm:p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">
                          Occupancy Rate
                        </p>
                        <p className="theme-text-teal text-xl sm:text-2xl font-bold">
                          {roomType.totalCount > 0
                            ? Math.round(
                                ((roomType.totalCount - roomType.availableCount) /
                                  roomType.totalCount) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>

                      <div className="theme-card rounded-lg p-3 sm:p-4">
                        <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">
                          Shift Booking
                        </p>
                        <p
                          className={`text-base sm:text-lg font-semibold ${
                            roomType.allowShiftBooking
                              ? "theme-text-teal"
                              : "theme-text-muted"
                          }`}
                        >
                          {roomType.allowShiftBooking ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    </div>
                    
                    <ImageViewerModule
                      key={`${roomType.id}-images`}
                      className="h-[65vh] md:h-[50vh] w-full md:w-1/2 rounded-lg overflow-hidden theme-outline my-5"
                      imagePlacementStyle="object-cover object-center"
                      imageList={roomTypeImages}
                    />

                    <div className="mb-6 theme-card rounded-lg p-3 sm:p-4">
                      <p className="theme-text-subtle text-xs font-bold uppercase tracking-wide mb-2">
                        Created On
                      </p>
                      <p className="theme-text text-sm sm:text-base break-words">
                        {new Date(roomType.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEditRoom(roomType.id)}
                        className="w-full sm:w-auto px-4 py-3 rounded-lg theme-btn-teal font-semibold transition-all shadow-lg"
                      >
                        ✎ Edit Room Type
                      </button>
                    </div>
                  </div>
                )}
              </div>
              );
            })
          ) : (
            <div className="theme-card rounded-lg p-4 sm:p-6 text-center">
              <p className="theme-text-subtle text-sm sm:text-base">
                No room types available. Click &quot;Add Room Type&quot; to create one.
              </p>
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
