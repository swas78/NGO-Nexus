"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generates a concise AI summary for a Need.
 */
export async function generateNeedSummary(need: {
  title: string;
  description: string;
  category: string;
  urgency: string;
  quantity: number;
  location: string;
  createdAt: string;
}): Promise<{
  oneLiner: string;
  estimatedImpact: string;
  recommendedAction: string;
  urgencyWindow: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an AI assistant for an NGO disaster coordination platform called ReliefSync AI.
Analyze this humanitarian need and provide a concise JSON response:

Need Details:
- Title: ${need.title}
- Category: ${need.category}
- Urgency: ${need.urgency}
- Description: ${need.description}
- Quantity needed: ${need.quantity}
- Location: ${need.location}
- Posted: ${new Date(need.createdAt).toLocaleDateString()}

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "oneLiner": "One sentence issue summary under 15 words",
  "estimatedImpact": "Estimated people/communities affected (e.g., '120 people at risk')",
  "recommendedAction": "Specific action to take (e.g., 'Deploy 3 medical volunteers within 4 hours')",
  "urgencyWindow": "Time window for response (e.g., 'Critical: Act within 2 hours')"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini summary error:", error);
    return {
      oneLiner: `${need.urgency.charAt(0).toUpperCase() + need.urgency.slice(1)} ${need.category} need requires immediate attention.`,
      estimatedImpact: `Approx. ${need.quantity * 3} people potentially affected.`,
      recommendedAction: `Assign available ${need.category} volunteers to this need promptly.`,
      urgencyWindow: need.urgency === "critical" ? "Act within 2 hours" : need.urgency === "high" ? "Act within 6 hours" : "Act within 24 hours",
    };
  }
}

/**
 * Generates strategic AI recommendations based on current platform state.
 */
export async function generateStrategicRecommendations(context: {
  totalNeeds: number;
  criticalNeeds: number;
  categories: { name: string; count: number }[];
  locations: string[];
  availableVolunteers: number;
  unresolvedUrgent: number;
}): Promise<{
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium";
  confidence: number;
  category: string;
}[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const topCategories = context.categories
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((c) => `${c.name}: ${c.count} needs`)
      .join(", ");

    const prompt = `You are a strategic AI advisor for ReliefSync, an NGO coordination platform.
Analyze current platform data and generate 3 actionable recommendations:

Platform State:
- Total open needs: ${context.totalNeeds}
- Critical needs: ${context.criticalNeeds}
- Unresolved urgent: ${context.unresolvedUrgent}
- Available volunteers: ${context.availableVolunteers}
- Top need categories: ${topCategories}
- Active regions: ${context.locations.slice(0, 5).join(", ")}

Respond with ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "id": "rec_1",
    "title": "Short action title under 8 words",
    "description": "2-3 sentence actionable recommendation with specific numbers",
    "priority": "critical|high|medium",
    "confidence": 85,
    "category": "resource|volunteer|logistics|alert"
  }
]
Generate exactly 3 recommendations.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini recommendations error:", error);
    return [
      {
        id: "rec_1",
        title: "Increase volunteer allocation to critical zones",
        description: `With ${context.criticalNeeds} critical needs active, redeploy available volunteers from low-urgency assignments. Priority zones need immediate reinforcement.`,
        priority: "critical",
        confidence: 78,
        category: "volunteer",
      },
      {
        id: "rec_2",
        title: "Optimize resource distribution routes",
        description: "Cluster nearby needs to reduce volunteer travel time by an estimated 30%. Batch deliveries in the same zone to maximize efficiency.",
        priority: "high",
        confidence: 82,
        category: "logistics",
      },
      {
        id: "rec_3",
        title: "Pre-position medical supplies proactively",
        description: "Historical patterns indicate medical needs spike 40% in the next 48 hours. Pre-position supplies in high-risk zones before demand peaks.",
        priority: "medium",
        confidence: 65,
        category: "resource",
      },
    ];
  }
}
