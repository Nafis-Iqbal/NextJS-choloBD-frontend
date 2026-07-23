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

const scrollContainerClass =
  "rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border";

const cardClass =
  "rounded-sm md:rounded p-2 md:p-3 overflow-hidden transition-colors border-0 md:border";

// Booked Transport Section
export const BookedTransportSection: React.FC<{
  transports: TransportBooking[];
  className?: string;
  showFakeData?: boolean;
  id?: string;
}> = ({ transports, className, showFakeData = false, id }) => {
  const ongoingTransport =
    transports?.filter((t) => t.status === "ongoing") || [];
  const upcomingTransport =
    transports?.filter((t) => t.status === "upcoming") || [];

  const renderTransportCard = (transport: TransportBooking) => (
    <div
      key={transport.id}
      className={cardClass}
      style={{
        backgroundColor: "var(--theme-bg)",
        borderColor: "var(--theme-deep-green)",
      }}
    >
      <div className="flex flex-col gap-2 md:gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
        <div className="flex-1 min-w-0">
          <p className="theme-text font-medium break-words">
            {transport.transportType}
          </p>
          <div className="theme-text-muted text-sm mt-1 flex flex-col gap-0.5 sm:block">
            <span className="break-words">{transport.route}</span>
            <span className="hidden sm:inline"> • </span>
            <span>{transport.departureDate}</span>
          </div>
        </div>
        <div className="w-full sm:w-auto text-left sm:text-right shrink-0">
          <p className="theme-text font-semibold text-sm sm:text-base">
            ৳ {transport.price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className={`mb-0 ${className || ""}`} id={id}>
      <div
        className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
        style={{ borderColor: "var(--theme-deep-green)" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
          Booked Transport
        </h2>
      </div>

      {showFakeData && (
        <PlaceholderFeatureWarning moduleName="Booked Transport Details" />
      )}

      {ongoingTransport.length === 0 && upcomingTransport.length === 0 ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No booked transport
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {ongoingTransport.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-semibold text-orange-400 mb-2 md:mb-3">
                🔴 Active Journey
              </h3>
              <div
                className={scrollContainerClass}
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="space-y-2">
                  {ongoingTransport.map(renderTransportCard)}
                </div>
              </div>
            </div>
          )}
          {upcomingTransport.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-semibold text-blue-400 mb-2 md:mb-3">
                📅 Upcoming Journey
              </h3>
              <div
                className={scrollContainerClass}
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="space-y-2">
                  {upcomingTransport.map(renderTransportCard)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
