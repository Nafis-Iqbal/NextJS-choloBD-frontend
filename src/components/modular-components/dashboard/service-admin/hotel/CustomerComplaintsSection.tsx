import React, { useState } from "react";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";

type Complaint = {
  id: string;
  bookingId: string;
  guestName: string;
  email: string;
  complaintType: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  reportedAt: string;
  resolution?: string;
};

const FAKE_COMPLAINTS: Complaint[] = [
  {
    id: "complaint-001",
    bookingId: "booking-001",
    guestName: "Ahmad Khan",
    email: "ahmad@example.com",
    complaintType: "Noise",
    description: "Excessive noise from neighboring rooms during night hours",
    status: "resolved",
    priority: "medium",
    reportedAt: "Feb 2, 2026 - 11:30 PM",
    resolution: "Moved guest to quieter room on different floor",
  },
  {
    id: "complaint-002",
    bookingId: "booking-002",
    guestName: "Fatima Ahmed",
    email: "fatima@example.com",
    complaintType: "Water Issue",
    description: "Hot water not available in bathroom, only cold water",
    status: "in-progress",
    priority: "high",
    reportedAt: "Feb 2, 2026 - 10:15 AM",
  },
  {
    id: "complaint-003",
    bookingId: "booking-003",
    guestName: "Hassan Ali",
    email: "hassan@example.com",
    complaintType: "Service Quality",
    description: "Slow room service and unprofessional staff behavior",
    status: "pending",
    priority: "high",
    reportedAt: "Feb 2, 2026 - 8:45 AM",
  },
  {
    id: "complaint-004",
    bookingId: "booking-004",
    guestName: "Sophia Rahman",
    email: "sophia@example.com",
    complaintType: "Cleanliness",
    description: "Room not properly cleaned, dust on surfaces",
    status: "resolved",
    priority: "medium",
    reportedAt: "Feb 1, 2026 - 3:00 PM",
    resolution: "Room deep cleaned, compensation offered",
  },
  {
    id: "complaint-005",
    bookingId: "booking-005",
    guestName: "Mohammed Hassan",
    email: "mohammed@example.com",
    complaintType: "WiFi Issue",
    description: "WiFi disconnects frequently throughout the stay",
    status: "in-progress",
    priority: "low",
    reportedAt: "Jan 29, 2026 - 6:30 PM",
  },
];

// Customer Complaints Section
export const CustomerComplaintsSection: React.FC<{ hotelProfile: Hotel; className?: string }> = ({ hotelProfile, className }) => {
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [complaintStatus, setComplaintStatus] = useState<Record<string, Complaint["status"]>>({});
  const complaints = FAKE_COMPLAINTS;

  const getStatusColor = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-600/30 text-red-300 border border-red-600/50";
      case "in-progress":
        return "bg-[color:var(--theme-star)] bg-opacity-20 text-[color:var(--theme-star)]" + " " + "border" + " " + "border-[color:var(--theme-star)]/50";
      case "resolved":
        return "bg-green-600/30 text-green-300 border border-green-600/50";
    }
  };

  const getPriorityColor = (priority: Complaint["priority"]) => {
    switch (priority) {
      case "low":
        return "theme-text-teal";
      case "medium":
        return "text-[color:var(--theme-star)]";
      case "high":
        return "text-red-400";
    }
  };

  const handleStatusUpdate = (complaintId: string, status: Complaint["status"]) => {
    setComplaintStatus((prev) => ({ ...prev, [complaintId]: status }));
  };

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold theme-text mb-6">Customer Complaints</h2>

      <PlaceholderFeatureWarning moduleName="Customer Complaints Management" />

      <div className="space-y-3">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="theme-card rounded-lg p-4 transition-colors"
            style={{ borderColor: 'var(--theme-teal)' }}
          >
            <div className="flex flex-col space-x-4 md:flex-row md:items-start md:justify-between">

              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="theme-text font-semibold">{complaint.guestName}</p>
                    <p className="theme-text-subtle text-xs">{complaint.email}</p>
                    <p className={`text-sm font-medium mt-2 ${getPriorityColor(complaint.priority)}`}>
                      🚨 {complaint.priority.toUpperCase()} - {complaint.complaintType}
                    </p>
                    <p className="theme-text-subtle text-sm mt-2">{complaint.description}</p>
                    {complaint.resolution && (
                      <p className="theme-text-teal text-sm mt-2">
                        ✓ Resolution: {complaint.resolution}
                      </p>
                    )}
                    <p className="theme-text-subtle text-xs mt-2">{complaint.reportedAt}</p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(complaintStatus[complaint.id] || complaint.status)}`}>
                    {(complaintStatus[complaint.id] || complaint.status).toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedComplaint(selectedComplaint === complaint.id ? null : complaint.id)
                }
                className="mt-3 md:mt-0 px-4 py-1 rounded-lg theme-text text-sm"
                style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text)' }}
              >
                {selectedComplaint === complaint.id ? "Hide" : "Update"}
              </button>
            </div>

            {selectedComplaint === complaint.id && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--theme-deep-green)' }}>
                <p className="theme-text-muted text-sm mb-3">Update Status:</p>

                <div className="flex gap-2 flex-wrap mb-4">
                  {(["pending", "in-progress", "resolved"] as Complaint["status"][]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(complaint.id, status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (complaintStatus[complaint.id] || complaint.status) === status
                          ? "theme-btn-teal"
                          : "theme-text-muted"
                      }`}
                      style={{
                        backgroundColor: (complaintStatus[complaint.id] || complaint.status) === status 
                          ? 'var(--theme-teal)' 
                          : 'var(--theme-card-bg)'
                      }}
                    >
                      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Add resolution notes..."
                  className="w-full px-4 py-2 rounded-lg theme-input text-sm"
                  rows={3}
                />

                <button className="mt-3 w-full py-2 theme-btn-teal rounded-lg font-medium">
                  Save Update
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};