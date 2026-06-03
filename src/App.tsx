import { useState } from "react";
import type { EventDraft, EventItem } from "./types";
import { useAuth } from "./context/AuthContext";
import { useEvents } from "./hooks/useEvents";
import { useSettings } from "./hooks/useSettings";
import { Home } from "./pages/Home";
import { CalendarPage } from "./pages/CalendarPage";
import { DeadlinePage } from "./pages/DeadlinePage";
import { SettingsPage } from "./pages/SettingsPage";
import { EventModal } from "./components/EventModal/EventModal";
import { EventTypeSelector } from "./components/EventModal/EventTypeSelector";
import type { EventMode } from "./components/EventModal/EventTypeSelector";
import { cn, formatDateJa, todayKey } from "./lib/utils";

type Tab = "home" | "calendar" | "deadline" | "settings";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "ホーム", icon: "🏠" },
  { id: "calendar", label: "カレンダー", icon: "🗓️" },
  { id: "deadline", label: "締切", icon: "🔥" },
  { id: "settings", label: "設定", icon: "⚙️" },
];

const TAB_TITLE: Record<Tab, string> = {
  home: "MOTIO",
  calendar: "カレンダー",
  deadline: "締切リスト",
  settings: "設定",
};

export default function App() {
  const { loading } = useAuth();
  const { events, source, addEvent, updateEvent, deleteEvent, toggleDone } =
    useEvents();
  const { settings, updateSettings } = useSettings();

  const [tab, setTab] = useState<Tab>("home");

  // ① セレクタ（予定 or 締切 を選ぶボトムシート）
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<string>(todayKey());

  // ② モーダル（フォーム本体）
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<EventMode | undefined>(undefined);
  const [editing, setEditing] = useState<EventItem | null>(null);

  /** FAB / カレンダーの「この日に追加」→ セレクタを開く */
  function openSelector(date?: string) {
    setPendingDate(date ?? todayKey());
    setSelectorOpen(true);
  }

  /** セレクタでモードを選んだ → モーダルへ */
  function handleModeSelected(mode: EventMode) {
    setSelectorOpen(false);
    setEditing(null);
    setModalMode(mode);
    setModalOpen(true);
  }

  /** 既存イベントのタップ → セレクタをスキップして直接モーダルへ */
  function openEdit(event: EventItem) {
    setEditing(event);
    setModalMode(undefined); // 編集時は mode 不要
    setModalOpen(true);
  }

  function handleSave(draft: EventDraft, id?: string) {
    if (id) void updateEvent(id, draft);
    else void addEvent(draft);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/80 px-5 py-3.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>📌</span>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
            {TAB_TITLE[tab]}
          </h1>
        </div>
        {tab === "home" && (
          <span className="text-sm font-medium text-slate-400">
            {formatDateJa(todayKey())}
          </span>
        )}
      </header>

      {/* 本文 */}
      <main className="flex-1 px-4 pb-28 pt-5">
        {tab === "home" && (
          <Home events={events} onToggleDone={toggleDone} onSelectEvent={openEdit} />
        )}
        {tab === "calendar" && (
          <CalendarPage
            events={events}
            onSelectEvent={openEdit}
            onAddOnDate={openSelector}
          />
        )}
        {tab === "deadline" && (
          <DeadlinePage events={events} onToggleDone={toggleDone} onSelectEvent={openEdit} />
        )}
        {tab === "settings" && (
          <SettingsPage settings={settings} updateSettings={updateSettings} source={source} />
        )}
      </main>

      {/* 下部固定：FAB ＋ ボトムナビ */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={() => openSelector()}
          aria-label="予定・締切を追加"
          className="absolute -top-16 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-3xl font-light text-white shadow-lg shadow-brand-600/30 transition active:scale-95 hover:bg-brand-700"
        >
          ＋
        </button>
        <nav className="border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="grid grid-cols-4">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition",
                    active ? "text-brand-600" : "text-slate-400",
                  )}
                >
                  <span className={cn("text-xl", active && "scale-110")} aria-hidden>
                    {t.icon}
                  </span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ① 種別セレクタ */}
      <EventTypeSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleModeSelected}
      />

      {/* ② フォームモーダル */}
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteEvent}
        initial={editing}
        defaultDate={pendingDate}
        mode={modalMode}
      />
    </div>
  );
}
