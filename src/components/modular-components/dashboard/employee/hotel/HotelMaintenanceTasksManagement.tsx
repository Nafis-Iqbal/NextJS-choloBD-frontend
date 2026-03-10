import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import React, { useState } from "react";

export type MaintenanceTask = {
  id: string;
  roomId: string;
  roomNumber: string;
  taskType: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate: string;
};

// Maintenance Tasks Component
export const HotelMaintenanceTasksManagement: React.FC<{ tasks: MaintenanceTask[]; className?: string }> = ({ tasks, className }) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<Record<string, MaintenanceTask["status"]>>({});

  const getStatusColor = (status: MaintenanceTask["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-600/30 text-red-300 border border-red-600/50";
      case "in-progress":
        return "bg-yellow-600/30 text-yellow-300 border border-yellow-600/50";
      case "completed":
        return "bg-green-600/30 text-green-300 border border-green-600/50";
    }
  };

  const getPriorityColor = (priority: MaintenanceTask["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-blue-600/30 text-blue-300";
      case "medium":
        return "bg-yellow-600/30 text-yellow-300";
      case "high":
        return "bg-red-600/30 text-red-300";
    }
  };

  const handleStatusUpdate = (taskId: string, status: MaintenanceTask["status"]) => {
    setTaskStatus((prev) => ({ ...prev, [taskId]: status }));
  };

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-4">Maintenance Tasks</h2>

      <PlaceholderFeatureWarning moduleName="Guest Complaints"/>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-white font-semibold">
                      Room {task.roomNumber} - {task.taskType}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                    {task.assignedTo && (
                      <p className="text-teal-400 text-sm mt-1">👤 Assigned to: {task.assignedTo}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">Due: {task.dueDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(taskStatus[task.id] || task.status)}`}>
                      {(taskStatus[task.id] || task.status).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                className="mt-3 md:mt-0 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
              >
                {selectedTask === task.id ? "Hide" : "Update"}
              </button>
            </div>

            {selectedTask === task.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-300 text-sm mb-3">Update Task Status:</p>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "in-progress", "completed"] as MaintenanceTask["status"][]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(task.id, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (taskStatus[task.id] || task.status) === status
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">
                  Save Task Update
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
