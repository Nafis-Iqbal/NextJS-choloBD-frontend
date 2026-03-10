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
        <h2 className="text-2xl font-bold text-white">Hotel Profile</h2>
        <button
          onClick={() => router.push(`/hotels/${profile.id}/edit`)}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium"
        >
          ✎ Edit
        </button>
      </div>

      <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{profile.name}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{profile.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone Number</p>
                <p className="text-white">{profile.phoneNumber}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Website</p>
                <p className="text-teal-400">{profile.website || "Not set"}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Address</p>
                <p className="text-white">{profile.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-sm">Check-in Time</p>
                  <p className="text-white">{profile.checkInTime}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Check-out Time</p>
                  <p className="text-white">{profile.checkOutTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Description</p>
          <p className="text-gray-300">{profile.description}</p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-white font-semibold mb-3">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {profile.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-3 py-1 rounded-full bg-teal-600/30 text-teal-300 text-sm"
              >
                ✓ {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-white font-semibold mb-3">Policies</p>
          <ul className="space-y-2">
            {profile.policies.map((policy) => (
              <li key={policy} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span>{policy}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm">Hotel Rating</p>
          <StarRating rating={profile.rating} />
        </div>
      </div>
    </section>
  );
};