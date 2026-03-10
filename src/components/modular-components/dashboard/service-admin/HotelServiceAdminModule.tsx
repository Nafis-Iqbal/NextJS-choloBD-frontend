/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { HotelApi, UserApi, AuthApi } from "@/services/api";
import { RoomTypeManagementSection } from "./hotel/HotelRoomTypeManagementModule";
import { CustomerComplaintsSection } from "./hotel/CustomerComplaintsSection";
import { RoomTypeStatsSection } from "./hotel/RoomTypeStatsSection";
import { HotelProfileSection } from "./hotel/HotelProfileSection";
import { AdminStatsDashboard } from "./hotel/AdminStatsDashboard";
import { EarningsSummarySection } from "./hotel/EarningsSummarySection";

// Main Module Component
export const HotelServiceAdminModule = () => {
  const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
  const userId = authResponse?.data?.userId;

  const { data: userDetailData } = UserApi.useGetUserDetailRQ(userId || "", !!userId);
  const hotelId = userDetailData?.data?.serviceEntityId;

  const { data: hotelData } = HotelApi.useGetHotelDetailRQ(hotelId || "");

  const hotelProfile = hotelData?.data;

  if (!hotelProfile) {
    return (
      <section className="flex flex-col space-y-2 mt-4 w-full bg-gray-900 text-white min-h-screen p-6">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold text-white">Hotel Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Loading hotel data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col space-y-2 mt-4 w-full bg-gray-900 text-white min-h-screen p-6 rounded-lg" id="hotel_service_admin_module">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">Hotel Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Manage hotel profile, rooms, earnings, and customer complaints
          </p>
        </div>

        {/* Admin Statistics */}
        <AdminStatsDashboard isReady={false} className="p-3 rounded-md"/>

        {/* Hotel Profile */}
        <HotelProfileSection profile={hotelProfile} className="p-3 rounded-md"/>

        {/* Room Type Statistics */}
        <RoomTypeStatsSection roomTypes={hotelProfile.roomTypes || []} className="p-3 rounded-md"/>

        {/* Room Management */}
        <RoomTypeManagementSection 
          hotelId={hotelProfile.id} 
          hotelDetail={hotelProfile} 
          className="p-3 rounded-md"
        />

        {/* Earnings Summary */}
        <EarningsSummarySection hotelId={hotelProfile.id} className="p-3 rounded-md"/>

        {/* Customer Complaints */}
        <CustomerComplaintsSection hotelProfile={hotelProfile} className="p-3 rounded-md"/>
      </div>
    </section>
  );
};
