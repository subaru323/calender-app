import { useEffect } from "react";

export type EventMode = "schedule" | "deadline";

export function EventTypeSelector({
  open,
  onClose,
  onSelect,
  onTimetable,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (mode: EventMode) => void;
  onTimetable?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 背景 */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* シート本体 */}
      <div className="relative w-full max-w-md rounded-t-3xl bg-white px-5 pt-5 pb-8 shadow-2xl">
        {/* ハンドル */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200" />

        <p className="mb-4 text-center text-[15px] font-bold text-slate-700">
          何を追加しますか？
        </p>

        <div className="flex flex-col gap-3">
          {/* 予定 */}
          <button
            type="button"
            onClick={() => onSelect("schedule")}
            className="flex items-center gap-4 rounded-2xl border-2 border-sky-100 bg-sky-50 px-5 py-4 text-left transition active:scale-[0.98] hover:border-sky-300 hover:bg-sky-100"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-2xl shadow-sm">
              📅
            </span>
            <div>
              <p className="font-bold text-sky-800">予定を追加</p>
              <p className="mt-0.5 text-sm text-sky-600">
                授業・バイト・サークルなど
              </p>
              <p className="mt-0.5 text-xs text-sky-400">締切なし・日時で管理</p>
            </div>
            <span className="ml-auto text-sky-300">›</span>
          </button>

          {/* 締切 */}
          <button
            type="button"
            onClick={() => onSelect("deadline")}
            className="flex items-center gap-4 rounded-2xl border-2 border-rose-100 bg-rose-50 px-5 py-4 text-left transition active:scale-[0.98] hover:border-rose-300 hover:bg-rose-100"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-2xl shadow-sm">
              🔥
            </span>
            <div>
              <p className="font-bold text-rose-800">締切タスクを追加</p>
              <p className="mt-0.5 text-sm text-rose-600">
                課題・試験・就活ESなど
              </p>
              <p className="mt-0.5 text-xs text-rose-400">優先順位で自動ソート</p>
            </div>
            <span className="ml-auto text-rose-300">›</span>
          </button>

          {/* 時間割（一括） */}
          {onTimetable && (
            <button
              type="button"
              onClick={onTimetable}
              className="flex items-center gap-4 rounded-2xl border-2 border-violet-100 bg-violet-50 px-5 py-4 text-left transition active:scale-[0.98] hover:border-violet-300 hover:bg-violet-100"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-2xl shadow-sm">
                📚
              </span>
              <div>
                <p className="font-bold text-violet-800">時間割をまとめて登録</p>
                <p className="mt-0.5 text-sm text-violet-600">
                  曜日×時限で学期分を一括
                </p>
                <p className="mt-0.5 text-xs text-violet-400">毎週の授業を自動生成</p>
              </div>
              <span className="ml-auto text-violet-300">›</span>
            </button>
          )}
        </div>

        {/* キャンセル */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl py-3 text-sm font-medium text-slate-400 hover:text-slate-600"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
