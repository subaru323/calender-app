import type { EventItem } from "../types";
import { addDays, dateKey } from "./utils";
import { inferItemsSync } from "./items";

/**
 * ゲストモード（未ログイン）用のサンプル予定。
 * 「予定ゼロの空っぽ画面」を避け、各機能の動きをすぐ確認できるようにする。
 * ログインすると Firestore のデータに置き換わる。
 */
export function createSampleEvents(now: Date = new Date()): EventItem[] {
  const at = (offset: number) => dateKey(addDays(now, offset));
  const iso = (offset: number, time: string) => `${at(offset)}T${time}:00`;
  const base = now.getTime();

  const draft = (
    e: Omit<EventItem, "id" | "createdAt" | "items"> & { items?: string[] },
    i: number,
  ): EventItem => ({
    ...e,
    id: `sample-${i}`,
    createdAt: base - i * 1000,
    items: e.items ?? inferItemsSync(e.type),
  });

  return [
    draft(
      {
        title: "経済学 レポート提出",
        type: "assignment",
        date: at(1),
        deadline: iso(1, "23:59"),
        estimatedMinutes: 180,
        importance: 3,
        done: false,
        memo: "グラフ3枚＋考察1000字",
      },
      0,
    ),
    draft(
      {
        title: "情報処理 第3回講義",
        type: "class",
        date: at(0),
        time: "13:00",
        importance: 1,
        done: false,
      },
      1,
    ),
    draft(
      {
        title: "カフェ バイト",
        type: "shift",
        date: at(0),
        time: "18:00",
        importance: 2,
        done: false,
      },
      2,
    ),
    draft(
      {
        title: "〇〇商事 ES提出",
        type: "jobhunt",
        date: at(3),
        deadline: iso(3, "12:00"),
        estimatedMinutes: 120,
        importance: 3,
        done: false,
        memo: "ガクチカ・志望動機",
      },
      3,
    ),
    draft(
      {
        title: "TOEIC 模試",
        type: "exam",
        date: at(2),
        time: "10:00",
        importance: 2,
        done: false,
      },
      4,
    ),
    draft(
      {
        title: "英語 課題プリント",
        type: "assignment",
        date: at(0),
        deadline: iso(0, "23:59"),
        estimatedMinutes: 45,
        importance: 2,
        done: false,
      },
      5,
    ),
    draft(
      {
        title: "サークル新歓",
        type: "personal",
        date: at(5),
        time: "19:00",
        importance: 1,
        done: false,
      },
      6,
    ),
  ];
}
