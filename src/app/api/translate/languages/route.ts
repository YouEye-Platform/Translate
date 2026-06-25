import { NextResponse } from "next/server";
import { LANGUAGES } from "@/lib/translate/languages";

export async function GET() {
  return NextResponse.json({ languages: LANGUAGES });
}
