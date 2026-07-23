"use client";

import { useRouter } from "next/navigation";
import { StarRating } from "@/components/custom-elements/StarRating";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export const ActivityProfileSection: React.FC<{
  profile: ActivitySpot;
  className?: string;
  id?: string;
}> = ({ profile, className, id }) => {
  const router = useRouter();

  return (
    <section className={`mb-8 ${className || ""}`} id={id}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-end mb-6">
        {/* <h2 className="text-xl sm:text-2xl font-bold theme-text">
          Activity Profile
        </h2> */}
        <button
          onClick={() => router.push(`/activity-spots/${profile.id}/edit`)}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg theme-btn-teal font-medium"
        >
          ✎ Edit
        </button>
      </div>

      <div className="theme-card rounded-xl p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h3 className="theme-text font-semibold text-lg sm:text-xl">
            {profile.name || "Activity Profile"}
          </h3>
          {profile.isPopular && (
            <span className="theme-badge px-3 py-1 rounded-full text-xs font-medium">
              Popular
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
          {profile.activityType && (
            <span
              className="px-3 py-1 rounded-full text-xs font-medium theme-text-muted"
              style={{ backgroundColor: "var(--theme-section-bg)" }}
            >
              {formatLabel(profile.activityType)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="theme-text-subtle text-sm">Phone</p>
              <p className="theme-text">{profile.phoneNumber || "Not set"}</p>
            </div>
            {(profile.extraPhoneNumbers?.length ?? 0) > 0 && (
              <div>
                <p className="theme-text-subtle text-sm">Extra Phones</p>
                <p className="theme-text break-all">
                  {profile.extraPhoneNumbers?.join(", ")}
                </p>
              </div>
            )}
            <div>
              <p className="theme-text-subtle text-sm">Location</p>
              <p className="theme-text">
                {profile.location?.name ||
                  profile.location?.city ||
                  "Not set"}
              </p>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Duration</p>
              <p className="theme-text">{profile.duration || "N/A"}</p>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Age Restriction</p>
              <p className="theme-text">{profile.ageRestriction || "None"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="theme-text-subtle text-sm">Entry Cost</p>
              <p className="theme-text-teal text-xl font-bold">
                ৳ {(profile.entryCost ?? 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Max Bookings / Day</p>
              <p className="theme-text">
                {profile.maxBookingsPerDay ?? "Unlimited"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="theme-text-subtle text-sm">Opening Hours</p>
                <p className="theme-text">{profile.openingHours || "N/A"}</p>
              </div>
              <div>
                <p className="theme-text-subtle text-sm">Closing Hours</p>
                <p className="theme-text">{profile.closingHours || "N/A"}</p>
              </div>
            </div>
            <div>
              <p className="theme-text-subtle text-sm">Best Time to Visit</p>
              <p className="theme-text">{profile.bestTimeToVisit || "N/A"}</p>
            </div>
          </div>
        </div>

        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid var(--theme-deep-green)" }}
        >
          <p className="theme-text-subtle text-sm mb-2">Description</p>
          <p className="theme-text-muted break-words">
            {profile.description || "No description provided"}
          </p>
        </div>

        {profile.bookingConfirmInstruction && (
          <div
            className="mt-6 pt-6"
            style={{ borderTop: "1px solid var(--theme-deep-green)" }}
          >
            <p className="theme-text-subtle text-sm mb-2">
              Booking Confirm Instruction
            </p>
            <p className="theme-text-muted break-words">
              {profile.bookingConfirmInstruction}
            </p>
          </div>
        )}

        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid var(--theme-deep-green)" }}
        >
          <p className="theme-text-subtle text-sm">Activity Rating</p>
          <StarRating rating={profile.rating || 0} />
          {profile.reviews != null && (
            <p className="theme-text-subtle text-xs mt-1">
              {profile.reviews.length} review
              {profile.reviews.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
