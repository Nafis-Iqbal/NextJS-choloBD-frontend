"use client";

import { forwardRef, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AuthApi, NotificationApi, WalletApi } from "@/services/api";
import { useRouter } from "next/navigation";
import useLogout from "@/hooks/UtilHooks/logoutHooks";

interface DropdownMenuProps {
    className?: string;
    onClose?: () => void;
}

const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(({ className = "top-full right-0", onClose }, ref) => {
    const router = useRouter();
    const logout = useLogout();
    const containerRef = useRef<HTMLDivElement>(null);
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;

    const { data: walletResponse } = WalletApi.useGetMyWalletRQ();
    const walletBalance = walletResponse?.data?.balance || 0;

    const { data: unreadResponse } = NotificationApi.useGetUnreadNotificationCountRQ(
        !!isAuthenticated
    );
    const notificationCount = unreadResponse?.data?.count ?? 0;

    const onLogOutClick = () => {
        logout();
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={containerRef} onClick={(e) => e.stopPropagation()}>
            <div
                ref={ref}
                className={`absolute ${className} flex flex-col md:hidden space-y-1 items-center theme-dropdown opacity-100 font-sans`}
            >
            {isAuthenticated && (
                <button
                    type="button"
                    className="p-2 w-full border-b-1 border-[var(--theme-border-subtle)] theme-text bg-transparent text-center"
                    onClick={() => {
                        // Small-screen notification panel will be implemented later
                        onClose?.();
                    }}
                >
                    Notifications
                    {notificationCount > 0 ? ` (${notificationCount})` : ""}
                </button>
            )}
            <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href="/community" >Community</Link>
            <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href="/dashboard" >Dashboard</Link>
            
            {!isAuthenticated ? (
                <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href="/booking/trackers">Booking Tracker</Link>
            ) : <></>}

            {!isAuthenticated ? (
                <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href="/login" >Log In</Link>
            ) : (
                <>
                    <Link className="p-2 border-b-1 border-[var(--theme-border-subtle)] theme-text" href={`/user_profile/${currentUserId}`} >Profile</Link>
                    <div className="flex flex-col w-full items-center border-b-1 border-[var(--theme-border-subtle)]">
                        {isAuthenticated && (<p className="p-2 theme-text font-semibold">{walletBalance.toLocaleString()} C</p>)}
                        <button 
                            className="p-2 w-full text-center theme-text hover:brightness-125 bg-transparent"
                            onClick={() => router.push("/wallet/wallet-recharge")}
                        >
                            Get Credits!
                        </button>
                    </div>
                </>
            )}

            {isAuthenticated && 
            <div className="p-2 border-b-1 border-[var(--theme-border-subtle)] text-[var(--theme-red)] cursor-pointer" onClick={onLogOutClick} >Log Out</div>
            }
            </div>
        </div>
    );
});

DropdownMenu.displayName = "DropdownMenu";

export const MotionDropdownMenu = motion(DropdownMenu);

export default DropdownMenu;
