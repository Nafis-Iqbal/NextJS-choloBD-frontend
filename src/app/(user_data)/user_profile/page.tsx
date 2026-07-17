/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AuthApi, UserApi } from "@/services/api";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

import TableLayout from "@/components/layout-elements/TableLayout";
import { UserViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import { useEffect, useState, Suspense } from "react";

function UserProfileListContent() {
    const router = useRouter();
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;
    const searchParams = useSearchParams();
    const [queryString, setQueryString] = useState<string>('');

    const {data: usersList, isLoading: isFetchLoading, isError: isFetchError, refetch: refetchUsers} = UserApi.useGetUsersRQ(queryString);
    
    useEffect(() => {
        const qString = (window.location.search).slice(1);
        setQueryString(qString);
    }, [searchParams]);

    useEffect(() => {
        refetchUsers();
    }, [queryString]);

    // Authentication and role checks
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
            return;
        }

        // Only MASTER_ADMIN users can access this page
        if (currentUserRole === "USER") {
            router.push("/");
            return;
        }

        if (currentUserRole === "SERVICE_ADMIN") {
            router.push("/dashboard");
            return;
        }
    }, [isAuthenticated, currentUserRole, router]);

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">User Profiles</h3>
                <p className="text-green-200">All user profiles registered on the site.</p>

                <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                    <div className="w-full">
                        <div
                            className="block rounded-sm md:rounded-md border-0 md:border px-0 py-1 md:p-2"
                            style={{
                                backgroundColor: "var(--theme-card-bg)",
                                borderColor: "var(--theme-deep-green)",
                            }}
                        >
                            {isFetchLoading && (
                                <div className="flex justify-center p-4">
                                    <p className="theme-text-teal">Loading users...</p>
                                </div>
                            )}
                            {isFetchError && (
                                <div className="flex justify-center p-4">
                                    <p style={{ color: "var(--theme-red)" }}>
                                        Error loading users. Please try again.
                                    </p>
                                </div>
                            )}
                            {(usersList?.data?.results ?? []).map((user: User, index: number) => {
                                return (
                                    <UserViewListTableRow
                                        key={user.id}
                                        id={index + 1}
                                        user_name={user.userName || ''}
                                        user_id={user.id.toString()}
                                        email={user.email || ''}
                                        role={user.role || 'USER'}
                                        userImageURL={user.imageUrl}
                                        totalSpent={user.spent || 0}
                                        onClickNavigate={() => router.push(`/user_profile/${user.id}`)}
                                    />
                                );
                            })}
                            {!isFetchLoading && !isFetchError && (!usersList?.data?.results || usersList.data.results.length === 0) && (
                                <div className="flex justify-center p-4">
                                    <p className="theme-text-subtle">No users found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TableLayout>
            </div>
        </div>
    )
}

export default function UserProfileList() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <UserProfileListContent />
        </Suspense>
    );
}