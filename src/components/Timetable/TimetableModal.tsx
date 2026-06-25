import { useEffect, useState } from "react";
import type { EventDraft } from "../../types";
import { cn, todayKey } from "../../lib/utils";
import {
  DEFAULT_PERIODS,
  WEEKDAY_COLS,
  cellKey,
  countFilledCells,
  generateTimetableEvents,
  type Period,
  type TimetableGrid,
} from "../../lib/timetable";
import { Modal } from "../shared/Modal";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100";

export function TimetableModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  /** drafts を生成して渡す。replace=true なら既存の時間割を置き換える。 */
  onSubmit: (drafts: EventDraft[], replace: boolean) => void;
}) {
  const [periods, setPeriods] = useState<Period[]>(DEFAULT_PERIODS);
  const [includeSat, setIncludeSat] = useState(false);
  const [grid, setGrid] = useState<TimetableGrid>({});
  const [startDate, setStartDate] = useState(todayKey());
  const [weeks, setWeeks] = useState("15");
  const [replace, setReplace] = useState(true);

  // 編集中セル
  const [active, setActive] = useState<{ weekday: number; periodIdx: number } | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editRoom, setEditRoom] = useState("");

  useEffect(() => {
    if (open) setActive(null);
  }, [open]);

  const cols = includeSat
    ? WEEKDAY_COLS
    : WEEKDAY_COLS.filter((c) => c.weekday <= 5);

  const filled = countFilledCells(grid);
  const weeksNum = Math.max(1, Number(weeks) || 1);

  function openCell(weekday: number, periodIdx: number) {
    const cell = grid[cellKey(weekday, periodIdx)];
    setEditSubject(cell?.subject ?? "");
    setEditRoom(cell?.room ?? "");
    setActive({ weekday, periodIdx });
  }

  function saveCell() {
    if (!active) return;
    const key = cellKey(active.weekday, active.periodIdx);
    const subject = editSubject.trim();
    setGrid((prev) => {
      const next = { ...prev };
      if (subject) next[key] = { subject, room: editRoom.trim() || undefined };
      else delete next[key];
      return next;
    });
    setActive(null);
  }

  function clearCell() {
    if (!active) return;
    const key = cellKey(active.weekday, active.periodIdx);
    setGrid((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setActive(null);
  }

  function setPeriodTime(idx: number, time: string) {
    setPeriods((prev) => prev.map((p, i) => (i === idx ? { ...p, time } : p)));
  }

  function addPeriod() {
    setPeriods((prev) => [
      ...prev,
      { label: `${prev.length + 1}限`, time: "" },
    ]);
  }

  function removePeriod() {
    if (periods.length <= 1) return;
    const lastIdx = periods.length - 1;
    setPeriods((prev) => prev.slice(0, -1));
    // 削除した時限のセルも消す
    setGrid((prev) => {
      const next: TimetableGrid = {};
      for (const [k, v] of Object.entries(prev)) {
        if (!k.endsWith(`-${lastIdx}`)) next[k] = v;
      }
      return next;
    });
  }

  function handleSubmit() {
    if (filled === 0) return;
    const drafts = generateTimetableEvents({
      grid,
      periods,
      startDate,
      weeks: weeksNum,
    });
    onSubmit(drafts, replace);
    onClose();
  }

  const activeLabel = active
    ? `${WEEKDAY_COLS.find((c) => c.weekday === active.weekday)?.label}曜 ${periods[active.periodIdx]?.label}`
    : "";

  return (
    <Modal open={open} onClose={onClose} title="時間割をまとめて登録">
      <div className="space-y-5">
        <p className="text-sm text-slate-500">
          科目を入れて「登録」すると、学期ぶんの授業予定が自動で全部入ります 🎓
        </p>

        {/* グリッド */}
        <div className="-mx-1 overflow-x-auto">
          <div
            className="grid gap-1 px-1"
            style={{ gridTemplateColumns: `52px repeat(${cols.length}, minmax(58px, 1fr))` }}
          >
            {/* ヘッダー行 */}
            <div />
            {cols.map((c) => (
              <div
                key={c.weekday}
                className={cn(
                  "py-1 text-center text-xs font-bold",
                  c.weekday === 6 ? "text-sky-500" : "text-slate-500",
                )}
              >
                {c.label}
              </div>
            ))}

            {/* 時限行 */}
            {periods.map((p, pi) => (
              <div key={pi} className="contents">
                {/* 時限ラベル + 時刻 */}
                <div className="flex flex-col items-center justify-center py-1">
                  <span className="text-xs font-bold text-slate-600">{p.label}</span>
                  <input
                    type="time"
                    value={p.time}
                    onChange={(e) => setPeriodTime(pi, e.target.value)}
                    className="mt-0.5 w-full rounded bg-slate-100 px-0.5 py-0.5 text-center text-[10px] text-slate-500 outline-none focus:bg-white"
                  />
                </div>

                {/* 各曜日セル */}
                {cols.map((c) => {
                  const cell = grid[cellKey(c.weekday, pi)];
                  const isActive =
                    active?.weekday === c.weekday && active?.periodIdx === pi;
                  return (
                    <button
                      key={c.weekday}
                      type="button"
                      onClick={() => openCell(c.weekday, pi)}
                      className={cn(
                        "flex min-h-[44px] flex-col items-center justify-center rounded-lg border p-1 text-center transition",
                        isActive
                          ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                          : cell
                            ? "border-sky-200 bg-sky-50 hover:border-sky-300"
                            : "border-slate-100 bg-slate-50 hover:border-slate-200",
                      )}
                    >
                      {cell ? (
                        <>
                          <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-sky-800">
                            {cell.subject}
                          </span>
                          {cell.room && (
                            <span className="text-[9px] text-sky-500">{cell.room}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-base text-slate-300">＋</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 時限の増減・土曜トグル */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={addPeriod}
            className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-200"
          >
            ＋時限
          </button>
          <button
            type="button"
            onClick={removePeriod}
            className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-200"
          >
            －時限
          </button>
          <button
            type="button"
            onClick={() => setIncludeSat((v) => !v)}
            className={cn(
              "ml-auto rounded-lg px-3 py-1.5 font-medium transition",
              includeSat
                ? "bg-sky-100 text-sky-700"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200",
            )}
          >
            土曜 {includeSat ? "ON" : "OFF"}
          </button>
        </div>

        {/* セル編集パネル */}
        {active && (
          <div className="space-y-2 rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
            <p className="text-sm font-bold text-brand-700">{activeLabel}</p>
            <input
              className={inputCls}
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); saveCell(); }
              }}
              placeholder="科目名（例: 微分積分学）"
              autoFocus
            />
            <input
              className={inputCls}
              value={editRoom}
              onChange={(e) => setEditRoom(e.target.value)}
              placeholder="教室（任意・例: A302）"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearCell}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50"
              >
                クリア
              </button>
              <button
                type="button"
                onClick={saveCell}
                className="ml-auto flex-1 rounded-xl bg-brand-600 py-2 text-sm font-bold text-white hover:bg-brand-700"
              >
                このコマを保存
              </button>
            </div>
          </div>
        )}

        {/* 期間設定 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-600">
              開始日
            </label>
            <input
              type="date"
              className={inputCls}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-600">
              週数
            </label>
            <input
              type="number"
              min={1}
              max={30}
              className={inputCls}
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
            />
          </div>
        </div>

        {/* 置き換えオプション */}
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={replace}
            onChange={(e) => setReplace(e.target.checked)}
            className="h-5 w-5 accent-brand-600"
          />
          <span className="text-sm text-slate-600">
            前に登録した時間割を置き換える
            <span className="block text-xs text-slate-400">
              重複登録を防ぎます
            </span>
          </span>
        </label>

        {/* 登録 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={filled === 0}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {filled === 0
            ? "科目を入力してください"
            : `${filled}コマ × ${weeksNum}週 = ${filled * weeksNum}件を登録`}
        </button>
      </div>
    </Modal>
  );
}
