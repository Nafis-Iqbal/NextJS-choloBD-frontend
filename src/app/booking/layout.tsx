"use client";

import Navbar from "@/components/structure-components/Navbar";
import Footer from "@/components/structure-components/Footer";
import BottomNavbar from "@/components/structure-components/BottomNavbar";
import SidebarMenu from "@/components/structure-components/SIdebarMenu";
import DivGap from "@/components/custom-elements/UIUtilities";
import React from "react";

export default function BookingLayout({
    children
} : {
    children: React.ReactNode
}){
    return (
        <section className="flex flex-col min-h-screen">
            <header className="relative shrink-0">
                <nav>
                    <Navbar/>
                </nav>
            </header>
            
            <DivGap customHeightGap="h-[55px] md:h-[70px]"/>

            <div className="flex flex-1 border">
                <aside className="hidden md:block relative z-10 w-[15%] shrink-0 border-r-4 font-sans">
                    <SidebarMenu 
                        className="fixed w-[15%] top-17 left-0" 
                        isPopOutSidebar={false}
                    />
                </aside>

                <div className="flex flex-col flex-1 w-full md:w-[85%] md:border-r-4 min-h-0">
                    <div className="flex flex-1 flex-col min-h-0">
                        {children}
                    </div>

                    <footer className="mt-auto shrink-0">
                        <Footer/>
                    </footer>
                </div>
            </div>
            
            <nav className="shrink-0">
                <BottomNavbar/>
            </nav>
        </section>
    )
}
