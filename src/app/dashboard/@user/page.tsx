"use client";

import { useRouter } from "next/navigation";
import { UserApi } from "@/services/api";

import Image from "next/image"
import DivGap from "@/components/custom-elements/UIUtilities"
import { EditButton } from "@/components/custom-elements/Buttons"
import { AddressManagerModule } from "@/components/modular-components/AddressManagerModule";

export default function UserProfileInfoDashboard() {
    const { data: authResponse } = UserApi.useGetUserAuthenticationRQ("", true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserRole = authResponse?.data?.userRole;
    const router = useRouter();

    const { data: userDetailData} = UserApi.useGetUserDetailRQ(currentUserId || "", isAuthenticated && !!currentUserId);

    if (!isAuthenticated || !currentUserId) {
        return (
            <section className="flex justify-center items-center h-64">
                <p className="text-gray-400">Loading user information...</p>
            </section>
        );
    }

    const userDetail = userDetailData?.data;

    return (
        <section className="flex flex-col p-2 font-sans" id="dashboard_profile">
            <div className="md:ml-6 flex flex-col space-y-2">
                <div className="flex space-x-4">
                    <h3 className="text-green-500">Your Profile</h3>

                    <EditButton onClick={() => router.push(`/user_profile/${currentUserId}`)}></EditButton>
                </div>
                
                <p className="text-green-200">Personalize your account info, preferences.</p>

                <div className="flex flex-col mt-8 space-y-5">
                    <div className="flex relative w-[180px] h-[180px]">
                        <Image className="bg-gray-100" src={userDetail?.profileImage?.url || "/NoUserImage.jpeg"}  alt="Profile Picture" fill></Image>
                    </div>
                    
                    <p>Known as&nbsp;&nbsp;<span className="text-2xl text-green-300">{userDetail?.userName || 'Guest User'}</span></p>

                    <p>Role is&nbsp;&nbsp;<span className="text-3xl text-green-500">{currentUserRole}</span></p>                    

                    <h4 className="text-green-300">Personal Details</h4>

                    <div className="flex flex-col space-y-5">
                        <p>Email is&nbsp;&nbsp;<span className="text-xl text-green-300">{userDetail?.email}</span></p>

                        <p>Account created,&nbsp;&nbsp;<span className="text-xl text-green-300">14th December, 2025</span></p>
                    </div>
                    
                    <AddressManagerModule 
                        className="mt-5" 
                        userId={currentUserId}
                        hideActions={true}
                    />

                    <h2>Billing Info</h2>

                    <div className="flex mt-5 space-x-5">
                        <button className="p-2 bg-green-700 hover:bg-green-600 text-sm md:text-base text-white rounded-sm">Change Password</button>
                    </div>
                </div>
            </div>
            
            <DivGap customHeightGap="h-[80px]"/>
        </section>
    )
}