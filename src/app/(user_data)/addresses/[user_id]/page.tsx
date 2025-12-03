"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AddressApi, UserApi } from "@/services/api";
import { Role } from "@/types/enums";
import { AddressManagerModule } from "@/components/modular-components/AddressManagerModule";

export default function UserAddressListPage() {
    const router = useRouter();
    const { data: authResponse } = UserApi.useGetUserAuthenticationRQ("", true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserRole = authResponse?.data?.userRole;
    const { user_id } = useParams();

    // Session and permission checks
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
            return;
        }

        // Only MASTER_ADMIN can access other users' address pages
        if (currentUserRole !== Role.MASTER_ADMIN && currentUserId !== user_id) {
            if (currentUserRole === Role.SERVICE_ADMIN) {
                router.push("/dashboard");
            } else {
                router.push("/");
            }
            return;
        }
    }, [isAuthenticated, currentUserRole, currentUserId, router, user_id]);

    const {
        data: addressesData,
        isLoading: isAddressesLoading,
        isError: isAddressesError,
        refetch: refetchAddresses
    } = AddressApi.useGetUserAddressesRQ(user_id as string, true);

    if (!isAuthenticated || isAddressesLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="text-white text-xl">Loading addresses...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (isAddressesError) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900">
                <div className="text-red-400 text-xl mb-4">Error loading addresses</div>
                <button 
                    onClick={() => refetchAddresses()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const addresses = addressesData?.data || [];

    return (
        <div className="flex flex-col p-2 font-sans mt-5 md:mt-10 mb-5 md:mb-10">
            <AddressManagerModule className="p-2 md:p-0 md:ml-10" userId={user_id as string} showFullList={true} />
        </div>
    );
}