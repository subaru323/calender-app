import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import type { EventDraft, EventItem } from "../types";
import { db, firebaseEnabled } from "../lib/firebase";
import { stripUndefined } from "../lib/utils";
import { createSampleEvents } from "../lib/sampleData";
import { useAuth } from "../context/AuthContext";

export interface EventsStore {
  events: EventItem[];
  /** データの出どころ。UI のバッジ表示に使う。 */
  source: "firestore" | "memory";
  addEvent: (draft: EventDraft) => Promise<void>;
  addManyEvents: (drafts: EventDraft[]) => Promise<void>;
  updateEvent: (id: string, patch: Partial<EventDraft>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deleteManyEvents: (ids: string[]) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
}

/**
 * 予定の CRUD。
 * - ログイン済み（Firebase 有効）: Firestore `users/{uid}/events`
 * - 未ログイン: メモリ内 state（サンプル付き）
 * localStorage は使わない（絶対ルール5）。
 */
export function useEvents(): EventsStore {
  const { user } = useAuth();
  const useFirestore = firebaseEnabled && !!user && !!db;

  const [events, setEvents] = useState<EventItem[]>(() =>
    firebaseEnabled ? [] : createSampleEvents(),
  );

  useEffect(() => {
    if (!useFirestore) return;
    const ref = collection(db!, "users", user!.uid, "events");
    const unsub = onSnapshot(query(ref, orderBy("createdAt", "desc")), (snap) => {
      setEvents(
        snap.docs.map((d) => ({ ...(d.data() as Omit<EventItem, "id">), id: d.id })),
      );
    });
    return unsub;
  }, [useFirestore, user?.uid]);

  const addEvent = useCallback(
    async (draft: EventDraft) => {
      const createdAt = Date.now();
      if (useFirestore) {
        await addDoc(
          collection(db!, "users", user!.uid, "events"),
          stripUndefined({ ...draft, createdAt }),
        );
      } else {
        setEvents((prev) => [
          { ...draft, id: crypto.randomUUID(), createdAt },
          ...prev,
        ]);
      }
    },
    [useFirestore, user?.uid],
  );

  const updateEvent = useCallback(
    async (id: string, patch: Partial<EventDraft>) => {
      if (useFirestore) {
        await updateDoc(
          doc(db!, "users", user!.uid, "events", id),
          stripUndefined(patch),
        );
      } else {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      }
    },
    [useFirestore, user?.uid],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      if (useFirestore) {
        await deleteDoc(doc(db!, "users", user!.uid, "events", id));
      } else {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    },
    [useFirestore, user?.uid],
  );

  // 時間割など、複数イベントを一括追加（Firestore は writeBatch でまとめてコミット）
  const addManyEvents = useCallback(
    async (drafts: EventDraft[]) => {
      if (drafts.length === 0) return;
      const baseTime = Date.now();
      if (useFirestore) {
        const batch = writeBatch(db!);
        const col = collection(db!, "users", user!.uid, "events");
        drafts.forEach((draft, i) => {
          batch.set(doc(col), stripUndefined({ ...draft, createdAt: baseTime + i }));
        });
        await batch.commit();
      } else {
        setEvents((prev) => [
          ...drafts.map((draft, i) => ({
            ...draft,
            id: crypto.randomUUID(),
            createdAt: baseTime + i,
          })),
          ...prev,
        ]);
      }
    },
    [useFirestore, user?.uid],
  );

  const deleteManyEvents = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      if (useFirestore) {
        const batch = writeBatch(db!);
        ids.forEach((id) =>
          batch.delete(doc(db!, "users", user!.uid, "events", id)),
        );
        await batch.commit();
      } else {
        const idSet = new Set(ids);
        setEvents((prev) => prev.filter((e) => !idSet.has(e.id)));
      }
    },
    [useFirestore, user?.uid],
  );

  const toggleDone = useCallback(
    async (id: string) => {
      const target = events.find((e) => e.id === id);
      if (!target) return;
      await updateEvent(id, { done: !target.done });
    },
    [events, updateEvent],
  );

  return {
    events,
    source: useFirestore ? "firestore" : "memory",
    addEvent,
    addManyEvents,
    updateEvent,
    deleteEvent,
    deleteManyEvents,
    toggleDone,
  };
}
