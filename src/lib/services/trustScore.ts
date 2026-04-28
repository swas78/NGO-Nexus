// Pure computation utilities - no server directive needed
import type { Volunteer } from "@/types";

export interface TrustScoreResult {
  score: number; // 0-100
  rank: "Elite" | "Reliable" | "Moderate" | "New";
  completionRate: number;
  responseSpeed: number;
  normalizedRating: number;
  color: string;
  glowColor: string;
}

/**
 * Calculates volunteer trust score:
 * Score = (completion_rate * 0.4) + (response_speed * 0.3) + (rating * 0.3)
 * All components normalized to 0-100.
 */
export function calculateTrustScore(volunteer: Volunteer): TrustScoreResult {
  // Completion rate: missions completed / total possible missions (cap at 50 for normalization)
  const completionRate = Math.min(100, (volunteer.missionsCompleted / Math.max(1, 50)) * 100);

  // Response speed: derived from total hours / missions (fewer hours per mission = faster)
  // Perfect speed = 2 hrs/mission, slow = 20+ hrs/mission
  const avgHoursPerMission = volunteer.totalHours / Math.max(1, volunteer.missionsCompleted);
  const responseSpeed = Math.max(0, Math.min(100, ((20 - avgHoursPerMission) / 18) * 100));

  // Rating: already 0-5 scale, normalize to 0-100
  const normalizedRating = (volunteer.rating / 5) * 100;

  // Weighted trust score
  const score = Math.round(
    completionRate * 0.4 +
    responseSpeed * 0.3 +
    normalizedRating * 0.3
  );

  const clampedScore = Math.max(0, Math.min(100, score));

  // Rank determination
  let rank: TrustScoreResult["rank"];
  let color: string;
  let glowColor: string;

  if (clampedScore >= 80) {
    rank = "Elite";
    color = "text-amber-400";
    glowColor = "rgba(251,191,36,0.4)";
  } else if (clampedScore >= 60) {
    rank = "Reliable";
    color = "text-emerald-400";
    glowColor = "rgba(52,211,153,0.4)";
  } else if (clampedScore >= 35) {
    rank = "Moderate";
    color = "text-blue-400";
    glowColor = "rgba(96,165,250,0.4)";
  } else {
    rank = "New";
    color = "text-white/50";
    glowColor = "rgba(255,255,255,0.2)";
  }

  return {
    score: clampedScore,
    rank,
    completionRate: Math.round(completionRate),
    responseSpeed: Math.round(responseSpeed),
    normalizedRating: Math.round(normalizedRating),
    color,
    glowColor,
  };
}

/**
 * Enhanced volunteer matching that incorporates trust score.
 * Final Match Score = (skill_match * 0.4) + (distance_score * 0.2) + (availability * 0.1) + (trust_score * 0.3)
 */
export function rankVolunteersWithTrust(
  need: { category: string; title: string; description: string; location: { lat: number; lng: number } },
  volunteers: Volunteer[]
): { volunteer: Volunteer; score: number; trustScore: TrustScoreResult; distanceKm: number; skillMatchPct: number }[] {
  const needTags = [need.category.toLowerCase()];
  const keywords = (need.title + " " + need.description).toLowerCase().match(/\b(\w+)\b/g) || [];
  const importantKeywords = ["medical", "doctor", "nurse", "food", "cook", "drive", "transport", "water", "teach", "construction"];
  keywords.forEach((kw) => {
    const matched = importantKeywords.find((ikw) => ikw.includes(kw) || kw.includes(ikw));
    if (matched && !needTags.includes(matched)) needTags.push(matched);
  });

  return volunteers
    .map((vol) => {
      const trustScore = calculateTrustScore(vol);

      // Skill Match (0-40)
      const volSkills = vol.skills.map((s) => s.toLowerCase());
      const matches = needTags.filter((tag) => volSkills.some((vs) => vs.includes(tag) || tag.includes(vs)));
      const skillScore = needTags.length > 0 ? Math.min(40, (matches.length / Math.min(needTags.length, 3)) * 40) : 0;
      const skillMatchPct = Math.round((skillScore / 40) * 100);

      // Distance (0-20)
      const distKm = getDistance(need.location.lat, need.location.lng, vol.location.lat, vol.location.lng);
      const distanceScore = distKm <= 5 ? 20 : distKm <= 100 ? 20 * (1 - (distKm - 5) / 95) : 0;

      // Availability (0-10)
      const availScore = vol.availability === "available" ? 10 : vol.availability === "busy" ? 3 : 0;

      // Trust Score contribution (0-30)
      const trustContrib = (trustScore.score / 100) * 30;

      const total = Math.min(100, Math.round(skillScore + distanceScore + availScore + trustContrib));

      return { volunteer: vol, score: total, trustScore, distanceKm: Math.round(distKm), skillMatchPct };
    })
    .sort((a, b) => b.score - a.score);
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
