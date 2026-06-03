import type { UserSettings } from "../../types";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-bold tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0">
        <p className="font-medium text-slate-700">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-brand-600" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function Settings({
  settings,
  updateSettings,
  source,
}: {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  source: "firestore" | "memory";
}) {
  const { user, firebaseEnabled, signInWithGoogle, signOutUser } = useAuth();

  async function handleToggleNotifications(next: boolean) {
    if (
      next &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      try {
        await Notification.requestPermission();
      } catch {
        /* 許可ダイアログが使えない環境は無視 */
      }
    }
    updateSettings({ notificationsEnabled: next });
  }

  return (
    <div className="space-y-6">
      {/* アカウント */}
      <Card title="アカウント">
        {!firebaseEnabled ? (
          <Row label="ゲストモード" hint="Firebase 未設定。データはこのセッション内のみ保持されます。">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              ゲスト
            </span>
          </Row>
        ) : user ? (
          <>
            <Row label={user.displayName ?? "ログイン中"} hint={user.email ?? undefined}>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                同期中
              </span>
            </Row>
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="w-full px-4 py-3.5 text-left font-medium text-rose-600 hover:bg-rose-50"
            >
              ログアウト
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="flex w-full items-center justify-center gap-2 px-4 py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span aria-hidden>🔑</span> Google でログイン
          </button>
        )}
      </Card>

      {/* 通知 */}
      <Card title="通知">
        <Row label="通知を受け取る" hint="前日夜サマリー・朝ブリーフ">
          <Toggle
            checked={settings.notificationsEnabled}
            onChange={handleToggleNotifications}
          />
        </Row>
        <Row label="前日夜サマリー" hint="明日の予定・持ち物・締切TOP3">
          <input
            type="time"
            value={settings.nightSummaryTime}
            onChange={(e) => updateSettings({ nightSummaryTime: e.target.value })}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 outline-none focus:border-brand-400"
          />
        </Row>
        <Row label="朝ブリーフ" hint="今日の最優先タスク1件のみ">
          <input
            type="time"
            value={settings.morningBriefTime}
            onChange={(e) => updateSettings({ morningBriefTime: e.target.value })}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 outline-none focus:border-brand-400"
          />
        </Row>
      </Card>

      <p className="px-2 text-center text-xs text-slate-400">
        データ保存先: {source === "firestore" ? "Firestore（クラウド同期）" : "メモリ内（このセッションのみ）"}
        <br />
        プッシュ通知（FCM）は今後のアップデートで対応予定です。
      </p>
    </div>
  );
}
