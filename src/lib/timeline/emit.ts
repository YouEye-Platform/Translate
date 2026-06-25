/**
 * Translate Timeline Event Emitters
 *
 * Posts timeline entries to YE-UI when a translation is performed.
 * Each entry includes:
 *   - embed_path: lean URL for rich iframe card in timeline
 *   - data: structured content for fallback/API access
 *   - tags: machine-readable metadata for filtering
 *
 * Debounced per userId+key to prevent duplicate entries.
 */

import { createApiClient } from "@/lib/api";
import { getLanguageName } from "@/lib/translate/languages";

const api = createApiClient("ye-translate");
const postTimelineEntry = api.postTimelineEntry.bind(api);

const emitDebounce = new Map<string, number>();
const DEBOUNCE_MS = 30 * 1000; // 30 seconds

async function emitIfNotDebounced(
  userId: string,
  key: string,
  collection: string,
  entry: Record<string, unknown>
): Promise<void> {
  const debounceKey = `${userId}:${key}`;
  const last = emitDebounce.get(debounceKey) ?? 0;
  if (Date.now() - last < DEBOUNCE_MS) return;
  emitDebounce.set(debounceKey, Date.now());

  if (emitDebounce.size > 1000) {
    const cutoff = Date.now() - 10 * 60 * 1000;
    for (const [k, v] of emitDebounce.entries()) {
      if (v < cutoff) emitDebounce.delete(k);
    }
  }

  try {
    await postTimelineEntry(userId, collection, entry);
  } catch {
    // Timeline is best-effort
  }
}

// ─── Translation Performed ──────────────────────────────────────

export async function emitTranslation(
  userId: string,
  sourceLang: string,
  targetLang: string,
  charCount: number,
  preview: string
): Promise<void> {
  const srcName = getLanguageName(sourceLang);
  const tgtName = getLanguageName(targetLang);

  await emitIfNotDebounced(
    userId,
    `translate:${sourceLang}:${targetLang}:${preview.slice(0, 30)}`,
    "history",
    {
      app_id: "translate",
      entry_type: "translate-text",
      title: `Translated ${charCount} chars ${srcName} → ${tgtName}`,
      embed_path: `/embed/timeline/translation?src=${sourceLang}&tgt=${targetLang}&chars=${charCount}&preview=${encodeURIComponent(preview.slice(0, 100))}`,
      tags: { source_lang: sourceLang, target_lang: targetLang },
      data: {
        description: `${srcName} → ${tgtName}: "${preview.slice(0, 100)}"`,
        char_count: charCount,
        source_lang: sourceLang,
        target_lang: targetLang,
        preview: preview.slice(0, 200),
      },
      private: true,
    }
  );
}
