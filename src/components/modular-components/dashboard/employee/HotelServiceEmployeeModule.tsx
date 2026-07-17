"use client";

import React, { useMemo, useState } from "react";
import { HotelMetricsDashboard } from "./hotel/HotelMetricsDashboard";
import { HotelRoomStatusManagement } from "./hotel/HotelRoomStatusManagement";
import { HotelRoomBookingsManagement } from "./hotel/HotelRoomBookingsManagement";
import { HotelMaintenanceTasksManagement } from "./hotel/HotelMaintenanceTasksManagement";
import { ComplaintManagerModule } from "../master-admin/ComplaintManagerModule";
import { AuthApi, HotelRoomApi, HotelBookingApi, UserApi } from "@/services/api";
import { ComplaintAddressedTo, ComplaintTargetType } from "@/types/enums";
import { FAKE_METRICS, FAKE_MAINTENANCE_TASKS } from "./hotel/fakeData";

type EmployeeTabId = "rooms" | "bookings" | "complaints" | "maintenance";

interface EmployeeTab {
  id: EmployeeTabId;
  label: string;
  description: string;
}

const EMPLOYEE_TABS: EmployeeTab[] = [
  {
    id: "rooms",
    label: "Room Management",
    description: "View and update room status and availability",
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Manage hotel room bookings and check-ins",
  },
  {
    id: "complaints",
    label: "Customer Complaints",
    description: "Track and resolve guest complaints",
  },
  {
    id: "maintenance",
    label: "Maintenance Tasks",
    description: "Assign and complete hotel maintenance tasks",
  },
];

// Main Module Component
export const HotelServiceEmployeeModule = () => {
  const [activeTab, setActiveTab] = useState<EmployeeTabId>("rooms");

  const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
  const userId = authResponse?.data?.userId;

  const { data: userDetailData } = UserApi.useGetOwnUserDetailRQ(
    userId || "",
    !!userId
  );
  const hotelId = userDetailData?.data?.employeeServiceEntityId;

  const { data: roomsResponse } = HotelRoomApi.useGetHotelRoomsRQ(
    hotelId || ""
  );

  const { data: bookingsResponse } = HotelBookingApi.useGetBookingsRQ(
    hotelId ? `hotelId=${hotelId}` : undefined
  );

  const hotelRooms = useMemo(() => {
    return roomsResponse?.data || [];
  }, [roomsResponse?.data]);

  const hotelBookings = useMemo(() => {
    const data = bookingsResponse?.data;
    if (Array.isArray(data)) {
      return data;
    }
    // Handle paginated response
    return (data as { data?: HotelRoomBooking[] })?.data || [];
  }, [bookingsResponse?.data]);

  const currentTab =
    EMPLOYEE_TABS.find((tab) => tab.id === activeTab) || EMPLOYEE_TABS[0];

  return (
    <section
      className="flex flex-col space-y-2 mt-4 w-full bg-inherit theme-text min-h-screen md:p-6 rounded-lg"
      id="hotel_service_employee_module"
    >
      <div className="max-w-7xl w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text">
            Hotel Management Dashboard
          </h1>
          <p className="theme-text-subtle mt-2">
            Manage rooms, bookings, complaints, and maintenance tasks
          </p>

          <h2 className="text-2xl md:text-3xl font-bold theme-text-teal mt-4 md:mt-8">
            {userDetailData?.data?.employeeServiceEntityName}
          </h2>
        </div>

        <HotelMetricsDashboard
          metrics={FAKE_METRICS}
          isReady={false}
          className="rounded-md mb-8"
        />

        <div className="rounded-xl theme-outline bg-section overflow-hidden min-h-screen">
          <div
            className="flex flex-wrap md:flex-nowrap gap-1 p-2 md:p-3 border-b"
            style={{
              borderColor: "var(--theme-deep-green)",
              backgroundColor:
                "var(--theme-sub-section-bg, var(--theme-card-bg))",
            }}
            role="tablist"
            aria-label="Hotel employee sections"
          >
            {EMPLOYEE_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 min-w-[140px] px-3 py-2.5 md:px-4 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all"
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--theme-teal)",
                          color: "#ffffff",
                          boxShadow: "0 0 0 1px var(--theme-teal)",
                        }
                      : {
                          backgroundColor: "transparent",
                          color: "var(--theme-text-muted)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (isSelected) return;
                    e.currentTarget.style.backgroundColor =
                      "var(--theme-card-bg)";
                    e.currentTarget.style.color = "var(--theme-text)";
                  }}
                  onMouseLeave={(e) => {
                    if (isSelected) return;
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--theme-text-muted)";
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="py-4 px-2 md:p-6" role="tabpanel">
            <div
              className="mb-5 pb-4 border-b"
              style={{ borderColor: "var(--theme-deep-green)" }}
            >
              <h2 className="text-2xl font-bold theme-text-teal">
                {currentTab.label}
              </h2>
              <p className="theme-text-muted text-sm mt-1">
                {currentTab.description}
              </p>
            </div>

            <div className="space-y-2">
              {activeTab === "rooms" && (
                <HotelRoomStatusManagement
                  rooms={hotelRooms}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "bookings" && (
                <HotelRoomBookingsManagement
                  bookings={hotelBookings}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "complaints" && hotelId && (
                <ComplaintManagerModule
                  addressedTo={ComplaintAddressedTo.SERVICE_ADMIN}
                  targetType={ComplaintTargetType.HOTEL}
                  targetEntityId={hotelId}
                  className="p-1 rounded-md mb-0"
                />
              )}

              {activeTab === "maintenance" && (
                <HotelMaintenanceTasksManagement
                  tasks={FAKE_MAINTENANCE_TASKS}
                  className="p-1 rounded-md mb-0"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
