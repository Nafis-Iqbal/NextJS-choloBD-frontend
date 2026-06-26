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
        return "bg-red-600/30 text-red-800 border border-red-600/50";
      case "in-progress":
        return "bg-yellow-600/30 text-yellow-800 border border-yellow-600/50";
      case "completed":
        return "bg-green-600/30 text-green-800 border border-green-600/50";
    }
  };

  const getPriorityColor = (priority: MaintenanceTask["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-blue-600/30 text-blue-800";
      case "medium":
        return "bg-yellow-600/30 text-yellow-800";
      case "high":
        return "bg-red-600/30 text-red-800";
    }
  };

  const handleStatusUpdate = (taskId: string, status: MaintenanceTask["status"]) => {
    setTaskStatus((prev) => ({ ...prev, [taskId]: status }));
  };

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--theme-text)'}}>Maintenance Tasks</h2>

      <PlaceholderFeatureWarning moduleName="Guest Complaints"/>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg p-4 transition-colors"
            style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-semibold" style={{color: 'var(--theme-text)'}}>
                      Room {task.roomNumber} - {task.taskType}
                    </p>
                    <p className="text-sm mt-1" style={{color: 'var(--theme-text-muted)'}}>{task.description}</p>
                    {task.assignedTo && (
                      <p className="text-sm mt-1" style={{color: 'var(--theme-teal)'}}>👤 Assigned to: {task.assignedTo}</p>
                    )}
                    <p className="text-xs mt-2" style={{color: 'var(--theme-text-subtle)'}}>Due: {task.dueDate}</p>
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
                className="mt-3 md:mt-0 px-4 py-2 rounded-lg text-sm"
                style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}
              >
                {selectedTask === task.id ? "Hide" : "Update"}
              </button>
            </div>

            {selectedTask === task.id && (
              <div className="mt-4 pt-4" style={{borderTopColor: 'var(--theme-deep-green)', borderTopWidth: '1px'}}>
                <p className="text-sm mb-3" style={{color: 'var(--theme-text-muted)'}}>Update Task Status:</p>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "in-progress", "completed"] as MaintenanceTask["status"][]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(task.id, status)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: (taskStatus[task.id] || task.status) === status ? 'var(--theme-teal)' : 'var(--theme-section-bg)',
                        color: (taskStatus[task.id] || task.status) === status ? 'white' : 'var(--theme-text-muted)'
                      }}
                    >
                      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 rounded-lg font-medium" style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}>
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
