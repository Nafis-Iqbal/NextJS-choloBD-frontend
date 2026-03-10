"use client";

import { AuthApi } from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DivGap, {HorizontalDivider, VerticalDivider} from "../custom-elements/UIUtilities";
import { AboutSection } from "../page-content/AboutSection";

const Footer: React.FC = () => {
    const router = useRouter();
    const [showAbout, setShowAbout] = useState(false);
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;

    const onLogInClick = () => {
        router.push("/login");
    }

    const onLogOutClick = () => {
        router.push("/");
    }

    return (
        <>
            <div className="flex flex-col bg-gray-900 border-t border-[#00FF99]">
                <div className="flex flex-col md:flex-row items-start justify-between px-6 md:px-12 py-6 gap-8">
                    {/* Left: About Button */}
                    <div className="w-full md:w-[40%] flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-[#00FF99] font-sans">Cholo BD</h3>

                        <p className="text-gray-400 text-sm font-sans">
                            Travel smarter across Bangladesh — book tickets, hotels, and manage trips in one place.
                        </p>

                        <button
                            onClick={() => setShowAbout(true)}
                            className="w-fit px-4 py-2 bg-[#00FF99] text-gray-900 font-semibold rounded-md hover:bg-emerald-400 transition-colors"
                        >
                            About the Devs
                        </button>
                    </div>

                {/* Middle: Explore */}
                <div className="w-full md:w-[25%] flex flex-col gap-3 font-sans">
                    <div className="text-pink-100 font-semibold">Explore</div>
                    <Link className="text-gray-300 text-sm hover:text-[#00FF99] transition-colors" href="/booking">Bookings</Link>
                    <Link className="text-gray-300 text-sm hover:text-[#00FF99] transition-colors" href="/booking/trackers">Booking Tracker</Link>
                    <Link className="text-gray-300 text-sm hover:text-[#00FF99] transition-colors" href="/">Tickets</Link>
                    <Link className="text-gray-300 text-sm hover:text-[#00FF99] transition-colors" href="/">Hotels</Link>
                </div>

                <VerticalDivider className="hidden md:block border-gray-700" height="h-[120px]"/>

                {/* Right: Account */}
                <div className="w-full md:w-[25%] flex flex-col gap-3 font-sans">
                    <div className="text-pink-100 font-semibold">Account</div>
                    <Link className="text-gray-300 text-sm hover:text-[#00FF99] transition-colors" href="/dashboard">Dashboard</Link>
                    {isAuthenticated ? (
                        <button
                            className="text-left text-gray-300 text-sm hover:text-red-400 transition-colors"
                            onClick={onLogOutClick}
                        >
                            Log Out
                        </button>
                    ) : (
                        <button
                            className="text-left text-gray-300 text-sm hover:text-[#00FF99] transition-colors"
                            onClick={onLogInClick}
                        >
                            Log In
                        </button>
                    )}
                </div>
            </div>

            <HorizontalDivider className="border-gray-700"/>

            <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-3">
                <p className="text-gray-500 text-xs font-sans">© 2026 Cholo BD. All rights reserved.</p>
                <div className="text-gray-500 text-xs font-sans">Built for travelers</div>
            </div>
            </div>

            {/* About Section Slide-in */}
            <AnimatePresence>
                {showAbout && (
                    <motion.div
                        initial={{ x: -500, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -500, opacity: 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed left-0 bottom-0 w-full md:w-1/2 bg-gray-900 border border-[#00FF99] z-50 overflow-y-auto rounded-md"
                        style={{ maxHeight: "100%" }}
                    >
                        <AboutSection onClose={() => setShowAbout(false)} compact={true} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default Footer;