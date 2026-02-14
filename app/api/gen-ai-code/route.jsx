import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { prompt } = await req.json();
  try {
    const modifiedPrompt = prompt + " CRITICAL: Return ONLY valid JSON. No markdown, no backticks, no explanations.";
    const result = await GenAiCode.sendMessage(modifiedPrompt);
    const respo = result.response.text();

    let cleaned = respo
      ?.replace(/```json/g, "")
      ?.replace(/```/g, "")
      ?.trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("Invalid AI JSON:", cleaned);
      return NextResponse.json(
        { error: "AI returned invalid JSON." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating AI code:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
