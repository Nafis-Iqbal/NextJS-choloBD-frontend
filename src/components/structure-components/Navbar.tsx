/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { AuthApi, WalletApi } from "@/services/api";
import useLogout from "@/hooks/UtilHooks/logoutHooks";

import { Menu } from "lucide-react";
import { MotionDropdownMenu } from "./DropdownMenu";
import { MotionSidebarMenu } from "./SIdebarMenu";
import { FaUser, FaGift, FaGlobe, FaSignOutAlt, FaBlackTie, FaSearch, FaCaretDown, FaThList } from "react-icons/fa";
import IconWithBadge from "../custom-elements/IconWithBadge";
import BasicButton from "../custom-elements/Buttons";
import { SearchInputBar } from "./SearchInputBar";
import { NextImage } from "../custom-elements/UIUtilities";
import {
    navigationMessages,
    type NavigationMessages,
} from "@/i18n/navigationMessages";


const THEMES = ['forest', 'dusk', 'crimson', 'violet', 'amber', 'iceBlue', 'rose'] as const;
type Theme = typeof THEMES[number];

const THEME_ICONS: Record<Theme, string> = {
    forest: '🌿',
    dusk: '🌇',
    crimson: '🩸',
    violet: '🍇',
    amber: '🍂',
    iceBlue: '🧊',
    rose: '🌹',
};

const Navbar: React.FC<{
    affectOpacity?: boolean;
    copy?: NavigationMessages;
}> = ({affectOpacity = false, copy = navigationMessages.en}) => {
    const router = useRouter();
    const logout = useLogout();
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;

    const { data: walletResponse } = WalletApi.useGetMyWalletRQ();
    const walletBalance = walletResponse?.data?.balance || 0;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
    const [isSideBarMenuOpen, setIsSideBarMenuOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<Theme>('forest');
    const [navOpacity, setNavOpacity] = useState(0);

    // Load persisted theme on mount
    useEffect(() => {
        const saved = (localStorage.getItem('cholobd-theme') ?? 'forest') as Theme;
        const valid = THEMES.includes(saved) ? saved : 'forest';
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

    const onMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
        setIsSideBarMenuOpen(false);
        setIsSearchBarOpen(false);
    }

    const onSideBarMenuToggle = () => {
        setIsSideBarMenuOpen(!isSideBarMenuOpen);
        setIsSearchBarOpen(false);
        setIsMenuOpen(false);
    }

    const onSearchBarToggle = () => {
        setIsSearchBarOpen(!isSearchBarOpen);
        setIsMenuOpen(false);
        setIsSideBarMenuOpen(false);
    }

    const onLogOutClick = () => {
        logout();
    }

    const onLogoClick = () => {
        router.push("/");
    }

    // Helper to convert hex color to RGB object
    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : { r: 0, g: 0, b: 0 };
    };

    // Helper to read CSS variable value from current theme
    const getCSSVariableValue = (varName: string): string => {
        if (typeof window === 'undefined') return '#000000';
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    };

    // Dynamically get nav color from CSS variables (updated whenever currentTheme changes)
    const navColor = hexToRgb(getCSSVariableValue('--theme-teal'));
    
    return (
        <div 
            className="fixed top-0 z-100 md:flex items-center p-1 w-[100%] h-[55px] md:h-[70px]"
            style={{
                backgroundColor: `rgba(${navColor.r}, ${navColor.g}, ${navColor.b}, ${affectOpacity ? navOpacity : 1.0})`
            }}
        >
            <div className="relative flex justify-between items-center w-[100%] h-full bg-transparent">
                {/* Start Section */}
                <div className="relative flex space-x-2 md:space-x-0 md:justify-between items-center w-[30%] md:w-[65%] h-full bg-transparent">
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
                                copy={copy.sidebar}
                                className="mt-2 top-full z-90"
                                isPopOutSidebar={true}
                                setSidebarVisibility={setIsSideBarMenuOpen}
                                variants={{
                                rest: { x: '-100%', y: '-2px', transition: { type: 'spring', stiffness: 500, damping: 40, delay: 2.0 } },
                                animate: { x: '-4%', y: '-2px', transition: { type: 'spring', stiffness: 200, damping: 20} },
                                exit: { x: '-100%', y: '-2px', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
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
                        copy={copy.search}
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
                <div className="flex justify-end h-full w-[30%] md:w-auto space-x-2 bg-transparent">
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

                    {/* Small Screen Menu, relatively positioned */}
                    <BasicButton
                        buttonColor="bg-white/20"
                        buttonHoverColor="hover:bg-white/35"
                        buttonTextColor="text-white"
                        padding="p-2"
                        margin="m-0"
                        onClick={() => onMenuToggle()}
                        extraStyle="md:hidden rounded-full"
                    >
                        <FaCaretDown className="text-xl text-white" />
                    </BasicButton>

                    {/* absolutely positioned Small Screen Dropdown Menu, animated, button activated */}
                    <AnimatePresence>
                        {isMenuOpen && 
                            <MotionDropdownMenu 
                                copy={copy.dropdown}
                                className="mt-2 top-full -right-1 z-90"
                                variants={{
                                rest: { y: '-100%', transition: { type: 'spring', stiffness: 500, damping: 40, delay: 2.0 } },
                                animate: { y: '0%', transition: { type: 'spring', stiffness: 200, damping: 20} },
                                exit: { y: '-100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
                                }}
                                initial="rest"
                                animate="animate"
                                exit="exit"
                            />
                        }
                    </AnimatePresence>

                    {/* Big Screen Menu, hidden in small screens */}
                    <div className="hidden md:flex justify-end max-h-[100%] w-full mr-2 md:mr-4 lg:mr-8 space-x-6 items-center md:text-lg lg:text-xl text-white font-sans font-semibold bg-transparent">
                        <button
                            className="relative p-2 group transition-all duration-150 hover:scale-120"
                            onClick={cycleTheme}
                            title={`${copy.themeTitle}: ${copy.themes[currentTheme]}`}
                        >
                            <FaGlobe className="md:text-2xl text-white"/>
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-sans font-normal
                                text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {THEME_ICONS[currentTheme]} {copy.themes[currentTheme]}
                            </span>
                        </button>

                        <Link className="p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125" href="/dashboard">
                            <IconWithBadge Icon={FaGift} badgeValue={2} iconClassName="text-white md:text-2xl"/>
                        </Link>

                        <Link className="p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125" href="/dashboard">
                            <IconWithBadge Icon={FaThList} badgeValue={2} iconClassName="text-white text-xl md:text-2xl scale-110"/>
                        </Link>

                        {!isAuthenticated ? (<Link className="p-2 transition-all hover:scale-110 text-center text-white" href="/booking/trackers">{copy.bookingTracker}</Link>) : <></>}

                        {!isAuthenticated ? (<Link className="p-2 hover:scale-110 text-white" href="/login">{copy.logIn}</Link>) :
                        (
                            <>
                                <Link className="p-2 text-white transition-all duration-150 hover:scale-120 hover:brightness-125" href={`/user_profile/${currentUserId}`}>
                                    <IconWithBadge Icon={FaUser} badgeValue={2} iconClassName="text-white md:text-2xl"/>
                                </Link>

                                <div className="flex flex-col items-center justify-center bg-transparent">
                                    {isAuthenticated && (<p className="h-1/2 text-white font-semibold">{walletBalance.toLocaleString()} C</p>)}
                                    <button 
                                        className="h-1/2 p-1 bg-transparent hover:scale-110 hover:bg-gray-300/30 text-white text-sm text-center rounded-sm"
                                        onClick={() => router.push("wallet/wallet-recharge")}
                                    >
                                        {copy.getCredits}
                                    </button>
                                </div>
                            </>
                        )}

                        {isAuthenticated && <FaSignOutAlt className="text-3xl text-white hover:scale-120 cursor-pointer" onClick={onLogOutClick} />}
                    </div>
                </div>
                <SearchInputBar 
                    copy={copy.search}
                    className="md:hidden absolute top-full w-full"
                    setInputBarVisibility={setIsSearchBarOpen}
                    isOpen={isSearchBarOpen}
                />
            </div>
        </div>
    );
}

export default Navbar;
