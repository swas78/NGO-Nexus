"use server";

import type { Need, Volunteer } from "@/types";

/**
 * Calculates the urgency score (0-100) for a Need.
 * Factors:
 * 1. Category weight (e.g. Medical is more urgent than Education)
 * 2. People affected (logarithmic scale)
 * 3. Request age (older requests gain urgency)
 */
export async function calculateUrgencyScore(
  category: string,
  peopleAffected: number,
  createdAt: Date
): Promise<number> {
  // 1. Category Weight (Base Score out of 50)
  const categoryWeights: Record<string, number> = {
    medical: 50,
    food: 45,
    water: 45,
    shelter: 40,
    transport: 30,
    clothing: 20,
    education: 15,
    other: 10,
  };
  const baseScore = categoryWeights[category.toLowerCase()] || 25;

  // 2. Scale modifier based on people affected (0-25 points)
  // log10(10)=1, log10(100)=2, log10(1000)=3. Max cap at 10000 (log=4)
  const peopleLog = Math.max(0, Math.log10(peopleAffected || 1));
  const scaleScore = Math.min(25, (peopleLog / 4) * 25);

  // 3. Time decay/urgency factor based on request age (0-25 points)
  // Assuming max urgency added after 7 days (168 hours)
  const hoursSinceCreation = Math.abs(new Date().getTime() - createdAt.getTime()) / 36e5;
  const timeScore = Math.min(25, (hoursSinceCreation / 168) * 25);

  const totalScore = baseScore + scaleScore + timeScore;
  return Math.min(100, Math.round(totalScore));
}

/**
 * Determines urgency string label based on numeric score
 */
export async function getUrgencyLabel(score: number): Promise<"critical" | "high" | "medium" | "low"> {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * Matches a specific Need against a list of Volunteers.
 * Returns an array of volunteers sorted by fit score descending.
 * 
 * Score Formula (100 pts max):
 * - Skill Match: 50 pts (Jaccard similarity between Need tags/category and Volunteer skills)
 * - Proximity: 30 pts (Inverse distance using Haversine, max points if < 5km, 0 points if > 100km)
 * - Availability: 20 pts (Available=20, Busy=5, Offline=0)
 */
export async function rankVolunteersForNeed(need: Need, volunteers: Volunteer[]) {
  // 1. Need Context
  const needTags = [need.category.toLowerCase()];
  // Extract simple keywords from title/desc for basic matching
  const keywords = (need.title + " " + need.description).toLowerCase().match(/\b(\w+)\b/g) || [];
  const importantKeywords = ["medical", "doctor", "nurse", "first aid", "food", "cook", "drive", "transport", "logistics", "water", "plumbing", "teach", "education", "build", "construction"];
  keywords.forEach(kw => {
    const matched = importantKeywords.find(ikw => ikw.includes(kw) || kw.includes(ikw));
    if (matched && !needTags.includes(matched)) needTags.push(matched);
  });

  const ranked = volunteers.map(vol => {
    // --- Skill Match (0-50) ---
    const volSkills = vol.skills.map(s => s.toLowerCase());
    let skillScore = 0;
    // Simple matching: check how many needTags are covered by volSkills
    const matches = needTags.filter(tag => volSkills.some(vs => vs.includes(tag) || tag.includes(vs)));
    if (needTags.length > 0) {
      skillScore = (matches.length / Math.min(needTags.length, 3)) * 50; // Cap at 50, require max 3 matches
      skillScore = Math.min(50, skillScore);
    }

    // --- Distance Score (0-30) ---
    const distKm = getDistanceFromLatLonInKm(
      need.location.lat, need.location.lng,
      vol.location.lat, vol.location.lng
    );
    let distanceScore = 0;
    if (distKm <= 5) distanceScore = 30;
    else if (distKm <= 100) {
      // Linear decay from 5km (30pts) to 100km (0pts)
      distanceScore = 30 * (1 - (distKm - 5) / 95);
    }

    // --- Availability Score (0-20) ---
    let availabilityScore = 0;
    if (vol.availability === "available") availabilityScore = 20;
    else if (vol.availability === "busy") availabilityScore = 5;
    
    // --- Rating Bonus (0-5 bonus points) ---
    const ratingBonus = (vol.rating || 0);

    const totalScore = Math.min(100, Math.round(skillScore + distanceScore + availabilityScore + ratingBonus));

    return {
      volunteer: vol,
      score: totalScore,
      distanceKm: Math.round(distKm),
      skillMatchPercentage: Math.round((skillScore / 50) * 100)
    };
  });

  return ranked.sort((a, b) => b.score - a.score);
}

// Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}
