"use client";

import { UserApi } from "@/services/api";

import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"
import { ComplaintManagerModule } from "@/components/modular-components/ComplaintManagerModule"

export default function AdminDashboard() {
    const { data: authResponse } = UserApi.useGetUserAuthenticationRQ("", true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;
    
    if(!isAuthenticated || (currentUserRole !== "SERVICE_ADMIN" && currentUserRole !== "MASTER_ADMIN")) return (
        <>
        </>
    );

    return (
        <section className="flex flex-col p-2 font-sans" id="dashboard_admin">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">Your Business</h3>
                <p className="text-green-200">Manage everything at a glance.</p>

                <ComplaintManagerModule />

                <section className="flex flex-col" id="dashboard_store_settings">
                    <div className="flex items-center space-x-5">
                        <h3 className="text-green-500 font-bold">Store visibility toggle</h3>
                        <div className="hidden md:block text-sm px-1 bg-red-400 rounded-md self-center">Feature Not Ready</div>
                        <div className="md:hidden text-sm px-1 bg-red-400 rounded-md self-center">Not Ready</div>
                    </div>

                    <div className="flex flex-col space-y-5 mt-5 justify-start mr-5">
                        <div className="flex items-center space-x-4 justify-between">
                            <label>Freeze All Product Stocks</label>
                            <input className="w-6 h-6" type="checkbox"></input>
                        </div>

                        <div className="flex items-center space-x-4 justify-between">
                            <label className="text-red-700">Toggle Store Maintenance Mode</label>
                            <input className="w-6 h-6" type="checkbox"></input>
                        </div>
                    </div>
                </section>
            </div>

            <HorizontalDivider className="border-green-500 mt-15 md:mt-20"/>
        </section>
    )
}