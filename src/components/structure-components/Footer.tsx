"use client";

import { AuthApi } from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, LogIn, LogOut, QrCode } from "lucide-react";

import { AboutSection } from "../page-content/AboutSection";

const EXPLORE_LINKS = [
    { label: "Hotels & Stays", href: "/hotels" },
    { label: "Tour Spots", href: "/tour-spots" },
    { label: "Activities", href: "/activity-spots" },
    { label: "Local Guides", href: "/guides" },
];

const PLAN_LINKS = [
    { label: "Bookings", href: "/booking" },
    { label: "Booking Tracker", href: "/booking/trackers" },
    { label: "Tour Builder", href: "/tour-builder/platform" },
    { label: "Search", href: "/search" },
    { label: "About CholoBD", href: "/about-cholobd" },
];

const ACCOUNT_LINKS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Community", href: "/community" },
    { label: "Submit a Complaint", href: "/complaint/submit" },
];

const Footer: React.FC<{className?: string}> = ({className}) => {
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
            <footer className={`flex flex-col theme-footer font-sans ${className}`}>
                <div className="grid w-full grid-cols-1 gap-10 px-6 py-10 md:grid-cols-2 md:px-12 lg:grid-cols-4 lg:gap-8">
                    {/* Brand */}
                    <div className="flex flex-col gap-4 lg:col-span-1">
                        <h3 className="text-xl font-bold tracking-tight text-white">Cholo BD</h3>

                        <p className="max-w-xs text-sm leading-relaxed text-white/75">
                            Travel smarter across Bangladesh — book tickets, hotels, and manage trips in one place.
                        </p>

                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                            <QrCode className="h-3.5 w-3.5" strokeWidth={2} />
                            Cashless Ready
                        </span>

                        <button
                            onClick={() => setShowAbout(true)}
                            className="group mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                        >
                            About the Devs
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
                        </button>
                    </div>

                    <FooterLinkColumn title="Explore" links={EXPLORE_LINKS} />
                    <FooterLinkColumn title="Plan & Book" links={PLAN_LINKS} />

                    {/* Account */}
                    <div className="flex flex-col gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">Account</div>

                        {ACCOUNT_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="w-fit text-sm text-white/75 transition-all hover:translate-x-0.5 hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <button
                                className="mt-1 inline-flex w-fit items-center gap-1.5 bg-transparent text-sm text-white/75 transition-colors hover:text-white"
                                onClick={onLogOutClick}
                            >
                                <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                                Log Out
                            </button>
                        ) : (
                            <button
                                className="mt-1 inline-flex w-fit items-center gap-1.5 bg-transparent text-sm text-white/75 transition-colors hover:text-white"
                                onClick={onLogInClick}
                            >
                                <LogIn className="h-3.5 w-3.5" strokeWidth={2} />
                                Log In
                            </button>
                        )}
                    </div>
                </div>

                <div className="h-px w-full bg-white/20" />

                <div className="flex flex-col items-center justify-between gap-2 px-6 py-4 md:flex-row md:px-12">
                    <p className="text-xs text-white/60">© 2026 Cholo BD. All rights reserved.</p>
                    <p className="text-xs text-white/60">Built for travelers in Bangladesh</p>
                </div>
            </footer>

            {/* About Section Slide-in */}
            <AnimatePresence>
                {showAbout && (
                    <motion.div
                        initial={{ x: -500, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -500, opacity: 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed left-0 bottom-0 z-50 w-full overflow-y-auto rounded-2xl border border-[var(--theme-deep-green)] bg-[var(--theme-bg)] shadow-[0_-10px_40px_-20px_var(--theme-deep-green)] md:w-1/2"
                        style={{ maxHeight: "100%" }}
                    >
                        <AboutSection onClose={() => setShowAbout(false)} compact={true} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

const FooterLinkColumn = ({ title, links }: { title: string; links: { label: string; href: string }[] }) => (
    <div className="flex flex-col gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white">{title}</div>
        {links.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-white/75 transition-all hover:translate-x-0.5 hover:text-white"
            >
                {link.label}
            </Link>
        ))}
    </div>
);

export default Footer;
