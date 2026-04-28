import { generateNeedSummary } from "@/lib/services/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const summary = await generateNeedSummary(body);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Need summary API error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
