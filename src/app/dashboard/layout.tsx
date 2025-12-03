"use client";

import { redirect } from "next/navigation";
import { UserApi } from "@/services/api";

import Navbar from "@/components/structure-components/Navbar";
import Footer from "@/components/structure-components/Footer";
import BottomNavbar from "@/components/structure-components/BottomNavbar";
import SidebarMenu from "@/components/structure-components/SIdebarMenu";
import DivGap from "@/components/custom-elements/UIUtilities";
import React from "react";

export default function DashboardLayout({
    children, 
    user,
    consumer,
    admin, 
    master_admin, 
    stats
} : {
    children: React.ReactNode, 
    user: React.ReactNode,
    consumer: React.ReactNode,
    admin: React.ReactNode, 
    master_admin: React.ReactNode,
    stats: React.ReactNode,
}){
    const { data: authResponse } = UserApi.useGetUserAuthenticationRQ("", true);
    console.log(authResponse);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;

    if(!isAuthenticated) redirect("/login");

    return (
        <section className="flex flex-col min-h-screen">
            <header className="relative">
                <nav>
                    <Navbar/>
                </nav>
            </header>
            
            <DivGap customHeightGap="h-[55px] md:h-[70px]"/>

            <div className="flex border min-h-screen">
                <aside className="hidden md:block relative z-10 flex-grow w-[15%] border-r-4 shadow-[0_0_20px_#00FF99] font-sans">
                    <SidebarMenu 
                        className="fixed w-[15%] top-17 left-0" 
                        isPopOutSidebar={false}
                    />
                </aside>

                <div className="flex flex-col flex-grow w-full md:w-[85%] md:border-r-4">
                    {[children, master_admin, admin, consumer, user].map((el, i) => (
                        <React.Fragment key={i}>
                            {el}
                        </React.Fragment>
                    ))}
                </div>

                {/* <aside className="relative z-10 flex-grow w-[25%] shadow-[0_0_20px_#00FF99]">
                    {stats}
                </aside> */}
            </div>
            
            <nav>
                <BottomNavbar/>
            </nav>
            
            <footer>
                <Footer/>
            </footer>
        </section>
    )
}