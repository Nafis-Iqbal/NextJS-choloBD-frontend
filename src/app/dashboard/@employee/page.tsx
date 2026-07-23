"use client";

import { useRouter } from "next/navigation";
import { UserApi, AuthApi } from "@/services/api";

import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";

import { HotelServiceEmployeeModule } from "@/components/modular-components/dashboard/employee/HotelServiceEmployeeModule";
import { BusServiceEmployeeModule } from "@/components/modular-components/dashboard/employee/BusServiceEmployeeModule";

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
        <section className="flex flex-col p-2 font-sans" id="service_maintenance_dashboard">
            <div className="md:ml-4 flex flex-col space-y-2">
                {currentUserServiceType === "HOTEL_BOOKING" ? <HotelServiceEmployeeModule /> :
                 currentUserServiceType === "TRANSPORT_SERVICE" ? <BusServiceEmployeeModule /> : null}
            </div>
            
            <HorizontalDivider className="mt-15 md:mt-20"/>
        </section>
    )
}

