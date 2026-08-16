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
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { decryptMessage, encryptMessage } from "@/lib/message-crypto";
import { toDate } from "@/lib/time";
import type { AppUser, ChatMessage } from "@/lib/types";

async function mapMessage(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Promise<ChatMessage> {
  const data = docSnap.data({ serverTimestamps: "estimate" });
  const raw = typeof data.message === "string" ? data.message : "";
  return {
    id: docSnap.id,
    message: await decryptMessage(raw),
    uid: typeof data.uid === "string" ? data.uid : "",
    photo: typeof data.photo === "string" ? data.photo : null,
    email: typeof data.email === "string" ? data.email : null,
    displayName:
      typeof data.displayName === "string" ? data.displayName : "Someone",
    timestamp: toDate(data.timestamp),
  };
}

interface MessagesState {
  chatId: string | null;
  messages: ChatMessage[];
  error: string | null;
}

export function useMessages(chatId: string | null, user: AppUser | null) {
  const [state, setState] = useState<MessagesState>({
    chatId: null,
    messages: [],
    error: null,
  });

  useEffect(() => {
    if (!chatId) {
      return;
    }

    let cancelled = false;
    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
      limit(300),
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        void Promise.all(snapshot.docs.map(mapMessage)).then((messages) => {
          if (cancelled) {
            return;
          }
          setState({
            chatId,
            messages,
            error: null,
          });
        });
      },
      () => {
        if (cancelled) {
          return;
        }
        setState({
          chatId,
          messages: [],
          error: "Could not load messages.",
        });
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [chatId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || !chatId || !user) {
        return;
      }

      const chatRef = doc(db, "chats", chatId);
      const messagesRef = collection(chatRef, "messages");
      const encrypted = await encryptMessage(message);

      await addDoc(messagesRef, {
        timestamp: serverTimestamp(),
        message: encrypted,
        uid: user.uid,
        photo: user.photo,
        email: user.email,
        displayName: user.displayName,
      });

      try {
        await updateDoc(chatRef, {
          lastMessage: encrypted,
          lastMessageAt: serverTimestamp(),
          lastMessagePhoto: user.photo,
          lastMessageName: user.displayName,
        });
      } catch {
        // Preview fields are best-effort for older security rules.
      }
    },
    [chatId, user],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!chatId) {
        return;
      }

      const chatRef = doc(db, "chats", chatId);
      const messagesRef = collection(chatRef, "messages");
      await deleteDoc(doc(messagesRef, messageId));

      try {
        const latest = await getDocs(
          query(messagesRef, orderBy("timestamp", "desc"), limit(1)),
        );
        const latestDoc = latest.docs[0];

        if (!latestDoc) {
          await updateDoc(chatRef, {
            lastMessage: "",
            lastMessageAt: null,
            lastMessagePhoto: null,
            lastMessageName: null,
          });
          return;
        }

        const data = latestDoc.data({ serverTimestamps: "estimate" });
        await updateDoc(chatRef, {
          lastMessage: typeof data.message === "string" ? data.message : "",
          lastMessageAt: data.timestamp ?? serverTimestamp(),
          lastMessagePhoto: typeof data.photo === "string" ? data.photo : null,
          lastMessageName:
            typeof data.displayName === "string" ? data.displayName : null,
        });
      } catch {
        // Preview fields are best-effort for older security rules.
      }
    },
    [chatId],
  );

  const messages = state.chatId === chatId ? state.messages : [];
  const loading = Boolean(chatId) && state.chatId !== chatId;
  const error = state.chatId === chatId ? state.error : null;

  return { messages, loading, error, sendMessage, deleteMessage };
}
