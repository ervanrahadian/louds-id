import type { GroupIconId } from "@/lib/group-icons";

export interface AppUser {
  uid: string;
  photo: string | null;
  email: string | null;
  displayName: string;
}

export interface ChatRoom {
  id: string;
  chatName: string;
  icon?: GroupIconId;
  lastMessage?: string;
  lastMessageAt?: Date | null;
  lastMessagePhoto?: string | null;
  lastMessageName?: string | null;
  createdBy?: string;
  createdByName?: string;
  createdAt?: Date | null;
}

export interface ChatMessage {
  id: string;
  message: string;
  uid: string;
  photo: string | null;
  email: string | null;
  displayName: string;
  timestamp: Date | null;
}
