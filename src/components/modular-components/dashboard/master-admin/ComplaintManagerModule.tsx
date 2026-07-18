"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComplaintApi } from "@/services/api";
import {
    ComplaintAddressedTo,
    ComplaintStatus,
    ComplaintTargetType,
} from "@/types/enums";

import TableLayout from "../../../layout-elements/TableLayout";
import FilterSectionLayout from "../../../layout-elements/FilterSectionLayout";
import { CustomSelectInput } from "../../../custom-elements/CustomInputElements";
import { HorizontalDivider } from "../../../custom-elements/UIUtilities";
import { NoContentTableRow } from "../../../placeholder-components/NoContentTableRow";

export interface ComplaintManagerModuleProps {
    /**
     * Inbox destination — drives fetch scope and which filter UI is shown.
     * MASTER_ADMIN → only platform complaints
     * SERVICE_ADMIN → entity operator queue (backend scopes to caller's entity)
     */
    addressedTo: ComplaintAddressedTo;
    /** Entity type for SERVICE_ADMIN queues — UI labeling only */
    targetType?: ComplaintTargetType;
    /** Optional entity id for SERVICE_ADMIN header context */
    targetEntityId?: string;
    className?: string;
}

const formatEnumValue = (value: string): string => {
    return value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const formatCreatedAt = (value: Date | string): string => {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const truncateText = (value: string, maxLength: number): string => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trimEnd()}…`;
};

const getTargetDisplayName = (complaint: Complaint): string => {
    if (!complaint.targetType) {
        return "—";
    }

    const target = complaint.target;
    if (target) {
        if (complaint.targetType === "GUIDE") {
            const fullName = `${target.firstName || ""} ${target.lastName || ""}`.trim();
            return fullName || formatEnumValue(complaint.targetType);
        }
        if (target.name) {
            return target.name;
        }
    }

    return formatEnumValue(complaint.targetType);
};

const getComplainantName = (complaint: Complaint): string => {
    return (
        complaint.complainantName ||
        complaint.complainant?.userName ||
        complaint.complainant?.email ||
        "Unknown user"
    );
};

const STATUS_OPTIONS = [
    { value: "", label: "All statuses" },
    ...Object.values(ComplaintStatus).map((status) => ({
        value: status,
        label: formatEnumValue(status),
    })),
];

const TARGET_TYPE_OPTIONS = [
    { value: "", label: "All target types" },
    ...Object.values(ComplaintTargetType).map((type) => ({
        value: type,
        label: formatEnumValue(type),
    })),
];

const MasterAdminComplaintFilters = ({
    status,
    targetType,
    onStatusChange,
    onTargetTypeChange,
}: {
    status: ComplaintStatus | "";
    targetType: ComplaintTargetType | "";
    onStatusChange: (value: ComplaintStatus | "") => void;
    onTargetTypeChange: (value: ComplaintTargetType | "") => void;
}) => {
    return (
        <div className="flex flex-wrap justify-left gap-6">
            <div className="flex flex-col space-y-1 min-w-[180px]">
                <CustomSelectInput
                    label="Complaint Status"
                    name="status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(e) =>
                        onStatusChange((e.target.value as ComplaintStatus) || "")
                    }
                    style={{ backgroundColor: "var(--theme-card-bg)" }}
                />
            </div>

            <div className="flex flex-col space-y-1 min-w-[180px]">
                <CustomSelectInput
                    label="Related Entity Type"
                    name="targetType"
                    options={TARGET_TYPE_OPTIONS}
                    value={targetType}
                    onChange={(e) =>
                        onTargetTypeChange(
                            (e.target.value as ComplaintTargetType) || ""
                        )
                    }
                    style={{ backgroundColor: "var(--theme-card-bg)" }}
                />
            </div>
        </div>
    );
};

const ServiceAdminComplaintFilters = ({
    status,
    onStatusChange,
}: {
    status: ComplaintStatus | "";
    onStatusChange: (value: ComplaintStatus | "") => void;
}) => {
    return (
        <div className="flex flex-wrap justify-left gap-6">
            <div className="flex flex-col space-y-1 min-w-[180px]">
                <CustomSelectInput
                    label="Complaint Status"
                    name="status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(e) =>
                        onStatusChange((e.target.value as ComplaintStatus) || "")
                    }
                    style={{ backgroundColor: "var(--theme-card-bg)" }}
                />
            </div>
        </div>
    );
};

export const ComplaintManagerModule = ({
    addressedTo,
    targetType: propTargetType,
    className = "",
}: ComplaintManagerModuleProps) => {
    const isMasterAdminQueue =
        addressedTo === ComplaintAddressedTo.MASTER_ADMIN;

    const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "">("");
    const [targetTypeFilter, setTargetTypeFilter] = useState<
        ComplaintTargetType | ""
    >("");
    const [page, setPage] = useState(1);

    const inboxParams = isMasterAdminQueue
        ? {
              addressedTo: ComplaintAddressedTo.MASTER_ADMIN,
              status: statusFilter || undefined,
              targetType: targetTypeFilter || undefined,
              page,
              limit: 30,
          }
        : {
              status: statusFilter || undefined,
              page,
              limit: 30,
          };

    const {
        data: complaintsResponse,
        isLoading,
        isError,
    } = ComplaintApi.useGetComplaintInboxRQ(inboxParams);

    const complaints = complaintsResponse?.data?.results || [];
    const total = complaintsResponse?.data?.total || 0;
    const limit = complaintsResponse?.data?.limit || 30;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const onSubmitFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPage(1);
    };

    const title = isMasterAdminQueue
        ? "Platform Complaints"
        : `${propTargetType ? formatEnumValue(propTargetType) + " " : ""}Customer Complaints`;

    return (
        <section
            className={`flex flex-col ${className}`}
            id="complain_management"
        >
            <div className="flex space-x-5 mb-2 items-center">
                <h4 className="theme-text">{title}</h4>
            </div>

            <TableLayout className="">
                <div className="overflow-x-auto w-full">
                    <div className="min-w-[800px]">
                        <div
                            className="flex theme-outline p-2 text-left"
                            style={{ backgroundColor: "var(--theme-card-bg)" }}
                        >
                            <p className={isMasterAdminQueue ? "w-[18%]" : "w-[22%]"}>
                                Title
                            </p>
                            <p className={isMasterAdminQueue ? "w-[28%]" : "w-[33%]"}>
                                Description
                            </p>
                            {isMasterAdminQueue && (
                                <p className="w-[14%]">Related Entity</p>
                            )}
                            <p className={isMasterAdminQueue ? "w-[16%]" : "w-[20%]"}>
                                Complained by
                            </p>
                            <p className="w-[12%]">Status</p>
                            <p className="w-[12%]">Submitted</p>
                        </div>

                        <div className="flex flex-col theme-outline min-h-[70vh] md:min-h-[40vh]">
                            {isLoading ? (
                                <NoContentTableRow
                                    displayMessage="Loading Data"
                                    tdColSpan={1}
                                />
                            ) : isError ? (
                                <NoContentTableRow
                                    displayMessage="Error loading complaints"
                                    tdColSpan={1}
                                />
                            ) : complaints.length === 0 ? (
                                <NoContentTableRow
                                    displayMessage="No complaints submitted"
                                    tdColSpan={1}
                                />
                            ) : (
                                complaints.map((complaint) => (
                                    <ComplaintListTableRow
                                        key={complaint.id}
                                        complaintId={complaint.id}
                                        title={complaint.title}
                                        description={complaint.description}
                                        target={
                                            isMasterAdminQueue
                                                ? getTargetDisplayName(complaint)
                                                : undefined
                                        }
                                        complainingUserName={getComplainantName(
                                            complaint
                                        )}
                                        complaintStatus={complaint.status}
                                        createdAt={complaint.createdAt}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </TableLayout>

            {totalPages > 1 && (
                <div className="flex items-center gap-3 mr-5 mt-2">
                    <button
                        type="button"
                        className="green-button text-sm disabled:opacity-50"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <span className="theme-text-subtle text-sm">
                        Page {page} of {totalPages} ({total} total)
                    </span>
                    <button
                        type="button"
                        className="green-button text-sm disabled:opacity-50"
                        disabled={page >= totalPages}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                    >
                        Next
                    </button>
                </div>
            )}

            <FilterSectionLayout className="mr-5" onSubmit={onSubmitFilter}>
                {isMasterAdminQueue ? (
                    <MasterAdminComplaintFilters
                        status={statusFilter}
                        targetType={targetTypeFilter}
                        onStatusChange={(value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }}
                        onTargetTypeChange={(value) => {
                            setTargetTypeFilter(value);
                            setPage(1);
                        }}
                    />
                ) : (
                    <ServiceAdminComplaintFilters
                        status={statusFilter}
                        onStatusChange={(value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }}
                    />
                )}
            </FilterSectionLayout>

            <HorizontalDivider className="mr-5 my-10" />
        </section>
    );
};

const ComplaintListTableRow = ({
    complaintId,
    title,
    description,
    target,
    complainingUserName,
    complaintStatus,
    createdAt,
}: {
    complaintId: string;
    title: string;
    description: string;
    target?: string;
    complainingUserName: string;
    complaintStatus: ComplaintStatus;
    createdAt: Date | string;
}) => {
    const router = useRouter();
    const showTarget = target !== undefined;

    return (
        <div
            role="link"
            tabIndex={0}
            onClick={() => router.push(`/complaint/${complaintId}`)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/complaint/${complaintId}`);
                }
            }}
            className="flex p-2 w-full theme-outline text-left cursor-pointer transition-colors"
            style={{
                borderColor: "var(--theme-deep-green)",
                borderBottomWidth: "1px",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--theme-card-bg)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Open complaint details"
        >
            <p
                className={`${showTarget ? "w-[18%]" : "w-[22%]"} truncate pr-2`}
                title={title}
            >
                {title}
            </p>
            <p
                className={`${showTarget ? "w-[28%]" : "w-[33%]"} truncate pr-2 theme-text-muted`}
                title={description}
            >
                {truncateText(description, 120)}
            </p>
            {showTarget && (
                <p className="w-[14%] truncate pr-2" title={target}>
                    {target}
                </p>
            )}
            <p
                className={`${showTarget ? "w-[16%]" : "w-[20%]"} truncate pr-2`}
                title={complainingUserName}
            >
                {complainingUserName}
            </p>
            <p className="w-[12%] pr-2">{formatEnumValue(complaintStatus)}</p>
            <p className="w-[12%] theme-text-subtle">
                {formatCreatedAt(createdAt)}
            </p>
        </div>
    );
};
