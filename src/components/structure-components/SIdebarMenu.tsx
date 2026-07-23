"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, type ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AuthApi, UserApi } from '@/services/api';
import { ServiceType } from '@/types/enums';
import { IconType } from 'react-icons';
import { FaWindowClose } from 'react-icons/fa';
import {
    FaBuilding,
    FaMapMarkerAlt,
    FaTags,
    FaUsers,
    FaWallet,
    FaExclamationCircle,
    FaCog,
    FaTachometerAlt,
    FaTools,
    FaCalendarCheck,
    FaHotel,
    FaHome,
    FaMapMarkedAlt,
    FaHiking,
    FaRoute,
    FaSuitcase,
    FaBed,
    FaExchangeAlt,
    FaTicketAlt,
    FaUserCircle,
    FaHistory,
    FaSpinner,
    FaBus,
    FaUserTie,
    FaBookmark,
    FaComments,
    FaPlus,
    FaEdit,
} from 'react-icons/fa';

type MenuItem = {
    label: string;
    href: string;
    icon?: IconType;
    isPlaceholder?: boolean;
    disabled?: boolean;
    hiddenFor?: string[];
    visibleFor?: string[];
};

type SidebarMenuConfig = {
    [key: string]: MenuItem[];
};

type ServiceAwareLabels = {
    serviceAdminDashboardLabel: string;
    serviceAdminDashboardIcon: IconType;
    employeeDashboardLabel: string;
    employeeDashboardIcon: IconType;
};

function getServiceDisplayName(serviceType?: ServiceType | string | null): string | null {
    switch (serviceType) {
        case ServiceType.HOTEL_BOOKING:
            return 'Hotel';
        case ServiceType.GUIDE_SERVICE:
            return 'Guide';
        case ServiceType.ACTIVITY_BOOKING:
            return 'Activity';
        case ServiceType.TRANSPORT_SERVICE:
            return 'Transport';
        case ServiceType.TRIP_PACKAGE:
            return 'Package';
        default:
            return null;
    }
}

function getServiceAdminDashboardIcon(serviceType?: ServiceType | string | null): IconType {
    switch (serviceType) {
        case ServiceType.HOTEL_BOOKING:
            return FaHotel;
        case ServiceType.GUIDE_SERVICE:
            return FaUserTie;
        case ServiceType.ACTIVITY_BOOKING:
            return FaHiking;
        case ServiceType.TRANSPORT_SERVICE:
            return FaBus;
        default:
            return FaTachometerAlt;
    }
}

function getEmployeeDashboardIcon(serviceType?: ServiceType | string | null): IconType {
    switch (serviceType) {
        case ServiceType.HOTEL_BOOKING:
            return FaHotel;
        case ServiceType.TRANSPORT_SERVICE:
            return FaBus;
        case ServiceType.ACTIVITY_BOOKING:
            return FaHiking;
        default:
            return FaTools;
    }
}

function getServiceAwareLabels(
    serviceType?: ServiceType | string | null,
    employeeServiceType?: ServiceType | string | null
): ServiceAwareLabels {
    const adminServiceName = getServiceDisplayName(serviceType);
    const employeeServiceName = getServiceDisplayName(employeeServiceType);

    return {
        serviceAdminDashboardLabel: adminServiceName
            ? `${adminServiceName} Admin Dashboard`
            : 'Service Admin Dashboard',
        serviceAdminDashboardIcon: getServiceAdminDashboardIcon(serviceType),
        employeeDashboardLabel: employeeServiceName
            ? `${employeeServiceName} Maintenance Dashboard`
            : 'Service Maintenance Dashboard',
        employeeDashboardIcon: getEmployeeDashboardIcon(employeeServiceType),
    };
}

function buildHotelServiceAdminDashboardSections(): MenuItem[] {
    return [
        { label: 'Hotel Profile', href: '/dashboard#hotel_admin_profile', icon: FaHotel },
        { label: 'Room Management', href: '/dashboard#hotel_admin_rooms', icon: FaBed },
        { label: 'Earnings', href: '/dashboard#hotel_admin_earnings', icon: FaWallet },
        { label: 'Customer Complaints', href: '/dashboard#hotel_admin_complaints', icon: FaExclamationCircle },
    ];
}

function buildGuideServiceAdminDashboardSections(): MenuItem[] {
    return [
        { label: 'Guide Profile', href: '/dashboard#guide_admin_profile', icon: FaUserTie },
        { label: 'Booking Requests', href: '/dashboard#guide_admin_bookings', icon: FaCalendarCheck },
        { label: 'Earnings', href: '/dashboard#guide_admin_earnings', icon: FaWallet },
    ];
}

function buildActivityServiceAdminDashboardSections(): MenuItem[] {
    return [
        { label: 'Activity Profile', href: '/dashboard#activity_admin_profile', icon: FaHiking },
        { label: 'Bookings', href: '/dashboard#activity_admin_bookings', icon: FaCalendarCheck },
        { label: 'Earnings', href: '/dashboard#activity_admin_earnings', icon: FaWallet },
    ];
}

function buildBusServiceAdminDashboardSections(): MenuItem[] {
    return [
        { label: 'Bus Management', href: '/dashboard#bus_admin_buses', icon: FaBus },
        { label: 'Ride Management', href: '/dashboard#bus_admin_rides', icon: FaRoute },
        { label: 'Sales Report', href: '/dashboard#bus_admin_sales', icon: FaWallet },
    ];
}

function buildServiceAdminDashboardSections(
    serviceType: ServiceType | string | null | undefined,
    {
        serviceAdminDashboardLabel,
        serviceAdminDashboardIcon,
    }: Pick<ServiceAwareLabels, 'serviceAdminDashboardLabel' | 'serviceAdminDashboardIcon'>
): MenuItem[] {
    switch (serviceType) {
        case ServiceType.HOTEL_BOOKING:
            return buildHotelServiceAdminDashboardSections();
        case ServiceType.GUIDE_SERVICE:
            return buildGuideServiceAdminDashboardSections();
        case ServiceType.ACTIVITY_BOOKING:
            return buildActivityServiceAdminDashboardSections();
        case ServiceType.TRANSPORT_SERVICE:
            return buildBusServiceAdminDashboardSections();
        default:
            return [
                {
                    label: serviceAdminDashboardLabel,
                    href: '/dashboard#service_admin_dashboard',
                    icon: serviceAdminDashboardIcon,
                },
            ];
    }
}

function buildHotelServiceEmployeeDashboardSections(): MenuItem[] {
    return [
        { label: 'Room Management', href: '/dashboard#hotel_room_status_management', icon: FaBed },
        { label: 'Bookings', href: '/dashboard#hotel_room_bookings_management', icon: FaCalendarCheck },
        { label: 'Customer Complaints', href: '/dashboard#hotel_employee_complaints', icon: FaExclamationCircle },
        { label: 'Maintenance Tasks', href: '/dashboard#hotel_maintenance_tasks_management', icon: FaTools },
    ];
}

function buildBusServiceEmployeeDashboardSections(): MenuItem[] {
    return [
        { label: 'Seat Plan', href: '/dashboard#bus_employee_seat_plan', icon: FaTicketAlt },
        { label: 'Ride Operations', href: '/dashboard#bus_employee_rides', icon: FaRoute },
        { label: 'Ticket Check-in', href: '/dashboard#bus_employee_checkin', icon: FaCalendarCheck },
        { label: 'Maintenance', href: '/dashboard#bus_employee_maintenance', icon: FaTools },
    ];
}

function buildEmployeeDashboardSections(
    employeeServiceType: ServiceType | string | null | undefined,
    {
        employeeDashboardLabel,
        employeeDashboardIcon,
    }: Pick<ServiceAwareLabels, 'employeeDashboardLabel' | 'employeeDashboardIcon'>
): MenuItem[] {
    switch (employeeServiceType) {
        case ServiceType.HOTEL_BOOKING:
            return buildHotelServiceEmployeeDashboardSections();
        case ServiceType.TRANSPORT_SERVICE:
            return buildBusServiceEmployeeDashboardSections();
        default:
            return [
                {
                    label: employeeDashboardLabel,
                    href: '/dashboard#service_maintenance_dashboard',
                    icon: employeeDashboardIcon,
                },
            ];
    }
}

function buildDashboardSectionMenu(
    labels: ServiceAwareLabels,
    serviceType?: ServiceType | string | null,
    employeeServiceType?: ServiceType | string | null
): SidebarMenuConfig {
    return {
        MASTER_ADMIN: [
            { label: 'Entity Management', href: '/dashboard#entity_management', icon: FaBuilding },
            { label: 'Locations', href: '/dashboard#locations_management', icon: FaMapMarkerAlt },
            { label: 'Categories', href: '/dashboard#category_management', icon: FaTags },
            { label: 'User Management', href: '/dashboard#users_management', icon: FaUsers },
            { label: 'Consumer Complaints', href: '/dashboard#complain_management', icon: FaExclamationCircle },
            { label: 'Wallet Options', href: '/dashboard#wallet_management', icon: FaWallet },
            { label: 'Site Settings', href: '/dashboard#site_settings_management', icon: FaCog },
        ],
        SERVICE_ADMIN: buildServiceAdminDashboardSections(serviceType, labels),
        EMPLOYEE: buildEmployeeDashboardSections(
            employeeServiceType ?? serviceType,
            labels
        ),
        USER: [
            { label: 'Active & Ongoing', href: '/dashboard#user_activity_active', icon: FaRoute },
            { label: 'My Bookings', href: '/dashboard#user_activity_booked', icon: FaCalendarCheck },
            { label: 'Transaction History', href: '/dashboard#user_activity_transactions', icon: FaExchangeAlt },
            { label: 'Bookmarks', href: '/dashboard#bookmarks_section', icon: FaBookmark },
            { label: 'My Complaints', href: '/dashboard#submitted_complaints_section', icon: FaExclamationCircle },
        ],
    };
}

function buildSitePagesMenu({
    serviceAdminDashboardIcon,
    employeeDashboardIcon,
}: ServiceAwareLabels): SidebarMenuConfig {
    return {
        MASTER_ADMIN: [
            { label: 'Dashboard', href: '/dashboard', icon: FaTachometerAlt },
            { label: 'Home', href: '/', icon: FaHome },
            { label: 'Hotels', href: '/hotels', icon: FaHotel },
            { label: 'Tour Spots', href: '/tour-spots', icon: FaMapMarkedAlt },
            { label: 'Activity Spots', href: '/activity-spots', icon: FaHiking },
            { label: 'Guides', href: '/guides', icon: FaUserTie },
            { label: 'Users', href: '/user_profile', icon: FaUsers },
            { label: 'Tour Packages', href: '/tour-builder/tours', icon: FaSuitcase },
        ],
        SERVICE_ADMIN: [
            { label: 'Dashboard', href: '/dashboard', icon: serviceAdminDashboardIcon },
            { label: 'Home', href: '/', icon: FaHome },
            {
                label: 'More features coming soon!',
                href: '/dashboard#service_admin_dashboard',
                icon: FaTools,
            },
        ],
        EMPLOYEE: [
            { label: 'Dashboard', href: '/dashboard', icon: employeeDashboardIcon },
            { label: 'Home', href: '/', icon: FaHome },
            {
                label: 'More features coming soon!',
                href: '/dashboard#service_maintenance_dashboard',
                icon: FaTools,
            },
        ],
        USER: [
            { label: 'Dashboard', href: '/dashboard', icon: FaTachometerAlt },
            { label: 'Home', href: '/', icon: FaHome },
            { label: 'Community', href: '/community', icon: FaComments },
            { label: 'Bookings', href: '/booking', icon: FaCalendarCheck },
        ],
    };
}

function buildHotelServiceAdminQuickActions(hotelId?: string | null): MenuItem[] {
    const items: MenuItem[] = [];

    if (hotelId) {
        items.push({
            label: 'Edit Hotel Profile',
            href: `/hotels/${hotelId}/edit`,
            icon: FaEdit,
        });
    }

    items.push(
        {
            label: 'Create New Room Type',
            href: '/dashboard?createRoomType=1#hotel_admin_rooms',
            icon: FaPlus,
        },
        {
            label: 'Review Customer Complaints',
            href: '/dashboard#hotel_admin_complaints',
            icon: FaExclamationCircle,
        }
    );

    return items;
}

function buildServiceAdminQuickActions(
    serviceType?: ServiceType | string | null,
    hotelId?: string | null
): MenuItem[] {
    switch (serviceType) {
        case ServiceType.HOTEL_BOOKING:
            return buildHotelServiceAdminQuickActions(hotelId);
        default:
            return [];
    }
}

function buildQuickActionsMenu(
    _labels: ServiceAwareLabels,
    serviceType?: ServiceType | string | null,
    _employeeServiceType?: ServiceType | string | null,
    serviceEntityId?: string | null
): SidebarMenuConfig {
    return {
        MASTER_ADMIN: [
            { label: 'Create New Hotel', href: '/hotels/create', icon: FaHotel },
            { label: 'List New Guide', href: '/guides/create', icon: FaUserTie },
            { label: 'Add New Activity Provider', href: '/activity-spots/create', icon: FaHiking },
            { label: 'Build Tour Package', href: '/tour-builder', icon: FaSuitcase },
            { label: 'Create New Transport Service', href: '/tour-builder', icon: FaSuitcase },
            { label: 'Review Community Posts', href: '/community/pending-posts-admin', icon: FaComments },
        ],
        SERVICE_ADMIN: buildServiceAdminQuickActions(serviceType, serviceEntityId),
        EMPLOYEE: [],
        USER: [
            { label: 'Book a stay', href: '/booking/hotel', icon: FaHotel },
            { label: 'Go somewhere', href: '/booking/bus', icon: FaBus },
            { label: 'Find a guide', href: '/booking/guide', icon: FaUserTie },
            { label: 'Track Seat Bookings', href: '/booking/trackers', icon: FaTicketAlt },
            { label: 'Make a community post', href: '/community?createPost=1', icon: FaComments },
        ],
    };
}

const personalizeMenu: SidebarMenuConfig = {
    MASTER_ADMIN: [
        { label: 'Profile Info', href: '/dashboard#dashboard_profile', icon: FaUserCircle },
        { label: 'Activity History', href: '/dashboard#activity_history', icon: FaHistory },
        { label: 'Settings', href: '#', icon: FaCog, disabled: true },
    ],
    SERVICE_ADMIN: [
        { label: 'Profile Info', href: '/dashboard#dashboard_profile', icon: FaUserCircle },
        { label: 'Activity History', href: '/dashboard#activity_history', icon: FaHistory },
        { label: 'Settings', href: '#', icon: FaCog, disabled: true },
    ],
    EMPLOYEE: [
        { label: 'Profile Info', href: '/dashboard#dashboard_profile', icon: FaUserCircle },
        { label: 'Settings', href: '#', icon: FaCog, disabled: true },
    ],
    USER: [
        { label: 'Profile Info', href: '/dashboard#dashboard_profile', icon: FaUserCircle },
        { label: 'Activity History', href: '/dashboard#activity_history', icon: FaHistory },
        { label: 'Settings', href: '#', icon: FaCog, disabled: true },
    ],
};

const scrollBarStyle = `
    .sidebar-scrollable {
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
        transition: scrollbar-color 0.3s ease;
    }
    .sidebar-scrollable:hover {
        scrollbar-color: var(--theme-teal) var(--theme-section-bg);
    }
    .sidebar-scrollable::-webkit-scrollbar {
        width: 8px;
    }
    .sidebar-scrollable::-webkit-scrollbar-track {
        background: transparent;
        transition: background 0.3s ease;
    }
    .sidebar-scrollable:hover::-webkit-scrollbar-track {
        background: var(--theme-section-bg);
    }
    .sidebar-scrollable::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 4px;
        transition: background 0.3s ease;
    }
    .sidebar-scrollable:hover::-webkit-scrollbar-thumb {
        background: var(--theme-teal);
    }
    .sidebar-scrollable::-webkit-scrollbar-thumb:hover {
        background: var(--theme-teal-hover);
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
    isDesktopSidebar?: boolean;
};

const SidebarMenuBlock = ({
    menuSectionName,
    opensOnHover = false,
    currentUserRole,
    menuConfig,
    isDesktopSidebar = false,
}: SidebarMenuBlockProps) => {
    let dashboardItems: MenuItem[] = [];

    if (!currentUserRole) {
        dashboardItems = [
            { label: 'Loading', href: '#', icon: FaSpinner, isPlaceholder: true },
            { label: 'Loading', href: '#', icon: FaSpinner, isPlaceholder: true },
            { label: 'Loading', href: '#', icon: FaSpinner, isPlaceholder: true },
        ];
    } else if (menuConfig[currentUserRole]) {
        dashboardItems = menuConfig[currentUserRole];
    }

    if (currentUserRole && dashboardItems.length === 0) return null;

    const visibleItems = dashboardItems.filter((item) => {
        if (item.hiddenFor && currentUserRole && item.hiddenFor.includes(currentUserRole)) {
            return false;
        }
        return true;
    });

    return [
        <div
            key="dashboard-sections-header"
            className={`relative text-white theme-sidebar-header font-sans ${
                isDesktopSidebar
                    ? 'px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-left border-b border-white/15'
                    : 'px-2 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-left border-b border-[var(--theme-deep-green)]'
            }`}
        >
            {menuSectionName}
        </div>,
        <ul
            key="dashboard-sections-list"
            className={`flex flex-col font-sans bg-[var(--theme-section-bg)] ${
                isDesktopSidebar ? 'py-1' : 'py-0.5'
            }`}
        >
            {opensOnHover && (
                <div
                    className="absolute -right-[3.25rem] -top-1 h-[8%] w-[50px] bg-green-700 rounded-r-md cursor-pointer hover:bg-green-800 transition-colors z-40 relative overflow-hidden"
                >
                    <div className="absolute w-5 h-5 bg-red-600 rounded-full left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
            )}

            {visibleItems.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === visibleItems.length - 1;

                const linkContent: ReactNode = (
                    <>
                        {Icon && (
                            <span
                                className={`flex shrink-0 items-center justify-center rounded-md bg-[var(--theme-card-bg)] text-[var(--theme-teal)] ${
                                    isDesktopSidebar
                                        ? 'h-8 w-8 text-[0.95rem]'
                                        : 'h-5 w-5 text-[0.7rem]'
                                }`}
                            >
                                <Icon aria-hidden />
                            </span>
                        )}
                        <span
                            className={
                                isDesktopSidebar
                                    ? 'truncate leading-snug'
                                    : 'min-w-0 flex-1 whitespace-normal [overflow-wrap:normal] [word-break:normal] leading-5'
                            }
                        >
                            {item.label}
                        </span>
                    </>
                );

                return (
                    <li key={`${item.href}-${index}`}>
                        <Link
                            className={
                                isDesktopSidebar
                                    ? `group flex w-full items-center gap-3 px-3.5 py-2.5 text-sm text-[var(--theme-text)] transition-colors duration-150 hover:bg-[var(--theme-card-bg)] hover:text-[var(--theme-teal)] ${
                                          !isLast
                                              ? 'border-b border-[color:color-mix(in_srgb,var(--theme-border-subtle)_95%,transparent)]'
                                              : ''
                                      } ${item.disabled ? 'opacity-45 cursor-not-allowed hover:bg-transparent hover:text-[var(--theme-text)]' : ''}${
                                          item.isPlaceholder ? ' opacity-0 pointer-events-none' : ''
                                      }`
                                    : `group flex w-full items-start gap-2 px-1.5 py-2 text-xs text-[var(--theme-text)] transition-colors duration-150 hover:bg-[var(--theme-card-bg)] hover:text-[var(--theme-teal)] ${
                                          !isLast
                                              ? 'border-b border-[color:color-mix(in_srgb,var(--theme-border-subtle)_95%,transparent)]'
                                              : ''
                                      } ${item.disabled ? 'opacity-45 cursor-not-allowed hover:bg-transparent hover:text-[var(--theme-text)]' : ''}${
                                          item.isPlaceholder ? ' opacity-0 pointer-events-none' : ''
                                      }`
                            }
                            href={item.href}
                            onClick={(e) => item.disabled && e.preventDefault()}
                        >
                            {linkContent}
                        </Link>
                    </li>
                );
            })}
        </ul>,
    ];
};

type SidebarMenuProps = {
    className?: string;
    style?: React.CSSProperties;
    isPopOutSidebar: boolean;
    opensOnHover?: boolean;
    setSidebarVisibility?: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarMenuWithRef = forwardRef<HTMLDivElement, SidebarMenuProps>(
    ({ className, style, isPopOutSidebar, opensOnHover = false, setSidebarVisibility }, ref) => {
        const pathName = usePathname();
        const router = useRouter();

        const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
        const isAuthenticated = authResponse?.data?.isAuthenticated || false;
        const currentUserId = authResponse?.data?.userId;
        const currentUserRole = authResponse?.data?.userRole;
        const isDesktopSidebar = !isPopOutSidebar;

        const { data: userDetailResponse } = UserApi.useGetOwnUserDetailRQ(
            currentUserId || '',
            isAuthenticated && !!currentUserId
        );
        const userDetail = userDetailResponse?.data;

        const serviceAwareLabels = useMemo(
            () =>
                getServiceAwareLabels(
                    userDetail?.serviceType,
                    userDetail?.employeeServiceType ?? userDetail?.serviceType
                ),
            [userDetail?.serviceType, userDetail?.employeeServiceType]
        );

        const dashboardSectionMenu = useMemo(
            () =>
                buildDashboardSectionMenu(
                    serviceAwareLabels,
                    userDetail?.serviceType,
                    userDetail?.employeeServiceType ?? userDetail?.serviceType
                ),
            [
                serviceAwareLabels,
                userDetail?.serviceType,
                userDetail?.employeeServiceType,
            ]
        );
        const sitePagesMenu = useMemo(
            () => buildSitePagesMenu(serviceAwareLabels),
            [serviceAwareLabels]
        );
        const quickActionsMenu = useMemo(
            () =>
                buildQuickActionsMenu(
                    serviceAwareLabels,
                    userDetail?.serviceType,
                    userDetail?.employeeServiceType ?? userDetail?.serviceType,
                    userDetail?.serviceEntityId
                ),
            [
                serviceAwareLabels,
                userDetail?.serviceType,
                userDetail?.employeeServiceType,
                userDetail?.serviceEntityId,
            ]
        );

        const onLogInPrompt = () => {
            router.push('/login');
            onClose();
        };

        const onClose = () => {
            if (setSidebarVisibility) setSidebarVisibility(false);
        };

        const smallScreenStyle =
            'absolute top-[calc(100%-1rem)] min-h-screen md:h-auto left-0 md:hidden w-[120%] border-1 border-[var(--theme-deep-green)] bg-[var(--theme-section-bg)] z-50 flex flex-col ' +
            className;
        const bigScreenStyle =
            'border border-[color:color-mix(in_srgb,var(--theme-teal)_35%,transparent)] bg-[var(--theme-section-bg)] z-50 flex flex-col h-screen shadow-sm ' +
            className;

        //WHEN NOT LOGGED IN
        if (!isAuthenticated)
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

                    <div
                        ref={ref}
                        className={isPopOutSidebar ? smallScreenStyle : bigScreenStyle}
                        style={style}
                    >
                        {isPopOutSidebar && (
                            <div>
                                <div
                                    className="flex justify-center items-center min-h-[120px] font-bold text-white text-3xl bg-[var(--theme-teal)]
                        border-b-2 border-[var(--theme-deep-green)]"
                                >
                                    Cholo BD!
                                </div>
                                <button
                                    className="w-[100%] h-[40px] text-lg text-white font-sans theme-btn-teal"
                                    onClick={() => onClose()}
                                >
                                    Close
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            <div className="relative p-3 text-xl text-center border-b-2 text-white font-sans overflow-visible theme-sidebar-header">
                                Hello there!
                                {opensOnHover && (
                                    <div className="absolute flex justify-center items-center -right-[3.25rem] -top-1 h-[108%] w-[50px] bg-[var(--theme-teal)] rounded-r-md cursor-pointer hover:bg-[var(--theme-teal-hover)] transition-colors z-40">
                                        <div className="w-[50px] h-[100%] bg-emerald-700 relative flex items-center justify-center rounded-sm">
                                            <div className="w-5 h-5 bg-red-600 rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto sidebar-scrollable">
                                <div className="flex flex-col font-sans">
                                    <p className="text-lg pt-20 pb-10 theme-text-teal text-center">
                                        Log In to access additional features
                                    </p>
                                    <button
                                        className="w-[100%] h-[40px] mb-10 text-lg text-center theme-btn-teal"
                                        onClick={() => onLogInPrompt()}
                                    >
                                        Log In
                                    </button>
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

                <div
                    ref={ref}
                    className={isPopOutSidebar ? smallScreenStyle : bigScreenStyle}
                    style={style}
                >
                    {isPopOutSidebar && (
                        <div className="relative font-satisfy">
                            <div
                                className="flex justify-center items-center min-h-[80px] md:min-h-[120px] font-bold text-white text-2xl md:text-3xl
                            bg-[var(--theme-teal)] border-b-1 border-t-2 border-[var(--theme-deep-green)]"
                            >
                                Cholo BD
                            </div>

                            <button
                                className="absolute top-0 right-0 w-[20px] h-[20px] text-lg text-center text-red-400"
                                onClick={() => onClose()}
                            >
                                <FaWindowClose />
                            </button>
                        </div>
                    )}

                    <div className="relative">
                        {opensOnHover && (
                            <div className="absolute flex justify-center items-center -right-[3.25rem] -top-1 h-[11.5%] w-[50px] bg-[var(--theme-teal)] rounded-r-md cursor-pointer hover:bg-[var(--theme-teal-hover)] transition-colors z-40">
                                <div className="w-[50px] h-[100%] bg-emerald-700 relative flex items-center justify-center rounded-sm">
                                    <div className="w-5 h-5 bg-red-600 rounded-full" />
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto sidebar-scrollable max-h-[75vh] md:max-h-[80vh]">
                            {pathName === '/dashboard' && (
                                <SidebarMenuBlock
                                    menuSectionName="Dashboard Sections"
                                    opensOnHover={opensOnHover}
                                    currentUserRole={currentUserRole}
                                    menuConfig={dashboardSectionMenu}
                                    isDesktopSidebar={isDesktopSidebar}
                                />
                            )}

                            <SidebarMenuBlock
                                menuSectionName="Pages"
                                opensOnHover={opensOnHover}
                                currentUserRole={currentUserRole}
                                menuConfig={sitePagesMenu}
                                isDesktopSidebar={isDesktopSidebar}
                            />

                            <SidebarMenuBlock
                                menuSectionName="Quick Actions"
                                opensOnHover={opensOnHover}
                                currentUserRole={currentUserRole}
                                menuConfig={quickActionsMenu}
                                isDesktopSidebar={isDesktopSidebar}
                            />

                            <SidebarMenuBlock
                                menuSectionName="Personalize"
                                opensOnHover={opensOnHover}
                                currentUserRole={currentUserRole}
                                menuConfig={personalizeMenu}
                                isDesktopSidebar={isDesktopSidebar}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }
);

SidebarMenuWithRef.displayName = 'SidebarMenuWithRef';

export const MotionSidebarMenu = motion(SidebarMenuWithRef);

export default SidebarMenuWithRef;
