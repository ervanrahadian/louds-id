import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminsDialog } from "@/components/chat/admins-dialog";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { CreateChatDialog } from "@/components/chat/create-chat-dialog";
import { DeleteChatDialog } from "@/components/chat/delete-chat-dialog";
import { RenameChatDialog } from "@/components/chat/rename-chat-dialog";
import { useAdmins } from "@/hooks/use-admins";
import { useAuth } from "@/hooks/use-auth";
import { useChatReads } from "@/hooks/use-chat-reads";
import { filterChats, useChats, useLegacyLastMessages } from "@/hooks/use-chats";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMessages } from "@/hooks/use-messages";
import { useVisualViewportRect } from "@/hooks/use-visual-viewport";
import { SELECTED_CHAT_KEY } from "@/lib/site";
import type { GroupIconId } from "@/lib/group-icons";
import type { AppUser } from "@/lib/types";

function readStoredChatId(): string | null {
  try {
    return sessionStorage.getItem(SELECTED_CHAT_KEY);
  } catch {
    return null;
  }
}

export function ChatApp({ user }: { user: AppUser }) {
  const { signOutUser } = useAuth();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const viewport = useVisualViewportRect();
  const { isAdmin, isOwner, admins, addAdmin, removeAdmin } = useAdmins(user);
  const { chats, loading, error, createChat, deleteChat, renameChat } = useChats(
    user,
    isAdmin,
  );
  const previews = useLegacyLastMessages(chats);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [managingAdmins, setManagingAdmins] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(readStoredChatId);

  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const previousOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousRestoration = history.scrollRestoration;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    return () => {
      html.style.overflow = previousOverflow;
      body.style.overflow = previousBodyOverflow;
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  const rooms = useMemo(
    () =>
      chats.map((chat) =>
        !chat.lastMessage && previews[chat.id]
          ? { ...chat, ...previews[chat.id] }
          : chat,
      ),
    [chats, previews],
  );

  const visibleChats = useMemo(
    () => filterChats(rooms, search),
    [rooms, search],
  );

  const selectedChat =
    rooms.find((chat) => chat.id === selectedId) ?? null;
  const activeChatId = selectedChat?.id ?? (loading ? selectedId : null);
  const unreadIds = useChatReads(user, rooms, activeChatId);

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    editMessage,
    deleteMessage,
  } = useMessages(selectedChat?.id ?? null, user);

  useEffect(() => {
    try {
      if (activeChatId) {
        sessionStorage.setItem(SELECTED_CHAT_KEY, activeChatId);
      } else if (!loading) {
        sessionStorage.removeItem(SELECTED_CHAT_KEY);
      }
    } catch {
      // sessionStorage can be unavailable in private contexts.
    }
  }, [activeChatId, loading]);

  const handleCreate = useCallback(
    async (name: string, icon: GroupIconId) => {
      const id = await createChat(name, icon);
      if (id) {
        setSelectedId(id);
      }
    },
    [createChat],
  );

  const handleRenameChat = useCallback(
    async (name: string, icon: GroupIconId) => {
      if (!selectedChat) {
        return;
      }
      await renameChat(selectedChat.id, name, icon);
    },
    [renameChat, selectedChat],
  );

  const handleDeleteChat = useCallback(async () => {
    if (!selectedChat) {
      return;
    }

    setDeleteBusy(true);
    try {
      const id = selectedChat.id;
      await deleteChat(id);
      setSelectedId(null);
      setDeleting(false);
    } finally {
      setDeleteBusy(false);
    }
  }, [deleteChat, selectedChat]);

  const showSidebar = isDesktop || !activeChatId;
  const showChat = isDesktop || Boolean(activeChatId);

  return (
    <div
      className="fixed inset-x-0 flex min-w-0 overflow-hidden bg-surface"
      style={{ top: viewport.top, height: viewport.height }}
    >
      {showSidebar ? (
        <ChatSidebar
          user={user}
          chats={visibleChats}
          loading={loading}
          error={error}
          search={search}
          selectedId={activeChatId}
          unreadIds={unreadIds}
          canCreate={isAdmin}
          onSearch={setSearch}
          onSelect={setSelectedId}
          onCreate={() => setCreating(true)}
          onSignOut={signOutUser}
          onManageAdmins={isOwner ? () => setManagingAdmins(true) : undefined}
        />
      ) : null}

      {showChat ? (
        <ChatPanel
          user={user}
          chat={selectedChat}
          messages={messages}
          loading={loading || messagesLoading}
          error={messagesError}
          showBack={!isDesktop}
          canManage={isAdmin}
          onBack={() => setSelectedId(null)}
          onSend={sendMessage}
          onEdit={editMessage}
          onDelete={deleteMessage}
          onRenameChat={() => setRenaming(true)}
          onDeleteChat={() => setDeleting(true)}
        />
      ) : null}

      <CreateChatDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={handleCreate}
      />

      {renaming && selectedChat ? (
        <RenameChatDialog
          key={selectedChat.id}
          open
          initialName={selectedChat.chatName}
          initialIcon={selectedChat.icon}
          onClose={() => setRenaming(false)}
          onRename={handleRenameChat}
        />
      ) : null}

      <DeleteChatDialog
        open={deleting && Boolean(selectedChat)}
        chatName={selectedChat?.chatName ?? "this group"}
        submitting={deleteBusy}
        onClose={() => setDeleting(false)}
        onConfirm={() => void handleDeleteChat()}
      />

      <AdminsDialog
        open={managingAdmins}
        admins={admins}
        onClose={() => setManagingAdmins(false)}
        onAdd={addAdmin}
        onRemove={removeAdmin}
      />
    </div>
  );
}
