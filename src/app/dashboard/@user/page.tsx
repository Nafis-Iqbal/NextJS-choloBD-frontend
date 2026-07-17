"use client";

import { useRouter } from "next/navigation";
import { UserApi, AuthApi } from "@/services/api";
import { Role, ServiceType } from "@/types/enums";

import Image from "next/image"
import { stripLeadingDateFromISO } from "@/utilities/utilities";
import DivGap from "@/components/custom-elements/UIUtilities"
import { EditButton } from "@/components/custom-elements/Buttons"
import { AddressManagerModule } from "@/components/modular-components/dashboard/AddressManagerModule";
import { UserActivityHistoryModule } from "@/components/modular-components/dashboard/user/UserActivityHistoryModule";

export default function UserProfileInfoDashboard() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserRole = authResponse?.data?.userRole;
    const router = useRouter();

    const { data: userDetailData} = UserApi.useGetOwnUserDetailRQ(currentUserId || "", isAuthenticated && !!currentUserId);
    
    if (!isAuthenticated || !currentUserId) {
        return (
            <section className="flex justify-center items-center h-64 theme-section">
                <p className="theme-text-subtle">Loading user information...</p>
            </section>
        );
    }

    const userDetail = userDetailData?.data;

    return (
        <section className="flex flex-col p-2 font-sans" id="dashboard_profile">
            <div className="md:ml-6 flex flex-col space-y-2">
                <div className="flex space-x-4">
                    <h3 className="theme-text-teal">Profile Info</h3>

                    <EditButton onClick={() => router.push(`/user_profile/${currentUserId}`)}></EditButton>
                </div>
                
                <p className="theme-text-subtle">Personalize your account info, preferences.</p>

                <div className="theme-section rounded-xl p-4 sm:p-6 my-8 flex flex-col space-y-5">
                    <div className="relative w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] overflow-hidden theme-outline shrink-0">
                        <Image
                            className="object-cover"
                            style={{ backgroundColor: "var(--theme-card-bg)" }}
                            src={userDetail?.imageUrl || "/NoUserImage.jpeg"}
                            alt="Profile Picture"
                            fill
                        />
                    </div>
                    
                    <p className="theme-text-muted">Known as&nbsp;&nbsp;<span className="text-2xl font-semibold theme-text-teal">{userDetail?.userName || "Guest User"}</span></p>

                    <p className="theme-text-muted">Role is&nbsp;&nbsp;<span className="text-3xl font-semibold theme-text-teal">{currentUserRole}</span></p>

                    {userDetail?.role === Role.SERVICE_ADMIN && (
                        <div className="flex flex-col space-y-3">
                            <p className="theme-text-muted">
                                Service is&nbsp;&nbsp;
                                <span className="text-xl font-medium theme-text-teal">
                                    {userDetail?.serviceType || "N/A"}
                                </span>
                            </p>
                            <p className="theme-text-muted">
                                {userDetail?.serviceType === ServiceType.GUIDE_SERVICE
                                    ? "Guide Profile owner of"
                                    : "Admin of"}
                                &nbsp;&nbsp;
                                <span className="text-xl font-medium theme-text-teal">
                                    {userDetail?.serviceEntityName || "N/A"}
                                </span>
                            </p>
                        </div>
                    )}

                    {userDetail?.role === Role.EMPLOYEE && (
                        <div className="flex flex-col space-y-3">
                            <p className="theme-text-muted">
                                Employee of Service Type&nbsp;&nbsp;
                                <span className="text-xl font-medium theme-text-teal">
                                    {userDetail?.employeeServiceType || "N/A"}
                                </span>
                            </p>
                            <p className="theme-text-muted">
                                Employee of Company&nbsp;&nbsp;
                                <span className="text-xl font-medium theme-text-teal">
                                    {userDetail?.employeeServiceEntityName || "N/A"}
                                </span>
                            </p>
                        </div>
                    )}

                    <h4 className="text-lg font-semibold theme-text-teal pt-1">Personal Details</h4>

                    <div className="flex flex-col space-y-4">
                        <p className="theme-text-muted">Email is&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal break-all">{userDetail?.email}</span></p>

                        <p className="theme-text-muted">Account created,&nbsp;&nbsp;<span className="text-xl font-medium theme-text-teal">{stripLeadingDateFromISO(userDetail?.createdAt) || "N/A"}</span></p>
                    </div>
                    
                    <AddressManagerModule 
                        className="mt-5" 
                        userId={currentUserId}
                        hideActions={true}
                    />

                    <div className="flex mt-5 space-x-5">
                        <button className="px-3 py-1.5 theme-btn-teal text-sm md:text-base text-white rounded transition-colors">Change Password</button>
                    </div>
                </div>

                <UserActivityHistoryModule userId={currentUserId}/>
            </div>
            
            <DivGap customHeightGap="h-[80px]"/>
        </section>
    )
}