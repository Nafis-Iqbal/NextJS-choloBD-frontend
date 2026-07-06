"use client";

import { redirect, useRouter } from "next/navigation";
import { AuthApi } from "@/services/api";

import Navbar from "@/components/structure-components/Navbar";
import Footer from "@/components/structure-components/Footer";
import { MotionSidebarMenu } from "@/components/structure-components/SIdebarMenu";
import React, { use, useEffect } from "react";
import DivGap from "@/components/custom-elements/UIUtilities";

export default function DashboardLayout({
    children
} : {
    children: React.ReactNode
}){
    const router = useRouter();
    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated;
    console.log("DashboardLayout - isAuthenticated:", isAuthenticated, " isLoading:", isLoading);
    
    // useEffect(() => {
    //     if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined)) {
    //         router.replace("/");
    //     }
    // }, [isLoading, isAuthenticated, router]);

    // if (isLoading) {
    //     return null; // or <FullPageLoader />
    // }

    return (
        <section className="flex flex-col min-h-screen">
            <header className="relative">
                <nav>
                    <Navbar/>
                </nav>
            </header>
            
            <div className="flex flex-col">
                <aside className="hidden md:block relative z-20 flex-grow w-[15%] font-sans">
                    <MotionSidebarMenu
                        variants={{
                            rest: { 
                                x: '-100%', 
                                y: '65px',
                                transition: { type: 'spring', stiffness: 500, damping: 40, delay: 2.0 } 
                            },
                            hover: {
                                x: '-2%',
                                y: '65px',
                                transition: { type: 'spring', stiffness: 200, damping: 20} 
                            }
                        }}
                        initial="rest"
                        animate="rest"
                        whileHover="hover"
                        isPopOutSidebar={false}
                        opensOnHover={true}
                        className="fixed w-[15%]"
                    />
                </aside>
                
                <div className="flex flex-col flex-grow w-full mt-10 md:mt-15 md:border-r-4">
                    {[children].map((el, i) => (
                        <React.Fragment key={i}>
                            {el}
                        </React.Fragment>
                    ))}
                </div>
            </div>
          
            {/* <nav>
                <BottomNavbar/>
            </nav> */}
            
            <footer>
                <Footer/>
            </footer>
        </section>
    )
}