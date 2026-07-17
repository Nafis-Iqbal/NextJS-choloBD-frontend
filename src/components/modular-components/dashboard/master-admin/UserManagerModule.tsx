/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState, type ReactNode } from "react"
import { Role, UserStatus, PaymentStatus, ServiceType } from "@/types/enums"
import { UserApi } from "@/services/api"
import { filterUsersSchema } from "@/validators/userValidators"

import TableLayout from "../../../layout-elements/TableLayout"
import FilterSectionLayout from "../../../layout-elements/FilterSectionLayout"
import { CustomSelectInput } from "../../../custom-elements/CustomInputElements"
import { CustomTextInput } from "../../../custom-elements/CustomInputElements"
import { HorizontalDivider } from "../../../custom-elements/UIUtilities"
import { NoContentTableRow } from "../../../placeholder-components/NoContentTableRow"
import { PaginationControls } from "../user/PaginationControls"
import { useRouter } from "next/navigation"

const PAGE_SIZE = 50;

const infoCardClass =
    "w-full shrink-0 rounded-sm md:rounded-md p-4 md:p-5 mb-3 border-0 md:border transition-colors min-h-[7.5rem]";

const infoCardStyle = {
    backgroundColor: "var(--theme-bg)",
    borderColor: "var(--theme-deep-green)",
} as const;

const metaChipClass =
    "inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium";

const MetaChip = ({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) => (
    <span
        className={metaChipClass}
        style={{
            backgroundColor: "var(--theme-section-bg)",
            color: "var(--theme-text-muted)",
        }}
    >
        <span className="theme-text-subtle mr-1">{label}:</span>
        <span className="theme-text">{value}</span>
    </span>
);

const formatEnumValue = (value: string): string => {
    return value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, c => c.toUpperCase())
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

type UserFilter = {
    role: Role | "";
    user_status: UserStatus | "";
    payment_status: PaymentStatus | "";
    user_name: string;
    email: string;
}

const defaultFilterValues: UserFilter = {
    role: "",
    user_status: "",
    payment_status: "",
    user_name: "",
    email: "",
}

export function buildUserQueryString(
    filters: Partial<UserFilter> | undefined | null,
    page = 1,
    limit = PAGE_SIZE
) {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (!filters) {
        return params.toString();
    }

    Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === "string" && value.trim() !== "") {
            params.append(key, value.trim());
        }
    });

    return params.toString();
}

export const UserManagerModule = () => {
    const router = useRouter();
    const [filters, setFilters] = useState<UserFilter>(defaultFilterValues);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [page, setPage] = useState(1);

    const queryString = useMemo(
        () => buildUserQueryString(filters, page, PAGE_SIZE),
        [filters, page]
    );

    const {
        data: usersList,
        isLoading: isFetchLoading,
        isError: isFetchError,
    } = UserApi.useGetUsersRQ(queryString);

    const users = usersList?.data?.results ?? [];
    const total = usersList?.data?.total ?? 0;
    const limit = usersList?.data?.limit ?? PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const userRoleOptions = Object.values(Role).map(role => ({
        value: role,
        label: role.replace("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())
    }));

    const userStatusOptions = Object.values(UserStatus).map(status => ({
        value: status,
        label: status.replace("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())
    }));

    const paymentStatusOptions = Object.values(PaymentStatus).map(status => ({
        value: status,
        label: status.replace("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())
    }));

    const handleResetFilters = () => {
        setFilters(defaultFilterValues);
        setErrors({});
        setPage(1);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
        setPage(1);

        const updatedData = { ...filters, [name]: value || undefined };

        const result = filterUsersSchema.safeParse(updatedData);
        if (!result.success) {
            const key = name as keyof typeof result.error.formErrors.fieldErrors;
            const fieldError = result.error.formErrors.fieldErrors[key]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <section className="flex flex-col mt-5" id="users_management">
            <div className="flex mb-2 space-x-5 items-center">
                <h4 className="theme-text">All Users</h4>
                <p className="text-sm theme-text-subtle">
                    Showing {users.length} of {total} users
                </p>
            </div>
            <TableLayout className="md:mr-5">
                <div className="w-full">
                    <div
                        className="block rounded-sm md:rounded-md border-0 md:border max-h-[80vh] md:max-h-[50vh] overflow-y-auto px-0 py-1 md:p-2"
                        style={{
                            backgroundColor: "var(--theme-card-bg)",
                            borderColor: "var(--theme-deep-green)",
                        }}
                    >
                        {
                            isFetchLoading ? (<NoContentTableRow displayMessage="Loading Data"  tdColSpan={1}/>) :
                            isFetchError ? (<NoContentTableRow displayMessage="An error occured"  tdColSpan={1}/>) :
                            users.length === 0 ? (<NoContentTableRow displayMessage="No users found" tdColSpan={1}/>) :
                            users.map((user, index) => (
                                <UserListTableRow 
                                    key={user.id} 
                                    id={(page - 1) * limit + index + 1}
                                    userName={user.userName} 
                                    email={user.email}
                                    phoneNumber={user.phoneNumber}
                                    role={user.role}
                                    walletBalance={user?.wallet?.balance ?? -1}
                                    userStatus={user.userStatus}
                                    paymentStatus={user.paymentStatus}
                                    serviceType={user.serviceType}
                                    serviceEntityName={user.serviceEntityName}
                                    employeeServiceType={user.employeeServiceType}
                                    employeeServiceEntityName={user.employeeServiceEntityName}
                                    createdAt={user.createdAt ? new Date(user.createdAt) : new Date()}
                                    navigateOnClick={() => router.push(`/user_profile/${user.id}`)}
                                />
                            ))
                        }
                    </div>
                </div>
            </TableLayout>

            {totalPages > 1 && (
                <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    className="md:mr-5"
                />
            )}

            <FilterSectionLayout className="md:mr-5" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-wrap gap-4 md:gap-15 justify-left">
                    <CustomSelectInput
                        options={[{ value: "", label: "-- All Roles --" }, ...userRoleOptions]}
                        onChange={handleChange}
                        value={filters.role}
                        style={{backgroundColor: 'var(--theme-card-bg)'}}
                        className=""
                        name="role"
                        label="Role"
                    />

                    <CustomSelectInput
                        options={[{ value: "", label: "-- All Statuses --" }, ...userStatusOptions]}
                        onChange={handleChange}
                        value={filters.user_status}
                        style={{backgroundColor: 'var(--theme-card-bg)'}}
                        className=""
                        name="user_status"
                        label="User Status"
                    />

                    <CustomSelectInput
                        options={[{ value: "", label: "-- All Payments --" }, ...paymentStatusOptions]}
                        onChange={handleChange}
                        value={filters.payment_status}
                        style={{backgroundColor: 'var(--theme-card-bg)'}}
                        className=""
                        name="payment_status"
                        label="Payment Status"
                    />
                </div>

                <div className="flex flex-wrap gap-4 md:gap-8 justify-left ">
                    <CustomTextInput 
                        placeholderText="Enter user name"
                        onChange={handleChange}
                        value={filters.user_name}
                        name="user_name"
                        label="User Name"
                        className="w-[150px] md:w-auto"
                    />

                    <CustomTextInput 
                        placeholderText="Enter user email"
                        onChange={handleChange}
                        value={filters.email}
                        name="email"
                        label="Email"
                        error={errors.email}
                        className="w-[150px] md:w-auto"
                    />
                </div>

                <div className="flex flex-wrap gap-2 md:gap-6 justify-left">
                    <button 
                        className="flex self-end items-center px-2 py-1 theme-btn-teal text-base md:text-lg rounded-sm mt-2" 
                        type="button" 
                        onClick={handleResetFilters}
                    >
                        Reset Filters
                    </button>
                </div>
            </FilterSectionLayout>

            <HorizontalDivider className="mr-5 my-10"/>
        </section>
    )
}

const UserListTableRow = ({
    id, 
    userName,
    email, 
    role, 
    walletBalance,
    phoneNumber,
    
    serviceType,
    serviceEntityName,
    employeeServiceType,
    employeeServiceEntityName,

    userStatus, 
    paymentStatus, 
    createdAt, 
    navigateOnClick
} : {
    id: number, 
    userName: string, 
    email: string, 
    role: Role, 
    walletBalance: number,
    phoneNumber?: string,

    serviceType?: ServiceType;
    serviceEntityName?: string;
    employeeServiceType?: ServiceType;
    employeeServiceEntityName?: string;

    userStatus: UserStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date, 
    navigateOnClick: () => void
}) => {
    const resolvedServiceType =
        role === Role.SERVICE_ADMIN
            ? serviceType
            : role === Role.EMPLOYEE
              ? employeeServiceType
              : undefined;

    const resolvedCompanyName =
        role === Role.SERVICE_ADMIN
            ? serviceEntityName
            : role === Role.EMPLOYEE
              ? employeeServiceEntityName
              : undefined;

    return (
        <article
            className={`${infoCardClass} cursor-pointer hover:opacity-95`}
            style={infoCardStyle}
            onClick={navigateOnClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateOnClick();
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div className="flex flex-col gap-3 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base md:text-lg font-semibold theme-text break-words">
                                {userName}
                            </h3>
                            <span className="text-xs theme-text-subtle">#{id}</span>
                        </div>
                        <p className="text-sm theme-text-muted break-all mt-1">{email}</p>
                    </div>

                    <span className="text-xs theme-text-subtle shrink-0">
                        Joined {new Date(createdAt).toDateString()}
                    </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    <MetaChip label="Role" value={formatEnumValue(role)} />
                    <MetaChip label="Status" value={formatEnumValue(userStatus)} />
                    <MetaChip label="Payment" value={formatEnumValue(paymentStatus)} />
                    <MetaChip
                        label="Wallet"
                        value={walletBalance >= 0 ? `৳ ${walletBalance.toLocaleString()}` : "N/A"}
                    />
                    {phoneNumber && (
                        <MetaChip label="Phone" value={phoneNumber} />
                    )}
                    {resolvedServiceType && (
                        <MetaChip
                            label="Service"
                            value={formatEnumValue(resolvedServiceType)}
                        />
                    )}
                    {resolvedCompanyName && (
                        <MetaChip label="Company" value={resolvedCompanyName} />
                    )}
                </div>
            </div>
        </article>
    )
}
