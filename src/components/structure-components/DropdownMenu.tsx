"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AuthApi } from "@/services/api";
import { useRouter } from "next/navigation";
import {
    navigationMessages,
    type NavigationMessages,
} from "@/i18n/navigationMessages";

interface DropdownMenuProps {
    className?: string;
    copy?: NavigationMessages["dropdown"];
}

const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(({ className = "top-full right-0", copy = navigationMessages.en.dropdown }, ref) => {
    const router = useRouter();
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;

    const onLogOutClick = () => {
        // TODO: Implement your custom logout logic here
        router.push("/");
    }

    return (
        <div
            ref={ref} // Forward the ref
            className={`absolute ${className} flex flex-col md:hidden space-y-1 items-center theme-dropdown opacity-100 font-sans`}
        >
            <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href="/dashboard" >{copy.dashboard}</Link>
            <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href="/booking/trackers">{copy.tracker}</Link>
            <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href="/" >{copy.tickets}</Link>
            <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href="/" >{copy.hotels}</Link>
            <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href={isAuthenticated ? `/user_profile/${currentUserId}` : "/login"} >{isAuthenticated ? copy.profile : copy.logIn}</Link>
            {isAuthenticated && 
            <div className="p-2 border-b-1 border-[var(--theme-border-subtle)] text-[var(--theme-red)] cursor-pointer" onClick={onLogOutClick} >{copy.logOut}</div>
            }
        </div>
    );
});

DropdownMenu.displayName = "DropdownMenu";

export const MotionDropdownMenu = motion(DropdownMenu);

export default DropdownMenu;
