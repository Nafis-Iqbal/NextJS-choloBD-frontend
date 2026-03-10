"use client";

import { AuthApi } from "@/services/api";

import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"
import { HotelServiceAdminModule } from "@/components/modular-components/dashboard/service-admin/HotelServiceAdminModule";
import { BusServiceAdminModule } from "@/components/modular-components/BusServiceAdminModule";

export default function AdminDashboard() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;
    const currentUserServiceType = authResponse?.data?.userServiceType;
    
    if(!isAuthenticated || (currentUserRole !== "SERVICE_ADMIN" && currentUserRole !== "MASTER_ADMIN")) return (
        <>
        </>
    );

    return (
        <section className="flex flex-col p-2 font-sans" id="service_admin_dashboard">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">Service Admin Panel</h3>
                <p className="text-green-200">Manage your business here.</p>

                {
                    currentUserServiceType === "HOTEL_BOOKING" ? <HotelServiceAdminModule /> : 
                    currentUserServiceType === "TRANSPORT_SERVICE" ? <BusServiceAdminModule /> : null
                }
                <HotelServiceAdminModule />

            </div>

            <HorizontalDivider className="border-green-500 mt-15 md:mt-20"/>
        </section>
    )
}