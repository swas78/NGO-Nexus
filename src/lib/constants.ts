import type { Need, Volunteer, Notification, DashboardStats, ActivityItem, AnalyticsData } from "@/types";

// ============================================================
// Navigation
// ============================================================
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Needs", href: "/needs", icon: "Heart" },
  { label: "Volunteers", href: "/volunteers", icon: "Users" },
  { label: "Map", href: "/map", icon: "MapPin" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Impact", href: "/impact", icon: "Zap" },
];

// ============================================================
// Mock Dashboard Stats
// ============================================================
export const MOCK_STATS: DashboardStats = {
  totalNeeds: 1284,
  activeVolunteers: 547,
  resourcesDistributed: 23840,
  regionsCovered: 42,
  needsTrend: 12.5,
  volunteersTrend: 8.3,
  resourcesTrend: 24.1,
  regionsTrend: 5.7,
};

// ============================================================
// Mock Needs
// ============================================================
export const MOCK_NEEDS: Need[] = [
  {
    id: "n1",
    title: "Emergency Food Supply",
    description: "Urgent need for food supplies for 200 families affected by recent floods in the eastern district.",
    category: "food",
    urgency: "critical",
    status: "in-progress",
    location: { lat: 28.6139, lng: 77.209, address: "Eastern District, Delhi" },
    quantity: 200,
    fulfilledQuantity: 85,
    createdAt: "2026-04-24T10:00:00Z",
    updatedAt: "2026-04-26T08:00:00Z",
    assignedVolunteers: ["v1", "v3", "v5"],
    organizationId: "org1",
  },
  {
    id: "n2",
    title: "Medical Supplies for Camp",
    description: "Need essential medicines and first-aid kits for the refugee camp housing 500+ displaced persons.",
    category: "medical",
    urgency: "critical",
    status: "open",
    location: { lat: 19.076, lng: 72.8777, address: "Andheri, Mumbai" },
    quantity: 500,
    fulfilledQuantity: 0,
    createdAt: "2026-04-25T14:00:00Z",
    updatedAt: "2026-04-25T14:00:00Z",
    assignedVolunteers: [],
    organizationId: "org2",
  },
  {
    id: "n3",
    title: "Temporary Shelter Setup",
    description: "Setting up temporary shelters for families displaced by the cyclone in coastal areas.",
    category: "shelter",
    urgency: "high",
    status: "in-progress",
    location: { lat: 13.0827, lng: 80.2707, address: "Coastal Chennai" },
    quantity: 150,
    fulfilledQuantity: 60,
    createdAt: "2026-04-23T09:00:00Z",
    updatedAt: "2026-04-26T06:00:00Z",
    assignedVolunteers: ["v2", "v4"],
    organizationId: "org1",
  },
  {
    id: "n4",
    title: "School Supplies for Children",
    description: "Educational materials needed for 300 children in underserved rural communities.",
    category: "education",
    urgency: "medium",
    status: "open",
    location: { lat: 26.9124, lng: 75.7873, address: "Jaipur, Rajasthan" },
    quantity: 300,
    fulfilledQuantity: 0,
    createdAt: "2026-04-22T11:00:00Z",
    updatedAt: "2026-04-22T11:00:00Z",
    assignedVolunteers: [],
    organizationId: "org3",
  },
  {
    id: "n5",
    title: "Clean Water Distribution",
    description: "Providing clean drinking water to drought-affected villages through mobile purification units.",
    category: "water",
    urgency: "high",
    status: "in-progress",
    location: { lat: 23.2599, lng: 77.4126, address: "Rural Bhopal" },
    quantity: 1000,
    fulfilledQuantity: 450,
    createdAt: "2026-04-20T08:00:00Z",
    updatedAt: "2026-04-26T07:00:00Z",
    assignedVolunteers: ["v1", "v6"],
    organizationId: "org2",
  },
  {
    id: "n6",
    title: "Winter Clothing Drive",
    description: "Warm clothing needed for elderly and children in mountain communities facing harsh winter.",
    category: "clothing",
    urgency: "medium",
    status: "fulfilled",
    location: { lat: 30.7333, lng: 76.7794, address: "Chandigarh" },
    quantity: 400,
    fulfilledQuantity: 400,
    createdAt: "2026-04-18T12:00:00Z",
    updatedAt: "2026-04-25T15:00:00Z",
    assignedVolunteers: ["v2", "v5", "v7"],
    organizationId: "org1",
  },
  {
    id: "n7",
    title: "Transport for Medical Patients",
    description: "Ambulance and transport services needed for patients in remote areas to reach hospitals.",
    category: "transport",
    urgency: "high",
    status: "open",
    location: { lat: 22.5726, lng: 88.3639, address: "Kolkata" },
    quantity: 50,
    fulfilledQuantity: 0,
    createdAt: "2026-04-25T16:00:00Z",
    updatedAt: "2026-04-25T16:00:00Z",
    assignedVolunteers: [],
    organizationId: "org3",
  },
  {
    id: "n8",
    title: "Community Kitchen Setup",
    description: "Setting up community kitchens to serve hot meals to flood victims in temporary camps.",
    category: "food",
    urgency: "critical",
    status: "in-progress",
    location: { lat: 12.9716, lng: 77.5946, address: "Bangalore South" },
    quantity: 3,
    fulfilledQuantity: 1,
    createdAt: "2026-04-24T07:00:00Z",
    updatedAt: "2026-04-26T09:00:00Z",
    assignedVolunteers: ["v3", "v8"],
    organizationId: "org2",
  },
];

// ============================================================
// Mock Volunteers
// ============================================================
export const MOCK_VOLUNTEERS: Volunteer[] = [
  {
    id: "v1",
    name: "Priya Sharma",
    email: "priya@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    phone: "+91 98765 43210",
    skills: ["First Aid", "Logistics", "Communication"],
    availability: "available",
    location: { lat: 28.6139, lng: 77.209, address: "New Delhi" },
    totalHours: 342,
    missionsCompleted: 28,
    joinedAt: "2025-01-15T00:00:00Z",
    rating: 4.9,
  },
  {
    id: "v2",
    name: "Arjun Patel",
    email: "arjun@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
    phone: "+91 98765 43211",
    skills: ["Construction", "Project Management", "Driving"],
    availability: "busy",
    location: { lat: 19.076, lng: 72.8777, address: "Mumbai" },
    totalHours: 567,
    missionsCompleted: 45,
    joinedAt: "2024-06-10T00:00:00Z",
    rating: 4.8,
  },
  {
    id: "v3",
    name: "Sneha Reddy",
    email: "sneha@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    phone: "+91 98765 43212",
    skills: ["Medical", "Counseling", "Teaching"],
    availability: "available",
    location: { lat: 13.0827, lng: 80.2707, address: "Chennai" },
    totalHours: 289,
    missionsCompleted: 22,
    joinedAt: "2025-03-20T00:00:00Z",
    rating: 4.7,
  },
  {
    id: "v4",
    name: "Rahul Kumar",
    email: "rahul@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    phone: "+91 98765 43213",
    skills: ["Construction", "Plumbing", "Electrical"],
    availability: "available",
    location: { lat: 26.9124, lng: 75.7873, address: "Jaipur" },
    totalHours: 198,
    missionsCompleted: 15,
    joinedAt: "2025-08-05T00:00:00Z",
    rating: 4.6,
  },
  {
    id: "v5",
    name: "Ananya Singh",
    email: "ananya@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    phone: "+91 98765 43214",
    skills: ["Teaching", "Translation", "IT Support"],
    availability: "offline",
    location: { lat: 23.2599, lng: 77.4126, address: "Bhopal" },
    totalHours: 412,
    missionsCompleted: 34,
    joinedAt: "2024-11-12T00:00:00Z",
    rating: 4.9,
  },
  {
    id: "v6",
    name: "Vikram Joshi",
    email: "vikram@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    phone: "+91 98765 43215",
    skills: ["Logistics", "Driving", "Water Purification"],
    availability: "busy",
    location: { lat: 22.5726, lng: 88.3639, address: "Kolkata" },
    totalHours: 156,
    missionsCompleted: 12,
    joinedAt: "2026-01-08T00:00:00Z",
    rating: 4.5,
  },
  {
    id: "v7",
    name: "Meera Nair",
    email: "meera@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
    phone: "+91 98765 43216",
    skills: ["Cooking", "Nutrition", "Fundraising"],
    availability: "available",
    location: { lat: 12.9716, lng: 77.5946, address: "Bangalore" },
    totalHours: 278,
    missionsCompleted: 20,
    joinedAt: "2025-05-22T00:00:00Z",
    rating: 4.8,
  },
  {
    id: "v8",
    name: "Karan Mehta",
    email: "karan@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan",
    phone: "+91 98765 43217",
    skills: ["Medical", "First Aid", "Logistics"],
    availability: "available",
    location: { lat: 30.7333, lng: 76.7794, address: "Chandigarh" },
    totalHours: 89,
    missionsCompleted: 7,
    joinedAt: "2026-02-14T00:00:00Z",
    rating: 4.4,
  },
];

// ============================================================
// Mock Activity Feed
// ============================================================
export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "a1",
    type: "need_created",
    title: "New need posted",
    description: "Emergency Food Supply request created for Eastern District",
    timestamp: "2026-04-26T09:30:00Z",
    actor: { name: "System", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=System" },
  },
  {
    id: "a2",
    type: "volunteer_joined",
    title: "Volunteer joined",
    description: "Karan Mehta joined as a Medical & Logistics volunteer",
    timestamp: "2026-04-26T08:15:00Z",
    actor: { name: "Karan Mehta", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan" },
  },
  {
    id: "a3",
    type: "resource_delivered",
    title: "Resources delivered",
    description: "85 food packages delivered to Eastern District families",
    timestamp: "2026-04-26T07:45:00Z",
    actor: { name: "Priya Sharma", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
  },
  {
    id: "a4",
    type: "need_fulfilled",
    title: "Need fulfilled",
    description: "Winter Clothing Drive completed — 400 items distributed",
    timestamp: "2026-04-25T15:00:00Z",
    actor: { name: "Meera Nair", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera" },
  },
  {
    id: "a5",
    type: "alert",
    title: "Critical alert",
    description: "Medical supplies urgently needed at Mumbai refugee camp",
    timestamp: "2026-04-25T14:00:00Z",
    actor: { name: "System", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alert" },
  },
];

// ============================================================
// Mock Notifications
// ============================================================
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "nt1", title: "Critical Need", message: "Medical supplies urgently needed in Mumbai", type: "error", read: false, createdAt: "2026-04-26T09:00:00Z" },
  { id: "nt2", title: "New Volunteer", message: "Karan Mehta joined your organization", type: "info", read: false, createdAt: "2026-04-26T08:15:00Z" },
  { id: "nt3", title: "Need Fulfilled", message: "Winter Clothing Drive successfully completed", type: "success", read: false, createdAt: "2026-04-25T15:00:00Z" },
  { id: "nt4", title: "Resource Update", message: "85 food packages delivered in Eastern District", type: "success", read: true, createdAt: "2026-04-25T12:00:00Z" },
  { id: "nt5", title: "Low Stock Alert", message: "Clean water supplies running low in Bhopal", type: "warning", read: true, createdAt: "2026-04-25T10:00:00Z" },
];

// ============================================================
// Mock Analytics Data
// ============================================================
export const MOCK_ANALYTICS: AnalyticsData = {
  resourcesByCategory: [
    { name: "Food", value: 4500, color: "#10b981" },
    { name: "Medical", value: 3200, color: "#ef4444" },
    { name: "Shelter", value: 2800, color: "#f59e0b" },
    { name: "Education", value: 1900, color: "#8b5cf6" },
    { name: "Water", value: 2100, color: "#3b82f6" },
    { name: "Clothing", value: 1500, color: "#ec4899" },
  ],
  volunteerEngagement: [
    { month: "Jan", active: 320, new: 45 },
    { month: "Feb", active: 350, new: 38 },
    { month: "Mar", active: 410, new: 62 },
    { month: "Apr", active: 480, new: 78 },
    { month: "May", active: 520, new: 55 },
    { month: "Jun", active: 547, new: 42 },
  ],
  needsByUrgency: [
    { name: "Critical", value: 15, color: "#ef4444" },
    { name: "High", value: 28, color: "#f97316" },
    { name: "Medium", value: 35, color: "#eab308" },
    { name: "Low", value: 22, color: "#10b981" },
  ],
  responseTimeTrend: [
    { month: "Jan", avgHours: 48 },
    { month: "Feb", avgHours: 42 },
    { month: "Mar", avgHours: 36 },
    { month: "Apr", avgHours: 28 },
    { month: "May", avgHours: 22 },
    { month: "Jun", avgHours: 18 },
  ],
  monthlyOverview: [
    { month: "Jan", needs: 180, fulfilled: 145, volunteers: 320 },
    { month: "Feb", needs: 210, fulfilled: 178, volunteers: 350 },
    { month: "Mar", needs: 250, fulfilled: 215, volunteers: 410 },
    { month: "Apr", needs: 280, fulfilled: 240, volunteers: 480 },
    { month: "May", needs: 310, fulfilled: 275, volunteers: 520 },
    { month: "Jun", needs: 340, fulfilled: 298, volunteers: 547 },
  ],
};

// ============================================================
// Map defaults
// ============================================================
export const MAP_CENTER = { lat: 22.5937, lng: 78.9629 }; // India center
export const MAP_ZOOM = 5;

// ============================================================
// Category icons & labels
// ============================================================
export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  food: { label: "Food", icon: "Utensils", color: "#10b981" },
  shelter: { label: "Shelter", icon: "Home", color: "#f59e0b" },
  medical: { label: "Medical", icon: "Stethoscope", color: "#ef4444" },
  education: { label: "Education", icon: "GraduationCap", color: "#8b5cf6" },
  clothing: { label: "Clothing", icon: "Shirt", color: "#ec4899" },
  water: { label: "Water", icon: "Droplets", color: "#3b82f6" },
  transport: { label: "Transport", icon: "Truck", color: "#f97316" },
  other: { label: "Other", icon: "Package", color: "#6b7280" },
};
