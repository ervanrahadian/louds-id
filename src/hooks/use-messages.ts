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
import { messageSnippet } from "@/lib/message";
import { decryptMessage, encryptMessage } from "@/lib/message-crypto";
import { toDate } from "@/lib/time";
import type { AppUser, ChatMessage, MessageReply } from "@/lib/types";

async function mapReplyTo(data: DocumentData): Promise<MessageReply | null> {
  const raw = data.replyTo;
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const id = typeof raw.id === "string" ? raw.id : "";
  if (!id) {
    return null;
  }

  const encrypted =
    typeof raw.message === "string" ? raw.message : "";

  return {
    id,
    uid: typeof raw.uid === "string" ? raw.uid : "",
    displayName:
      typeof raw.displayName === "string" ? raw.displayName : "Someone",
    message: encrypted ? await decryptMessage(encrypted) : "",
  };
}

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
    editedAt: toDate(data.editedAt),
    replyTo: await mapReplyTo(data),
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
    async (text: string, replyTo?: ChatMessage | null) => {
      const message = text.trim();
      if (!message || !chatId || !user) {
        return;
      }

      const chatRef = doc(db, "chats", chatId);
      const messagesRef = collection(chatRef, "messages");
      const encrypted = await encryptMessage(message);
      const replySnippet = replyTo
        ? await encryptMessage(messageSnippet(replyTo.message))
        : null;

      await addDoc(messagesRef, {
        timestamp: serverTimestamp(),
        message: encrypted,
        uid: user.uid,
        photo: user.photo,
        email: user.email,
        displayName: user.displayName,
        ...(replyTo && replySnippet
          ? {
              replyTo: {
                id: replyTo.id,
                uid: replyTo.uid,
                displayName: replyTo.displayName,
                message: replySnippet,
              },
            }
          : {}),
      });

      try {
        await updateDoc(chatRef, {
          lastMessage: encrypted,
          lastMessageAt: serverTimestamp(),
          lastMessagePhoto: user.photo,
          lastMessageName: user.displayName,
          lastMessageUid: user.uid,
        });
      } catch {
        // Preview fields are best-effort for older security rules.
      }
    },
    [chatId, user],
  );

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      const message = text.trim();
      if (!message || !chatId || !user) {
        return;
      }

      const chatRef = doc(db, "chats", chatId);
      const messageRef = doc(chatRef, "messages", messageId);
      const encrypted = await encryptMessage(message);

      try {
        await updateDoc(messageRef, {
          message: encrypted,
          editedAt: serverTimestamp(),
        });
      } catch {
        throw new Error("Could not save edit.");
      }

      try {
        const latest = await getDocs(
          query(
            collection(chatRef, "messages"),
            orderBy("timestamp", "desc"),
            limit(1),
          ),
        );
        if (latest.docs[0]?.id === messageId) {
          await updateDoc(chatRef, { lastMessage: encrypted });
        }
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
            lastMessageUid: null,
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
          lastMessageUid: typeof data.uid === "string" ? data.uid : null,
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

  return {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}
