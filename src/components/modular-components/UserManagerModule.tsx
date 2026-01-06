/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { Role, UserStatus, PaymentStatus } from "@/types/enums"
import { UserApi } from "@/services/api"
import { filterUsersSchema } from "@/validators/userValidators"
import { queryClient } from "@/services/apiInstance"

import TableLayout from "../layout-elements/TableLayout"
import FilterSectionLayout from "../layout-elements/FilterSectionLayout"
import { CustomSelectInput } from "../custom-elements/CustomInputElements"
import { CustomTextInput } from "../custom-elements/CustomInputElements"
import { HorizontalDivider } from "../custom-elements/UIUtilities"
import { NoContentTableRow } from "../placeholder-components/NoContentTableRow"
import { useRouter } from "next/navigation"

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
        <section className="flex flex-col mt-5" id="dashboard_users">
            <div className="flex mb-2 space-x-5">
                <h4 className="">All Users</h4>
                <button className="text-sm px-1 mt-1 bg-green-700 hover:bg-green-600 rounded-md self-center">View All</button>
            </div>
            <TableLayout className="md:mr-5">
                <div className="overflow-x-auto w-full">
                    <div className="min-w-[900px]">
                        <div className="flex border border-green-800 p-2 bg-gray-600 text-center">
                            <p className="w-[5%]">Sr.</p>
                            <p className="w-[25%]">User Name</p>
                            <p className="w-[15%]">Role</p>
                            <p className="w-[25%]">Email</p>
                            <p className="w-[15%]">Spent</p>
                            <p className="w-[15%]">Joined</p>
                        </div>
                        <div className="flex flex-col border-1 border-green-800 h-[80vh] md:h-[50vh] overflow-y-auto">
                            {
                                isFetchLoading ? (<NoContentTableRow displayMessage="Loading Data"  tdColSpan={1}/>) :
                                isFetchError ? (<NoContentTableRow displayMessage="An error occured"  tdColSpan={1}/>) :

                                (usersList?.data && Array.isArray(usersList?.data) && usersList?.data.length <= 0) ? (<NoContentTableRow displayMessage="No users found" tdColSpan={1}/>) :
                                (Array.isArray(usersList?.data) &&
                                    usersList?.data?.map((user, index) => (
                                        <UserListTableRow 
                                            key={user.id} 
                                            id={index + 1}
                                            userId={user.id} 
                                            userName={user.userName} 
                                            role={user.role} 
                                            email={user.email} 
                                            spent={5000} 
                                            joined={user.emailVerified ?? new Date(2025, 0, 31)}
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
                        className="bg-gray-600"
                        name="role"
                        label="Role"
                    />

                    <CustomSelectInput
                        options={userStatusOptions}
                        onChange={handleChange}
                        value={filters?.user_status}
                        className="bg-gray-600"
                        name="user_status"
                        label="User Status"
                    />

                    <CustomSelectInput
                        options={paymentStatusOptions}
                        onChange={handleChange}
                        value={filters?.payment_status}
                        className="bg-gray-600"
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
    id, userId, userName, role, email, spent, joined, navigateOnClick
} : {
    id: number, userId: string, userName: string, role: Role, email: string, spent: number, joined: Date, navigateOnClick: () => void
}) => {
    return (
        <div className="flex p-2 w-full border-green-900 hover:bg-gray-600 text-center" onClick={() => navigateOnClick()}>
            <p className="w-[5%]">{id}</p>
            <p className="w-[25%] hover:cursor-pointer">{userName}</p>
            <p className="w-[15%]">{role}</p>
            <p className="w-[25%]">{email}</p>
            <p className="w-[15%]">{spent}</p>
            <p className="w-[15%]">{new Date(joined).toDateString()}</p>
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
