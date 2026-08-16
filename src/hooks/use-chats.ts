import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { DEFAULT_GROUP_ICON, parseGroupIcon, type GroupIconId } from "@/lib/group-icons";
import { decryptMessage } from "@/lib/message-crypto";
import { toDate } from "@/lib/time";
import type { AppUser, ChatRoom } from "@/lib/types";

async function mapChat(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Promise<ChatRoom> {
  const data = docSnap.data({ serverTimestamps: "estimate" });
  const rawLastMessage =
    typeof data.lastMessage === "string" ? data.lastMessage : undefined;
  return {
    id: docSnap.id,
    chatName: typeof data.chatName === "string" ? data.chatName : "Untitled",
    icon: parseGroupIcon(data.icon),
    lastMessage: rawLastMessage
      ? await decryptMessage(rawLastMessage)
      : undefined,
    lastMessageAt: toDate(data.lastMessageAt ?? data.createdAt),
    lastMessagePhoto:
      typeof data.lastMessagePhoto === "string" ? data.lastMessagePhoto : null,
    lastMessageName:
      typeof data.lastMessageName === "string" ? data.lastMessageName : null,
    createdBy: typeof data.createdBy === "string" ? data.createdBy : undefined,
    createdByName:
      typeof data.createdByName === "string" ? data.createdByName : undefined,
    createdAt: toDate(data.createdAt),
  };
}

export function useChats(user: AppUser | null, canManageGroups: boolean) {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const chatsQuery = query(collection(db, "chats"), limit(100));

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        void Promise.all(snapshot.docs.map(mapChat)).then((next) => {
          if (cancelled) {
            return;
          }
          next.sort((a, b) => {
            const aTime = a.createdAt?.getTime() ?? 0;
            const bTime = b.createdAt?.getTime() ?? 0;
            return aTime - bTime;
          });
          setChats(next);
          setLoading(false);
          setError(null);
        });
      },
      () => {
        if (cancelled) {
          return;
        }
        setError("Could not load conversations.");
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const createChat = useCallback(
    async (chatName: string, icon: GroupIconId = DEFAULT_GROUP_ICON) => {
      const name = chatName.trim();
      if (!name || !user || !canManageGroups) {
        return null;
      }

      const docRef = await addDoc(collection(db, "chats"), {
        chatName: name,
        icon: parseGroupIcon(icon),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: user.displayName,
        createdByEmail: user.email,
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        lastMessagePhoto: user.photo,
        lastMessageName: user.displayName,
      });

      return docRef.id;
    },
    [canManageGroups, user],
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      if (!canManageGroups) {
        return;
      }

      const chatRef = doc(db, "chats", chatId);
      const messagesRef = collection(chatRef, "messages");

      while (true) {
        const snapshot = await getDocs(query(messagesRef, limit(400)));
        if (snapshot.empty) {
          break;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((messageDoc) => {
          batch.delete(messageDoc.ref);
        });
        await batch.commit();
      }

      await deleteDoc(chatRef);
    },
    [canManageGroups],
  );

  const renameChat = useCallback(
    async (chatId: string, chatName: string, icon: GroupIconId) => {
      const name = chatName.trim();
      if (!name || !canManageGroups) {
        return;
      }

      await updateDoc(doc(db, "chats", chatId), {
        chatName: name,
        icon: parseGroupIcon(icon),
      });
    },
    [canManageGroups],
  );

  return { chats, loading, error, createChat, deleteChat, renameChat };
}

export function filterChats(chats: ChatRoom[], queryText: string): ChatRoom[] {
  const needle = queryText.trim().toLowerCase();
  if (!needle) {
    return chats;
  }

  return chats.filter((chat) => {
    const haystack = [chat.chatName, chat.lastMessage, chat.lastMessageName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

/** Fetches a one-off last message for groups that predate denormalized previews. */
export function useLegacyLastMessages(chats: ChatRoom[]) {
  const [previews, setPreviews] = useState<Record<string, Partial<ChatRoom>>>(
    {},
  );
  const missingKey = chats
    .filter((chat) => !chat.lastMessage)
    .slice(0, 40)
    .map((chat) => chat.id)
    .join(",");

  useEffect(() => {
    if (!missingKey) {
      return;
    }

    const missing = missingKey.split(",");
    const unsubscribers = missing.map((chatId) => {
      const messagesQuery = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("timestamp", "desc"),
        limit(1),
      );

      return onSnapshot(messagesQuery, (snapshot) => {
        const docSnap = snapshot.docs[0];
        if (!docSnap) {
          return;
        }
        const data = docSnap.data({ serverTimestamps: "estimate" });
        const lastMessageAt = toDate(data.timestamp);
        const raw =
          typeof data.message === "string" ? data.message : "";
        void decryptMessage(raw).then((lastMessage) => {
          setPreviews((current) => ({
            ...current,
            [chatId]: {
              lastMessage,
              ...(lastMessageAt ? { lastMessageAt } : {}),
              lastMessagePhoto:
                typeof data.photo === "string" ? data.photo : null,
              lastMessageName:
                typeof data.displayName === "string" ? data.displayName : null,
            },
          }));
        });
      });
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [missingKey]);

  return previews;
}
