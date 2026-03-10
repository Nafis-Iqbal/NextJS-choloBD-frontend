import React from "react";

export type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destination: string;
  status: "ongoing" | "upcoming";
  members: number;
};

// Trips Section
export const TripsSection: React.FC<{
  trips: Trip[];
  title: string;
  className?: string;
}> = ({ trips, title, className }) => {
  if (!trips || trips.length === 0) {
    return (
      <section className={`mb-8 ${className || ''}`}>
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No {title.toLowerCase()} at the moment
        </div>
      </section>
    );
  }

  return (
    <section className={`mb-8 ${className || ''}`}>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="space-y-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{trip.title}</h3>
                <p className="text-teal-400 text-sm mt-1">📍 {trip.destination}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {trip.startDate} to {trip.endDate} • {trip.members} members
                </p>
              </div>
              <div className="mt-3 md:mt-0">
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    trip.status === "ongoing"
                      ? "bg-orange-600/30 text-orange-300 border border-orange-600/50"
                      : "bg-blue-600/30 text-blue-300 border border-blue-600/50"
                  }`}
                >
                  {trip.status === "ongoing" ? "🔴 Ongoing" : "📅 Upcoming"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
