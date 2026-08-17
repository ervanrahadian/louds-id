import { GroupIcon } from "@/components/chat/group-icon";
import type { ChatRoom } from "@/lib/types";
import { formatListTime } from "@/lib/time";
import { cn } from "@/lib/utils";

interface ChatListItemProps {
  chat: ChatRoom;
  active: boolean;
  unread: boolean;
  onSelect: () => void;
}

export function ChatListItem({
  chat,
  active,
  unread,
  onSelect,
}: ChatListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      aria-label={unread ? `${chat.chatName}, unread` : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
        active
          ? "bg-brand-700 text-white shadow-elevated"
          : "hover:bg-brand-50",
      )}
    >
      <GroupIcon
        icon={chat.icon}
        className={active ? "ring-white/40" : undefined}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              unread && !active ? "font-bold" : "font-semibold",
              active ? "text-white" : "text-brand-950",
            )}
          >
            {chat.chatName}
          </span>
          <span
            className={cn(
              "shrink-0 text-[11px] font-medium",
              active
                ? "text-white/70"
                : unread
                  ? "text-brand-700"
                  : "text-slate-500",
            )}
          >
            {formatListTime(chat.lastMessageAt)}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-xs",
              unread && !active ? "font-semibold" : undefined,
              active ? "text-white/75" : unread ? "text-slate-700" : "text-slate-500",
            )}
          >
            {chat.lastMessage || "No messages yet"}
          </span>
          {unread && !active ? (
            <span
              className="size-2 shrink-0 rounded-full bg-brand-600"
              aria-hidden
            />
          ) : null}
        </span>
      </span>
    </button>
  );
}
