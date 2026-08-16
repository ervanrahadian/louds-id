import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HiChevronLeft, HiPencilSquare, HiTrash } from "react-icons/hi2";

import { EmptyChat } from "@/components/chat/empty-chat";
import { GroupIcon } from "@/components/chat/group-icon";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageComposer } from "@/components/chat/message-composer";
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
  onSend: (text: string) => Promise<void>;
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
  onDelete,
  onRenameChat,
  onDeleteChat,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    const onScroll = () => {
      stickToBottom.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 96;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [chat?.id]);

  useEffect(() => {
    if (!stickToBottom.current) {
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (!chat) {
    return (
      <section
        className={cn(
          "h-full min-h-0 flex-1 items-center justify-center bg-surface",
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
    <section className="flex h-full min-h-0 flex-1 flex-col bg-surface">
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

      <div
        ref={scrollerRef}
        className="chat-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
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
          <EmptyChat variant="thread" />
        ) : (
          <div className="flex flex-col gap-3">
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
                      onDelete={
                        isOwn || canManage
                          ? () => void onDelete(message.id)
                          : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <MessageComposer onSend={onSend} />
    </section>
  );
}
