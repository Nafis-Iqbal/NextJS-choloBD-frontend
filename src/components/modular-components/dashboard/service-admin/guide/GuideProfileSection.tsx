"use client";

import { useRouter } from "next/navigation";
import { StarRating } from "@/components/custom-elements/StarRating";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatWorkingDays(workingDays?: number[]) {
  if (!workingDays || workingDays.length === 0) return "Not specified";
  return [...workingDays]
    .sort((a, b) => a - b)
    .map((day) => DAY_LABELS[day] ?? String(day))
    .join(", ");
}

export const GuideProfileSection: React.FC<{
  profile: Guide;
  className?: string;
}> = ({ profile, className }) => {
  const router = useRouter();
  const guideName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <section className={`mb-8 ${className || ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold theme-text">Guide Profile</h2>
        <button
          onClick={() => router.push(`/guides/${profile.id}/edit`)}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg theme-btn-teal font-medium"
        >
          ✎ Edit
        </button>
      </div>

      <div className="theme-card rounded-xl p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h3 className="theme-text font-semibold text-lg sm:text-xl">
            {guideName || "Guide Profile"}
          </h3>
          {profile.isVerified && (
            <span className="theme-badge px-3 py-1 rounded-full text-xs font-medium">
              Verified
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              profile.isActive
                ? "bg-green-600/20 text-green-700"
                : "bg-red-500/20 text-red-700"
            }`}
          >
            {profile.isActive ? "Active" : "Inactive"}
          </span>
          {profile.availabilityStatus && (
            <span className="px-3 py-1 rounded-full text-xs font-medium theme-text-muted"
              style={{ backgroundColor: "var(--theme-section-bg)" }}
            >
              {formatLabel(profile.availabilityStatus)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="theme-text-subtle text-sm">Email</p>
              <p className="theme-text break-all">{profile.contactEmail}</p>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Phone</p>
              <p className="theme-text">{profile.phoneNumber}</p>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Location</p>
              <p className="theme-text">
                {profile.location?.name ||
                  profile.location?.city ||
                  "Not set"}
              </p>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Experience</p>
              <p className="theme-text">
                {profile.experienceYears} year
                {profile.experienceYears === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="theme-text-subtle text-sm">Price Per Day</p>
              <p className="theme-text-teal text-xl font-bold">
                ৳ {profile.pricePerDay.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Working Days</p>
              <p className="theme-text">{formatWorkingDays(profile.workingDays)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="theme-text-subtle text-sm">Hours Start</p>
                <p className="theme-text">
                  {profile.workingHoursStart || "N/A"}
                </p>
              </div>
              <div>
                <p className="theme-text-subtle text-sm">Hours End</p>
                <p className="theme-text">
                  {profile.workingHoursEnd || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Requires Start Time</p>
              <p className="theme-text">
                {profile.requiresStartTime ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid var(--theme-deep-green)" }}
        >
          <p className="theme-text-subtle text-sm mb-2">Bio</p>
          <p className="theme-text-muted break-words">{profile.bio}</p>
        </div>

        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid var(--theme-deep-green)" }}
        >
          <p className="theme-text font-semibold mb-3">Specializations</p>
          <div className="flex flex-wrap gap-2">
            {(profile.specializations || []).map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: "var(--theme-teal)", color: "white" }}
              >
                {formatLabel(item)}
              </span>
            ))}
            {(!profile.specializations || profile.specializations.length === 0) && (
              <p className="theme-text-subtle text-sm">None listed</p>
            )}
          </div>
        </div>

        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid var(--theme-deep-green)" }}
        >
          <p className="theme-text font-semibold mb-3">Languages</p>
          <div className="flex flex-wrap gap-2">
            {(profile.languages || []).map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-sm theme-text"
                style={{ backgroundColor: "var(--theme-section-bg)" }}
              >
                {formatLabel(item)}
              </span>
            ))}
            {(!profile.languages || profile.languages.length === 0) && (
              <p className="theme-text-subtle text-sm">None listed</p>
            )}
          </div>
        </div>

        {(profile.certificationNumber || profile.licenseNumber) && (
          <div
            className="mt-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{ borderTop: "1px solid var(--theme-deep-green)" }}
          >
            {profile.certificationNumber && (
              <div>
                <p className="theme-text-subtle text-sm">Certification</p>
                <p className="theme-text break-all">{profile.certificationNumber}</p>
              </div>
            )}
            {profile.licenseNumber && (
              <div>
                <p className="theme-text-subtle text-sm">License</p>
                <p className="theme-text break-all">{profile.licenseNumber}</p>
              </div>
            )}
          </div>
        )}

        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid var(--theme-deep-green)" }}
        >
          <p className="theme-text-subtle text-sm">Guide Rating</p>
          <StarRating rating={profile.rating || 0} />
          {profile._count?.reviews != null && (
            <p className="theme-text-subtle text-xs mt-1">
              {profile._count.reviews} review
              {profile._count.reviews === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
