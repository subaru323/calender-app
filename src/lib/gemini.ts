import type { EventItem } from "../types";
import { inferItems as inferItemsRule } from "./items";

const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/** Markdown コードフェンスを除去してから JSON.parse する（仕様書 Section 5） */
function stripCodeFence(text: string): string {
  return text
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();
}

/**
 * Phase 2: Gemini で文脈から持ち物を推論する。
 * items.ts の inferItems と同一 I/F なので、呼び出し側を変えずに差し替えられる。
 * VITE_GEMINI_API_KEY が未設定／API 失敗時はルールベースへフォールバック。
 */
export async function inferItemsAI(event: EventItem): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) return inferItemsRule(event);

  const prompt = [
    "あなたは若者向け予定アプリの持ち物アシスタントです。",
    "次の予定に必要な持ち物を、日本語の短い単語からなる配列で返してください。",
    "出力は JSON 配列のみ。前置き・説明・Markdownのコードフェンスは一切禁止です。",
    `タイトル: ${event.title}`,
    `種別: ${event.type}`,
    `メモ: ${event.memo ?? "なし"}`,
  ].join("\n");

  try {
    const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const parsed: unknown = JSON.parse(stripCodeFence(raw));
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x).trim()).filter(Boolean);
    }
    return inferItemsRule(event);
  } catch {
    // ネットワーク/パース失敗時は黙ってルールベースに戻す
    return inferItemsRule(event);
  }
}
