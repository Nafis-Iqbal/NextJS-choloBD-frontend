"use client";

import React, { useState } from "react";
import { LocationApi, TransportInventoryApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import {
  deriveTripStatus,
  fromDateTimeLocalValue,
  layoutSeatCount,
  toDateTimeLocalValue,
} from "./types";

interface RideManagementSectionProps {
  transportId: string;
  operatorName?: string;
  id?: string;
  className?: string;
}

export const RideManagementSection = ({
  transportId,
  operatorName,
  id,
  className = "",
}: RideManagementSectionProps) => {
  const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [isAddingRide, setIsAddingRide] = useState(false);
  const [routeForm, setRouteForm] = useState({
    name: "",
    originLocationId: "",
    destinationLocationId: "",
  });
  const [tripForm, setTripForm] = useState({
    transportRouteId: "",
    layoutId: "",
    departureDateTime: "",
    arrivalDateTime: "",
  });
  const [editTimes, setEditTimes] = useState({
    departureDateTime: "",
    arrivalDateTime: "",
  });

  const { data: locationsData } = LocationApi.useGetAllLocationsRQ();
  const locations = (locationsData?.data || []).filter(
    (location) => location.locationType === "DISTRICT"
  );

  const {
    data: routesData,
    isLoading: isRoutesLoading,
    refetch: refetchRoutes,
  } = TransportInventoryApi.useGetTransportRoutesRQ(
    transportId ? { transportId } : undefined,
    Boolean(transportId)
  );
  const routes = routesData?.data || [];

  const { data: layoutsData } = TransportInventoryApi.useGetTransportLayoutsRQ(
    transportId,
    Boolean(transportId)
  );
  const layouts = layoutsData?.data || [];

  const {
    data: tripsData,
    isLoading: isTripsLoading,
    isError: isTripsError,
    refetch: refetchTrips,
  } = TransportInventoryApi.useGetTransportTripsRQ(
    transportId ? { transportId } : undefined,
    Boolean(transportId)
  );
  const trips = tripsData?.data || [];

  const { data: seatsData, isLoading: isSeatsLoading } =
    TransportInventoryApi.useGetTransportTripSeatsRQ(
      expandedRide || "",
      Boolean(expandedRide)
    );

  const finish = (message: string) => {
    showLoadingContent(false);
    openNotificationPopUpMessage(message);
  };

  const invalidateSchedule = () => {
    queryClient.invalidateQueries({ queryKey: ["transport-inventory", "routes"] });
    queryClient.invalidateQueries({ queryKey: ["transport-inventory", "trips"] });
    refetchRoutes();
    refetchTrips();
  };

  const { mutate: createRouteMutate } = TransportInventoryApi.useCreateTransportRouteRQ(
    (response) => {
      if (response.status === "success") {
        setIsAddingRoute(false);
        setRouteForm({ name: "", originLocationId: "", destinationLocationId: "" });
        invalidateSchedule();
        finish("Route created.");
      } else {
        finish(response.message || "Failed to create route.");
      }
    },
    (error) => finish(error?.message || "Failed to create route.")
  );

  const { mutate: deleteRouteMutate } = TransportInventoryApi.useDeleteTransportRouteRQ(
    (response) => {
      if (response.status === "success") {
        invalidateSchedule();
        finish("Route deleted.");
      } else {
        finish(response.message || "Failed to delete route.");
      }
    },
    (error) => finish(error?.message || "Failed to delete route.")
  );

  const { mutate: createTripMutate } = TransportInventoryApi.useCreateTransportTripRQ(
    (response) => {
      if (response.status === "success") {
        setIsAddingRide(false);
        setTripForm({
          transportRouteId: "",
          layoutId: "",
          departureDateTime: "",
          arrivalDateTime: "",
        });
        invalidateSchedule();
        finish("Trip scheduled.");
      } else {
        finish(response.message || "Failed to create trip.");
      }
    },
    (error) => finish(error?.message || "Failed to create trip.")
  );

  const { mutate: updateTripMutate } = TransportInventoryApi.useUpdateTransportTripRQ(
    (response) => {
      if (response.status === "success") {
        invalidateSchedule();
        finish("Trip updated.");
      } else {
        finish(response.message || "Failed to update trip.");
      }
    },
    (error) => finish(error?.message || "Failed to update trip.")
  );

  const { mutate: deleteTripMutate } = TransportInventoryApi.useDeleteTransportTripRQ(
    (response) => {
      if (response.status === "success") {
        setExpandedRide(null);
        invalidateSchedule();
        finish("Trip deleted.");
      } else {
        finish(response.message || "Failed to delete trip.");
      }
    },
    (error) => finish(error?.message || "Failed to delete trip.")
  );

  const getStatusStyle = (
    status: ReturnType<typeof deriveTripStatus>
  ): React.CSSProperties => {
    const base: React.CSSProperties = {
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
      border: "1px solid",
      textTransform: "capitalize",
    };

    switch (status) {
      case "scheduled":
        return {
          ...base,
          backgroundColor: "rgba(42, 157, 143, 0.15)",
          color: "var(--theme-teal)",
          borderColor: "var(--theme-teal)",
        };
      case "ongoing":
        return {
          ...base,
          backgroundColor: "rgba(212, 160, 23, 0.15)",
          color: "var(--theme-star)",
          borderColor: "var(--theme-star)",
        };
      case "completed":
        return {
          ...base,
          backgroundColor: "var(--theme-section-bg)",
          color: "var(--theme-text-muted)",
          borderColor: "var(--theme-deep-green)",
        };
      case "inactive":
        return {
          ...base,
          backgroundColor: "rgba(220, 53, 69, 0.15)",
          color: "var(--theme-red)",
          borderColor: "var(--theme-red)",
        };
    }
  };

  const handleCreateRoute = () => {
    if (!routeForm.originLocationId || !routeForm.destinationLocationId) {
      finish("Origin and destination are required.");
      return;
    }
    if (routeForm.originLocationId === routeForm.destinationLocationId) {
      finish("Origin and destination must be different.");
      return;
    }
    showLoadingContent(true);
    createRouteMutate({
      transportId,
      originLocationId: routeForm.originLocationId,
      destinationLocationId: routeForm.destinationLocationId,
      name: routeForm.name || undefined,
    });
  };

  const handleCreateTrip = () => {
    if (!tripForm.transportRouteId || !tripForm.layoutId) {
      finish("Select a route and a coach layout.");
      return;
    }
    if (!tripForm.departureDateTime || !tripForm.arrivalDateTime) {
      finish("Departure and arrival times are required.");
      return;
    }
    showLoadingContent(true);
    createTripMutate({
      transportId,
      transportRouteId: tripForm.transportRouteId,
      layoutId: tripForm.layoutId,
      departureDateTime: fromDateTimeLocalValue(tripForm.departureDateTime),
      arrivalDateTime: fromDateTimeLocalValue(tripForm.arrivalDateTime),
    });
  };

  const handleSaveTimes = (tripId: string) => {
    if (!editTimes.departureDateTime || !editTimes.arrivalDateTime) {
      finish("Departure and arrival times are required.");
      return;
    }
    showLoadingContent(true);
    updateTripMutate({
      id: tripId,
      departureDateTime: fromDateTimeLocalValue(editTimes.departureDateTime),
      arrivalDateTime: fromDateTimeLocalValue(editTimes.arrivalDateTime),
    });
  };

  const routeLabel = (route?: TransportRoute) =>
    route?.name ||
    `${route?.originLocation?.name || "Origin"} → ${route?.destinationLocation?.name || "Destination"}`;

  const takenSeats = (seatsData?.data?.seats || []).filter((seat) => !seat.isAvailable).length;
  const availableSeats = (seatsData?.data?.seats || []).filter((seat) => seat.isAvailable).length;

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <h3 className="text-xl font-bold theme-text">Routes & Trips</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAddingRoute(!isAddingRoute)}
            className="px-4 py-2.5 rounded-lg font-medium theme-text w-full sm:w-auto"
            style={{
              backgroundColor: "var(--theme-card-bg)",
              border: "1px solid var(--theme-deep-green)",
            }}
          >
            {isAddingRoute ? "Cancel" : "+ Add Route"}
          </button>
          <button
            type="button"
            onClick={() => setIsAddingRide(!isAddingRide)}
            className="theme-btn-teal text-white w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg font-medium shrink-0"
          >
            {isAddingRide ? "Cancel" : "+ Schedule Trip"}
          </button>
        </div>
      </div>

      {isAddingRoute && (
        <div className="theme-card theme-outline-teal border rounded-xl p-4 sm:p-6 mb-5">
          <h3 className="font-semibold theme-text mb-4">Add Route</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Optional route name"
              value={routeForm.name}
              onChange={(e) => setRouteForm((prev) => ({ ...prev, name: e.target.value }))}
              className="theme-input px-4 py-2.5 rounded-lg md:col-span-2"
            />
            <select
              value={routeForm.originLocationId}
              onChange={(e) =>
                setRouteForm((prev) => ({ ...prev, originLocationId: e.target.value }))
              }
              className="theme-input px-4 py-2.5 rounded-lg"
            >
              <option value="">Origin district</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <select
              value={routeForm.destinationLocationId}
              onChange={(e) =>
                setRouteForm((prev) => ({ ...prev, destinationLocationId: e.target.value }))
              }
              className="theme-input px-4 py-2.5 rounded-lg"
            >
              <option value="">Destination district</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleCreateRoute}
            className="theme-btn-teal text-white mt-4 w-full py-2.5 rounded-lg font-medium"
          >
            Save Route
          </button>
        </div>
      )}

      {isAddingRide && (
        <div className="theme-card theme-outline-teal border rounded-xl p-4 sm:p-6 mb-5">
          <h3 className="font-semibold theme-text mb-4">Schedule Trip</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <select
              value={tripForm.transportRouteId}
              onChange={(e) =>
                setTripForm((prev) => ({ ...prev, transportRouteId: e.target.value }))
              }
              className="theme-input px-4 py-2.5 rounded-lg"
            >
              <option value="">Select route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {routeLabel(route)}
                </option>
              ))}
            </select>
            <select
              value={tripForm.layoutId}
              onChange={(e) => setTripForm((prev) => ({ ...prev, layoutId: e.target.value }))}
              className="theme-input px-4 py-2.5 rounded-lg"
            >
              <option value="">Select coach layout</option>
              {layouts.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.name} ({layoutSeatCount(layout)} seats)
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={tripForm.departureDateTime}
              onChange={(e) =>
                setTripForm((prev) => ({ ...prev, departureDateTime: e.target.value }))
              }
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <input
              type="datetime-local"
              value={tripForm.arrivalDateTime}
              onChange={(e) =>
                setTripForm((prev) => ({ ...prev, arrivalDateTime: e.target.value }))
              }
              className="theme-input px-4 py-2.5 rounded-lg"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateTrip}
            className="theme-btn-teal text-white mt-4 w-full py-2.5 rounded-lg font-medium"
          >
            Create Trip
          </button>
        </div>
      )}

      {routes.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold theme-text-muted mb-2">Active routes</p>
          <div className="flex flex-wrap gap-2">
            {routes.map((route) => (
              <span
                key={route.id}
                className="theme-badge px-3 py-1.5 rounded-full text-xs flex items-center gap-2"
              >
                {routeLabel(route)}
                <button
                  type="button"
                  onClick={() => {
                    showLoadingContent(true);
                    deleteRouteMutate(route.id);
                  }}
                  className="bg-transparent p-0"
                  style={{ color: "var(--theme-red)" }}
                  aria-label={`Delete ${routeLabel(route)}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {isRoutesLoading || isTripsLoading ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">Loading trips...</div>
      ) : isTripsError ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          Could not load trips for this operator.
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No trips scheduled yet. Add a route, then schedule a trip with a coach layout.
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {
            const status = deriveTripStatus(trip);
            const isExpanded = expandedRide === trip.id;
            const totalSeats = layoutSeatCount(trip.layout);
            const occupancyPercent =
              isExpanded && seatsData?.data?.seats?.length
                ? (takenSeats / seatsData.data.seats.length) * 100
                : 0;

            return (
              <div
                key={trip.id}
                className="rounded-xl p-4 sm:p-5 overflow-hidden transition-colors"
                style={{
                  backgroundColor: "var(--theme-bg)",
                  border: "1px solid var(--theme-deep-green)",
                }}
              >
                <div className="flex flex-col gap-4 min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="theme-text text-base sm:text-lg font-semibold break-words">
                          {routeLabel(trip.route)}
                        </p>
                        <span style={getStatusStyle(status)}>{status}</span>
                      </div>
                      <p className="theme-text-muted text-sm break-words">
                        {trip.layout?.name || "Layout"}
                        <span className="theme-text-subtle mx-1.5">·</span>
                        {totalSeats} seats
                      </p>
                      <p className="theme-text-subtle text-xs">
                        {new Date(trip.departureDateTime).toLocaleString()} →{" "}
                        {new Date(trip.arrivalDateTime).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = isExpanded ? null : trip.id;
                        setExpandedRide(next);
                        if (next) {
                          setEditTimes({
                            departureDateTime: toDateTimeLocalValue(trip.departureDateTime),
                            arrivalDateTime: toDateTimeLocalValue(trip.arrivalDateTime),
                          });
                        }
                      }}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-lg theme-text text-sm font-medium shrink-0"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: "1px solid var(--theme-deep-green)",
                      }}
                    >
                      {isExpanded ? "Hide" : "Manage"}
                    </button>
                  </div>

                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg p-3"
                    style={{ backgroundColor: "var(--theme-card-bg)" }}
                  >
                    <div className="min-w-0">
                      <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                        Occupancy
                      </p>
                      {isExpanded ? (
                        isSeatsLoading ? (
                          <p className="theme-text-subtle text-xs">Loading seats...</p>
                        ) : (
                          <>
                            <div
                              className="h-2 rounded-full overflow-hidden mb-1.5"
                              style={{ backgroundColor: "var(--theme-section-bg)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: "var(--theme-teal)",
                                  width: `${occupancyPercent}%`,
                                }}
                              />
                            </div>
                            <p className="theme-text-teal text-xs font-medium tabular-nums">
                              {takenSeats}/{seatsData?.data?.seats?.length || totalSeats} booked
                              {typeof availableSeats === "number" ? ` · ${availableSeats} free` : ""}
                            </p>
                          </>
                        )
                      ) : (
                        <p className="theme-text text-sm">Open manage to load live seats</p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                        Layout
                      </p>
                      <p className="theme-text text-sm font-medium break-words">
                        {trip.layout?.name || "N/A"}
                      </p>
                    </div>
                    <div className="min-w-0 col-span-2 sm:col-span-1">
                      <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                        Operator
                      </p>
                      <p className="theme-text text-sm font-medium break-words">
                        {operatorName || trip.transport?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t space-y-4"
                    style={{ borderColor: "var(--theme-deep-green)" }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="datetime-local"
                        value={editTimes.departureDateTime}
                        onChange={(e) =>
                          setEditTimes((prev) => ({
                            ...prev,
                            departureDateTime: e.target.value,
                          }))
                        }
                        className="theme-input px-4 py-2.5 rounded-lg"
                      />
                      <input
                        type="datetime-local"
                        value={editTimes.arrivalDateTime}
                        onChange={(e) =>
                          setEditTimes((prev) => ({
                            ...prev,
                            arrivalDateTime: e.target.value,
                          }))
                        }
                        className="theme-input px-4 py-2.5 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSaveTimes(trip.id)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium theme-text-teal"
                        style={{
                          backgroundColor: "var(--theme-card-bg)",
                          border: "1px solid var(--theme-teal)",
                        }}
                      >
                        Save Schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showLoadingContent(true);
                          updateTripMutate({ id: trip.id, isActive: !trip.isActive });
                        }}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: "var(--theme-card-bg)",
                          border: trip.isActive
                            ? "1px solid var(--theme-red)"
                            : "1px solid var(--theme-teal)",
                          color: trip.isActive ? "var(--theme-red)" : "var(--theme-teal)",
                        }}
                      >
                        {trip.isActive ? "Deactivate Trip" : "Activate Trip"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        showLoadingContent(true);
                        deleteTripMutate(trip.id);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: "1px solid var(--theme-red)",
                        color: "var(--theme-red)",
                      }}
                    >
                      Delete Trip
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
