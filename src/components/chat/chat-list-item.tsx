import { GroupIcon } from "@/components/chat/group-icon";
import type { ChatRoom } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";

interface ChatListItemProps {
  chat: ChatRoom;
  active: boolean;
  onSelect: () => void;
}

export function ChatListItem({ chat, active, onSelect }: ChatListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
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
              "truncate text-sm font-semibold",
              active ? "text-white" : "text-brand-950",
            )}
          >
            {chat.chatName}
          </span>
          <span
            className={cn(
              "shrink-0 text-[11px] font-medium",
              active ? "text-white/70" : "text-slate-500",
            )}
          >
            {formatRelativeTime(chat.lastMessageAt) ||
              (chat.lastMessage ? "now" : "")}
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-xs",
            active ? "text-white/75" : "text-slate-500",
          )}
        >
          {chat.lastMessage || "No messages yet"}
        </span>
      </span>
    </button>
  );
}
