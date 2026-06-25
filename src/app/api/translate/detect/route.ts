import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { internetFetch } from "@/lib/internet";

export async function POST(request: NextRequest) {
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { text } = body;
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  // Use MyMemory with auto source to detect language
  try {
    const params = new URLSearchParams({
      q: text.slice(0, 200),
      langpair: `|en`,
    });
    const res = await internetFetch(`https://api.mymemory.translated.net/get?${params}`, {
      signal: AbortSignal.timeout(10000),
    }, session.userId);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const detected = data.responseData?.detectedLanguage ?? null;
    return NextResponse.json({ language: detected, confidence: detected ? 0.8 : 0 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
