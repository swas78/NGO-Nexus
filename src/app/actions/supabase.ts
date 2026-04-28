"use server";

import { createClient } from "@supabase/supabase-js";
import { calculateUrgencyScore, getUrgencyLabel, rankVolunteersForNeed } from "@/lib/services/scoring";
import type { Need, Volunteer } from "@/types";

// Create a server-side Supabase client using Service Role or Anon Key
// In a real app, you'd use @supabase/ssr createServerClient to use cookies/auth.
// Here we are creating a generic client for the server actions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/* ==============================
   NEEDS API
============================== */

export async function fetchNeeds(): Promise<Need[]> {
  const { data, error } = await supabase
    .from("needs")
    .select(`
      *,
      assignments ( volunteer_id )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching needs:", error);
    return [];
  }

  // Transform data to match frontend types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((n: any) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    category: n.category,
    urgency: n.urgency,
    status: n.status,
    location: { lat: n.location_lat, lng: n.location_lng, address: n.address || "" },
    quantity: n.quantity,
    fulfilledQuantity: n.fulfilled_quantity,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
    organizationId: n.ngo_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assignedVolunteers: n.assignments?.map((a: any) => a.volunteer_id) || []
  }));
}

export async function createNeed(data: Partial<Need>) {
  // 1. Run Urgency Scoring Algorithm
  const score = await calculateUrgencyScore(
    data.category || "other",
    data.quantity || 1,
    new Date()
  );
  
  const urgencyLabel = await getUrgencyLabel(score);

  // 2. Insert into Supabase
  const { data: newNeed, error } = await supabase
    .from("needs")
    .insert({
      ngo_id: data.organizationId || "11111111-1111-1111-1111-111111111111", // default demo ngo
      title: data.title,
      description: data.description,
      category: data.category,
      urgency: urgencyLabel,
      status: "open",
      quantity: data.quantity,
      fulfilled_quantity: 0,
      location_lat: data.location?.lat,
      location_lng: data.location?.lng,
      address: data.location?.address
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return newNeed;
}

export async function updateNeed(id: string, data: Partial<Need>) {
  const { error } = await supabase
    .from("needs")
    .update({
      title: data.title,
      description: data.description,
      category: data.category,
      urgency: data.urgency,
      quantity: data.quantity,
      location_lat: data.location?.lat,
      location_lng: data.location?.lng,
      address: data.location?.address,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateNeedStatus(id: string, status: string) {
  const { error } = await supabase
    .from("needs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteNeed(id: string) {
  const { error } = await supabase
    .from("needs")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/* ==============================
   VOLUNTEERS API
============================== */

export async function fetchVolunteers(): Promise<Volunteer[]> {
  const { data, error } = await supabase
    .from("volunteers")
    .select("*")
    .order('joined_at', { ascending: false });

  if (error) {
    console.error("Error fetching volunteers:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((v: any) => ({
    id: v.id,
    name: v.name,
    email: v.email,
    phone: v.phone,
    avatar: v.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.name}`,
    skills: v.skills || [],
    availability: v.availability,
    location: { lat: v.location_lat, lng: v.location_lng, address: v.address || "" },
    totalHours: v.total_hours,
    missionsCompleted: v.missions_completed,
    rating: v.rating,
    joinedAt: v.joined_at,
  }));
}

export async function createVolunteer(data: Partial<Volunteer>) {
  const { data: newVol, error } = await supabase
    .from("volunteers")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      skills: data.skills,
      availability: data.availability || "available",
      location_lat: data.location?.lat,
      location_lng: data.location?.lng,
      address: data.location?.address,
      rating: 5.0
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return newVol;
}

export async function updateVolunteer(id: string, data: Partial<Volunteer>) {
  const { error } = await supabase
    .from("volunteers")
    .update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      skills: data.skills,
      availability: data.availability,
      location_lat: data.location?.lat,
      location_lng: data.location?.lng,
      address: data.location?.address,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteVolunteer(id: string) {
  const { error } = await supabase
    .from("volunteers")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/* ==============================
   MATCHING & ASSIGNMENTS API
============================== */

export async function findBestMatches(needId: string) {
  // Fetch the specific need
  const { data: needData, error: needErr } = await supabase.from("needs").select("*").eq("id", needId).single();
  if (needErr || !needData) throw new Error("Need not found");

  const need: Need = {
    ...needData,
    location: { lat: needData.location_lat, lng: needData.location_lng, address: needData.address },
  };

  // Fetch all available/busy volunteers (skip offline)
  const allVolunteers = await fetchVolunteers();
  const validVolunteers = allVolunteers.filter(v => v.availability !== "offline");

  // Run matching algorithm
  const rankedMatches = await rankVolunteersForNeed(need, validVolunteers);
  
  // Return top 3
  return rankedMatches.slice(0, 3);
}

export async function assignVolunteer(needId: string, volunteerId: string) {
  // 1. Create Assignment
  const { error: assignErr } = await supabase
    .from("assignments")
    .insert({
      need_id: needId,
      volunteer_id: volunteerId,
      status: "accepted"
    });
  
  if (assignErr) throw new Error(assignErr.message);

  // 2. Update Need status to in-progress if it was open
  await supabase
    .from("needs")
    .update({ status: "in-progress", updated_at: new Date().toISOString() })
    .eq("id", needId)
    .eq("status", "open");
    
  return true;
}
