"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthApi, UserApi } from "@/services/api";
import { Role } from "@/types/enums";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import TableLayout from "@/components/layout-elements/TableLayout";
import FilterSectionLayout from "@/components/layout-elements/FilterSectionLayout";
import { CustomSelectInput, CustomTextInput } from "@/components/custom-elements/CustomInputElements";
import { ListPaginationBar } from "@/components/layout-elements/ListPaginationBar";
import { UserViewListTableRow } from "@/components/data-elements/DataTableRowElements";
import { NoContentTableRow } from "@/components/placeholder-components/NoContentTableRow";
import {
    PAGE_SIZE_OPTIONS,
    DEFAULT_PAGE_SIZE,
    parsePositiveInt,
    clampPageSize,
    toQueryString,
    getListRange,
} from "@/utilities/adminEntityList";

function UserProfileListContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;

    const appliedName = searchParams.get("user_name")?.trim() ?? "";
    const appliedEmail = searchParams.get("email")?.trim() ?? "";
    const role = searchParams.get("role") ?? "";
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = clampPageSize(parsePositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE));

    const [draftName, setDraftName] = useState(appliedName);
    const [draftEmail, setDraftEmail] = useState(appliedEmail);

    useEffect(() => {
        setDraftName(appliedName);
        setDraftEmail(appliedEmail);
    }, [appliedName, appliedEmail]);

    const queryString = useMemo(
        () =>
            toQueryString({
                user_name: appliedName,
                email: appliedEmail,
                role,
                page,
                limit,
            }),
        [appliedName, appliedEmail, role, page, limit]
    );

    const replaceListParams = useCallback(
        (patch: Partial<{
            user_name: string;
            email: string;
            role: string;
            page: number;
            limit: number;
        }>) => {
            const nextQuery = toQueryString({
                user_name: patch.user_name ?? appliedName,
                email: patch.email ?? appliedEmail,
                role: patch.role ?? role,
                page: patch.page ?? page,
                limit: patch.limit ?? limit,
            });
            router.replace(nextQuery ? `/user_profile?${nextQuery}` : "/user_profile", { scroll: false });
        },
        [appliedName, appliedEmail, role, page, limit, router]
    );

    const {
        data: usersList,
        isLoading: isFetchLoading,
        isError: isFetchError,
    } = UserApi.useGetUsersRQ(queryString);

    const users = usersList?.data?.results ?? [];
    const total = usersList?.data?.total ?? 0;
    const { currentPage, pageSize, totalPages, from, to } = getListRange(
        total,
        usersList?.data?.page ?? page,
        usersList?.data?.limit ?? limit
    );

    const roleOptions = useMemo(
        () => Object.values(Role).map((value) => ({ value, label: value.replace(/_/g, " ") })),
        []
    );

    const pageSizeOptions = useMemo(() => {
        const values = PAGE_SIZE_OPTIONS.includes(limit)
            ? PAGE_SIZE_OPTIONS
            : [...PAGE_SIZE_OPTIONS, limit].sort((a, b) => a - b);
        return values.map((size) => ({ value: String(size), label: `${size} per page` }));
    }, [limit]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
            return;
        }
        if (currentUserRole === "USER") {
            router.push("/");
            return;
        }
        if (currentUserRole === "SERVICE_ADMIN") {
            router.push("/dashboard");
        }
    }, [isAuthenticated, currentUserRole, router]);

    useEffect(() => {
        if (total === 0) return;
        if (page > totalPages) {
            replaceListParams({ page: totalPages });
        }
    }, [page, total, totalPages, replaceListParams]);

    const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        replaceListParams({ user_name: draftName, email: draftEmail, page: 1 });
    };

    const paginationBar = (className: string) => (
        <ListPaginationBar
            entityLabel="users"
            from={from}
            to={to}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            isLoading={isFetchLoading}
            isError={isFetchError}
            onPageChange={(nextPage) => replaceListParams({ page: nextPage })}
            className={className}
        />
    );

    return (
        <div className="flex flex-col p-2 font-sans mt-5">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="theme-label">User Profiles</h3>
                <p className="theme-text-muted">
                    {isFetchLoading
                        ? "Loading users..."
                        : isFetchError
                            ? "Could not load users."
                            : total > 0
                                ? `Found ${total} matching user${total === 1 ? "" : "s"}.`
                                : "No users found."}
                </p>

                <FilterSectionLayout className="mt-3 md:mr-5" onSubmit={handleApplyFilters}>
                    <div className="flex flex-wrap gap-4 md:gap-8 items-end">
                        <CustomTextInput
                            placeholderText="Search by user name"
                            onChange={(event) => setDraftName(event.target.value)}
                            value={draftName}
                            name="user_name"
                            label="Name"
                            className="w-[180px] md:w-auto"
                        />
                        <CustomTextInput
                            placeholderText="Search by email"
                            onChange={(event) => setDraftEmail(event.target.value)}
                            value={draftEmail}
                            name="email"
                            label="Email"
                            className="w-[180px] md:w-auto"
                        />
                        <CustomSelectInput
                            options={[{ value: "", label: "-- All Roles --" }, ...roleOptions]}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                replaceListParams({
                                    user_name: draftName,
                                    email: draftEmail,
                                    role: event.target.value,
                                    page: 1,
                                })
                            }
                            value={role}
                            name="role"
                            label="Role"
                            className="min-w-[160px]"
                        />
                        <CustomSelectInput
                            options={pageSizeOptions}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                replaceListParams({
                                    user_name: draftName,
                                    email: draftEmail,
                                    limit: clampPageSize(parsePositiveInt(event.target.value, DEFAULT_PAGE_SIZE)),
                                    page: 1,
                                })
                            }
                            value={String(limit)}
                            name="limit"
                            label="Page length"
                            className="min-w-[140px]"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4">
                        <button
                            className="flex self-end items-center px-2 py-1 theme-btn-teal text-base md:text-lg rounded-sm mt-2"
                            type="submit"
                        >
                            Apply Filters
                        </button>
                        <button
                            className="flex self-end items-center px-2 py-1 theme-btn-teal text-base md:text-lg rounded-sm mt-2"
                            type="button"
                            onClick={() => {
                                setDraftName("");
                                setDraftEmail("");
                                router.replace("/user_profile", { scroll: false });
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                </FilterSectionLayout>

                {paginationBar("mt-4")}

                <TableLayout className="mt-3 md:mr-5 mb-3">
                    <div className="w-full">
                        <div className="block rounded-sm md:rounded-md border-0 md:border px-0 py-1 md:p-2 theme-card">
                            {isFetchLoading ? (
                                <NoContentTableRow displayMessage="Loading users..." tdColSpan={1} />
                            ) : isFetchError ? (
                                <NoContentTableRow displayMessage="Error loading users. Please try again." tdColSpan={1} />
                            ) : users.length === 0 ? (
                                <NoContentTableRow displayMessage="No users found." tdColSpan={1} />
                            ) : (
                                users.map((user: User, index: number) => (
                                    <UserViewListTableRow
                                        key={user.id}
                                        id={(currentPage - 1) * pageSize + index + 1}
                                        user_name={user.userName || ""}
                                        user_id={user.id.toString()}
                                        email={user.email || ""}
                                        role={user.role || "USER"}
                                        userImageURL={user.imageUrl}
                                        totalSpent={user.spent || 0}
                                        onClickNavigate={() => router.push(`/user_profile/${user.id}`)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </TableLayout>

                {paginationBar("mb-4")}
            </div>
        </div>
    );
}

export default function UserProfileList() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <UserProfileListContent />
        </Suspense>
    );
}
