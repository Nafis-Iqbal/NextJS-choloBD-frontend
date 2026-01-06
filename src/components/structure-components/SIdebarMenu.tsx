"use client";

import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { redirect, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/services/api';

import { FaBlackTie, FaWindowClose } from 'react-icons/fa';

type SidebarMenuProps = {
    className?: string;
    style?: React.CSSProperties;
    isPopOutSidebar: boolean;
    opensOnHover?: boolean;
    setSidebarVisibility?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarMenuWithRef = forwardRef<HTMLDivElement, SidebarMenuProps>(({className, style, isPopOutSidebar, opensOnHover = false, setSidebarVisibility}, ref) => {
    const pathName = usePathname();
    const router = useRouter();
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserRole = authResponse?.data?.userRole;

    const navigateToPage = (pathURL: string) => {
        router.push(pathURL);
        onClose();
    }

    const navigateBySession = ({adminURL, userURL, masterAdminURL} : {adminURL: string, userURL: string, masterAdminURL?: string}) => {
        if(isAuthenticated) {
            if(currentUserRole === "SERVICE_ADMIN" || currentUserRole === "MASTER_ADMIN") {
                if(masterAdminURL && currentUserRole === "MASTER_ADMIN") router.push(masterAdminURL);
                else router.push(adminURL);
            } else {
                router.push(userURL);
            }
        }

        onClose();
    }

    const sessionConditionedButtonName = ({adminUserButton, userButton, masterAdminUserButton} : {adminUserButton: string, userButton: string, masterAdminUserButton?: string}) => {
        if(isAuthenticated && (currentUserRole === "SERVICE_ADMIN" || currentUserRole === "MASTER_ADMIN")) {
            if(masterAdminUserButton && currentUserRole === "MASTER_ADMIN") return masterAdminUserButton;
            else return adminUserButton;
        }
        return userButton;
    }

    const isButtonInvisible = (sessionTypesToHide: string[]) => {
        if(isAuthenticated && currentUserRole && sessionTypesToHide.includes(currentUserRole)) {
            return "hidden";
        }
        return "";
    }

    const onLogInPrompt = () => {
        router.push("/login");
        onClose();
    }

    const onClose = () => {
        if(setSidebarVisibility) setSidebarVisibility(false);
    }

    const smallScreenStyle = "absolute top-[calc(100%-1rem)] min-h-screen md:h-auto left-0 md:hidden w-[120%] border-1 border-[#00FF99] z-50 " + className;
    const bigScreenStyle = "border-4 border-[#00FF99] z-50 " + className;

    //WHEN NOT LOGGED IN
    if(!isAuthenticated) return (
        <div ref={ref} className={isPopOutSidebar ? smallScreenStyle : bigScreenStyle} style={style}>
            {isPopOutSidebar && (
                <div>
                    <div className="flex justify-center items-center min-h-[120px] font-bold text-[#00FF99] text-3xl bg-black
                     border-b-4 border-pink-100">Cholo BD!</div>
                    <button className="w-[100%] h-[40px] bg-emerald-500 text-lg text-white font-sans" onClick={() => onClose()}>Close</button>
                </div>
            )}

            <div className="relative p-3 text-xl text-center border-b-4 text-pink-100 bg-gray-600 font-sans">Hello there!
                {opensOnHover && (<div 
                                    className="absolute flex justify-center items-center -right-13 -top-1 h-[108%] w-[50px] bg-[#00FF99] rounded-r-md"
                                >
                                    <FaBlackTie className='text-4xl text-center text-black'/>
                                </div>)
                }
            </div>

            <div className='flex flex-col font-sans'>
                <p className="text-lg pt-20 pb-10 text-green-400 text-center">Log In to access additional features</p>
                <button className="w-[100%] h-[40px] mb-10 bg-emerald-500 hover:bg-emerald-400 text-lg text-white text-center" onClick={() => onLogInPrompt()}>Log In</button>
            </div>
        </div>
    );
  
    return (
        <div ref={ref} className={isPopOutSidebar ? smallScreenStyle : bigScreenStyle} style={style}>
            {isPopOutSidebar && (
                <div className='relative font-satisfy'>
                    <div className="flex justify-center items-center min-h-[80px] md:min-h-[120px] font-bold text-[#00FF99] text-2xl md:text-3xl
                     bg-black border-b-1 border-t-2 border-[#00FF99]">Cholo BD</div>
                    <button className="absolute top-0 right-0 w-[20px] h-[20px] text-lg text-center text-red-400" onClick={() => onClose()}>
                        <FaWindowClose/>
                    </button>
                </div>
            )}

            <div className="relative p-3 text-xl text-center font-sans text-pink-100 border-b-1 md:border-b-2 bg-gray-600">Pages
                {opensOnHover && (<div 
                                    className="absolute flex justify-center items-center -right-13 -top-1 h-[108%] w-[50px] bg-[#00FF99] rounded-r-md"
                                >
                                    <FaBlackTie className='text-4xl text-center text-black'/>
                                </div>)
                }
            </div>

            <ul className="flex flex-col font-sans">
                <li>
                    <button onClick={() => {
                        navigateToPage(pathName === "/dashboard" ? "/products" : "/dashboard")
                    }} className="w-[100%] p-2 hover:bg-gray-600 border-b-1 text-pink-100">
                        {pathName === "/dashboard" ? "Browse Tour Plans" : "Dashboard"}
                    </button>
                </li>
                <li>
                    <button onClick={() => 
                        navigateBySession({adminURL: `/products?user_id=${currentUserId}`, userURL: `/offers`, masterAdminURL: `/user_profile`})
                    } className="w-[100%] p-2 hover:bg-gray-600 border-b-1 text-pink-100 disabled:cursor-not-allowed disabled:bg-gray-400" disabled={currentUserRole === 'USER'}>
                        {sessionConditionedButtonName({adminUserButton: "Your Products", userButton: "Your Offers", masterAdminUserButton: "All Users"})}
                    </button>
                </li>
            </ul>

            <div className="p-3 text-xl text-center border-b-1 md:border-b-2 text-pink-100 font-sans bg-gray-600">Quick Actions</div>
            
            <ul className="flex flex-col font-sans">
                <li>
                    <button disabled className="w-[100%] p-2 hover:bg-gray-600 border-b-1 text-pink-100 disabled:bg-gray-400 disabled:cursor-not-allowed" onClick={() =>navigateToPage('/track-order')}>
                        Track Seat Bookings
                    </button>
                </li>
                <li>
                    <button className={`w-[100%] p-2 hover:bg-gray-600 border-b-1 text-pink-100 ${isButtonInvisible(["USER"])}`} onClick={() => navigateToPage('/dashboard#dashboard_complaints')}>
                        Consumer Complaints
                    </button>
                </li>
                <li>
                    <button className={`w-[100%] p-2 hover:bg-gray-600 border-b-1 text-pink-100 ${isButtonInvisible(["USER", "SERVICE_ADMIN"])}`} onClick={() => navigateToPage('/dashboard#dashboard_site_settings')}>
                        {sessionConditionedButtonName({adminUserButton: "", userButton: "", masterAdminUserButton: "Site Settings"})}
                    </button>
                </li>
            </ul>

            <div className="p-3 text-xl text-center border-b-1 md:border-b-2 text-pink-100 font-sans bg-gray-600">Personalize</div>
            
            <ul className="flex flex-col font-sans">
                <li>
                    <button onClick={() => {redirect(`/dashboard#dashboard_profile`); onClose();}} className="w-[100%] p-2 hover:bg-gray-600 text-pink-100">Profile Info</button>
                </li>
                <li>
                    <button className="w-[100%] p-2 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-pink-100" disabled>Settings</button>
                </li>
            </ul>
        </div>
    );
});

SidebarMenuWithRef.displayName = "SidebarMenuWithRef";

export const MotionSidebarMenu = motion(SidebarMenuWithRef);

export default SidebarMenuWithRef;