import { useEffect, useRef, useState, type MouseEvent } from "react";
import { HiArrowUturnLeft, HiPencilSquare, HiTrash } from "react-icons/hi2";

import { Avatar } from "@/components/ui/avatar";
import { messageSnippet, parseMessageParts } from "@/lib/message";
import { formatTime } from "@/lib/time";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showMeta: boolean;
  highlighted?: boolean;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenReply?: () => void;
}

export function MessageBubble({
  message,
  isOwn,
  showMeta,
  highlighted = false,
  onReply,
  onEdit,
  onDelete,
  onOpenReply,
}: MessageBubbleProps) {
  const parts = parseMessageParts(message.message);
  const rootRef = useRef<HTMLElement>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const quote = message.replyTo;

  useEffect(() => {
    if (!actionsOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }
      setActionsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [actionsOpen]);

  const toggleActions = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest("a, button")) {
      return;
    }
    setActionsOpen((open) => !open);
  };

  return (
    <article
      ref={rootRef}
      id={`message-${message.id}`}
      className="relative w-full min-w-0"
    >
      {highlighted ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-y-1 -left-3 -right-3 bg-brand-700/12 sm:-left-6 sm:-right-6"
        />
      ) : null}
      <div
        className={cn(
          "relative flex w-fit min-w-0 max-w-full flex-col sm:max-w-[32rem]",
          isOwn ? "ml-auto items-end" : "mr-auto items-start",
        )}
      >
      {showMeta ? (
        <p
          className={cn(
            "mb-1 px-1 text-[11px] font-semibold",
            isOwn ? "mr-11 text-right text-brand-700" : "ml-11 text-slate-500",
          )}
        >
          {message.displayName}
        </p>
      ) : null}

      <div
        className={cn(
          "flex min-w-0 max-w-full items-end gap-2",
          isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        <div className="flex size-9 shrink-0 items-end justify-center">
          {showMeta ? (
            <Avatar
              src={message.photo}
              name={message.displayName}
              email={message.email}
              size="sm"
            />
          ) : null}
        </div>

        <div
          className="relative min-w-0 max-w-full cursor-pointer"
          onClick={toggleActions}
          onContextMenu={(event) => {
            event.preventDefault();
            setActionsOpen(true);
          }}
        >
          <div
            className={cn(
              "min-w-0 max-w-full overflow-hidden rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
              isOwn
                ? "rounded-br-md bg-brand-700 text-white"
                : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200",
            )}
          >
            {quote ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenReply?.();
                }}
                className={cn(
                  "mb-1.5 block w-full min-w-0 overflow-hidden rounded-xl px-2.5 py-1.5 text-left",
                  isOwn ? "bg-white/15" : "bg-brand-50",
                )}
              >
                <span
                  className={cn(
                    "block truncate text-[11px] font-semibold",
                    isOwn ? "text-accent-300" : "text-brand-700",
                  )}
                >
                  {quote.displayName}
                </span>
                <span
                  className={cn(
                    "mt-0.5 line-clamp-2 wrap-break-word text-xs",
                    isOwn ? "text-white/80" : "text-slate-500",
                  )}
                >
                  {messageSnippet(quote.message) || "Message"}
                </span>
              </button>
            ) : null}
            <p className="whitespace-pre-wrap wrap-break-word">
              {parts.map((part, index) =>
                part.type === "link" ? (
                  <a
                    key={`${part.value}-${index}`}
                    href={part.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "wrap-break-word font-medium underline-offset-2 hover:underline",
                      isOwn ? "text-accent-300" : "text-brand-700",
                    )}
                  >
                    {part.value}
                  </a>
                ) : (
                  <span key={index}>{part.value}</span>
                ),
              )}
            </p>
          </div>
        </div>
      </div>

      <p
        className={cn(
          "mt-1 px-1 text-[11px] font-medium text-slate-400",
          isOwn ? "mr-11 text-right" : "ml-11 text-left",
        )}
      >
        {message.timestamp ? formatTime(message.timestamp) : "Sending…"}
        {message.editedAt ? " · edited" : ""}
      </p>

      {actionsOpen ? (
        <div
          className={cn(
            "mt-1 flex max-w-full min-w-0 flex-wrap gap-1.5",
            isOwn ? "mr-11 justify-end" : "ml-11",
          )}
        >
          <button
            type="button"
            onClick={() => {
              setActionsOpen(false);
              onReply();
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand-700 ring-1 ring-brand-100"
          >
            <HiArrowUturnLeft className="size-4" aria-hidden />
            Reply
          </button>
          {onEdit ? (
            <button
              type="button"
              onClick={() => {
                setActionsOpen(false);
                onEdit();
              }}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand-700 ring-1 ring-brand-100"
            >
              <HiPencilSquare className="size-4" aria-hidden />
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                setActionsOpen(false);
                onDelete();
              }}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-rose-50 px-3 text-xs font-semibold text-rose-600 ring-1 ring-rose-100"
            >
              <HiTrash className="size-4" aria-hidden />
              Delete
            </button>
          ) : null}
        </div>
      ) : null}
      </div>
    </article>
  );
}
