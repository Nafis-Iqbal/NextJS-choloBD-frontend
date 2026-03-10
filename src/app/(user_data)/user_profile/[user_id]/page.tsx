"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { UserApi, AuthApi, HotelApi } from "@/services/api";
import { Role, UserStatus, ServiceType } from "@/types/enums";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import DivGap from "@/components/custom-elements/UIUtilities";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { ImageUploadButton } from "@/components/custom-elements/ImageUploadButton";
import { EditButton } from "@/components/custom-elements/Buttons";
import { CustomCheckboxInput, CustomMiniTextInput, CustomSelectInput } from "@/components/custom-elements/CustomInputElements";

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

    const [isUserUpdateConfirmationVisible, setIsUserUpdateConfirmationVisible] = useState<boolean>(false);

    const { data: userDetailData} = UserApi.useGetUserDetailRQ(userId, true);
    const { data: hotelsData } = HotelApi.useGetAllHotelsRQ(serviceType === "HOTEL_BOOKING" ? "" : undefined);

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
            } 
            else openNotificationPopUpMessage("Failed to update user. Please try again.");
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
            setServiceEntity(userDetailData.data.serviceAddressId || "");
        }
    }, [userDetailData]);

    useEffect(() => {
        if (!isLoading && (isAuthenticated === false || isAuthenticated === undefined || currentUserRole !== "MASTER_ADMIN")) {
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
    };

    const onUpdateUserRoleClicked = () => {
        setIsUserUpdateConfirmationVisible(true);
    }

    const onUpdateServiceType = () => {
        updateUserRoleStatus({ userId: userDetail?.id || "", userServiceType: serviceType as ServiceType });
    }

    const onUpdateServiceEntity = () => {
        // TODO: Call mutation to update service entity
        updateUserRoleStatus({ userId: userDetail?.id || "", serviceEntityId: serviceEntity || undefined });
        setIsEditingServiceEntity(false);
        setServiceEntitySearch("");
        setServiceEntity("");
        openNotificationPopUpMessage("Service entity assigned successfully!");
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

    const filteredEntities = serviceType === "HOTEL_BOOKING" 
        ? ((hotelsData?.data || []) as Hotel[]).filter((hotel: Hotel) => 
            hotel.name.toLowerCase().includes(serviceEntitySearch.toLowerCase())
        )
        : [];

    const cancelUserUpdate = () => {
        if(isEditingUserRole) {
            setIsEditingUserRole(false);
        } else if(isEditingUserStatus) {
            setIsEditingUserStatus(false);
        } else if(isEditingServiceType) {
            setIsEditingServiceType(false);
        }
        
        setIsUserUpdateConfirmationVisible(false);
    }

    return (
        <section className="flex flex-col p-2 font-sans overflow-x-hidden" id="user_profile_detail">
            <div className="ml-2 md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">User Profile Details</h3>
                <p className="text-green-200">View detailed information for {userDetail?.userName || "Unknown"}.</p>

                <ConfirmationModal 
                    isVisible={isUserUpdateConfirmationVisible}
                    message={isEditingUserRole ? "Are you sure you want to update this user's role?" : 
                        "Are you sure you want to ban this user?"}
                    onConfirm={isEditingUserStatus ? onUpdateUserStatus : onUpdateUserRole} 
                    onCancel={cancelUserUpdate} 
                />

                <div className="flex flex-col mt-8 space-y-5">
                    <div className="flex relative w-[180px] h-[180px]">
                        <Image 
                            className="bg-gray-100 object-cover" 
                            src={userDetail?.imageUrl || "/NoUserImage.jpeg"} 
                            alt="Profile Picture" 
                            fill
                        />

                        {isOwnProfile && 
                            <ImageUploadButton
                                className="absolute bottom-0 right-0" 
                                imageSrc="/edit_icon.png"
                                resourceId={userDetail?.id || ""}
                                pic_url_Builder={profilePicUploadURLBuilder}
                                updateResourceMutation={({id, imageUrl} : {id: string, imageUrl: string}) =>updateUserNameOrImage({ id: currentUserId || "", imageUrl } )}
                            />
                        }
                    </div>
                    
                    <div className="relative flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center space-x-3">
                        <div className="flex space-x-2">
                            <p>Known as&nbsp;&nbsp;<span className="text-2xl text-green-300">{userDetail?.userName || 'N/A'}</span></p>

                            {isOwnProfile && !isEditingUserName && 
                                <EditButton 
                                    onClick={() => setIsEditingUserName(true)}
                                    className=""
                                >
                                </EditButton>
                            }
                        </div>

                        {isEditingUserName &&
                            <div className="flex p-2 space-x-2 md:space-x-4 bg-gray-700 border-2 border-gray-600">
                                <CustomMiniTextInput 
                                    type="text"
                                    name="user_name"
                                    value={userName}
                                    onChange={handleUserNameChange}
                                />

                                <button className="p-2 bg-green-700 hover:bg-green-600" onClick={onUpdateUserName}>Update</button>
                                <button className="p-2 bg-red-700 hover:bg-red-600" onClick={() => setIsEditingUserName(false)}>Cancel</button>
                            </div>
                        }

                        {userDetail?.userStatus === "BANNED" || userDetail?.userStatus === "RESTRICTED" ? (
                            <p className="text-red-500">This user is currently banned or restricted.</p>
                        ) : null}
                    </div>

                    <p>User ID&nbsp;&nbsp;<span className="text-xl text-green-300">{userDetail?.id || ""}</span></p>

                    <div className="flex space-x-5 items-end">
                        <p>Role is&nbsp;&nbsp;<span className="text-3xl text-green-500">{userDetail?.role || 'USER'}</span></p>

                        {userDetail?.role !== "MASTER_ADMIN" && !isEditingUserRole && currentUserRole === "MASTER_ADMIN" && 
                            <button className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-xs" onClick={() => setIsEditingUserRole(true)}>Change Role</button>
                        }

                        {isEditingUserRole &&
                            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row space-x-0 md:space-x-4 p-2 bg-gray-700 border-2 border-gray-600">
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

                                <button className="p-2 bg-green-700 hover:bg-green-600" onClick={onUpdateUserRoleClicked}>Update</button>
                                <button className="p-2 bg-red-700 hover:bg-red-600" onClick={() => setIsEditingUserRole(false)}>Cancel</button>
                            </div>
                        }
                    </div>

                    <div className="flex space-x-5 items-end">
                        <p>Service is <span className="text-xl text-green-300">{userDetail?.serviceType || "N/A"}</span></p>
                        
                        {!isEditingServiceType && currentUserRole === "MASTER_ADMIN" && 
                            <button className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-xs" onClick={() => setIsEditingServiceType(true)}>{userDetail?.serviceType ? "Change Service Type" : "Assign Service Type"}</button>
                        }
                    </div>

                    {isEditingServiceType &&
                        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row space-x-0 md:space-x-4 p-2 bg-gray-700 border-2 border-gray-600">
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

                            <button className="p-2 bg-green-700 hover:bg-green-600" onClick={onUpdateServiceType}>Update</button>
                            <button className="p-2 bg-red-700 hover:bg-red-600" onClick={() => setIsEditingServiceType(false)}>Cancel</button>
                        </div>
                    }
                    
                    <div className="flex space-x-5 items-end">
                        <p>Admin of <span className="text-xl text-green-300">{userDetail?.serviceEntityName || "N/A"}</span></p>
                        
                        {!isEditingServiceEntity && currentUserRole === "MASTER_ADMIN" && 
                            <button className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-xs" onClick={() => setIsEditingServiceEntity(true)}>{userDetail?.serviceEntityName ? "Change Service Entity" : "Assign Service Entity"}</button>
                        }
                    </div>

                    {isEditingServiceEntity &&
                        <div className="flex flex-col space-y-4 p-4 bg-gray-700 border-2 border-gray-600 rounded-lg">
                            <div className="flex flex-col space-y-2">
                                <label className="text-green-300 font-medium">Search Service Entity</label>
                                <div className="relative">
                                    <CustomMiniTextInput
                                        type="text"
                                        placeholder="Search by name..."
                                        value={serviceEntitySearch}
                                        onChange={handleServiceEntitySearch}
                                        className="w-full"
                                    />
                                    
                                    {serviceEntitySearch && filteredEntities.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-500 rounded-sm shadow-lg z-20">
                                            {filteredEntities.slice(0, 4).map((entity: Hotel) => (
                                                <div
                                                    key={entity.id}
                                                    onClick={() => setServiceEntity(entity.id)}
                                                    className="px-3 py-2 text-black hover:bg-gray-100 cursor-pointer border-b border-gray-500 last:border-b-0"
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
                                    label="Select Service Entity"
                                    value={serviceEntity || ""}
                                    onChange={(e) => setServiceEntity(e.target.value || null)}
                                    options={[
                                        { label: "-- Select an entity --", value: "" },
                                        ...(hotelsData?.data || []).map((entity: Hotel) => ({
                                            label: entity.name,
                                            value: entity.id
                                        }))
                                    ]}
                                    className="bg-gray-600 text-white"
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button 
                                    className="p-2 bg-green-700 hover:bg-green-600 text-white rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    disabled={!serviceEntity}
                                    onClick={() => onUpdateServiceEntity()}
                                >
                                    Update
                                </button>
                                <button 
                                    className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-md"
                                    onClick={() => {
                                        setIsEditingServiceEntity(false);
                                        setServiceEntitySearch("");
                                        setServiceEntity("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    }

                    <p>Email Verified&nbsp;&nbsp;<span className="text-xl text-green-300">{userDetail?.emailVerified ? 'Yes' : 'No'}</span></p>

                    <h4 className="text-green-300">Personal Details</h4>
                    
                    <div className="flex flex-col space-y-5">
                        <p>Email is&nbsp;&nbsp;<span className="text-xl text-green-300">{userDetail?.email || 'N/A'}</span></p>

                        {userDetail?.emailVerified && (
                            <p>Email verified on&nbsp;&nbsp;<span className="text-xl text-green-300">
                                {new Date(userDetail?.emailVerified).toDateString()}
                            </span></p>
                        )}

                        <p>Account created,&nbsp;&nbsp;<span className="text-xl text-green-300">{(new Date(userDetail?.createdAt)).toDateString()}</span></p>
                    </div>
                    
                    <div className="flex space-x-4">
                        {showBanUnbanOption && !showAllowOption &&
                            <button 
                                className="p-2 w-fit bg-red-600 hover:bg-red-500 text-white rounded-xs"
                                onClick={onBanUserClicked}
                            >
                                Ban User
                            </button>
                        }

                        {showBanUnbanOption && showAllowOption &&
                            <button 
                                className="p-2 w-fit bg-green-600 hover:bg-green-500 text-white rounded-xs"
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
