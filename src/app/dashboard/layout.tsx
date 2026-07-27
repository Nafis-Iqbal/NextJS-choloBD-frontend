"use client";

import { useRouter } from "next/navigation";
import { AuthApi } from "@/services/api";

import Navbar from "@/components/structure-components/Navbar";
import Footer from "@/components/structure-components/Footer";
import SidebarMenu from "@/components/structure-components/SIdebarMenu";
import React, { useEffect } from "react";

export default function DashboardLayout({
    children, 
    user,
    employee,
    service_admin, 
    master_admin
} : {
    children: React.ReactNode, 
    user: React.ReactNode,
    employee: React.ReactNode,
    service_admin: React.ReactNode, 
    master_admin: React.ReactNode
}){
    const router = useRouter();
    const {
        data: authResponse,
        isPending,
        isFetching,
        isFetched,
    } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated === true;
    
    useEffect(() => {
        // Wait for in-flight auth checks to finish. Right after login the cache
        // may still say false until refetch completes — redirecting early causes
        // a login ↔ dashboard bounce.
        if (!isFetched || isPending || isFetching) return;
        if (!isAuthenticated) {
            router.replace("/login");
        }
    }, [isFetched, isPending, isFetching, isAuthenticated, router]);

    // Authenticated: render immediately (background refetch won't blank the UI)
    if (isAuthenticated) {
        return (
            <section className="flex flex-col">
                <header className="relative">
                    <nav>
                        <Navbar/>
                    </nav>
                </header>

                <div className="flex border">
                    <aside className="hidden md:block relative z-10 flex-grow w-[15%] border-r-4 font-sans">
                        <SidebarMenu 
                            className="fixed w-[15%] top-17 left-0" 
                            isPopOutSidebar={false}
                        />
                    </aside>

                    <div className="flex flex-col flex-grow w-full md:w-[85%] md:border-r-4">
                        {[children, master_admin, service_admin, employee, user].map((el, i) => (
                            <React.Fragment key={i}>
                                {el}
                            </React.Fragment>
                        ))}

                        <footer>
                            <Footer/>
                        </footer>
                    </div>
                </div>
            </section>
        );
    }

    // Verifying session or redirecting to login
    return null;
}
