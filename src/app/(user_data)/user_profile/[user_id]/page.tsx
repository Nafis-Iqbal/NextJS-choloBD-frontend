"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { UserApi, AuthApi, HotelApi, ActivitySpotApi, GuideApi } from "@/services/api";
import { Role, UserStatus, ServiceType } from "@/types/enums";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import DivGap from "@/components/custom-elements/UIUtilities";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { ImageUploadButton } from "@/components/custom-elements/ImageUploadButton";
import { EditButton } from "@/components/custom-elements/Buttons";
import { CustomCheckboxInput, CustomMiniTextInput, CustomSelectInput } from "@/components/custom-elements/CustomInputElements";

type ServiceEntityOption = { id: string; name: string };

function asEntityList<T>(data: unknown): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data as T[];
    if (
        typeof data === "object" &&
        data !== null &&
        "results" in data &&
        Array.isArray((data as { results: unknown }).results)
    ) {
        return (data as { results: T[] }).results;
    }
    return [];
}

function getEntitiesForServiceType(
    type: string | null | undefined,
    hotelsData: unknown,
    activitySpotsData: unknown,
    guidesData: unknown
): ServiceEntityOption[] {
    switch (type) {
        case ServiceType.HOTEL_BOOKING:
            return asEntityList<Hotel>(hotelsData).map((hotel) => ({
                id: hotel.id,
                name: hotel.name,
            }));
        case ServiceType.ACTIVITY_BOOKING:
            return asEntityList<ActivitySpot>(activitySpotsData).map((spot) => ({
                id: spot.id,
                name: spot.name,
            }));
        case ServiceType.GUIDE_SERVICE:
            return asEntityList<Guide>(guidesData).map((guide) => ({
                id: guide.id,
                name: `${guide.firstName} ${guide.lastName}`.trim() || guide.id,
            }));
        default:
            return [];
    }
}

function getServiceEntityLabel(type: string | null | undefined): string {
    switch (type) {
        case ServiceType.HOTEL_BOOKING:
            return "Hotel";
        case ServiceType.ACTIVITY_BOOKING:
            return "Activity Spot";
        case ServiceType.GUIDE_SERVICE:
            return "Guide Profile";
        case ServiceType.TRANSPORT_SERVICE:
            return "Transport Service";
        default:
            return "Service Entity";
    }
}

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();

    const {openNotificationPopUpMessage} = useGlobalUI();

    const { data: authResponse, isLoading } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserRole = authResponse?.data?.userRole;
    
    const userId = params.user_id as string;

    const [userName, setUserName] = useState<string>("");
    const [isEditingUserName, setIsEditingUserName] = useState<boolean>(false);

    const [userRole, setUserRole] = useState<string | null>("");
    const [isEditingUserRole, setIsEditingUserRole] = useState<boolean>(false);

    const [userStatus, setUserStatus] = useState<string | null>("");
    const [isEditingUserStatus, setIsEditingUserStatus] = useState<boolean>(false);

    const [serviceType, setServiceType] = useState<string | null>("");
    const [isEditingServiceType, setIsEditingServiceType] = useState<boolean>(false);

    const [serviceEntity, setServiceEntity] = useState<string | null>("");
    const [serviceEntitySearch, setServiceEntitySearch] = useState<string>("");
    const [isEditingServiceEntity, setIsEditingServiceEntity] = useState<boolean>(false);

    const [employeeServiceType, setEmployeeServiceType] = useState<string | null>("");
    const [isEditingEmployeeServiceType, setIsEditingEmployeeServiceType] = useState<boolean>(false);

    const [employeeServiceEntity, setEmployeeServiceEntity] = useState<string | null>("");
    const [employeeServiceEntitySearch, setEmployeeServiceEntitySearch] = useState<string>("");
    const [isEditingEmployeeServiceEntity, setIsEditingEmployeeServiceEntity] = useState<boolean>(false);

    const [isUserUpdateConfirmationVisible, setIsUserUpdateConfirmationVisible] = useState<boolean>(false);

    const { data: userDetailData} = UserApi.useGetUserDetailRQ(userId, true);

    const needsHotels =
        serviceType === ServiceType.HOTEL_BOOKING ||
        employeeServiceType === ServiceType.HOTEL_BOOKING;
    const needsActivitySpots =
        serviceType === ServiceType.ACTIVITY_BOOKING ||
        employeeServiceType === ServiceType.ACTIVITY_BOOKING;
    const needsGuides = serviceType === ServiceType.GUIDE_SERVICE;

    const { data: hotelsData } = HotelApi.useGetAllHotelsRQ(needsHotels ? "" : undefined);
    const { data: activitySpotsData } = ActivitySpotApi.useGetAllActivitySpotsRQ(
        needsActivitySpots ? "" : undefined
    );
    const { data: guidesData } = GuideApi.useGetAllGuidesRQ(
        needsGuides ? { limit: 100 } : undefined
    );

    const { mutate: updateUserRoleStatus } = UserApi.useUpdateUserRoleStatusServiceRQ(
        (response) => {
            if (response.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["users", userId] });

                if(isEditingUserRole) {
                    setIsEditingUserRole(false);
                    openNotificationPopUpMessage("User role updated successfully!");
                }
                else if(isEditingUserStatus) {
                    setIsEditingUserStatus(false);
                    openNotificationPopUpMessage("User status updated successfully!");
                }
                else if(isEditingServiceType) {
                    setIsEditingServiceType(false);
                    openNotificationPopUpMessage("Service type assigned successfully!");
                }
                else if(isEditingServiceEntity) {
                    setIsEditingServiceEntity(false);
                    setServiceEntitySearch("");
                    openNotificationPopUpMessage("Service entity assigned successfully!");
                }
                else if(isEditingEmployeeServiceType) {
                    setIsEditingEmployeeServiceType(false);
                    openNotificationPopUpMessage("Employee service type assigned successfully!");
                }
                else if(isEditingEmployeeServiceEntity) {
                    setIsEditingEmployeeServiceEntity(false);
                    setEmployeeServiceEntitySearch("");
                    openNotificationPopUpMessage("Employee service entity assigned successfully!");
                }
            } 
            else openNotificationPopUpMessage(response.message || "Failed to update user. Please try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to update user. An error occurred.");
        }
    );

    const { mutate: updateUserNameOrImage } = UserApi.useUpdateUserRQ(
        (response) => {
            if (response.status === "success") {
                setIsEditingUserName(false);
                queryClient.invalidateQueries({ queryKey: ["users", userId] });

                openNotificationPopUpMessage("User info/status updated successfully!");
            } 
            else openNotificationPopUpMessage("Failed to update user info. Please try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to update user info. An error occurred.");
        }
    );

    useEffect(() => {
        if (userDetailData?.data) {
            setUserName(userDetailData.data.userName || "");
            setUserRole(userDetailData.data.role || "");
            setUserStatus(userDetailData.data.userStatus || "");
            setServiceType(userDetailData.data.serviceType || "");
            setServiceEntity(userDetailData.data.serviceEntityId || "");
            setEmployeeServiceType(userDetailData.data.employeeServiceType || "");
            setEmployeeServiceEntity(userDetailData.data.employeeServiceEntityId || "");
        }
    }, [userDetailData]);

    useEffect(() => {
        if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined || (currentUserRole !== "MASTER_ADMIN" && currentUserId !== userId  ))) {
            router.replace("/");
        }
    }, [isLoading, isAuthenticated, currentUserRole, router]);

    if (isLoading) {
        return null; // or <FullPageLoader />
    }

    const isOwnProfile = currentUserId === userId;
    const userDetail = userDetailData?.data as User;
    const showBanUnbanOption = currentUserRole === "MASTER_ADMIN" && currentUserId !== userId && userDetailData?.data?.role !== "MASTER_ADMIN";
    const showAllowOption = userDetail?.userStatus === "BANNED" || userDetail?.userStatus === "RESTRICTED";
    
    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        const startsWithNumber = /^\d/.test(newValue);
        if (startsWithNumber) return;

        if(e.target.name === "user_name") setUserName(newValue);
    };

    const onUpdateUserName = () => {
        updateUserNameOrImage({ id: userDetail?.id || "", userName: userName });
    };

    const profilePicUploadURLBuilder = (userId: string) => {
        return `cholo_bd/users/${userId}/image`;
    }

    const handleCheckboxChange = (role: Role) => {
        setUserRole(prev => (prev === role ? null : role));
    };

    const handleServiceTypeChange = (type: ServiceType) => {
        setServiceType(prev => (prev === type ? null : type));
        setServiceEntity("");
        setServiceEntitySearch("");
    };

    const onUpdateUserRoleClicked = () => {
        setIsUserUpdateConfirmationVisible(true);
    }

    const onUpdateServiceType = () => {
        updateUserRoleStatus({ userId: userDetail?.id || "", userServiceType: serviceType as ServiceType });
    }

    const onUpdateServiceEntity = () => {
        if (!serviceEntity) return;
        updateUserRoleStatus({
            userId: userDetail?.id || "",
            serviceEntityId: serviceEntity,
        });
    }

    const onUpdateUserRole = () => {
        setIsUserUpdateConfirmationVisible(false);
        updateUserRoleStatus({ userId: userDetail?.id || "", role: userRole ? userRole : userDetail?.role });
    }
    
    const onBanUserClicked = () => {
        if(showAllowOption) setUserStatus("ACTIVE");
        else setUserStatus("BANNED")

        setIsEditingUserStatus(true);
        setIsUserUpdateConfirmationVisible(true);
    }

    const onUpdateUserStatus = () => {
        setIsUserUpdateConfirmationVisible(false);
        updateUserRoleStatus({ userId: userDetail?.id || "", userStatus: (userStatus || userDetail?.userStatus) as UserStatus });
    }

    const handleServiceEntitySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setServiceEntitySearch(e.target.value);
    };

    const serviceEntityOptions = getEntitiesForServiceType(
        serviceType || userDetailData?.data?.serviceType,
        hotelsData?.data,
        activitySpotsData?.data,
        guidesData?.data
    );

    const filteredEntities = serviceEntityOptions.filter((entity) =>
        entity.name.toLowerCase().includes(serviceEntitySearch.toLowerCase())
    );

    const handleEmployeeServiceTypeChange = (type: ServiceType) => {
        if (type === ServiceType.GUIDE_SERVICE) return;
        setEmployeeServiceType(prev => (prev === type ? null : type));
        setEmployeeServiceEntity("");
        setEmployeeServiceEntitySearch("");
    };

    const onUpdateEmployeeServiceType = () => {
        if (employeeServiceType === ServiceType.GUIDE_SERVICE) {
            openNotificationPopUpMessage("GUIDE_SERVICE does not support EMPLOYEE assignment.");
            return;
        }
        updateUserRoleStatus({
            userId: userDetail?.id || "",
            employeeServiceType: employeeServiceType as ServiceType,
        });
    }

    const handleEmployeeServiceEntitySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployeeServiceEntitySearch(e.target.value);
    };

    const employeeServiceEntityOptions = getEntitiesForServiceType(
        employeeServiceType || userDetailData?.data?.employeeServiceType,
        hotelsData?.data,
        activitySpotsData?.data,
        undefined
    );

    const filteredEmployeeEntities = employeeServiceEntityOptions.filter((entity) =>
        entity.name.toLowerCase().includes(employeeServiceEntitySearch.toLowerCase())
    );

    const onUpdateEmployeeServiceEntity = () => {
        if (!employeeServiceEntity) return;
        if (
            (employeeServiceType || userDetail?.employeeServiceType) ===
            ServiceType.GUIDE_SERVICE
        ) {
            openNotificationPopUpMessage("GUIDE_SERVICE does not support EMPLOYEE assignment.");
            return;
        }
        updateUserRoleStatus({
            userId: userDetail?.id || "",
            employeeServiceEntityId: employeeServiceEntity,
        });
    }

    const cancelUserUpdate = () => {
        if(isEditingUserRole) {
            setIsEditingUserRole(false);
        } else if(isEditingUserStatus) {
            setIsEditingUserStatus(false);
        } else if(isEditingServiceType) {
            setIsEditingServiceType(false);
        } else if(isEditingEmployeeServiceType) {
            setIsEditingEmployeeServiceType(false);
        }
        
        setIsUserUpdateConfirmationVisible(false);
    }

    return (
        <section className="flex flex-col p-3 sm:p-4 font-sans overflow-x-hidden theme-text" id="user_profile_detail">
            <div className="ml-1 md:ml-6 max-w-4xl flex flex-col">
                <h3 className="text-2xl font-bold theme-text-teal">User Profile Details</h3>
                <p className="theme-text-muted mt-1">View detailed information for {userDetail?.userName || "Unknown"}.</p>

                <ConfirmationModal 
                    isVisible={isUserUpdateConfirmationVisible}
                    message={isEditingUserRole ? "Are you sure you want to update this user's role?" : 
                        "Are you sure you want to ban this user?"}
                    onConfirm={isEditingUserStatus ? onUpdateUserStatus : onUpdateUserRole} 
                    onCancel={cancelUserUpdate} 
                />

                <div className="theme-section rounded-xl p-4 sm:p-6 mt-6 flex flex-col space-y-5">
                    <div className="relative w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] rounded-lg overflow-hidden theme-outline shrink-0">
                        <Image 
                            className="object-cover" 
                            style={{ backgroundColor: "var(--theme-card-bg)" }}
                            src={userDetail?.imageUrl || "/NoUserImage.jpeg"} 
                            alt="Profile Picture" 
                            fill
                        />

                        {isOwnProfile && 
                            <ImageUploadButton
                                className="absolute bottom-1 right-1" 
                                imageSrc="/edit_icon.png"
                                resourceId={userDetail?.id || ""}
                                pic_url_Builder={profilePicUploadURLBuilder}
                                updateResourceMutation={({id, imageUrl} : {id: string, imageUrl: string}) =>updateUserNameOrImage({ id: currentUserId || "", imageUrl } )}
                            />
                        }
                    </div>
                    
                    <div className="relative flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="theme-text-muted">Known as&nbsp;&nbsp;<span className="text-2xl font-semibold theme-text-teal">{userDetail?.userName || 'N/A'}</span></p>

                            {isOwnProfile && !isEditingUserName && 
                                <EditButton 
                                    onClick={() => setIsEditingUserName(true)}
                                    className=""
                                >
                                </EditButton>
                            }
                        </div>

                        {isEditingUserName &&
                            <div className="flex flex-wrap items-center p-2 gap-2 md:gap-4 theme-card rounded-md">
                                <CustomMiniTextInput 
                                    type="text"
                                    name="user_name"
                                    value={userName}
                                    onChange={handleUserNameChange}
                                />

                                <button className="px-3 py-1.5 theme-btn-teal rounded text-sm" onClick={onUpdateUserName}>Update</button>
                                <button className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-sm" onClick={() => setIsEditingUserName(false)}>Cancel</button>
                            </div>
                        }

                        {userDetail?.userStatus === "BANNED" || userDetail?.userStatus === "RESTRICTED" ? (
                            <p className="text-sm text-red-500">This user is currently banned or restricted.</p>
                        ) : null}
                    </div>

                    <p className="theme-text-muted">User ID&nbsp;&nbsp;<span className="text-base sm:text-xl font-medium theme-text-teal break-all">{userDetail?.id || ""}</span></p>

                    <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                        <p className="theme-text-muted">First Name&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.firstName || 'N/A'}</span></p>
                        <p className="theme-text-muted">Last Name&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.lastName || 'N/A'}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-end">
                        <p className="theme-text-muted">Role is&nbsp;&nbsp;<span className="text-3xl font-semibold theme-text-teal">{userDetail?.role || 'USER'}</span></p>

                        {userDetail?.role !== "MASTER_ADMIN" && !isEditingUserRole && currentUserRole === "MASTER_ADMIN" && 
                            <button className="px-3 py-1.5 theme-btn-teal rounded text-sm text-white" onClick={() => setIsEditingUserRole(true)}>Change Role</button>
                        }

                        {isEditingUserRole &&
                            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center p-2 theme-card rounded-md w-full md:w-auto">
                                <CustomCheckboxInput
                                    label="Master Admin"
                                    checked={userRole === "MASTER_ADMIN"}
                                    onChange={() => handleCheckboxChange(Role.MASTER_ADMIN)}
                                    className="p-2 rounded-xs"
                                />

                                <CustomCheckboxInput
                                    label="Service Admin"
                                    checked={userRole === "SERVICE_ADMIN"}
                                    onChange={() => handleCheckboxChange(Role.SERVICE_ADMIN)}
                                    className="p-2 rounded-xs"
                                />

                                <CustomCheckboxInput
                                    label="Employee"
                                    checked={userRole === "EMPLOYEE"}
                                    onChange={() => handleCheckboxChange(Role.EMPLOYEE)}
                                    className="p-2 rounded-xs"
                                />

                                <button className="px-3 py-1.5 theme-btn-teal rounded text-sm" onClick={onUpdateUserRoleClicked}>Update</button>
                                <button className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-sm" onClick={() => setIsEditingUserRole(false)}>Cancel</button>
                            </div>
                        }
                    </div>
                    
                    {/* Admin Level Service Entity Edit */}
                    {userDetail?.role === "SERVICE_ADMIN" && (
                        <>
                            <div className="flex flex-wrap gap-3 items-end">
                                <p className="theme-text-muted">Service is&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.serviceType || "N/A"}</span></p>
                                
                                {!isEditingServiceType && currentUserRole === "MASTER_ADMIN" && 
                                    <button className="px-3 py-1.5 theme-btn-teal text-white rounded text-sm" onClick={() => setIsEditingServiceType(true)}>{userDetail?.serviceType ? "Change Service Type" : "Assign Service Type"}</button>
                                }
                            </div>

                            {isEditingServiceType &&
                                <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center p-2 theme-card rounded-md">
                                    <CustomCheckboxInput
                                        label="Hotel Booking"
                                        checked={serviceType === ServiceType.HOTEL_BOOKING}
                                        onChange={() => handleServiceTypeChange(ServiceType.HOTEL_BOOKING)}
                                        className="p-2 rounded-xs"
                                    />

                                    <CustomCheckboxInput
                                        label="Transport Service"
                                        checked={serviceType === ServiceType.TRANSPORT_SERVICE}
                                        onChange={() => handleServiceTypeChange(ServiceType.TRANSPORT_SERVICE)}
                                        className="p-2 rounded-xs"
                                    />

                                    <CustomCheckboxInput
                                        label="Activity Booking"
                                        checked={serviceType === ServiceType.ACTIVITY_BOOKING}
                                        onChange={() => handleServiceTypeChange(ServiceType.ACTIVITY_BOOKING)}
                                        className="p-2 rounded-xs"
                                    />

                                    <CustomCheckboxInput
                                        label="Guide Service"
                                        checked={serviceType === ServiceType.GUIDE_SERVICE}
                                        onChange={() => handleServiceTypeChange(ServiceType.GUIDE_SERVICE)}
                                        className="p-2 rounded-xs"
                                    />

                                    <button className="px-3 py-1.5 theme-btn-teal rounded text-sm" onClick={onUpdateServiceType}>Update</button>
                                    <button className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-sm" onClick={() => setIsEditingServiceType(false)}>Cancel</button>
                                </div>
                            }
                            
                            <div className="flex flex-wrap gap-3 items-end">
                                <p className="theme-text-muted">
                                    {serviceType === ServiceType.GUIDE_SERVICE ? "Guide Profile owner of " : "Admin of"}&nbsp;&nbsp;
                                    <span className="text-xl font-medium theme-text-teal">{userDetail?.serviceEntityName || "N/A"}</span>
                                </p>
                                
                                {!isEditingServiceEntity && currentUserRole === "MASTER_ADMIN" && 
                                    <button className="px-3 py-1.5 theme-btn-teal text-white rounded text-sm" onClick={() => setIsEditingServiceEntity(true)}>{userDetail?.serviceEntityName ? "Change Service Entity" : "Assign Service Entity"}</button>
                                }
                            </div>

                            {isEditingServiceEntity &&
                                <div className="flex flex-col space-y-4 p-3 theme-card rounded-md">
                                    {!serviceType && !userDetail?.serviceType ? (
                                        <p className="theme-text-subtle text-sm">
                                            Assign a service type before selecting a service entity.
                                        </p>
                                    ) : (serviceType || userDetail?.serviceType) === ServiceType.TRANSPORT_SERVICE ? (
                                        <p className="theme-text-subtle text-sm">
                                            Transport service listing is not available yet. Assign the transport entity ID via API when ready.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="flex flex-col space-y-2">
                                                <label className="theme-label text-sm">
                                                    Search {getServiceEntityLabel(serviceType || userDetail?.serviceType)}
                                                </label>
                                                <div className="relative">
                                                    <CustomMiniTextInput
                                                        type="text"
                                                        placeholder="Search by name..."
                                                        value={serviceEntitySearch}
                                                        onChange={handleServiceEntitySearch}
                                                        className="w-full"
                                                    />
                                                    
                                                    {serviceEntitySearch && filteredEntities.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 theme-card rounded-sm shadow-lg z-20 overflow-hidden">
                                                            {filteredEntities.slice(0, 4).map((entity) => (
                                                                <div
                                                                    key={entity.id}
                                                                    onClick={() => {
                                                                        setServiceEntity(entity.id);
                                                                        setServiceEntitySearch(entity.name);
                                                                    }}
                                                                    className="px-3 py-2 theme-text cursor-pointer border-b last:border-b-0 hover:opacity-80"
                                                                    style={{ borderColor: "var(--theme-deep-green)" }}
                                                                >
                                                                    {entity.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <CustomSelectInput
                                                    label={`Select a ${getServiceEntityLabel(serviceType || userDetail?.serviceType)}`}
                                                    value={serviceEntity || ""}
                                                    onChange={(e) => setServiceEntity(e.target.value || null)}
                                                    options={[
                                                        { label: `-- Select a ${getServiceEntityLabel(serviceType || userDetail?.serviceType)} --`, value: "" },
                                                        ...serviceEntityOptions.map((entity) => ({
                                                            label: entity.name,
                                                            value: entity.id
                                                        }))
                                                    ]}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        <button 
                                            className="px-3 py-1.5 theme-btn-teal text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={
                                                !serviceEntity ||
                                                (serviceType || userDetail?.serviceType) === ServiceType.TRANSPORT_SERVICE
                                            }
                                            onClick={() => onUpdateServiceEntity()}
                                        >
                                            Update
                                        </button>
                                        <button 
                                            className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
                                            onClick={() => {
                                                setIsEditingServiceEntity(false);
                                                setServiceEntitySearch("");
                                                setServiceEntity(userDetail?.serviceEntityId || "");
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            }
                        </>
                    )}

                    {/* Employee Level Service Entity Edit */}
                    {userDetail?.role === "EMPLOYEE" && (
                        <>
                            <div className="flex flex-wrap gap-3 items-end">
                                <p className="theme-text-muted">Employee of Service Type&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.employeeServiceType || "N/A"}</span></p>
                                
                                {!isEditingEmployeeServiceType && currentUserRole === "MASTER_ADMIN" && 
                                    <button className="px-3 py-1.5 theme-btn-teal text-white rounded text-sm" onClick={() => setIsEditingEmployeeServiceType(true)}>{userDetail?.employeeServiceType ? "Change Service Type of Employee" : "Assign Service Type to Employee"}</button>
                                }
                            </div>

                            {isEditingEmployeeServiceType &&
                                <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center p-2 theme-card rounded-md">
                                    <CustomCheckboxInput
                                        label="Hotel Booking"
                                        checked={employeeServiceType === ServiceType.HOTEL_BOOKING}
                                        onChange={() => handleEmployeeServiceTypeChange(ServiceType.HOTEL_BOOKING)}
                                        className="p-2 rounded-xs"
                                    />

                                    <CustomCheckboxInput
                                        label="Transport Service"
                                        checked={employeeServiceType === ServiceType.TRANSPORT_SERVICE}
                                        onChange={() => handleEmployeeServiceTypeChange(ServiceType.TRANSPORT_SERVICE)}
                                        className="p-2 rounded-xs"
                                    />

                                    <CustomCheckboxInput
                                        label="Activity Booking"
                                        checked={employeeServiceType === ServiceType.ACTIVITY_BOOKING}
                                        onChange={() => handleEmployeeServiceTypeChange(ServiceType.ACTIVITY_BOOKING)}
                                        className="p-2 rounded-xs"
                                    />

                                    <p className="theme-text-subtle text-xs w-full md:w-auto">
                                        Guide Service has no employee tier.
                                    </p>

                                    <button className="px-3 py-1.5 theme-btn-teal rounded text-sm" onClick={onUpdateEmployeeServiceType}>Update</button>
                                    <button className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-sm" onClick={() => setIsEditingEmployeeServiceType(false)}>Cancel</button>
                                </div>
                            }

                            <div className="flex flex-wrap gap-3 items-end">
                                <p className="theme-text-muted">Employee of Company&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.employeeServiceEntityName || "N/A"}</span></p>
                                
                                {!isEditingEmployeeServiceEntity && currentUserRole === "MASTER_ADMIN" && 
                                    <button className="px-3 py-1.5 theme-btn-teal text-white rounded text-sm" onClick={() => setIsEditingEmployeeServiceEntity(true)}>{userDetail?.employeeServiceEntityName ? "Change Employee Company" : "Assign Company to Employee"}</button>
                                }
                            </div>

                            {isEditingEmployeeServiceEntity &&
                                <div className="flex flex-col space-y-4 p-3 theme-card rounded-md">
                                    {!(employeeServiceType || userDetail?.employeeServiceType) ? (
                                        <p className="theme-text-subtle text-sm">
                                            Assign an employee service type before selecting a company.
                                        </p>
                                    ) : (employeeServiceType || userDetail?.employeeServiceType) === ServiceType.GUIDE_SERVICE ? (
                                        <p className="theme-text-subtle text-sm">
                                            GUIDE_SERVICE does not support EMPLOYEE assignment. Guides are managed by a SERVICE_ADMIN only.
                                        </p>
                                    ) : (employeeServiceType || userDetail?.employeeServiceType) === ServiceType.TRANSPORT_SERVICE ? (
                                        <p className="theme-text-subtle text-sm">
                                            Transport service listing is not available yet. Assign the transport entity ID via API when ready.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="flex flex-col space-y-2">
                                                <label className="theme-label text-sm">
                                                    Search {getServiceEntityLabel(employeeServiceType || userDetail?.employeeServiceType)}
                                                </label>
                                                <div className="relative">
                                                    <CustomMiniTextInput
                                                        type="text"
                                                        placeholder="Search by name..."
                                                        value={employeeServiceEntitySearch}
                                                        onChange={handleEmployeeServiceEntitySearch}
                                                        className="w-full"
                                                    />

                                                    {employeeServiceEntitySearch && filteredEmployeeEntities.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 theme-card rounded-sm shadow-lg z-20 overflow-hidden">
                                                            {filteredEmployeeEntities.slice(0, 4).map((entity) => (
                                                                <div
                                                                    key={entity.id}
                                                                    onClick={() => {
                                                                        setEmployeeServiceEntity(entity.id);
                                                                        setEmployeeServiceEntitySearch(entity.name);
                                                                    }}
                                                                    className="px-3 py-2 theme-text cursor-pointer border-b last:border-b-0 hover:opacity-80"
                                                                    style={{ borderColor: "var(--theme-deep-green)" }}
                                                                >
                                                                    {entity.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <CustomSelectInput
                                                    label={`Select a ${getServiceEntityLabel(employeeServiceType || userDetail?.employeeServiceType)} for Employee`}
                                                    value={employeeServiceEntity || ""}
                                                    onChange={(e) => setEmployeeServiceEntity(e.target.value || null)}
                                                    options={[
                                                        {
                                                            label: `-- Select a ${getServiceEntityLabel(employeeServiceType || userDetail?.employeeServiceType)} --`,
                                                            value: "",
                                                        },
                                                        ...employeeServiceEntityOptions.map((entity) => ({
                                                            label: entity.name,
                                                            value: entity.id,
                                                        })),
                                                    ]}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        <button 
                                            className="px-3 py-1.5 theme-btn-teal text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={
                                                !employeeServiceEntity ||
                                                (employeeServiceType || userDetail?.employeeServiceType) === ServiceType.GUIDE_SERVICE ||
                                                (employeeServiceType || userDetail?.employeeServiceType) === ServiceType.TRANSPORT_SERVICE
                                            }
                                            onClick={() => onUpdateEmployeeServiceEntity()}
                                        >
                                            Update
                                        </button>
                                        <button 
                                            className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
                                            onClick={() => {
                                                setIsEditingEmployeeServiceEntity(false);
                                                setEmployeeServiceEntitySearch("");
                                                setEmployeeServiceEntity(userDetail?.employeeServiceEntityId || "");
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            }
                        </>
                    )}

                    <p className="theme-text-muted">Email Verified&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.emailVerified ? 'Yes' : 'No'}</span></p>

                    <h4 className="text-lg font-semibold theme-text-teal pt-2">Personal Details</h4>
                    
                    <div className="flex flex-col space-y-4">
                        <p className="theme-text-muted">Email is&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal break-all">{userDetail?.email || 'N/A'}</span></p>

                        <p className="theme-text-muted">Phone Number&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.phoneNumber || 'N/A'}</span></p>

                        <p className="theme-text-muted">Phone Verified&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.phoneVerified ? 'Yes' : 'No'}</span></p>

                        {userDetail?.emailVerified && (
                            <p className="theme-text-muted">Email verified on&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">
                                {new Date(userDetail?.emailVerified).toDateString()}
                            </span></p>
                        )}

                        {userDetail?.phoneVerified && (
                            <p className="theme-text-muted">Phone verified on&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">
                                {new Date(userDetail?.phoneVerified).toDateString()}
                            </span></p>
                        )}

                        <p className="theme-text-muted">Account created,&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{userDetail?.createdAt ? (new Date(userDetail.createdAt)).toDateString() : "N/A"}</span></p>
                    </div>

                    <h4 className="text-lg font-semibold theme-text-teal pt-2">Account Status & Financial Info</h4>
                    
                    <div className="flex flex-col space-y-4">
                        <p className="theme-text-muted">User Status&nbsp;&nbsp;<span className={`text-xl font-semibold ${userDetail?.userStatus === 'ACTIVE' ? 'theme-text-teal' : userDetail?.userStatus === 'BANNED' ? 'text-red-500' : 'text-yellow-600'}`}>{userDetail?.userStatus || 'N/A'}</span></p>

                        <p className="theme-text-muted">Payment Status&nbsp;&nbsp;<span className={`text-xl font-semibold ${userDetail?.paymentStatus === 'PAID' ? 'theme-text-teal' : 'text-yellow-600'}`}>{userDetail?.paymentStatus || 'N/A'}</span></p>

                        <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                            <p className="theme-text-muted">Total Earned&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">৳{userDetail?.earned || 0}</span></p>
                            <p className="theme-text-muted">Total Spent&nbsp;&nbsp;<span className="text-xl font-medium text-orange-500">৳{userDetail?.spent || 0}</span></p>
                        </div>

                        {userDetail?.wallet && (
                            <p className="theme-text-muted">Wallet Balance&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">৳{userDetail.wallet.balance || 0}</span></p>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 pt-1">
                        {showBanUnbanOption && !showAllowOption &&
                            <button 
                                className="px-3 py-1.5 w-fit bg-red-600 hover:bg-red-500 text-white rounded text-sm"
                                onClick={onBanUserClicked}
                            >
                                Ban User
                            </button>
                        }

                        {showBanUnbanOption && showAllowOption &&
                            <button 
                                className="px-3 py-1.5 w-fit theme-btn-teal text-white rounded text-sm"
                                onClick={onBanUserClicked}
                            >
                                Unban User
                            </button>
                        }
                    </div>
                    
                </div>
            </div>
            
            <DivGap customHeightGap="h-[80px]"/>
        </section>
    );
}
