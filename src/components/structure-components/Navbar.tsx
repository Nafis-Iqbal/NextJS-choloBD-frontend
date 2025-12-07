/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { AuthApi } from "@/services/api";
import useLogout from "@/hooks/UtilHooks/logoutHooks";

import { Menu } from "lucide-react";
import { MotionDropdownMenu } from "./DropdownMenu";
import { MotionSidebarMenu } from "./SIdebarMenu";
import { FaShoppingCart, FaUser, FaGift, FaGlobe, FaSignOutAlt, FaBlackTie, FaSearch, FaCaretDown, FaThList } from "react-icons/fa";
import IconWithBadge from "../custom-elements/IconWithBadge";
import BasicButton from "../custom-elements/Buttons";
import { SearchInputBar } from "./SearchInputBar";


const Navbar: React.FC = () => {
    const router = useRouter();
    const logout = useLogout();
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
    const [isSideBarMenuOpen, setIsSideBarMenuOpen] = useState(false);

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
    
    return (
        <div className="fixed top-0 z-100 md:flex items-center p-1 w-[100%] h-[55px] md:h-[70px] bg-[#00FF99]">
            <div className="relative flex justify-between items-center w-[100%] h-full bg-inherit">
                {/* Start Section */}
                <div className="relative flex space-x-2 md:space-x-0 md:justify-between items-center w-[40%] md:w-[65%] bg-inherit">
                    {/* Small Screen Menu*/}
                    <BasicButton
                        buttonColor="bg-black"
                        buttonTextColor="text-white"
                        onClick={() => onSideBarMenuToggle()}
                        extraStyle="md:hidden border border-white"
                    >
                        <Menu className="text-[#00FF99]" />
                    </BasicButton>

                    {/* absolutely positioned Small Screen Dropdown Menu, animated, button activated */}
                    <AnimatePresence>
                        {isSideBarMenuOpen && 
                            <MotionSidebarMenu 
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
                        className="hidden md:block w-[20%] ml-5 p-2 text-center bg-[#0F0F0F] md:text-xl lg:text-2xl text-[#00FF99] font-satisfy
                        rounded-sm transition-all duration-150 hover:scale-110 hover:brightness-130 hover:backdrop-blur-sm"
                        onClick={() => onLogoClick()}
                    >
                        Cholo BD!
                    </button>
                    
                    <SearchInputBar 
                        className="hidden md:block w-[75%] mr-3" 
                        isOpen={true}
                        setInputBarVisibility={setIsSearchBarOpen}
                    />
                </div>
                
                {/* Mid Section */}
                {/* Homepage Button */}
                <div className="flex w-[20%] md:hidden justify-center bg-inherit">
                    <button 
                        className="self-center block md:hidden p-2 text-center bg-black text-[#00FF99] rounded-full"
                        onClick={() => router.push("/")}
                    >
                        <FaBlackTie className="inline-block text-2xl" />
                    </button>
                </div>

                {/* End Section */}
                <div className="flex justify-end h-full w-[40%] md:w-auto space-x-2 bg-inherit">
                    {/* Search Bar Button */}
                    <BasicButton
                        buttonColor="bg-black"
                        buttonTextColor="text-white"
                        onClick={() => onSearchBarToggle()}
                        extraStyle="md:hidden border border-white"
                    >
                        <FaSearch className="text-2xl text-[#00FF99]" />
                    </BasicButton>

                    {/* Small Screen Menu, relatively positioned */}
                    <BasicButton
                        buttonColor="bg-black"
                        buttonTextColor="text-white"
                        onClick={() => onMenuToggle()}
                        extraStyle="md:hidden border border-white"
                    >
                        <FaCaretDown className="text-2xl text-[#00FF99]" />
                    </BasicButton>

                    {/* absolutely positioned Small Screen Dropdown Menu, animated, button activated */}
                    <AnimatePresence>
                        {isMenuOpen && 
                            <MotionDropdownMenu 
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
                    <div className="hidden md:flex justify-end max-h-[100%] w-full mr-2 md:mr-4 lg:mr-8 space-x-6 items-center md:text-lg lg:text-xl text-green-800 font-sans font-semibold bg-inherit">
                        <a className="p-2 " href="#experience">
                            <FaGlobe className="md:text-2xl text-gray-800 transition-all duration-150 hover:scale-120 hover:brightness-130"/>
                        </a>

                        <Link className="p-2 text-gray-800 transition-all duration-150 hover:scale-120 hover:brightness-130" href="/cart">
                            <IconWithBadge Icon={FaGift} badgeValue={2} iconClassName="text-gray-800 md:text-2xl"/>
                        </Link>

                        <Link className="p-2 text-gray-800 transition-all duration-150 hover:scale-120 hover:brightness-130" href="/dashboard">
                            <IconWithBadge Icon={FaThList} badgeValue={2} iconClassName="text-gray-800 text-xl md:text-2xl scale-110"/>
                        </Link>

                        {!isAuthenticated ? (<Link className="p-2 hover:scale-110" href="/login">Log In</Link>) : 
                        (
                            <>
                                <Link className="p-2 text-gray-800 transition-all duration-150 hover:scale-120 hover:brightness-130" href={`/user_profile/${currentUserId}`}>
                                    <IconWithBadge Icon={FaUser} badgeValue={2} iconClassName="text-gray-800 md:text-2xl"/>
                                </Link>

                                <div className="flex flex-col items-center justify-center bg-transparent">
                                    <p className="h-1/2 text-black">$5.00</p>
                                    <button 
                                        className="h-1/2 p-1 bg-transparent hover:scale-110 hover:bg-black text-green-900 hover:text-green-400 text-sm text-center rounded-sm"
                                        onClick={() => router.push("wallet/wallet-recharge")}
                                    >
                                        Get Credits!
                                    </button>
                                </div>
                            </>
                        )}

                        {isAuthenticated && <FaSignOutAlt className="text-3xl text-gray-800 hover:scale-120 cursor-pointer" onClick={onLogOutClick} />}
                    </div>
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