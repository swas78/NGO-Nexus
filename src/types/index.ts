// ============================================================
// NGO Nexus — Type Definitions
// ============================================================

export type UrgencyLevel = "critical" | "high" | "medium" | "low";
export type NeedStatus = "open" | "in-progress" | "fulfilled" | "closed";
export type NeedCategory = "food" | "shelter" | "medical" | "education" | "clothing" | "water" | "transport" | "other";
export type VolunteerAvailability = "available" | "busy" | "offline";

export interface Need {
  id: string;
  title: string;
  description: string;
  category: NeedCategory;
  urgency: UrgencyLevel;
  status: NeedStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  quantity: number;
  fulfilledQuantity: number;
  createdAt: string;
  updatedAt: string;
  assignedVolunteers: string[];
  organizationId: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  skills: string[];
  availability: VolunteerAvailability;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  totalHours: number;
  missionsCompleted: number;
  joinedAt: string;
  rating: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalNeeds: number;
  activeVolunteers: number;
  resourcesDistributed: number;
  regionsCovered: number;
  needsTrend: number; // percentage
  volunteersTrend: number;
  resourcesTrend: number;
  regionsTrend: number;
}

export interface ActivityItem {
  id: string;
  type: "need_created" | "need_fulfilled" | "volunteer_joined" | "resource_delivered" | "alert";
  title: string;
  description: string;
  timestamp: string;
  actor: {
    name: string;
    avatar: string;
  };
}

export interface AnalyticsData {
  resourcesByCategory: { name: string; value: number; color: string }[];
  volunteerEngagement: { month: string; active: number; new: number }[];
  needsByUrgency: { name: string; value: number; color: string }[];
  responseTimeTrend: { month: string; avgHours: number }[];
  monthlyOverview: { month: string; needs: number; fulfilled: number; volunteers: number }[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
