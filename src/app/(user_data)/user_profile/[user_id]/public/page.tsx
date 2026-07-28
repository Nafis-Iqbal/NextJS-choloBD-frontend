"use client";

import { useParams } from "next/navigation";
import { UserApi } from "@/services/api";
import { PublicUserProfile } from "@/services/api/userApi";
import { Role, UserStatus } from "@/types/enums";

const formatEnumValue = (value?: string | null): string => {
    if (!value) return "Not specified";

    return value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getDisplayName = (profile: PublicUserProfile): string => {
    const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();
    return fullName || profile.userName || "CholoBD Traveler";
};

const getInitials = (profile: PublicUserProfile): string => {
    const displayName = getDisplayName(profile);

    return displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "CB";
};

const formatJoinedDate = (createdAt?: string): string => {
    if (!createdAt) return "Unknown";

    const parsedDate = new Date(createdAt);
    if (Number.isNaN(parsedDate.getTime())) return "Unknown";

    return parsedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
    });
};

const getRoleHeadline = (role: Role): string => {
    switch (role) {
        case Role.MASTER_ADMIN:
            return "Platform Administrator";
        case Role.SERVICE_ADMIN:
            return "Service Administrator";
        case Role.EMPLOYEE:
            return "Service Team Member";
        default:
            return "Traveler";
    }
};

const getServiceSummary = (profile: PublicUserProfile): string => {
    if (profile.role === Role.SERVICE_ADMIN) {
        const serviceType = formatEnumValue(profile.serviceType);
        return profile.serviceEntityName
            ? `Manages ${profile.serviceEntityName} in ${serviceType}.`
            : `Works as a service administrator in ${serviceType}.`;
    }

    if (profile.role === Role.EMPLOYEE) {
        const serviceType = formatEnumValue(profile.employeeServiceType);
        return profile.employeeServiceEntityName
            ? `Supports operations at ${profile.employeeServiceEntityName} in ${serviceType}.`
            : `Works as a team member in ${serviceType}.`;
    }

    if (profile.role === Role.MASTER_ADMIN) {
        return "Helps oversee platform operations and community quality across CholoBD.";
    }

    return "Explores destinations, plans trips, and takes part in the CholoBD travel community.";
};

const getProfileSummary = (profile: PublicUserProfile): string => {
    return `${getDisplayName(profile)} is a ${getRoleHeadline(profile.role).toLowerCase()} on CholoBD. ${getServiceSummary(profile)}`;
};

const getPrimaryServiceLabel = (profile: PublicUserProfile): string | null => {
    if (profile.role === Role.SERVICE_ADMIN && profile.serviceType) {
        return formatEnumValue(profile.serviceType);
    }

    if (profile.role === Role.EMPLOYEE && profile.employeeServiceType) {
        return formatEnumValue(profile.employeeServiceType);
    }

    return null;
};

export default function PublicUserProfilePage() {
    const params = useParams();
    const userId = params.user_id as string;

    const {
        data: publicProfileResponse,
        isLoading,
        isError,
    } = UserApi.useGetPublicUserDetailRQ(userId, !!userId);

    const profile = publicProfileResponse?.data;

    if (isLoading) {
        return (
            <div className="flex flex-col p-4 md:p-6 lg:p-8 font-sans">
                <section className="theme-section rounded-3xl p-6 md:p-8 animate-pulse">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center">
                        <div className="h-28 w-28 rounded-3xl theme-avatar" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-32 rounded" style={{ backgroundColor: "var(--theme-card-bg)" }} />
                            <div className="h-8 w-56 rounded" style={{ backgroundColor: "var(--theme-card-bg)" }} />
                            <div className="h-4 w-full rounded" style={{ backgroundColor: "var(--theme-card-bg)" }} />
                            <div className="h-4 w-3/4 rounded" style={{ backgroundColor: "var(--theme-card-bg)" }} />
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="flex flex-col p-4 md:p-6 lg:p-8 font-sans">
                <section className="theme-section rounded-3xl p-6 md:p-8">
                    <div className="max-w-2xl space-y-3">
                        <p className="theme-label">Public Profile</p>
                        <h3 className="theme-text">This profile is not available right now.</h3>
                        <p className="theme-text-muted">
                            The profile may not exist, or your account may not currently have permission to view it.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    const publicStats = [
        { label: "Trip Plans", value: profile._count?.userTripPlans ?? 0 },
        { label: "Bookings", value: profile._count?.tripBookings ?? 0 },
        { label: "Community Posts", value: profile._count?.communityPostsCreated ?? 0 },
        { label: "Reviews", value: profile._count?.reviews ?? 0 },
    ];

    const primaryServiceLabel = getPrimaryServiceLabel(profile);
    const serviceEntityName =
        profile.role === Role.SERVICE_ADMIN
            ? profile.serviceEntityName
            : profile.role === Role.EMPLOYEE
              ? profile.employeeServiceEntityName
              : null;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 font-sans">
            <section className="theme-section rounded-3xl p-6 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <div
                        className="theme-avatar theme-outline flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-center bg-cover text-3xl font-semibold text-white md:h-32 md:w-32"
                        style={profile.imageUrl ? { backgroundImage: `url(${profile.imageUrl})` } : undefined}
                    >
                        {!profile.imageUrl && getInitials(profile)}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <span className="theme-badge rounded-full px-4 py-1 text-sm">
                                {getRoleHeadline(profile.role)}
                            </span>
                            {primaryServiceLabel && (
                                <span className="theme-badge rounded-full px-4 py-1 text-sm">
                                    {primaryServiceLabel}
                                </span>
                            )}
                            {profile.userStatus && profile.userStatus !== UserStatus.ACTIVE && (
                                <span className="theme-badge rounded-full px-4 py-1 text-sm">
                                    {formatEnumValue(profile.userStatus)}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="theme-label">Public Profile</p>
                            <h2 className="theme-text">{getDisplayName(profile)}</h2>
                            <p className="theme-text-muted max-w-4xl text-base md:text-lg leading-relaxed">
                                {getProfileSummary(profile)}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                            <div className="theme-card rounded-2xl px-4 py-3">
                                <p className="theme-text-subtle uppercase tracking-wide text-xs">Member Since</p>
                                <p className="theme-text mt-1 font-semibold">{formatJoinedDate(profile.createdAt)}</p>
                            </div>

                            <div className="theme-card rounded-2xl px-4 py-3">
                                <p className="theme-text-subtle uppercase tracking-wide text-xs">Public Role</p>
                                <p className="theme-text mt-1 font-semibold">{getRoleHeadline(profile.role)}</p>
                            </div>

                            <div className="theme-card rounded-2xl px-4 py-3 sm:col-span-2 xl:col-span-1">
                                <p className="theme-text-subtle uppercase tracking-wide text-xs">Current Focus</p>
                                <p className="theme-text mt-1 font-semibold">
                                    {serviceEntityName || primaryServiceLabel || "Travel and community activity"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {publicStats.map((stat) => (
                    <article key={stat.label} className="theme-card rounded-2xl p-4 md:p-5">
                        <p className="theme-text-subtle text-xs uppercase tracking-wide">{stat.label}</p>
                        <p className="theme-text mt-3 text-3xl font-semibold">{stat.value}</p>
                    </article>
                ))}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
                <article className="theme-card rounded-3xl p-6">
                    <div className="space-y-4">
                        <div>
                            <p className="theme-label">Profile Overview</p>
                            <h4 className="theme-text mt-2">A cleaner public-facing view</h4>
                        </div>

                        <p className="theme-text-muted leading-relaxed">
                            This page highlights the user&apos;s public travel presence on CholoBD rather than their
                            personal account controls. It focuses on who they are in the ecosystem, how long they have
                            been around, and the kind of activity they contribute.
                        </p>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="theme-section rounded-2xl p-4">
                                <p className="theme-text-subtle text-xs uppercase tracking-wide">Display Name</p>
                                <p className="theme-text mt-1 font-semibold">{getDisplayName(profile)}</p>
                            </div>

                            <div className="theme-section rounded-2xl p-4">
                                <p className="theme-text-subtle text-xs uppercase tracking-wide">Username</p>
                                <p className="theme-text mt-1 font-semibold">{profile.userName || "Not shared"}</p>
                            </div>

                            <div className="theme-section rounded-2xl p-4">
                                <p className="theme-text-subtle text-xs uppercase tracking-wide">Role</p>
                                <p className="theme-text mt-1 font-semibold">{getRoleHeadline(profile.role)}</p>
                            </div>

                            <div className="theme-section rounded-2xl p-4">
                                <p className="theme-text-subtle text-xs uppercase tracking-wide">Joined</p>
                                <p className="theme-text mt-1 font-semibold">{formatJoinedDate(profile.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="theme-card rounded-3xl p-6">
                    <div className="space-y-4">
                        <div>
                            <p className="theme-label">Public Activity Notes</p>
                            <h4 className="theme-text mt-2">What is visible here</h4>
                        </div>

                        <div className="space-y-3">
                            <div className="theme-section rounded-2xl p-4">
                                <p className="theme-text font-semibold">Travel footprint</p>
                                <p className="theme-text-muted mt-1 leading-relaxed">
                                    Counts for trip plans, bookings, community posts, and reviews are shown here as a
                                    light public snapshot of activity.
                                </p>
                            </div>

                            <div className="theme-section rounded-2xl p-4">
                                <p className="theme-text font-semibold">Service context</p>
                                <p className="theme-text-muted mt-1 leading-relaxed">
                                    {serviceEntityName
                                        ? `${getDisplayName(profile)} is publicly associated with ${serviceEntityName}.`
                                        : "No public service assignment is shown for this profile."}
                                </p>
                            </div>

                            <div className="theme-section rounded-2xl p-4">
                                <p className="theme-text font-semibold">Private details remain hidden</p>
                                <p className="theme-text-muted mt-1 leading-relaxed">
                                    Email, phone number, wallet information, and account-management controls are
                                    intentionally left out of this public-facing page.
                                </p>
                            </div>
                        </div>
                    </div>
                </article>
            </section>
        </div>
    );
}
