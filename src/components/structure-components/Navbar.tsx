/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { AuthApi, NotificationApi, WalletApi } from "@/services/api";
import useLogout from "@/hooks/UtilHooks/logoutHooks";
import { Role } from "@/types/enums";

import { Menu } from "lucide-react";
import { MotionSidebarMenu } from "./SIdebarMenu";
import NotificationDropdown from "./NotificationDropdown";
import { FaUser, FaPalette, FaSignOutAlt, FaUserFriends, FaSearch, FaBell, FaThList, FaCalendarCheck } from "react-icons/fa";
import IconWithBadge from "../custom-elements/IconWithBadge";
import BasicButton from "../custom-elements/Buttons";
import { SearchInputBar } from "./SearchInputBar";
import { NextImage } from "../custom-elements/UIUtilities";


const THEMES = ['dusk', 'crimson', 'iceBlue', 'rose'] as const;
type Theme = typeof THEMES[number];

const THEME_LABELS: Record<Theme, string> = {
    dusk:   '🌇 Dusk',
    crimson: '🩸 Crimson',
    iceBlue: '🧊 Ice Blue',
    rose: '🌹 Rose',
};

function getRoleBadgeStyle(role?: Role | string | null): {
    backgroundColor: string;
    color: string;
    borderColor: string;
} {
    switch (role) {
        case Role.MASTER_ADMIN:
            return {
                backgroundColor: "#D4A017",
                color: "#1a1a1a",
                borderColor: "#B8860B",
            };
        case Role.SERVICE_ADMIN:
            return {
                backgroundColor: "#7C3AED",
                color: "#ffffff",
                borderColor: "#6D28D9",
            };
        case Role.EMPLOYEE:
            return {
                backgroundColor: "#16A34A",
                color: "#ffffff",
                borderColor: "#15803D",
            };
        case Role.USER:
        default:
            return {
                backgroundColor: "rgba(255, 255, 255, 0.22)",
                color: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.55)",
            };
    }
}

function formatRoleBadgeLabel(role?: Role | string | null): string {
    if (!role) return "USER";
    return String(role).replace(/_/g, " ").toUpperCase();
}

const Navbar: React.FC<{affectOpacity?: boolean}> = ({affectOpacity = false}) => {
    const router = useRouter();
    const logout = useLogout();
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserName = authResponse?.data?.userName;
    const currentUserRole = authResponse?.data?.userRole;

    const { data: walletResponse } = WalletApi.useGetMyWalletRQ();
    const walletBalance = walletResponse?.data?.balance || 0;

    const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
    const [isSideBarMenuOpen, setIsSideBarMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<Theme>('dusk');
    const [navOpacity, setNavOpacity] = useState(0);

    const { data: unreadResponse } = NotificationApi.useGetUnreadNotificationCountRQ(
        !!isAuthenticated
    );
    const notificationCount = unreadResponse?.data?.count ?? 0;

    // Load persisted theme on mount
    useEffect(() => {
        const saved = (localStorage.getItem('cholobd-theme') ?? 'dusk') as Theme;
        const valid = THEMES.includes(saved) ? saved : 'dusk';
        document.documentElement.setAttribute('data-theme', valid);
        setCurrentTheme(valid);
    }, []);

    // Handle scroll opacity
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Starts transparent, becomes opaque after ~300px of scrolling
            const opacity = Math.min(scrollY / 300, 1);
            setNavOpacity(opacity);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const cycleTheme = () => {
        const nextTheme = THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length];
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('cholobd-theme', nextTheme);
        setCurrentTheme(nextTheme);
    };

    const onSideBarMenuToggle = () => {
        setIsSideBarMenuOpen(!isSideBarMenuOpen);
        setIsSearchBarOpen(false);
        setIsNotificationOpen(false);
    }

    const onSearchBarToggle = () => {
        setIsSearchBarOpen(!isSearchBarOpen);
        setIsSideBarMenuOpen(false);
        setIsNotificationOpen(false);
    }

    const onNotificationToggle = () => {
        setIsNotificationOpen(!isNotificationOpen);
        setIsSideBarMenuOpen(false);
        setIsSearchBarOpen(false);
    }

    const onLogOutClick = () => {
        logout();
    }

    const onLogoClick = () => {
        router.push("/");
    }

    return (
        <div 
            className="fixed top-0 z-100 md:flex items-center p-1 w-[100%] h-[55px] md:h-[70px]"
            style={{
                // Use CSS vars only — reading getComputedStyle(window) during render
                // caused server/client hydration mismatches on every page with Navbar.
                backgroundColor: affectOpacity
                    ? `color-mix(in srgb, var(--theme-teal) ${Math.round(navOpacity * 100)}%, transparent)`
                    : "var(--theme-teal)",
            }}
        >
            <div className="relative flex justify-between items-center w-[100%] h-full bg-transparent">
                {/* Start Section */}
                <div className="relative flex space-x-2 md:space-x-0 md:justify-between items-center w-[30%] md:w-[60%] h-full bg-transparent">
                    {/* Small Screen Menu*/}
                    <BasicButton
                        buttonColor="bg-white/20"
                        buttonHoverColor="hover:bg-white/35"
                        buttonTextColor="text-white"
                        padding="p-2"
                        margin="m-0"
                        onClick={() => onSideBarMenuToggle()}
                        extraStyle="md:hidden rounded-full"
                    >
                        <Menu className="text-white text-xl" />
                    </BasicButton>

                    {/* absolutely positioned Small Screen Dropdown Menu, animated, button activated */}
                    <AnimatePresence>
                        {isSideBarMenuOpen && 
                            <MotionSidebarMenu 
                                className="z-90"
                                isPopOutSidebar={true}
                                setSidebarVisibility={setIsSideBarMenuOpen}
                                variants={{
                                rest: { x: '-100%', y: 0, transition: { type: 'spring', stiffness: 500, damping: 40, delay: 2.0 } },
                                animate: { x: 0, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20} },
                                exit: { x: '-100%', y: 0, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
                                }}
                                initial="rest"
                                animate="animate"
                                exit="exit"
                            />
                        }
                    </AnimatePresence>

                    <button 
                        className="hidden md:block w-[20%] h-full ml-5 p-2 md:text-xl lg:text-2xl text-white bg-[var(--theme-red)] font-satisfy
                         transition-all duration-150 brightness-125 hover:scale-102 hover:brightness-150"
                        onClick={() => onLogoClick()}
                    >
                        <NextImage src="/CholoBD-Logo.png" alt="Home" className="h-full w-full" nextImageClassName="object-contain"/>
                    </button>
                    
                    <SearchInputBar 
                        className="hidden md:block w-[75%] mr-3" 
                        isOpen={true}
                        setInputBarVisibility={setIsSearchBarOpen}
                    />
                </div>
                
                {/* Mid Section */}
                {/* Homepage Button */}
                <div className="flex w-[40%] md:hidden justify-center bg-transparent">
                    <button 
                        className="self-center block md:hidden h-30 w-90 p-0 text-center bg-[var(--theme-red)]"
                        onClick={() => router.push("/")}
                    >
                        <NextImage src="/CholoBD-Logo.png" alt="Home" className="h-full w-full" nextImageClassName="object-contain"/>
                    </button>
                </div>

                {/* End Section */}
                <div className="relative flex items-center justify-end h-full w-[30%] md:w-auto space-x-2 md:mr-4 lg:mr-8 md:space-x-3 md:text-lg lg:text-xl text-white font-sans font-semibold bg-transparent">
                    {/* Search Bar Button */}
                    <BasicButton
                        buttonColor="bg-white/20"
                        buttonHoverColor="hover:bg-white/35"
                        buttonTextColor="text-white"
                        padding="p-2"
                        margin="m-0"
                        onClick={() => onSearchBarToggle()}
                        extraStyle="md:hidden rounded-full"
                    >
                        <FaSearch className="text-xl text-white" />
                    </BasicButton>

                    {/* Small-screen bell — toggles the same NotificationDropdown as md+ */}
                    <BasicButton
                        buttonColor="bg-white/20"
                        buttonHoverColor="hover:bg-white/35"
                        buttonTextColor="text-white"
                        padding="p-2"
                        margin="m-0"
                        onClick={() => onNotificationToggle()}
                        extraStyle="md:hidden rounded-full"
                    >
                        <IconWithBadge
                            Icon={FaBell}
                            badgeValue={notificationCount}
                            iconClassName="text-white text-xl"
                        />
                    </BasicButton>

                    <button
                        className="hidden md:flex flex-col items-center space-y-2 p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125 bg-transparent"
                        onClick={cycleTheme}
                        title={`Theme: ${THEME_LABELS[currentTheme]} — click to cycle`}
                    >
                        <FaPalette className="text-xl text-white"/>
                        <span className="text-xs font-normal">Change Theme</span>
                    </button>

                    {/* One instance — must stay outside any `hidden` parent so the panel can open on sm */}
                    <NotificationDropdown
                        isOpen={isNotificationOpen}
                        onToggle={onNotificationToggle}
                        onClose={() => setIsNotificationOpen(false)}
                    />

                    <Link
                        className="hidden md:flex flex-col items-center space-y-2 p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125"
                        href="/community"
                    >
                        <IconWithBadge Icon={FaUserFriends} badgeValue={2} iconClassName="text-white text-xl scale-110"/>
                        <span className="text-xs font-normal">Community</span>
                    </Link>

                    <Link
                        className="hidden md:flex flex-col items-center space-y-2 p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125"
                        href="/dashboard"
                    >
                        <IconWithBadge Icon={FaThList} badgeValue={notificationCount} iconClassName="text-white text-xl scale-110"/>
                        <span className="text-xs font-normal">Dashboard</span>
                    </Link>

                    {!isAuthenticated ? (
                        <Link
                            className="hidden md:flex flex-col items-center space-y-2 p-2 text-white transition-all duration-150 hover:scale-110 hover:brightness-125"
                            href="/booking/trackers"
                        >
                            <IconWithBadge Icon={FaCalendarCheck} badgeValue={2} iconClassName="text-white text-xl scale-110"/>
                            <span className="text-xs font-normal">Booking Tracker</span>
                        </Link>
                    ) : null}

                    {!isAuthenticated ? (
                        <Link
                            className="hidden md:block p-2 hover:scale-110 text-white"
                            href="/login"
                        >
                            Log In
                        </Link>
                    ) : (
                        <>
                            <Link className="hidden md:flex flex-col items-center space-y-2 p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125" href={`/user_profile/${currentUserId}`}>
                                <IconWithBadge Icon={FaUser} badgeValue={2} iconClassName="text-white text-xl"/>
                                {currentUserName && (
                                    <span className="text-xs font-normal">{currentUserName.length > 7 ? `${currentUserName.slice(0, 7)}.` : currentUserName}</span>
                                )}
                            </Link>
                            {currentUserRole !== Role.USER && (
                            <div
                                className="hidden md:flex flex-col items-center justify-center px-1.5 py-1"
                                title={formatRoleBadgeLabel(currentUserRole)}
                            >
                                <span
                                    className="inline-flex items-center justify-center max-w-[7.5rem] px-2 py-0.5 rounded-md text-[10px] lg:text-[11px] font-bold tracking-wide leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis border"
                                    style={getRoleBadgeStyle(currentUserRole)}
                                >
                                    {formatRoleBadgeLabel(currentUserRole)}
                                </span>
                            </div>
                            )}

                            <div className="hidden md:flex flex-col items-center justify-center bg-transparent">
                                <p className="h-1/2 text-white text-sm font-semibold">{walletBalance.toLocaleString()} C</p>
                                <button
                                    className="h-1/2 p-1 bg-transparent hover:scale-110 hover:bg-gray-300/30 text-white text-xs text-center rounded-sm"
                                    onClick={() => router.push("wallet/wallet-recharge")}
                                >
                                    Get Credits!
                                </button>
                            </div>
                        </>
                    )}

                    {isAuthenticated && (
                        <FaSignOutAlt className="hidden md:block text-3xl text-white hover:scale-120 cursor-pointer" onClick={onLogOutClick} />
                    )}
                </div>

                <SearchInputBar 
                    className="md:hidden absolute top-full w-full"
                    setInputBarVisibility={setIsSearchBarOpen}
                    isOpen={isSearchBarOpen}
                />
            </div>
        </div>
    );
}

export default Navbar;