"use client";

import { motion, AnimatePresence } from 'framer-motion';
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
        scrollbar-color: #2A9D8F #E6F3EE;
    }
    .sidebar-scrollable::-webkit-scrollbar {
        width: 8px;
    }
    .sidebar-scrollable::-webkit-scrollbar-track {
        background: transparent;
        transition: background 0.3s ease;
    }
    .sidebar-scrollable:hover::-webkit-scrollbar-track {
        background: #E6F3EE;
    }
    .sidebar-scrollable::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 4px;
        transition: background 0.3s ease;
    }
    .sidebar-scrollable:hover::-webkit-scrollbar-thumb {
        background: #2A9D8F;
    }
    .sidebar-scrollable::-webkit-scrollbar-thumb:hover {
        background: #1F7A6E;
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
        <div key="dashboard-sections-header" className="relative p-3 text-xl text-center font-sans text-white border-b-1 md:border-b-2 theme-sidebar-header">
            {menuSectionName}
        </div>,
        <ul key="dashboard-sections-list" className="flex flex-col font-sans bg-[var(--theme-section-bg)]">
            {opensOnHover && (
                <div
                    className="absolute -right-[3.25rem] -top-1 h-[8%] w-[50px] bg-green-700 rounded-r-md cursor-pointer hover:bg-green-800 transition-colors z-40 relative overflow-hidden"
                >
                    <div className="absolute w-5 h-5 bg-red-600 rounded-full left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2" />
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
                            className={`block w-[100%] p-2 hover:bg-[var(--theme-card-bg)] border-b-1 border-[var(--theme-border-subtle)] text-center text-[var(--theme-text)] ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}${item.isPlaceholder ? ' opacity-0 pointer-events-none' : ''}`}
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

    const onLogInPrompt = () => {
        router.push("/login");
        onClose();
    }

    const onClose = () => {
        if(setSidebarVisibility) setSidebarVisibility(false);
    }

    const smallScreenStyle = "absolute top-[calc(100%-1rem)] min-h-screen md:h-auto left-0 md:hidden w-[120%] border-1 border-[var(--theme-deep-green)] bg-[var(--theme-section-bg)] z-50 flex flex-col " + className;
    const bigScreenStyle = "border-4 border-[var(--theme-teal)] bg-[var(--theme-section-bg)] z-50 flex flex-col h-screen " + className;

    //WHEN NOT LOGGED IN
    if(!isAuthenticated) return (
        <>
            <style>{scrollBarStyle}</style>

            <AnimatePresence>
                {isPopOutSidebar && (
                    <motion.div 
                        className="fixed inset-0 z-40 w-screen h-screen"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                )}
            </AnimatePresence>

            <div ref={ref} className={isPopOutSidebar ? smallScreenStyle : bigScreenStyle} style={style}>
                {isPopOutSidebar && (
                    <div>
                        <div className="flex justify-center items-center min-h-[120px] font-bold text-white text-3xl bg-[var(--theme-teal)]
                        border-b-2 border-[var(--theme-deep-green)]">Cholo BD!</div>
                        <button className="w-[100%] h-[40px] text-lg text-white font-sans theme-btn-teal" onClick={() => onClose()}>Close</button>
                    </div>
                )}

                <div className="relative">
                    <div className="relative p-3 text-xl text-center border-b-2 text-white font-sans overflow-visible theme-sidebar-header">Hello there!
                        {opensOnHover && (
                            <div 
                                className="absolute flex justify-center items-center -right-[3.25rem] -top-1 h-[108%] w-[50px] bg-[var(--theme-teal)] rounded-r-md cursor-pointer hover:bg-[var(--theme-teal-hover)] transition-colors z-40"
                            >
                                <div className="w-[50px] h-[100%] bg-emerald-700 relative flex items-center justify-center rounded-sm">
                                    <div className="w-5 h-5 bg-red-600 rounded-full" />
                                </div>
                            </div>
                        )
                        }
                    </div>

                    <div className="flex-1 overflow-y-auto sidebar-scrollable">
                        <div className='flex flex-col font-sans'>
                            <p className="text-lg pt-20 pb-10 theme-text-teal text-center">Log In to access additional features</p>
                            <button className="w-[100%] h-[40px] mb-10 text-lg text-center theme-btn-teal" onClick={() => onLogInPrompt()}>Log In</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
  
    return (
        <>
            <style>{scrollBarStyle}</style>

            <AnimatePresence>
                {isPopOutSidebar && (
                    <motion.div 
                        className="fixed inset-0 z-40 w-screen h-screen"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                )}
            </AnimatePresence>

            <div ref={ref} className={isPopOutSidebar ? smallScreenStyle : bigScreenStyle} style={style}>
                {isPopOutSidebar && (
                    <div className='relative font-satisfy'>
                        <div className="flex justify-center items-center min-h-[80px] md:min-h-[120px] font-bold text-white text-2xl md:text-3xl
                            bg-[var(--theme-teal)] border-b-1 border-t-2 border-[var(--theme-deep-green)]">
                            Cholo BD
                        </div>
                        
                        <button className="absolute top-0 right-0 w-[20px] h-[20px] text-lg text-center text-red-400" onClick={() => onClose()}>
                            <FaWindowClose/>
                        </button>
                    </div>
                )}

                <div className="relative">
                    {opensOnHover && (
                        <div 
                            className="absolute flex justify-center items-center -right-[3.25rem] -top-1 h-[11.5%] w-[50px] bg-[var(--theme-teal)] rounded-r-md cursor-pointer hover:bg-[var(--theme-teal-hover)] transition-colors z-40"
                        >
                            <div className="w-[50px] h-[100%] bg-emerald-700 relative flex items-center justify-center rounded-sm">
                                <div className="w-5 h-5 bg-red-600 rounded-full" />
                            </div>
                        </div>
                    )
                    }

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