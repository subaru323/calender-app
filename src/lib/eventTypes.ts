import type { EventType } from "../types";

export interface EventTypeMeta {
  label: string;
  emoji: string;
  /** バッジ用（背景＋文字色） */
  badge: string;
  /** カレンダーのドット用（背景色） */
  dot: string;
  /** やわらかい背景（カード等） */
  soft: string;
  /** アクセント文字色 */
  text: string;
}

export const EVENT_TYPE_META: Record<EventType, EventTypeMeta> = {
  class: {
    label: "授業",
    emoji: "📚",
    badge: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
    soft: "bg-sky-50",
    text: "text-sky-600",
  },
  assignment: {
    label: "課題",
    emoji: "📝",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    soft: "bg-amber-50",
    text: "text-amber-600",
  },
  exam: {
    label: "試験",
    emoji: "✍️",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
    soft: "bg-rose-50",
    text: "text-rose-600",
  },
  jobhunt: {
    label: "就活",
    emoji: "👔",
    badge: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
    soft: "bg-indigo-50",
    text: "text-indigo-600",
  },
  shift: {
    label: "バイト",
    emoji: "🛍️",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50",
    text: "text-emerald-600",
  },
  personal: {
    label: "その他",
    emoji: "✨",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    soft: "bg-slate-50",
    text: "text-slate-500",
  },
};

/** モーダルの種別選択などで使う表示順 */
export const EVENT_TYPE_ORDER: EventType[] = [
  "class",
  "assignment",
  "exam",
  "jobhunt",
  "shift",
  "personal",
];
