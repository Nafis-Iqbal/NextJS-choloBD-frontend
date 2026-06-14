import { useRouter } from "next/navigation";
import { StarRating } from "@/components/custom-elements/StarRating";

type HotelProfile = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  website?: string;
  address: string;
  city: string;
  totalRooms: number;
  checkInTime: string;
  checkOutTime: string;
  description: string;
  amenities: string[];
  policies: string[];
  rating: number;
};

export const HotelProfileSection: React.FC<{ profile: HotelProfile; className?: string }> = ({ profile, className }) => {
  const router = useRouter();

  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold theme-text">Hotel Profile</h2>
        <button
          onClick={() => router.push(`/hotels/${profile.id}/edit`)}
          className="px-4 py-2 rounded-lg theme-btn-teal font-medium"
        >
          ✎ Edit
        </button>
      </div>

      <div className="theme-card rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="theme-text font-semibold text-lg mb-4">{profile.name}</h3>
            <div className="space-y-3">
              <div>
                <p className="theme-text-subtle text-sm">Email</p>
                <p className="theme-text">{profile.email}</p>
              </div>
              <div>
                <p className="theme-text-subtle text-sm">Phone Number</p>
                <p className="theme-text">{profile.phoneNumber}</p>
              </div>
              <div>
                <p className="theme-text-subtle text-sm">Website</p>
                <p className="theme-text-teal">{profile.website || "Not set"}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div>
                <p className="theme-text-subtle text-sm">Address</p>
                <p className="theme-text">{profile.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="theme-text-subtle text-sm">Check-in Time</p>
                  <p className="theme-text">{profile.checkInTime}</p>
                </div>
                <div>
                  <p className="theme-text-subtle text-sm">Check-out Time</p>
                  <p className="theme-text">{profile.checkOutTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--theme-deep-green)' }}>
          <p className="theme-text-subtle text-sm mb-2">Description</p>
          <p className="theme-text-muted">{profile.description}</p>
        </div>

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--theme-deep-green)' }}>
          <p className="theme-text font-semibold mb-3">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {profile.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--theme-teal)', color: 'white' }}
              >
                ✓ {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--theme-deep-green)' }}>
          <p className="theme-text font-semibold mb-3">Policies</p>
          <ul className="space-y-2">
            {profile.policies.map((policy) => (
              <li key={policy} className="theme-text-muted text-sm flex items-start gap-2">
                <span className="theme-text-teal mt-1">•</span>
                <span>{policy}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--theme-deep-green)' }}>
          <p className="theme-text-subtle text-sm">Hotel Rating</p>
          <StarRating rating={profile.rating} />
        </div>
      </div>
    </section>
  );
};