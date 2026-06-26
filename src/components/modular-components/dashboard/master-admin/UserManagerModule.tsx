/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { Role, UserStatus, PaymentStatus, ServiceType } from "@/types/enums"
import { UserApi } from "@/services/api"
import { filterUsersSchema } from "@/validators/userValidators"
import { queryClient } from "@/services/apiInstance"

import TableLayout from "../../../layout-elements/TableLayout"
import FilterSectionLayout from "../../../layout-elements/FilterSectionLayout"
import { CustomSelectInput } from "../../../custom-elements/CustomInputElements"
import { CustomTextInput } from "../../../custom-elements/CustomInputElements"
import { HorizontalDivider } from "../../../custom-elements/UIUtilities"
import { NoContentTableRow } from "../../../placeholder-components/NoContentTableRow"
import { UserViewListTableRow } from "../../../data-elements/DataTableRowElements"
import { useRouter } from "next/navigation"

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
    role: Role;
    user_status: UserStatus;
    payment_status: PaymentStatus;
    user_name: string;
    email: string;
    city: string;
    minimum_spent: number;
    minimum_order_count: number;
}

const defaultFilterValues: UserFilter = {
    role: Role.USER, 
    user_status: UserStatus.ACTIVE,
    payment_status: PaymentStatus.PAID,
    user_name: '',
    email: '',
    city: '',
    minimum_spent: 0,
    minimum_order_count: 0
}

export const UserManagerModule = () => {
    const router = useRouter();
    const [filters, setFilters] = useState<Partial<UserFilter>>(defaultFilterValues);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [queryString, setQueryString] = useState<string>();
    const {data: usersList, isLoading: isFetchLoading, isError: isFetchError, refetch: refetchUserData} = UserApi.useGetUsersRQ(queryString);

    useEffect(() => {
        refetchUserData();
    }, [queryString]);

    useEffect(() => {
        setFilters(defaultFilterValues);
    }, [])

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

    const onSubmitFilterUserSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const query = buildUserQueryString(filters);
        queryClient.invalidateQueries({queryKey: ["users"]});

        setQueryString(query);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        const numericFields = new Set(["minimum_spent", "minimum_order_count"]);

        let parsedValue: string | number | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, '');

            parsedValue = noLeadingZeros === '' ? undefined : Number(noLeadingZeros);
        } else {
            parsedValue = value || undefined;
        }
        
        setFilters((prev) => ({
            ...prev,
            [name]: parsedValue
        }));

        const updatedData = { ...filters, [name]: parsedValue };
        
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
            <div className="flex mb-2 space-x-5">
                <h4 className="theme-text">All Users</h4>
                <button className="text-sm px-1 mt-1 rounded-md self-center theme-btn-teal">View All</button>
            </div>
            <TableLayout className="md:mr-5">
                <div className="overflow-x-auto w-full">
                    <div className="min-w-[1800px]">
                        <div className="flex theme-outline p-2 text-center text-sm font-semibold" style={{backgroundColor: 'var(--theme-card-bg)'}}>
                            <p className="w-[2%] flex-shrink-0">Sr.</p>
                            <p className="w-[11%] flex-shrink-0">User Name</p>
                            <p className="w-[13%] flex-shrink-0">Email</p>
                            <p className="w-[6%] flex-shrink-0">Role</p>
                            <p className="w-[9%] flex-shrink-0">Status</p>
                            <p className="w-[6%] flex-shrink-0">Payment</p>
                            <p className="w-[13%] flex-shrink-0">Phone</p>
                            <p className="w-[9%] flex-shrink-0">Service Type</p>
                            <p className="w-[10%] flex-shrink-0">Company Name</p>
                            <p className="w-[6%] flex-shrink-0">Wallet</p>
                            <p className="w-[5%] flex-shrink-0">Verified</p>
                            <p className="w-[9%] flex-shrink-0">Joined</p>
                        </div>
                        <div className="flex flex-col theme-outline h-[80vh] md:h-[50vh] overflow-y-auto">
                            {
                                isFetchLoading ? (<NoContentTableRow displayMessage="Loading Data"  tdColSpan={1}/>) :
                                isFetchError ? (<NoContentTableRow displayMessage="An error occured"  tdColSpan={1}/>) :

                                (usersList?.data && Array.isArray(usersList?.data) && usersList?.data.length <= 0) ? (<NoContentTableRow displayMessage="No users found" tdColSpan={1}/>) :
                                (Array.isArray(usersList?.data) &&
                                    usersList?.data?.map((user, index) => (
                                        <UserListTableRow 
                                            key={user.id} 
                                            id={index + 1}
                                            userName={user.userName} 
                                            email={user.email}
                                            phoneNumber={user.phoneNumber}
                                            role={user.role}
                                            walletBalance={user?.wallet?.balance || -1}
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
                                )
                            }
                        </div>
                    </div>
                </div>
            </TableLayout>

            <FilterSectionLayout className="md:mr-5" onSubmit={onSubmitFilterUserSearch}>
                <div className="flex flex-wrap gap-4 md:gap-15 justify-left">
                    <CustomSelectInput
                        options={userRoleOptions}
                        onChange={handleChange}
                        value={filters?.role}
                        style={{backgroundColor: 'var(--theme-card-bg)'}}
                        className=""
                        name="role"
                        label="Role"
                    />

                    <CustomSelectInput
                        options={userStatusOptions}
                        onChange={handleChange}
                        value={filters?.user_status}
                        style={{backgroundColor: 'var(--theme-card-bg)'}}
                        className=""
                        name="user_status"
                        label="User Status"
                    />

                    <CustomSelectInput
                        options={paymentStatusOptions}
                        onChange={handleChange}
                        value={filters?.payment_status}
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
                        value={filters?.user_name}
                        name="user_name"
                        label="User Name"
                        className="w-[150px] md:w-auto"
                    />

                    <CustomTextInput 
                        placeholderText="Enter user email"
                        onChange={handleChange}
                        value={filters?.email}
                        name="email"
                        label="Email"
                        error={errors.email}
                        className="w-[150px] md:w-auto"
                    />
                </div>

                <div className="flex flex-wrap gap-2 md:gap-6 justify-left space-x-6">
                    <div className="flex space-x-5 md:space-x-10 mt-2 md:mt-0">
                        <button className="flex self-end items-center px-2 py-1 bg-green-700 hover:bg-green-600
                            text-white text-base md:text-lg rounded-sm" 
                            type="submit"
                        >
                            Filter Users
                        </button>
                    
                        <button 
                            className="flex self-end items-center px-2 py-1 bg-green-700 hover:bg-green-600
                            text-white text-base md:text-lg rounded-sm" 
                            type="button" 
                            onClick={() => {setFilters(defaultFilterValues); setErrors({}); setQueryString("")}}
                        >
                            Reset Filters
                        </button>
                    </div>
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
    return (
        <div className="flex p-2 w-full border-green-900 hover:bg-gray-200 text-center hover:cursor-pointer" onClick={() => navigateOnClick()}>
            <p className="w-[2%] flex-shrink-0">{id}</p>
            <p className="w-[11%] flex-shrink-0 hover:cursor-pointer">{userName}</p>
            <p className="w-[13%] flex-shrink-0">{email}</p>
            <p className="w-[6%] flex-shrink-0">{role}</p>
            <p className="w-[9%] flex-shrink-0">{userStatus}</p>
            <p className="w-[6%] flex-shrink-0">{paymentStatus}</p>
            <p className="w-[13%] flex-shrink-0">{phoneNumber || '-'}</p>
            <p className="w-[9%] flex-shrink-0">{role === Role.SERVICE_ADMIN ? serviceType : role === Role.EMPLOYEE ? employeeServiceType: '-'}</p>
            <p className="w-[10%] flex-shrink-0">{role === Role.SERVICE_ADMIN ? serviceEntityName : role === Role.EMPLOYEE ? employeeServiceEntityName: '-'}</p>
            <p className="w-[6%] flex-shrink-0">{walletBalance} C</p>
            <p className="w-[5%] flex-shrink-0">-</p>
            <p className="w-[9%] flex-shrink-0">{new Date(createdAt).toDateString()}</p>
        </div>
    )
}

export function buildUserQueryString(filters: Partial<UserFilter> | undefined | null) {
    if(!filters){
        return "";
    }

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (
        typeof value === "string" ||
        typeof value === "number"
        ) {
        if (value !== "") {
            params.append(key, String(value));
        }
        }
    });

    return params.toString();
}
