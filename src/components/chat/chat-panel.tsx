import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  HiChevronDown,
  HiChevronLeft,
  HiPencilSquare,
  HiTrash,
} from "react-icons/hi2";

import { EmptyChat } from "@/components/chat/empty-chat";
import { GroupIcon } from "@/components/chat/group-icon";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageComposer } from "@/components/chat/message-composer";
import { messageSnippet } from "@/lib/message";
import { formatDateLabel, isSameDay } from "@/lib/time";
import type { AppUser, ChatMessage, ChatRoom } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  user: AppUser;
  chat: ChatRoom | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  showBack: boolean;
  canManage: boolean;
  onBack: () => void;
  onSend: (text: string, replyTo?: ChatMessage | null) => Promise<void>;
  onEdit: (messageId: string, text: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onRenameChat: () => void;
  onDeleteChat: () => void;
}

export function ChatPanel({
  user,
  chat,
  messages,
  loading,
  error,
  showBack,
  canManage,
  onBack,
  onSend,
  onEdit,
  onDelete,
  onRenameChat,
  onDeleteChat,
}: ChatPanelProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const messageCount = useRef(0);
  const [showJump, setShowJump] = useState(false);
  const [newWhileAway, setNewWhileAway] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightTimer = useRef<number>(0);

  useEffect(() => {
    stickToBottom.current = true;
    setShowJump(false);
    setNewWhileAway(false);
    messageCount.current = 0;
    setReplyTo(null);
    setEditing(null);
    setHighlightId(null);
    window.clearTimeout(highlightTimer.current);
    return () => window.clearTimeout(highlightTimer.current);
  }, [chat?.id]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    const onScroll = () => {
      const atLatest = el.scrollTop <= 96;
      stickToBottom.current = atLatest;
      setShowJump((current) => {
        const next = !atLatest;
        return current === next ? current : next;
      });
      if (atLatest) {
        setNewWhileAway(false);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [chat?.id]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    const previousCount = messageCount.current;
    messageCount.current = messages.length;

    if (stickToBottom.current) {
      el.scrollTop = 0;
      return;
    }

    if (messages.length > previousCount && previousCount > 0) {
      setShowJump(true);
      setNewWhileAway(true);
    }
  }, [messages]);

  const jumpToLatest = () => {
    const el = scrollerRef.current;
    stickToBottom.current = true;
    setShowJump(false);
    setNewWhileAway(false);
    if (el) {
      el.scrollTop = 0;
    }
  };

  const startReply = (message: ChatMessage) => {
    setEditing(null);
    setReplyTo(message);
  };

  const startEdit = (message: ChatMessage) => {
    setReplyTo(null);
    setEditing(message);
  };

  const cancelComposerContext = () => {
    setReplyTo(null);
    setEditing(null);
  };

  const handleSend = async (text: string) => {
    if (editing) {
      if (text.trim() !== editing.message) {
        await onEdit(editing.id, text);
      }
      setEditing(null);
      return;
    }
    await onSend(text, replyTo);
    setReplyTo(null);
  };

  const openQuotedMessage = (messageId: string) => {
    const el = document.getElementById(`message-${messageId}`);
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(messageId);
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => {
      setHighlightId((current) => (current === messageId ? null : current));
    }, 1600);
  };

  if (!chat) {
    return (
      <section
        className={cn(
          "h-full min-h-0 min-w-0 flex-1 items-center justify-center bg-surface",
          showBack ? "flex" : "hidden md:flex",
        )}
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading conversation…</p>
        ) : (
          <EmptyChat variant="select" canCreate={canManage} />
        )}
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-2 py-3 sm:px-5">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="rounded-xl p-2 text-brand-700 transition-colors hover:bg-brand-50 md:hidden"
          >
            <HiChevronLeft className="size-6" aria-hidden />
          </button>
        ) : null}
        <GroupIcon icon={chat.icon} size="sm" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-brand-950">
            {chat.chatName}
          </h1>
        </div>
        {canManage ? (
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={onRenameChat}
              aria-label="Edit group"
              className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <HiPencilSquare className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onDeleteChat}
              aria-label="Delete group"
              className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <HiTrash className="size-5" aria-hidden />
            </button>
          </div>
        ) : null}
      </header>

      <div className="relative min-h-0 min-w-0 flex-1">
        <div
          ref={scrollerRef}
          className="chat-scroll absolute inset-0 flex flex-col-reverse overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4 sm:px-6"
        >
          {loading && messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Loading messages…
            </p>
          ) : error ? (
            <p className="py-10 text-center text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center">
              <EmptyChat variant="thread" />
            </div>
          ) : (
            <div className="flex w-full min-w-0 flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const previous = messages[index - 1];
                  const showDay =
                    !previous ||
                    !isSameDay(previous.timestamp, message.timestamp);
                  const showMeta =
                    !previous ||
                    previous.uid !== message.uid ||
                    showDay;
                  const isOwn =
                    message.uid === user.uid ||
                    Boolean(message.email && message.email === user.email);

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="w-full min-w-0 max-w-full"
                    >
                      {showDay && message.timestamp ? (
                        <p className="mb-3 text-center text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                          {formatDateLabel(message.timestamp)}
                        </p>
                      ) : null}
                      <MessageBubble
                        message={message}
                        isOwn={isOwn}
                        showMeta={showMeta}
                        highlighted={highlightId === message.id}
                        onReply={() => startReply(message)}
                        onEdit={
                          isOwn ? () => startEdit(message) : undefined
                        }
                        onDelete={
                          isOwn || canManage
                            ? () => void onDelete(message.id)
                            : undefined
                        }
                        onOpenReply={
                          message.replyTo
                            ? () => {
                                const quotedId = message.replyTo?.id;
                                if (quotedId) {
                                  openQuotedMessage(quotedId);
                                }
                              }
                            : undefined
                        }
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
        {showJump ? (
          <button
            type="button"
            onClick={jumpToLatest}
            aria-label={
              newWhileAway ? "Jump to new messages" : "Jump to latest messages"
            }
            className="absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-elevated"
          >
            <HiChevronDown className="size-4" aria-hidden />
            {newWhileAway ? "New messages" : "Latest"}
          </button>
        ) : null}
      </div>

      <MessageComposer
        initialText={editing?.message ?? ""}
        context={
          editing
            ? {
                title: "Edit message",
                preview: messageSnippet(editing.message),
              }
            : replyTo
              ? {
                  title: replyTo.displayName,
                  preview: messageSnippet(replyTo.message),
                }
              : null
        }
        contextKey={editing?.id ?? replyTo?.id ?? null}
        submitLabel={editing ? "save" : "send"}
        placeholder={
          editing
            ? "Edit your message"
            : replyTo
              ? "Write a reply — Enter to send"
              : "Write a message — Enter to send"
        }
        onCancelContext={
          editing || replyTo ? cancelComposerContext : undefined
        }
        onSend={handleSend}
      />
    </section>
  );
}
