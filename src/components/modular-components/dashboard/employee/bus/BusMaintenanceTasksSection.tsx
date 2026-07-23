"use client";

import React, { useState } from "react";
import type { BusMaintenanceTask } from "./types";

interface BusMaintenanceTasksSectionProps {
  tasks: BusMaintenanceTask[];
  id?: string;
  className?: string;
}

export const BusMaintenanceTasksSection = ({
  tasks,
  id = "bus_employee_maintenance",
  className = "",
}: BusMaintenanceTasksSectionProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<
    Record<string, BusMaintenanceTask["status"]>
  >({});

  const getStatusStyle = (
    status: BusMaintenanceTask["status"]
  ): React.CSSProperties => {
    const base: React.CSSProperties = {
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      border: "1px solid",
      textTransform: "capitalize",
      whiteSpace: "nowrap",
    };
    switch (status) {
      case "pending":
        return {
          ...base,
          backgroundColor: "rgba(220, 53, 69, 0.15)",
          color: "var(--theme-red)",
          borderColor: "var(--theme-red)",
        };
      case "in-progress":
        return {
          ...base,
          backgroundColor: "rgba(255, 165, 0, 0.15)",
          color: "rgb(200, 120, 0)",
          borderColor: "rgba(255, 165, 0, 0.45)",
        };
      case "completed":
        return {
          ...base,
          backgroundColor: "rgba(42, 157, 143, 0.15)",
          color: "var(--theme-teal)",
          borderColor: "var(--theme-teal)",
        };
    }
  };

  const getPriorityStyle = (
    priority: BusMaintenanceTask["priority"]
  ): React.CSSProperties => {
    const colors = {
      low: { bg: "rgba(0, 123, 255, 0.15)", color: "rgb(0, 123, 255)" },
      medium: { bg: "rgba(255, 165, 0, 0.15)", color: "rgb(200, 120, 0)" },
      high: { bg: "rgba(220, 53, 69, 0.15)", color: "var(--theme-red)" },
    };
    const c = colors[priority];
    return {
      paddingLeft: "0.6rem",
      paddingRight: "0.6rem",
      paddingTop: "0.2rem",
      paddingBottom: "0.2rem",
      borderRadius: "9999px",
      fontSize: "0.7rem",
      fontWeight: 600,
      textTransform: "uppercase",
      backgroundColor: c.bg,
      color: c.color,
    };
  };

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="mb-5">
        <h3 className="text-xl font-bold theme-text">Bus Maintenance Tasks</h3>
        <p className="theme-text-muted text-sm mt-1">
          Track coach repairs, seat blocks, and yard work orders
        </p>
      </div>

      {tasks.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center theme-text-subtle"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          No maintenance tasks
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const status = taskStatus[task.id] || task.status;
            const isExpanded = expandedId === task.id;

            return (
              <div
                key={task.id}
                className="rounded-xl p-4 sm:p-5 overflow-hidden"
                style={{
                  backgroundColor: "var(--theme-bg)",
                  border: "1px solid var(--theme-deep-green)",
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between min-w-0">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="theme-text font-semibold break-words">
                        {task.busNumber} — {task.taskType}
                      </p>
                      <span style={getPriorityStyle(task.priority)}>
                        {task.priority}
                      </span>
                      <span style={getStatusStyle(status)}>
                        {status.replace("-", " ")}
                      </span>
                    </div>
                    <p className="theme-text-muted text-sm break-words">
                      {task.description}
                    </p>
                    <p className="theme-text-subtle text-xs">
                      {task.coachType} coach
                      <span className="mx-1.5">·</span>
                      Due {task.dueDate}
                      {task.assignedTo ? (
                        <>
                          <span className="mx-1.5">·</span>
                          {task.assignedTo}
                        </>
                      ) : null}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : task.id)
                    }
                    className="w-full md:w-auto px-3.5 py-2 rounded-lg theme-text text-sm font-medium shrink-0"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      border: "1px solid var(--theme-deep-green)",
                    }}
                  >
                    {isExpanded ? "Hide" : "Update"}
                  </button>
                </div>

                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t space-y-3"
                    style={{ borderColor: "var(--theme-deep-green)" }}
                  >
                    <p className="text-sm theme-text-muted">Update status</p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        ["pending", "in-progress", "completed"] as BusMaintenanceTask["status"][]
                      ).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setTaskStatus((prev) => ({ ...prev, [task.id]: s }))
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            status === s
                              ? "theme-btn-teal text-white"
                              : "theme-text-muted"
                          }`}
                          style={
                            status === s
                              ? undefined
                              : {
                                  backgroundColor: "var(--theme-card-bg)",
                                  border: "1px solid var(--theme-deep-green)",
                                }
                          }
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
                        </button>
                      ))}
                    </div>
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
