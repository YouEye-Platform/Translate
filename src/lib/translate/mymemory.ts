import { internetFetch } from "@/lib/internet";

interface TranslateResult {
  translatedText: string;
  detectedLanguage?: string;
  match: number;
}

const MYMEMORY_BASE = "https://api.mymemory.translated.net";

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  userId?: string,
): Promise<TranslateResult> {
  // "auto" → "autodetect" for MyMemory's native language detection
  const effectiveSource = sourceLang === "auto" ? "autodetect" : sourceLang;

  // Only validate same-language when source is explicitly chosen (not auto-detect)
  if (sourceLang !== "auto" && effectiveSource === targetLang) {
    throw new Error(
      "Source and target languages must be different. Please change one of them."
    );
  }

  try {
    return await translateTextDirect(text, effectiveSource, targetLang, userId);
  } catch (err) {
    // When auto-detect finds the same language as target, MyMemory returns
    // "PLEASE SELECT TWO DISTINCT LANGUAGES". Return original text instead.
    if (sourceLang === "auto" && String(err).includes("DISTINCT LANGUAGES")) {
      return { translatedText: text, detectedLanguage: targetLang, match: 1 };
    }
    throw err;
  }
}

async function translateTextDirect(
  text: string,
  sourceLang: string,
  targetLang: string,
  userId?: string,
): Promise<TranslateResult> {
  const langpair = `${sourceLang}|${targetLang}`;

  const params = new URLSearchParams({
    q: text.slice(0, 500),
    langpair,
  });

  const res = await internetFetch(`${MYMEMORY_BASE}/get?${params}`, {
    signal: AbortSignal.timeout(15000),
  }, userId);
  if (!res.ok) throw new Error(`MyMemory API error: ${res.status}`);

  const data = await res.json();

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails ?? "Translation failed");
  }

  return {
    translatedText: data.responseData.translatedText,
    detectedLanguage: data.responseData.detectedLanguage ?? undefined,
    match: data.responseData.match ?? 0,
  };
}

export async function translateLongText(
  text: string,
  sourceLang: string,
  targetLang: string,
  userId?: string,
): Promise<TranslateResult> {
  const MAX_CHUNK = 500;
  if (text.length <= MAX_CHUNK) {
    return translateText(text, sourceLang, targetLang, userId);
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_CHUNK && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const results: string[] = [];
  let detectedLang: string | undefined;
  for (const chunk of chunks) {
    const result = await translateText(chunk, sourceLang, targetLang, userId);
    results.push(result.translatedText);
    if (!detectedLang && result.detectedLanguage) {
      detectedLang = result.detectedLanguage;
    }
  }

  return {
    translatedText: results.join(" "),
    detectedLanguage: detectedLang,
    match: 0,
  };
}
