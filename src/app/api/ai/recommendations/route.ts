import { generateStrategicRecommendations } from "@/lib/services/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const recs = await generateStrategicRecommendations(body);
    return NextResponse.json(recs);
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
