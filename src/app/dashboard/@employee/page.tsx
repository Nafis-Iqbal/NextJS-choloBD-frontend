"use client";

import { useRouter } from "next/navigation";
import { UserApi, AuthApi } from "@/services/api";

import Image from "next/image"
import DivGap from "@/components/custom-elements/UIUtilities"
import { HotelServiceEmployeeModule } from "@/components/modular-components/dashboard/employee/HotelServiceEmployeeModule";
import { BusServiceAdminModule } from "@/components/modular-components/BusServiceAdminModule";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export default function EmployeeDashboard() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const currentUserServiceType = authResponse?.data?.userServiceType;

    return (
        <section className="flex flex-col p-2 font-sans" id="service_maintenance_dashboard" style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}>
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="theme-text-teal">Employee Maintenance Panel</h3>
                <p className="theme-text-muted">All service management functionality, accessed here.</p>

                {currentUserServiceType === "HOTEL_BOOKING" ? <HotelServiceEmployeeModule /> : null}
                <HotelServiceEmployeeModule/>
            </div>
            
            <HorizontalDivider className="mt-15 md:mt-20"/>
        </section>
    )
}

