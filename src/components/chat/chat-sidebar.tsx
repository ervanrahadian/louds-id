import { HiMagnifyingGlass, HiPlus } from "react-icons/hi2";

import { ChatListItem } from "@/components/chat/chat-list-item";
import { ProfileMenu } from "@/components/chat/profile-menu";
import type { AppUser, ChatRoom } from "@/lib/types";
import { siteConfig } from "@/lib/site";

interface ChatSidebarProps {
  user: AppUser;
  chats: ChatRoom[];
  loading: boolean;
  error: string | null;
  search: string;
  selectedId: string | null;
  unreadIds: Set<string>;
  canCreate: boolean;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onSignOut: () => Promise<void>;
  onManageAdmins?: () => void;
}

export function ChatSidebar({
  user,
  chats,
  loading,
  error,
  search,
  selectedId,
  unreadIds,
  canCreate,
  onSearch,
  onSelect,
  onCreate,
  onSignOut,
  onManageAdmins,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 shrink-0 flex-col border-r border-slate-200 bg-white md:max-w-80 md:min-w-72">
      <div className="flex items-center gap-3 px-4 py-4">
        <ProfileMenu
          user={user}
          onSignOut={onSignOut}
          onManageAdmins={onManageAdmins}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-brand-950">
            {siteConfig.name}
          </p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={onCreate}
            aria-label="Create group"
            className="inline-flex size-10 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-elevated transition-colors hover:bg-brand-800"
          >
            <HiPlus className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="px-4 pb-3">
        <label className="sr-only" htmlFor="chat-search">
          Search conversations
        </label>
        <div className="flex items-center gap-2 rounded-2xl bg-brand-50 px-3 ring-1 ring-brand-900/10">
          <HiMagnifyingGlass className="size-4 text-brand-700" aria-hidden />
          <input
            id="chat-search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search groups"
            className="h-10 w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <ul className="space-y-2 px-2" aria-label="Loading conversations">
            {Array.from({ length: 6 }).map((_, index) => (
              <li
                key={index}
                className="flex items-center gap-3 rounded-2xl px-3 py-3"
              >
                <span className="size-11 animate-pulse rounded-full bg-slate-200" />
                <span className="flex-1 space-y-2">
                  <span className="block h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                  <span className="block h-2.5 w-full animate-pulse rounded bg-slate-100" />
                </span>
              </li>
            ))}
          </ul>
        ) : error ? (
          <p className="px-4 py-6 text-sm font-medium text-rose-600">{error}</p>
        ) : chats.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            {search
              ? "No groups match that search."
              : canCreate
                ? "No groups yet. Create one to get started."
                : "No groups yet. An admin will create one."}
          </p>
        ) : (
          <ul className="space-y-1">
            {chats.map((chat) => (
              <li key={chat.id}>
                <ChatListItem
                  chat={chat}
                  active={chat.id === selectedId}
                  unread={unreadIds.has(chat.id)}
                  onSelect={() => onSelect(chat.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
