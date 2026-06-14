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
      <h2 className="text-2xl font-bold theme-text mb-4">Booked Transport</h2>

      <PlaceholderFeatureWarning moduleName="Booked Transport Details" />

      {ongoingTransport.length === 0 && upcomingTransport.length === 0 ? (
        <div className="theme-card rounded-xl p-6 text-center theme-text-subtle">
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
                    className="theme-card rounded-lg p-4 flex items-center justify-between hover:border-orange-600 transition-colors"
                  >
                    <div>
                      <p className="theme-text font-medium">{transport.transportType}</p>
                      <p className="theme-text-muted text-sm">
                        {transport.route} • {transport.departureDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="theme-text font-semibold">৳ {transport.price.toLocaleString()}</p>
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
                    className="theme-card rounded-lg p-4 flex items-center justify-between hover:border-blue-600 transition-colors"
                  >
                    <div>
                      <p className="theme-text font-medium">{transport.transportType}</p>
                      <p className="theme-text-muted text-sm">
                        {transport.route} • {transport.departureDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="theme-text font-semibold">৳ {transport.price.toLocaleString()}</p>
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
