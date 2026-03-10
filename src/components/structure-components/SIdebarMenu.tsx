"use client";

import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/services/api';

import { FaBlackTie, FaWindowClose } from 'react-icons/fa';

type MenuItem = { 
  label: string; 
  href: string; 
  isPlaceholder?: boolean;
  disabled?: boolean;
  hiddenFor?: string[];
  visibleFor?: string[];
};

type SidebarMenuConfig = {
    [key: string]: MenuItem[];
};

const dashboardSectionMenu: SidebarMenuConfig = {
    MASTER_ADMIN: [
        { label: "Entity Management", href: "/dashboard#entity_management" },
        { label: "Locations", href: "/dashboard#locations_management" },
        { label: "Categories", href: "/dashboard#category_management" },
        { label: "User Management", href: "/dashboard#users_management" },
        { label: "Wallet Options", href: "/dashboard#wallet_management" },
        { label: "Consumer Complaints", href: "/dashboard#complain_management" },
        { label: "Site Settings", href: "/dashboard#site_settings_management" }
    ],
    SERVICE_ADMIN: [
        { label: "Service Admin Dashboard", href: "/dashboard#service_admin_dashboard" }
    ],
    EMPLOYEE: [
        { label: "Service Maintenance Dashboard", href: "/dashboard#service_maintenance_dashboard" }
    ],
    USER: [
        { label: "Bookings", href: "/dashboard#bookings" },
        { label: "Profile", href: "/dashboard#profile" }
    ]
};

const sitePagesMenu: SidebarMenuConfig = {
    MASTER_ADMIN: [
        { label: "Hotels", href: "/hotels" },
        { label: "Tour Spots", href: "/tour-spots" },
        { label: "Activity Spots", href: "/activity-spots" },
        { label: "Users", href: "/user_profile" },
        { label: "Build Tour Package", href: "/tour-builder" },
        { label: "View Tour Packages", href: "/tour-builder/tours" },
        { label: "Book a Hotel", href: "/booking/hotel" },
    ],
    SERVICE_ADMIN: [
        { label: "Service Admin Dashboard", href: "/dashboard#service_admin_dashboard" }
    ],
    EMPLOYEE: [
        { label: "Service Maintenance Dashboard", href: "/dashboard#service_maintenance_dashboard" }
    ],
    USER: [
        { label: "Book a Hotel", href: "/booking/hotel" },
        { label: "Book a Flight", href: "/booking/flight" },
        { label: "Profile", href: "/dashboard#profile" },
        { label: "Transaction History", href: "/dashboard#transaction_history" }
    ]
};

const quickActionsMenu: SidebarMenuConfig = {
    MASTER_ADMIN: [
        { label: "Track Seat Bookings", href: "/booking/trackers" },
        { label: "Service Admin Dashboard", href: "/dashboard#service_admin_dashboard", hiddenFor: ["USER"] },
        { label: "Service Maintenance Dashboard", href: "/dashboard#service_maintenance_dashboard", hiddenFor: ["USER"] }
    ],
    SERVICE_ADMIN: [
        { label: "Track Seat Bookings", href: "/booking/trackers" },
        { label: "Service Admin Dashboard", href: "/dashboard#service_admin_dashboard" }
    ],
    EMPLOYEE: [
        { label: "Track Seat Bookings", href: "/booking/trackers" }
    ],
    USER: [
        { label: "Track Seat Bookings", href: "/booking/trackers" }
    ]
};

const personalizeMenu: SidebarMenuConfig = {
    MASTER_ADMIN: [
        { label: "Profile Info", href: "/dashboard#dashboard_profile" },
        { label: "Activity History", href: "/dashboard#activity_history" },
        { label: "Settings", href: "#", disabled: true }
    ],
    SERVICE_ADMIN: [
        { label: "Profile Info", href: "/dashboard#dashboard_profile" },
        { label: "Settings", href: "#", disabled: true },
        { label: "Activity History", href: "/dashboard#activity_history" }
    ],
    EMPLOYEE: [
        { label: "Profile Info", href: "/dashboard#dashboard_profile" },
        { label: "Settings", href: "#", disabled: true }
    ],
    USER: [
        { label: "Profile Info", href: "/dashboard#dashboard_profile" },
        { label: "Activity History", href: "/dashboard#activity_history" },
        { label: "Settings", href: "#", disabled: true }
    ]
};

const scrollBarStyle = `
    .sidebar-scrollable {
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
        transition: scrollbar-color 0.3s ease;
    }
    .sidebar-scrollable:hover {
        scrollbar-color: #4ade80 #374151;
    }
    .sidebar-scrollable::-webkit-scrollbar {
        width: 8px;
    }
    .sidebar-scrollable::-webkit-scrollbar-track {
        background: transparent;
        transition: background 0.3s ease;
    }
    .sidebar-scrollable:hover::-webkit-scrollbar-track {
        background: #374151;
    }
    .sidebar-scrollable::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 4px;
        transition: background 0.3s ease;
    }
    .sidebar-scrollable:hover::-webkit-scrollbar-thumb {
        background: #4ade80;
    }
    .sidebar-scrollable::-webkit-scrollbar-thumb:hover {
        background: #22c55e;
    }
    .sidebar-scrollable::-webkit-scrollbar-button {
        display: none;
    }
`;

type SidebarMenuBlockProps = {
    menuSectionName: string;
    opensOnHover?: boolean;
    currentUserRole?: string;
    menuConfig: SidebarMenuConfig;
}

const SidebarMenuBlock = ({ menuSectionName, opensOnHover = false, currentUserRole, menuConfig }: SidebarMenuBlockProps) => {
    let dashboardItems: MenuItem[] = [];

    if (!currentUserRole) {
        dashboardItems = [
            { label: 'Loading', href: '#', isPlaceholder: true },
            { label: 'Loading', href: '#', isPlaceholder: true },
            { label: 'Loading', href: '#', isPlaceholder: true }
        ];
    } else if (menuConfig[currentUserRole]) {
        dashboardItems = menuConfig[currentUserRole];
    }

    if (currentUserRole && dashboardItems.length === 0) return null;

    return [
        <div key="dashboard-sections-header" className="relative p-3 text-xl text-center font-sans text-pink-100 border-b-1 md:border-b-2 bg-gray-600">{menuSectionName}

        </div>,
        <ul key="dashboard-sections-list" className="flex flex-col font-sans bg-gray-800">
            {opensOnHover && (
                <div 
                    className="absolute flex justify-center items-center -right-[3.25rem] -top-1 h-[8%] w-[50px] bg-[#00FF99] rounded-r-md cursor-pointer hover:bg-[#00DD88] transition-colors z-40"
                >
                    <FaBlackTie className='text-4xl text-center text-black'/>
                </div>
            )}
            
            {dashboardItems.map((item, index) => {
                // Check if item should be hidden based on role
                if (item.hiddenFor && currentUserRole && item.hiddenFor.includes(currentUserRole)) {
                    return null;
                }
                
                return (
                    <li key={`${item.href}-${index}`}>
                        <Link
                            className={`block w-[100%] p-2 hover:bg-gray-600 border-b-1 border-emerald-800 text-center text-pink-100 ${item.disabled ? 'disabled:bg-gray-400 disabled:cursor-not-allowed' : ''}${item.isPlaceholder ? ' opacity-0 pointer-events-none' : ''}`}
                            href={item.href}
                            onClick={(e) => item.disabled && e.preventDefault()}
                        >
                            {item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    ];
};

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

    const smallScreenStyle = "absolute top-[calc(100%-1rem)] min-h-screen md:h-auto left-0 md:hidden w-[120%] border-1 border-[#00FF99] z-50 flex flex-col " + className;
    const bigScreenStyle = "border-4 border-[#00FF99] z-50 flex flex-col h-screen " + className;

    //WHEN NOT LOGGED IN
    if(!isAuthenticated) return (
        <>
            <style>{scrollBarStyle}</style>
            <div ref={ref} className={isPopOutSidebar ? smallScreenStyle : bigScreenStyle} style={style}>
            {isPopOutSidebar && (
                <div>
                    <div className="flex justify-center items-center min-h-[120px] font-bold text-[#00FF99] text-3xl bg-black
                     border-b-4 border-pink-100">Cholo BD!</div>
                    <button className="w-[100%] h-[40px] bg-emerald-500 text-lg text-white font-sans" onClick={() => onClose()}>Close</button>
                </div>
            )}

            <div className="relative">
                <div className="relative p-3 text-xl text-center border-b-4 text-pink-100 bg-gray-600 font-sans overflow-visible">Hello there!
                    {opensOnHover && (<div 
                                        className="absolute flex justify-center items-center -right-[3.25rem] -top-1 h-[108%] w-[50px] bg-[#00FF99] rounded-r-md cursor-pointer hover:bg-[#00DD88] transition-colors z-40"
                                    >
                                        <FaBlackTie className='text-4xl text-center text-black'/>
                                    </div>)
                    }
                </div>

                <div className="flex-1 overflow-y-auto sidebar-scrollable">
                    <div className='flex flex-col font-sans'>
                        <p className="text-lg pt-20 pb-10 text-green-400 text-center">Log In to access additional features</p>
                        <button className="w-[100%] h-[40px] mb-10 bg-emerald-500 hover:bg-emerald-400 text-lg text-white text-center" onClick={() => onLogInPrompt()}>Log In</button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
  
    return (
        <>
            <style>{scrollBarStyle}</style>
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

            <div className="relative">
                <div className="flex-1 overflow-y-auto sidebar-scrollable max-h-[75vh] md:max-h-[80vh]">
                    {pathName === "/dashboard" &&
                        <SidebarMenuBlock
                            menuSectionName='Dashboard Sections'
                            opensOnHover={opensOnHover}
                            currentUserRole={currentUserRole}
                            menuConfig={dashboardSectionMenu}
                        />
                    }

                    <SidebarMenuBlock
                        menuSectionName='Pages'
                        opensOnHover={opensOnHover}
                        currentUserRole={currentUserRole}
                        menuConfig={sitePagesMenu}
                    />

                    <SidebarMenuBlock
                        menuSectionName='Quick Actions'
                        opensOnHover={opensOnHover}
                        currentUserRole={currentUserRole}
                        menuConfig={quickActionsMenu}
                    />

                    <SidebarMenuBlock
                        menuSectionName='Personalize'
                        opensOnHover={opensOnHover}
                        currentUserRole={currentUserRole}
                        menuConfig={personalizeMenu}
                    />
                </div>
            </div>
        </div>
        </>
    );
});

SidebarMenuWithRef.displayName = "SidebarMenuWithRef";

export const MotionSidebarMenu = motion(SidebarMenuWithRef);

export default SidebarMenuWithRef;