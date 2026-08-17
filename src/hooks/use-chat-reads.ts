import { useEffect, useMemo, useState } from "react";

import { CHAT_READS_KEY } from "@/lib/site";
import type { AppUser, ChatRoom } from "@/lib/types";

type ReadMap = Record<string, number>;

const INIT_KEY = "__init";

function storageKeyFor(uid: string) {
  return `${CHAT_READS_KEY}:${uid}`;
}

function readStored(uid: string): ReadMap | null {
  try {
    const raw = localStorage.getItem(storageKeyFor(uid));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const next: ReadMap = {};
    for (const [chatId, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value)) {
        next[chatId] = value;
      }
    }
    return next;
  } catch {
    return null;
  }
}

function writeStored(uid: string, reads: ReadMap) {
  try {
    localStorage.setItem(storageKeyFor(uid), JSON.stringify(reads));
  } catch {
    // localStorage can be unavailable in private contexts.
  }
}

function lastMessageTime(chat: ChatRoom): number {
  return chat.lastMessageAt?.getTime() ?? 0;
}

function hasPreview(chat: ChatRoom): boolean {
  return Boolean(chat.lastMessage?.trim());
}

/** Tracks which groups have new messages since this device last opened them. */
export function useChatReads(
  user: AppUser | null,
  chats: ChatRoom[],
  activeChatId: string | null,
) {
  const uid = user?.uid ?? null;
  const [reads, setReads] = useState<ReadMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uid) {
      setReads({});
      setReady(false);
      return;
    }

    const stored = readStored(uid);
    if (stored && stored[INIT_KEY]) {
      setReads(stored);
      setReady(true);
      return;
    }

    const initial: ReadMap = { [INIT_KEY]: Date.now(), ...stored };
    writeStored(uid, initial);
    setReads(initial);
    setReady(true);
  }, [uid]);

  useEffect(() => {
    if (!uid || !ready || !activeChatId) {
      return;
    }

    const stamp = Date.now();
    setReads((current) => {
      if ((current[activeChatId] ?? 0) >= stamp) {
        return current;
      }
      const next = { ...current, [activeChatId]: stamp };
      writeStored(uid, next);
      return next;
    });
  }, [uid, ready, activeChatId]);

  useEffect(() => {
    if (!uid || !ready || !activeChatId) {
      return;
    }

    const chat = chats.find((item) => item.id === activeChatId);
    const time = chat ? lastMessageTime(chat) : 0;
    if (!time) {
      return;
    }

    setReads((current) => {
      if ((current[activeChatId] ?? 0) >= time) {
        return current;
      }
      const next = { ...current, [activeChatId]: time };
      writeStored(uid, next);
      return next;
    });
  }, [uid, ready, activeChatId, chats]);

  const unreadIds = useMemo(() => {
    const ids = new Set<string>();
    if (!ready || !user) {
      return ids;
    }

    const fallback = reads[INIT_KEY] ?? 0;

    for (const chat of chats) {
      if (chat.id === activeChatId || !hasPreview(chat)) {
        continue;
      }
      if (chat.lastMessageUid && chat.lastMessageUid === user.uid) {
        continue;
      }
      const readAt = reads[chat.id] ?? fallback;
      if (lastMessageTime(chat) > readAt) {
        ids.add(chat.id);
      }
    }

    return ids;
  }, [ready, user, chats, activeChatId, reads]);

  return unreadIds;
}
