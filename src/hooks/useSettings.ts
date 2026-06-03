import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import type { UserSettings } from "../types";
import { db, firebaseEnabled } from "../lib/firebase";
import { stripUndefined } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export const DEFAULT_SETTINGS: UserSettings = {
  nightSummaryTime: "21:00",
  morningBriefTime: "07:30",
  notificationsEnabled: false,
};

export interface SettingsStore {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
}

/**
 * ユーザー設定。Firestore `users/{uid}/settings/app` に単一ドキュメントで保存。
 * 未ログイン時はメモリ内 state。
 */
export function useSettings(): SettingsStore {
  const { user } = useAuth();
  const useFirestore = firebaseEnabled && !!user && !!db;
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!useFirestore) return;
    const ref = doc(db!, "users", user!.uid, "settings", "app");
    const unsub = onSnapshot(ref, (snap) => {
      setSettings(
        snap.exists()
          ? { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<UserSettings>) }
          : DEFAULT_SETTINGS,
      );
    });
    return unsub;
  }, [useFirestore, user?.uid]);

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      if (useFirestore) {
        await setDoc(
          doc(db!, "users", user!.uid, "settings", "app"),
          stripUndefined(patch),
          { merge: true },
        );
      } else {
        setSettings((prev) => ({ ...prev, ...patch }));
      }
    },
    [useFirestore, user?.uid],
  );

  return { settings, updateSettings };
}
