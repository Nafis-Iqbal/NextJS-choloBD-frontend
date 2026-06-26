import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import React, { useState } from "react";

export type Complaint = {
  id: string;
  bookingId: string;
  guestName: string;
  complaintType: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  reportedAt: string;
};

// Complaints Management Component
export const ComplaintsManagement: React.FC<{ complaints: Complaint[]; className?: string }> = ({ complaints, className }) => {
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [complaintStatus, setComplaintStatus] = useState<Record<string, Complaint["status"]>>({});

  const getStatusColor = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-600/30 text-red-800 border border-red-600/50";
      case "in-progress":
        return "bg-yellow-600/30 text-yellow-800 border border-yellow-600/50";
      case "resolved":
        return "bg-green-600/30 text-green-800 border border-green-600/50";
    }
  };

  const getPriorityColor = (priority: Complaint["priority"]) => {
    switch (priority) {
      case "low":
        return "text-blue-800";
      case "medium":
        return "text-yellow-800";
      case "high":
        return "text-red-800";
    }
  };

  const handleStatusUpdate = (complaintId: string, status: Complaint["status"]) => {
    setComplaintStatus((prev) => ({ ...prev, [complaintId]: status }));
  };

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--theme-text)'}}>Guest Complaints</h2>

      <PlaceholderFeatureWarning moduleName="Guest Complaints"/>

      <div className="space-y-3">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="rounded-lg p-4 transition-colors"
            style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-semibold" style={{color: 'var(--theme-text)'}}>{complaint.guestName}</p>
                    <p className={`text-sm font-medium mt-1 ${getPriorityColor(complaint.priority)}`}>
                      🚨 {complaint.priority.toUpperCase()} - {complaint.complaintType}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaintStatus[complaint.id] || complaint.status)}`}>
                    {(complaintStatus[complaint.id] || complaint.status).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm mt-2" style={{color: 'var(--theme-text-muted)'}}>{complaint.description}</p>
                <p className="text-xs mt-2" style={{color: 'var(--theme-text-subtle)'}}>{complaint.reportedAt}</p>
              </div>
              <button
                onClick={() =>
                  setSelectedComplaint(selectedComplaint === complaint.id ? null : complaint.id)
                }
                className="mt-3 md:mt-0 px-4 py-2 rounded-lg text-sm"
                style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}
              >
                {selectedComplaint === complaint.id ? "Hide" : "Update"}
              </button>
            </div>

            {selectedComplaint === complaint.id && (
              <div className="mt-4 pt-4" style={{borderTopColor: 'var(--theme-deep-green)', borderTopWidth: '1px'}}>
                <p className="text-sm mb-3" style={{color: 'var(--theme-text-muted)'}}>Update Status:</p>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "in-progress", "resolved"] as Complaint["status"][]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(complaint.id, status)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: (complaintStatus[complaint.id] || complaint.status) === status ? 'var(--theme-teal)' : 'var(--theme-section-bg)',
                        color: (complaintStatus[complaint.id] || complaint.status) === status ? 'white' : 'var(--theme-text-muted)'
                      }}
                    >
                      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 rounded-lg font-medium" style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}>
                  Save Status Update
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
