import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const apiKey = process.env.DEEPGRAM_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Deepgram API key is unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return NextResponse.json(
    { apiKey },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    },
  );
}