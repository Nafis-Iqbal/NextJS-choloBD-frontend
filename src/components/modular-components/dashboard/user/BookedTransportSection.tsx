import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import React from "react";

export type TransportBooking = {
  id: string;
  transportType: string;
  route: string;
  departureDate: string;
  price: number;
  status: "ongoing" | "upcoming" | "completed";
};

// Booked Transport Section
export const BookedTransportSection: React.FC<{
  transports: TransportBooking[];
  className?: string;
}> = ({ transports, className }) => {
  const ongoingTransport = transports?.filter((t) => t.status === "ongoing") || [];
  const upcomingTransport = transports?.filter((t) => t.status === "upcoming") || [];

  return (
    <section className={`mb-8 ${className || ''}`}>
      <h2 className="text-2xl font-bold text-white mb-4">Booked Transport</h2>

      <PlaceholderFeatureWarning moduleName="Booked Transport Details" />

      {ongoingTransport.length === 0 && upcomingTransport.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No booked transport
        </div>
      ) : (
        <div className="space-y-6">
          {ongoingTransport.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">
                🔴 Active Journey
              </h3>
              <div className="space-y-2">
                {ongoingTransport.map((transport) => (
                  <div
                    key={transport.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-orange-600 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{transport.transportType}</p>
                      <p className="text-gray-400 text-sm">
                        {transport.route} • {transport.departureDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">৳ {transport.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {upcomingTransport.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">
                📅 Upcoming Journey
              </h3>
              <div className="space-y-2">
                {upcomingTransport.map((transport) => (
                  <div
                    key={transport.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-blue-600 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{transport.transportType}</p>
                      <p className="text-gray-400 text-sm">
                        {transport.route} • {transport.departureDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">৳ {transport.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
