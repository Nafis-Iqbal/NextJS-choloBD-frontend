"use client";

import { useRouter } from "next/navigation";
import { UserApi, AuthApi } from "@/services/api";

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
    console.log("User Detail Data in Dashboard:", userDetailData);
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
                    <h3 className="theme-text-teal">Your Activities and Profile Info</h3>

                    <EditButton onClick={() => router.push(`/user_profile/${currentUserId}`)}></EditButton>
                </div>
                
                <p className="theme-text-subtle">Personalize your account info, preferences.</p>

                <div className="flex flex-col my-8 space-y-5">
                    <div className="flex relative w-[180px] h-[180px]" style={{ backgroundColor: 'var(--theme-section-bg)' }}>
                        <Image className="" src={userDetail?.imageUrl || "/NoUserImage.jpeg"}  alt="Profile Picture" fill></Image>
                    </div>
                    
                    <p>Known as&nbsp;&nbsp;<span className="text-2xl theme-text-muted">{userDetail?.userName || 'Guest User'}</span></p>

                    <p>Role is&nbsp;&nbsp;<span className="text-3xl theme-text-teal">{currentUserRole}</span></p>                    

                    <h4 className="theme-text-teal">Personal Details</h4>

                    <div className="flex flex-col space-y-5">
                        <p>Email is&nbsp;&nbsp;<span className="text-xl theme-text-muted">{userDetail?.email}</span></p>

                        <p>Account created,&nbsp;&nbsp;<span className="text-xl theme-text-muted">{stripLeadingDateFromISO(userDetail?.createdAt) || "N/A"}</span></p>
                    </div>
                    
                    <AddressManagerModule 
                        className="mt-5" 
                        userId={currentUserId}
                        hideActions={true}
                    />

                    <div className="flex mt-5 space-x-5">
                        <button className="p-2 theme-btn-teal text-sm md:text-base text-white rounded-sm transition-colors">Change Password</button>
                    </div>
                </div>

                <UserActivityHistoryModule userId={currentUserId}/>
            </div>
            
            <DivGap customHeightGap="h-[80px]"/>
        </section>
    )
}