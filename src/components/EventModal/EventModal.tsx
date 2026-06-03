import { useEffect, useState } from "react";
import type { EventDraft, EventItem, EventType, Importance } from "../../types";
import { EVENT_TYPE_META } from "../../lib/eventTypes";
import { inferItemsSync } from "../../lib/items";
import { cn, todayKey } from "../../lib/utils";
import { Modal } from "../shared/Modal";
import type { EventMode } from "./EventTypeSelector";

// 予定モード：授業・バイト優先、締切モード：課題・試験・就活優先
const TYPE_ORDER_SCHEDULE: EventType[] = ["class", "shift", "personal", "exam", "jobhunt", "assignment"];
const TYPE_ORDER_DEADLINE: EventType[] = ["assignment", "exam", "jobhunt", "class", "shift", "personal"];

const IMPORTANCE_OPTIONS: { value: Importance; label: string }[] = [
  { value: 1, label: "低" },
  { value: 2, label: "中" },
  { value: 3, label: "高" },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-600">
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100";

/** 新規追加時のモードごとのデフォルト設定 */
function defaultsForMode(
  mode: EventMode | undefined,
  date: string,
): {
  type: EventType;
  hasDeadline: boolean;
  deadline: string;
} {
  if (mode === "deadline") {
    return { type: "assignment", hasDeadline: true, deadline: `${date}T23:59` };
  }
  // schedule または undefined（編集時は呼ばれない）
  return { type: "class", hasDeadline: false, deadline: `${date}T23:59` };
}

export function EventModal({
  open,
  onClose,
  onSave,
  onDelete,
  initial,
  defaultDate,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: EventDraft, id?: string) => void;
  onDelete?: (id: string) => void;
  initial?: EventItem | null;
  defaultDate?: string;
  /** 新規追加時のモード。undefined は既存イベント編集（フォームを初期値で開く）。 */
  mode?: EventMode;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("class");
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState("");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [importance, setImportance] = useState<Importance>(2);
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [memo, setMemo] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [itemDraft, setItemDraft] = useState("");

  // モードに合わせた種別順
  const typeOrder =
    !initial && mode === "deadline" ? TYPE_ORDER_DEADLINE : TYPE_ORDER_SCHEDULE;

  // 締切フィールドを常時固定するか（deadline モードの新規追加のみ）
  const deadlineLocked = !initial && mode === "deadline";

  useEffect(() => {
    if (!open) return;
    if (initial) {
      // 編集：initial の値で初期化
      setTitle(initial.title);
      setType(initial.type);
      setDate(initial.date);
      setTime(initial.time ?? "");
      setHasDeadline(!!initial.deadline);
      setDeadline(initial.deadline ? initial.deadline.slice(0, 16) : "");
      setImportance(initial.importance);
      setEstimatedMinutes(initial.estimatedMinutes ? String(initial.estimatedMinutes) : "");
      setMemo(initial.memo ?? "");
      setItems(initial.items ?? inferItemsSync(initial.type));
    } else {
      // 新規：モードと日付に合わせた初期値
      const d = defaultDate ?? todayKey();
      const defs = defaultsForMode(mode, d);
      setTitle("");
      setType(defs.type);
      setDate(d);
      setTime("");
      setHasDeadline(defs.hasDeadline);
      setDeadline(defs.deadline);
      setImportance(2);
      setEstimatedMinutes("");
      setMemo("");
      setItems(inferItemsSync(defs.type));
    }
    setItemDraft("");
  }, [open, initial, defaultDate, mode]);

  function handleSelectType(next: EventType) {
    setType(next);
    const prevTemplate = inferItemsSync(type);
    const isUntouched =
      items.length === 0 ||
      (items.length === prevTemplate.length &&
        items.every((v, i) => v === prevTemplate[i]));
    if (isUntouched) setItems(inferItemsSync(next));
  }

  function addItem() {
    const v = itemDraft.trim();
    if (!v || items.includes(v)) { setItemDraft(""); return; }
    setItems((prev) => [...prev, v]);
    setItemDraft("");
  }

  function handleSubmit() {
    if (!title.trim() || !date) return;
    // deadline モードでは締切日時が必須
    if (deadlineLocked && !deadline) return;

    const draft: EventDraft = {
      title: title.trim(),
      type,
      date,
      importance,
      done: initial?.done ?? false,
      ...(time ? { time } : {}),
      ...(hasDeadline && deadline ? { deadline: `${deadline}:00` } : {}),
      ...(estimatedMinutes ? { estimatedMinutes: Number(estimatedMinutes) } : {}),
      ...(memo.trim() ? { memo: memo.trim() } : {}),
      ...(items.length ? { items } : {}),
    };
    onSave(draft, initial?.id);
    onClose();
  }

  // タイトル
  const modalTitle = initial
    ? "予定を編集"
    : mode === "deadline"
      ? "締切タスクを追加"
      : "予定を追加";

  return (
    <Modal open={open} onClose={onClose} title={modalTitle}>
      <div className="space-y-5">

        {/* モードバッジ（新規のみ） */}
        {!initial && mode && (
          <div className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
            mode === "deadline"
              ? "bg-rose-100 text-rose-700"
              : "bg-sky-100 text-sky-700",
          )}>
            {mode === "deadline" ? "🔥 締切タスク" : "📅 予定"}
          </div>
        )}

        {/* タイトル */}
        <div>
          <Label>タイトル</Label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              mode === "deadline" ? "例: 経済学 レポート提出" : "例: 情報処理 第3回講義"
            }
            autoFocus
          />
        </div>

        {/* 種別 */}
        <div>
          <Label>種別</Label>
          <div className="flex flex-wrap gap-2">
            {typeOrder.map((t) => {
              const meta = EVENT_TYPE_META[t];
              const active = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelectType(t)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {meta.emoji} {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 日付・時刻 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{mode === "deadline" ? "予定日" : "日付"}</Label>
            <input
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>時刻（任意）</Label>
            <input
              type="time"
              className={inputCls}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* ===== 締切セクション ===== */}
        {deadlineLocked ? (
          /* deadline モード：常時表示・ロック */
          <div>
            <Label>
              締切日時
              <span className="ml-1.5 text-xs font-normal text-rose-500">必須</span>
            </Label>
            <input
              type="datetime-local"
              className={cn(inputCls, "border-rose-200 focus:border-rose-400 focus:ring-rose-100")}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        ) : (
          /* schedule モード / 編集：任意トグル */
          !( !initial && mode === "schedule" ) && (
            <div>
              <div className="flex items-center justify-between">
                <Label>締切を設定</Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hasDeadline}
                  onClick={() => setHasDeadline((v) => !v)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition",
                    hasDeadline ? "bg-brand-600" : "bg-slate-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
                      hasDeadline ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>
              </div>
              {hasDeadline && (
                <input
                  type="datetime-local"
                  className={cn(inputCls, "mt-1")}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              )}
            </div>
          )
        )}

        {/* 重要度・所要時間 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>重要度</Label>
            <div className="flex gap-1.5">
              {IMPORTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setImportance(opt.value)}
                  className={cn(
                    "flex-1 rounded-xl py-2 text-sm font-semibold transition",
                    importance === opt.value
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* 所要時間：締切モードと編集時のみ表示 */}
          {(deadlineLocked || initial) && (
            <div>
              <Label>着手時間の目安（分）</Label>
              <input
                type="number"
                min={0}
                step={15}
                className={inputCls}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="例: 120"
              />
            </div>
          )}
        </div>

        {/* 持ち物 */}
        <div>
          <div className="flex items-center justify-between">
            <Label>持ち物</Label>
            <button
              type="button"
              onClick={() => setItems(inferItemsSync(type))}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              種別から再提案
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((it) => (
              <span
                key={it}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-sm text-brand-700"
              >
                {it}
                <button
                  type="button"
                  aria-label={`${it} を削除`}
                  onClick={() => setItems((prev) => prev.filter((x) => x !== it))}
                  className="text-brand-400 hover:text-brand-700"
                >
                  ×
                </button>
              </span>
            ))}
            {items.length === 0 && (
              <span className="text-sm text-slate-400">なし</span>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className={inputCls}
              value={itemDraft}
              onChange={(e) => setItemDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addItem(); }
              }}
              placeholder="持ち物を追加"
            />
            <button
              type="button"
              onClick={addItem}
              className="shrink-0 rounded-xl bg-slate-100 px-4 font-medium text-slate-600 hover:bg-slate-200"
            >
              追加
            </button>
          </div>
        </div>

        {/* メモ */}
        <div>
          <Label>メモ（任意）</Label>
          <textarea
            className={cn(inputCls, "min-h-[72px] resize-none")}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="補足・持ち物のヒントなど"
          />
        </div>

        {/* アクション */}
        <div className="flex items-center gap-3 pt-1">
          {initial && onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(initial.id); onClose(); }}
              className="rounded-xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50"
            >
              削除
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || (deadlineLocked && !deadline)}
            className={cn(
              "ml-auto flex-1 rounded-xl py-3 font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40",
              mode === "deadline" && !initial
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-brand-600 hover:bg-brand-700",
            )}
          >
            {initial ? "保存" : "追加する"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
