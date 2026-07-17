"use client";

import { useRouter } from "next/navigation";
import { UserApi, AuthApi } from "@/services/api";

import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";

import { HotelServiceEmployeeModule } from "@/components/modular-components/dashboard/employee/HotelServiceEmployeeModule";
import { TransportServiceEmployeeModule } from "@/components/modular-components/dashboard/employee/TransportServiceEmployeeModule";

export default function EmployeeDashboard() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;
    const currentUserServiceType = authResponse?.data?.userServiceType;

    console.log("yseful" + authResponse?.data?.userServiceType);

    if(!isAuthenticated || currentUserRole !== "EMPLOYEE"){
        return (
            <>
            </>
        );
    }

    return (
        <section className="flex flex-col p-2 font-sans" id="service_maintenance_dashboard" style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}>
            <div className="md:ml-4 flex flex-col space-y-2">
                {currentUserServiceType === "HOTEL_BOOKING" ? <HotelServiceEmployeeModule /> :
                 currentUserServiceType === "TRANSPORT_SERVICE" ? <TransportServiceEmployeeModule /> : null}
            </div>
            
            <HorizontalDivider className="mt-15 md:mt-20"/>
        </section>
    )
}

