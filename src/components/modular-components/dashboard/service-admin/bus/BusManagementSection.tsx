"use client";

import React, { useState } from "react";
import { TransportInventoryApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { BusServiceType } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { formatTransportEnumLabel, layoutSeatCount } from "./types";

interface BusManagementSectionProps {
  transportId: string;
  id?: string;
  className?: string;
}

export const BusManagementSection = ({
  transportId,
  id,
  className = "",
}: BusManagementSectionProps) => {
  const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [expandedLayout, setExpandedLayout] = useState<string | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingLayout, setIsAddingLayout] = useState(false);
  const [classForm, setClassForm] = useState({
    name: "",
    basePrice: "",
    busServiceType: "" as BusServiceType | "",
  });
  const [layoutForm, setLayoutForm] = useState({
    name: "",
    transportClassId: "",
    seatCount: "",
    compartmentName: "Coach",
  });
  const [editClass, setEditClass] = useState({
    name: "",
    basePrice: "",
  });

  const {
    data: classesData,
    isLoading: isClassesLoading,
    isError: isClassesError,
    refetch: refetchClasses,
  } = TransportInventoryApi.useGetTransportClassesRQ(transportId, Boolean(transportId));
  const classes = classesData?.data || [];

  const {
    data: layoutsData,
    isLoading: isLayoutsLoading,
    refetch: refetchLayouts,
  } = TransportInventoryApi.useGetTransportLayoutsRQ(transportId, Boolean(transportId));
  const layouts = layoutsData?.data || [];

  const finish = (message: string) => {
    showLoadingContent(false);
    openNotificationPopUpMessage(message);
  };

  const invalidateInventory = () => {
    queryClient.invalidateQueries({ queryKey: ["transport-inventory", "classes", transportId] });
    queryClient.invalidateQueries({ queryKey: ["transport-inventory", "layouts", transportId] });
    refetchClasses();
    refetchLayouts();
  };

  const { mutate: createClassMutate } = TransportInventoryApi.useCreateTransportClassRQ(
    (response) => {
      if (response.status === "success") {
        setIsAddingClass(false);
        setClassForm({ name: "", basePrice: "", busServiceType: "" });
        invalidateInventory();
        finish("Coach class created.");
      } else {
        finish(response.message || "Failed to create class.");
      }
    },
    (error) => finish(error?.message || "Failed to create class.")
  );

  const { mutate: updateClassMutate } = TransportInventoryApi.useUpdateTransportClassRQ(
    (response) => {
      if (response.status === "success") {
        invalidateInventory();
        finish("Coach class updated.");
      } else {
        finish(response.message || "Failed to update class.");
      }
    },
    (error) => finish(error?.message || "Failed to update class.")
  );

  const { mutate: deleteClassMutate } = TransportInventoryApi.useDeleteTransportClassRQ(
    (response) => {
      if (response.status === "success") {
        setExpandedClass(null);
        invalidateInventory();
        finish("Coach class deleted.");
      } else {
        finish(response.message || "Failed to delete class.");
      }
    },
    (error) => finish(error?.message || "Failed to delete class.")
  );

  const { mutate: createLayoutMutate } = TransportInventoryApi.useCreateTransportLayoutRQ(
    (response) => {
      if (response.status === "success") {
        setIsAddingLayout(false);
        setLayoutForm({
          name: "",
          transportClassId: "",
          seatCount: "",
          compartmentName: "Coach",
        });
        invalidateInventory();
        finish("Coach layout created with seats.");
      } else {
        finish(response.message || "Failed to create layout.");
      }
    },
    (error) => finish(error?.message || "Failed to create layout.")
  );

  const { mutate: deleteLayoutMutate } = TransportInventoryApi.useDeleteTransportLayoutRQ(
    (response) => {
      if (response.status === "success") {
        setExpandedLayout(null);
        invalidateInventory();
        finish("Coach layout deleted.");
      } else {
        finish(response.message || "Failed to delete layout.");
      }
    },
    (error) => finish(error?.message || "Failed to delete layout.")
  );

  const handleCreateClass = () => {
    if (!classForm.name.trim() || !classForm.basePrice) {
      finish("Class name and base price are required.");
      return;
    }
    showLoadingContent(true);
    createClassMutate({
      transportId,
      name: classForm.name.trim(),
      basePrice: Number(classForm.basePrice),
      busServiceType: classForm.busServiceType || undefined,
    });
  };

  const handleCreateLayout = () => {
    if (!layoutForm.name.trim() || !layoutForm.transportClassId || !layoutForm.seatCount) {
      finish("Layout name, class, and seat count are required.");
      return;
    }
    showLoadingContent(true);
    createLayoutMutate({
      transportId,
      name: layoutForm.name.trim(),
      transportClassId: layoutForm.transportClassId,
      seatCount: Number(layoutForm.seatCount),
      compartmentName: layoutForm.compartmentName.trim() || "Coach",
    });
  };

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <h3 className="text-xl font-bold theme-text">Coach Classes</h3>
        <button
          type="button"
          onClick={() => setIsAddingClass(!isAddingClass)}
          className="theme-btn-teal text-white w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg font-medium shrink-0"
        >
          {isAddingClass ? "Cancel" : "+ Add Class"}
        </button>
      </div>

      {isAddingClass && (
        <div className="theme-card theme-outline-teal border rounded-xl p-4 sm:p-6 mb-5">
          <h3 className="font-semibold theme-text mb-4">Add Coach Class</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Class name (e.g. AC Seater)"
              value={classForm.name}
              onChange={(e) => setClassForm((prev) => ({ ...prev, name: e.target.value }))}
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <select
              value={classForm.busServiceType}
              onChange={(e) =>
                setClassForm((prev) => ({
                  ...prev,
                  busServiceType: e.target.value as BusServiceType | "",
                }))
              }
              className="theme-input px-4 py-2.5 rounded-lg"
            >
              <option value="">Service type (optional)</option>
              {Object.values(BusServiceType).map((type) => (
                <option key={type} value={type}>
                  {formatTransportEnumLabel(type)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              placeholder="Base price (৳)"
              value={classForm.basePrice}
              onChange={(e) => setClassForm((prev) => ({ ...prev, basePrice: e.target.value }))}
              className="theme-input px-4 py-2.5 rounded-lg"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateClass}
            className="theme-btn-teal text-white mt-4 w-full py-2.5 rounded-lg font-medium"
          >
            Save Class
          </button>
        </div>
      )}

      {isClassesLoading ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle mb-8">Loading classes...</div>
      ) : isClassesError ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle mb-8">
          Could not load coach classes.
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle mb-8">
          No coach classes yet. Add a class before creating a seat layout.
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {classes.map((coachClass) => {
            const isExpanded = expandedClass === coachClass.id;

            return (
              <div
                key={coachClass.id}
                className="rounded-xl p-4 sm:p-5 overflow-hidden"
                style={{
                  backgroundColor: "var(--theme-bg)",
                  border: "1px solid var(--theme-deep-green)",
                }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between min-w-0">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="theme-text text-base sm:text-lg font-semibold break-words">
                        {coachClass.name}
                      </h3>
                      {coachClass.busServiceType && (
                        <span className="theme-badge px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {formatTransportEnumLabel(coachClass.busServiceType)}
                        </span>
                      )}
                    </div>
                    <p className="theme-text-muted text-sm">
                      ৳ {Number(coachClass.basePrice).toLocaleString()} base fare
                    </p>
                  </div>

                  <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={
                        coachClass.isActive
                          ? {
                              backgroundColor: "rgba(42, 157, 143, 0.2)",
                              color: "var(--theme-teal)",
                              border: "1px solid var(--theme-teal)",
                            }
                          : {
                              backgroundColor: "rgba(220, 53, 69, 0.2)",
                              color: "var(--theme-red)",
                              border: "1px solid var(--theme-red)",
                            }
                      }
                    >
                      {coachClass.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = isExpanded ? null : coachClass.id;
                        setExpandedClass(next);
                        if (next) {
                          setEditClass({
                            name: coachClass.name,
                            basePrice: String(coachClass.basePrice),
                          });
                        }
                      }}
                      className="px-3.5 py-2 rounded-lg theme-text text-sm font-medium shrink-0"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: "1px solid var(--theme-deep-green)",
                      }}
                    >
                      {isExpanded ? "Hide" : "Manage"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t space-y-3"
                    style={{ borderColor: "var(--theme-deep-green)" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={editClass.name}
                        onChange={(e) => setEditClass((prev) => ({ ...prev, name: e.target.value }))}
                        className="theme-input px-4 py-2.5 rounded-lg"
                      />
                      <input
                        type="number"
                        min={0}
                        value={editClass.basePrice}
                        onChange={(e) =>
                          setEditClass((prev) => ({ ...prev, basePrice: e.target.value }))
                        }
                        className="theme-input px-4 py-2.5 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          showLoadingContent(true);
                          updateClassMutate({
                            id: coachClass.id,
                            name: editClass.name.trim(),
                            basePrice: Number(editClass.basePrice),
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium theme-text-teal"
                        style={{
                          backgroundColor: "var(--theme-card-bg)",
                          border: "1px solid var(--theme-teal)",
                        }}
                      >
                        Save Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showLoadingContent(true);
                          updateClassMutate({
                            id: coachClass.id,
                            isActive: !coachClass.isActive,
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: "var(--theme-card-bg)",
                          border: coachClass.isActive
                            ? "1px solid var(--theme-red)"
                            : "1px solid var(--theme-teal)",
                          color: coachClass.isActive
                            ? "var(--theme-red)"
                            : "var(--theme-teal)",
                        }}
                      >
                        {coachClass.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        showLoadingContent(true);
                        deleteClassMutate(coachClass.id);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: "1px solid var(--theme-red)",
                        color: "var(--theme-red)",
                      }}
                    >
                      Delete Class
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <h3 className="text-xl font-bold theme-text">Coach Layouts</h3>
        <button
          type="button"
          onClick={() => setIsAddingLayout(!isAddingLayout)}
          className="theme-btn-teal text-white w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg font-medium shrink-0"
        >
          {isAddingLayout ? "Cancel" : "+ Add Layout"}
        </button>
      </div>

      {isAddingLayout && (
        <div className="theme-card theme-outline-teal border rounded-xl p-4 sm:p-6 mb-5">
          <h3 className="font-semibold theme-text mb-4">Add Coach Layout</h3>
          <p className="theme-text-muted text-sm mb-4">
            Seats are generated from the seat count and assigned to the selected class.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Layout name (e.g. 40-seater AC)"
              value={layoutForm.name}
              onChange={(e) => setLayoutForm((prev) => ({ ...prev, name: e.target.value }))}
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <select
              value={layoutForm.transportClassId}
              onChange={(e) =>
                setLayoutForm((prev) => ({ ...prev, transportClassId: e.target.value }))
              }
              className="theme-input px-4 py-2.5 rounded-lg"
            >
              <option value="">Assign class</option>
              {classes.map((coachClass) => (
                <option key={coachClass.id} value={coachClass.id}>
                  {coachClass.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={200}
              placeholder="Seat count"
              value={layoutForm.seatCount}
              onChange={(e) => setLayoutForm((prev) => ({ ...prev, seatCount: e.target.value }))}
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <input
              type="text"
              placeholder="Compartment name"
              value={layoutForm.compartmentName}
              onChange={(e) =>
                setLayoutForm((prev) => ({ ...prev, compartmentName: e.target.value }))
              }
              className="theme-input px-4 py-2.5 rounded-lg"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateLayout}
            className="theme-btn-teal text-white mt-4 w-full py-2.5 rounded-lg font-medium"
          >
            Generate Layout
          </button>
        </div>
      )}

      {isLayoutsLoading ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">Loading layouts...</div>
      ) : layouts.length === 0 ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No coach layouts yet. Create a class first, then generate seats.
        </div>
      ) : (
        <div className="space-y-4">
          {layouts.map((layout) => {
            const isExpanded = expandedLayout === layout.id;
            const tripCount =
              (layout as TransportLayout & { _count?: { trips?: number } })._count?.trips ?? 0;

            return (
              <div
                key={layout.id}
                className="rounded-xl p-4 sm:p-5 overflow-hidden"
                style={{
                  backgroundColor: "var(--theme-bg)",
                  border: "1px solid var(--theme-deep-green)",
                }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between min-w-0">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="theme-text text-base sm:text-lg font-semibold break-words">
                      {layout.name}
                    </h3>
                    <p className="theme-text-muted text-sm">
                      {layoutSeatCount(layout)} seats
                      <span className="theme-text-subtle mx-1.5">·</span>
                      {layout.compartments?.length || 1} compartment
                      <span className="theme-text-subtle mx-1.5">·</span>
                      {tripCount} trip{tripCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedLayout(isExpanded ? null : layout.id)}
                    className="px-3.5 py-2 rounded-lg theme-text text-sm font-medium shrink-0"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      border: "1px solid var(--theme-deep-green)",
                    }}
                  >
                    {isExpanded ? "Hide" : "Manage"}
                  </button>
                </div>

                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t"
                    style={{ borderColor: "var(--theme-deep-green)" }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        showLoadingContent(true);
                        deleteLayoutMutate(layout.id);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: "1px solid var(--theme-red)",
                        color: "var(--theme-red)",
                      }}
                    >
                      Delete Layout
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
