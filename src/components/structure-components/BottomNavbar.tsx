/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { FaUser, FaSignInAlt, FaCog, FaGift } from "react-icons/fa";
import IconWithBadge from "../custom-elements/IconWithBadge";
import { useSelector } from "react-redux";
import { AuthApi } from "@/services/api";

const BottomNavbar = () => {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;

    return (
        <div className="fixed z-100 md:hidden bottom-0 flex items-center p-1 w-[100%] h-[60px] theme-nav">
            <div className="relative flex items-center p-1 w-[100%] h-full bg-inherit text-white font-semibold">
                <Link className="w-[25%] py-2 text-center border-r-1 border-white/30" href="/dashboard" >
                    <IconWithBadge
                        Icon={FaCog} 
                        iconClassName="text-white text-3xl"
                    />
                </Link>

                <Link className="w-[25%] py-2 text-center border-r-1 border-white/30" href="/special-deals" >
                    <IconWithBadge
                        Icon={FaGift} 
                        iconClassName="text-white text-3xl"
                    />
                </Link>

                <Link className="w-[25%] py-2 text-center border-r-1 border-white/30" href="/">
                    <IconWithBadge
                        Icon={FaGift} 
                        iconClassName="text-white text-3xl"
                    />
                </Link>

                {
                    isAuthenticated ? (
                        <Link className="w-[25%] py-2 text-center" href="/dashboard#dashboard_profile">
                            <IconWithBadge 
                                Icon={FaUser} 
                                badgeValue={2} 
                                iconClassName="text-white text-3xl"
                            />
                        </Link>
                    ) : (
                        <Link className="w-[25%] py-2 text-center flex items-center justify-center" href={"/login"} >
                            <FaSignInAlt className="text-white text-3xl"/>
                        </Link>
                    )
                }
            </div>
        </div>
    );
}

export default BottomNavbar;