import { useEffect, useRef, useState, type MouseEvent } from "react";
import { HiTrash } from "react-icons/hi2";

import { Avatar } from "@/components/ui/avatar";
import { parseMessageParts } from "@/lib/message";
import { formatTime } from "@/lib/time";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showMeta: boolean;
  onDelete?: () => void;
}

export function MessageBubble({
  message,
  isOwn,
  showMeta,
  onDelete,
}: MessageBubbleProps) {
  const parts = parseMessageParts(message.message);
  const rootRef = useRef<HTMLElement>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

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
    if (!onDelete) {
      return;
    }
    if ((event.target as HTMLElement).closest("a, button")) {
      return;
    }
    setActionsOpen((open) => !open);
  };

  return (
    <article
      ref={rootRef}
      className={cn(
        "group flex max-w-[min(100%,32rem)] flex-col",
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
          "flex items-end gap-2",
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
          className="relative min-w-0 max-w-full"
          onClick={toggleActions}
          onContextMenu={(event) => {
            if (!onDelete) {
              return;
            }
            event.preventDefault();
            setActionsOpen(true);
          }}
        >
          <p
            className={cn(
              "whitespace-pre-wrap wrap-break-word rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
              onDelete ? "cursor-pointer" : null,
              isOwn
                ? "rounded-br-md bg-brand-700 text-white"
                : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200",
            )}
          >
            {parts.map((part, index) =>
              part.type === "link" ? (
                <a
                  key={`${part.value}-${index}`}
                  href={part.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "font-medium underline-offset-2 hover:underline",
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

      <p
        className={cn(
          "mt-1 px-1 text-[11px] font-medium text-slate-400",
          isOwn ? "mr-11 text-right" : "ml-11 text-left",
        )}
      >
        {message.timestamp ? formatTime(message.timestamp) : "Sending…"}
      </p>

      {onDelete && actionsOpen ? (
        <button
          type="button"
          onClick={() => {
            setActionsOpen(false);
            onDelete();
          }}
          className={cn(
            "mt-1 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-rose-50 px-3 text-xs font-semibold text-rose-600 ring-1 ring-rose-100",
            isOwn ? "mr-11" : "ml-11",
          )}
        >
          <HiTrash className="size-4" aria-hidden />
          Delete
        </button>
      ) : null}
    </article>
  );
}
