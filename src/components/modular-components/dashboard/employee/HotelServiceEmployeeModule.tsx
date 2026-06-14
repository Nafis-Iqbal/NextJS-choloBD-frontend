"use client";

import React, { useMemo } from "react";
import { HotelMetricsDashboard } from "./hotel/HotelMetricsDashboard";
import { HotelRoomStatusManagement } from "./hotel/HotelRoomStatusManagement";
import { HotelRoomBookingsManagement } from "./hotel/HotelRoomBookingsManagement";
import { ComplaintsManagement } from "./hotel/ComplaintsManagement";
import { HotelMaintenanceTasksManagement } from "./hotel/HotelMaintenanceTasksManagement";
import { AuthApi, HotelRoomApi, HotelBookingApi, UserApi } from "@/services/api";
import {
  FAKE_METRICS,
  FAKE_COMPLAINTS,
  FAKE_MAINTENANCE_TASKS,
} from "./hotel/fakeData";


// Main Module Component
export const HotelServiceEmployeeModule = () => {
  const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
  const userId = authResponse?.data?.userId;

  const { data: userDetailData } = UserApi.useGetUserDetailRQ(userId || "", !!userId);
  const hotelId = userDetailData?.data?.serviceEntityId;
  
  const { data: roomsResponse, isLoading: roomsLoading } = HotelRoomApi.useGetHotelRoomsRQ(hotelId || "");
  const { data: bookingsResponse, isLoading: bookingsLoading } = HotelBookingApi.useGetBookingsRQ(
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

  return (
    <section className="flex flex-col space-y-2 mt-4 w-full min-h-screen p-6" id="hotel_service_employee_module" style={{backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)'}}>
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold" style={{color: 'var(--theme-text)'}}>Hotel Management Dashboard</h1>
          <p className="mt-2" style={{color: 'var(--theme-text-muted)'}}>Manage rooms, bookings, complaints, and maintenance tasks</p>
        </div>

        {/* Metrics Dashboard */}
        <HotelMetricsDashboard metrics={FAKE_METRICS} isReady={false} className="p-3 rounded-md"/>

        {/* Room Status Management */}
        <HotelRoomStatusManagement rooms={hotelRooms} className="p-3 rounded-md"/>

        {/* Room Bookings Management */}
        <HotelRoomBookingsManagement bookings={hotelBookings} className="p-3 rounded-md"/>

        {/* Complaints Management */}
        <ComplaintsManagement complaints={FAKE_COMPLAINTS} className="p-3 rounded-md"/>

        {/* Maintenance Tasks Management */}
        <HotelMaintenanceTasksManagement tasks={FAKE_MAINTENANCE_TASKS} className="p-3 rounded-md"/>
      </div>
    </section>
  );
};