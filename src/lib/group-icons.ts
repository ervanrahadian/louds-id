import type { ComponentType } from "react";
import { FaGamepad } from "react-icons/fa6";
import {
  HiAcademicCap,
  HiBookOpen,
  HiBriefcase,
  HiCake,
  HiCamera,
  HiChatBubbleLeftRight,
  HiCodeBracket,
  HiFilm,
  HiFire,
  HiGlobeAlt,
  HiHeart,
  HiHome,
  HiMapPin,
  HiMusicalNote,
  HiPuzzlePiece,
  HiRocketLaunch,
  HiSparkles,
  HiStar,
  HiTrophy,
  HiUserGroup,
} from "react-icons/hi2";

export const GROUP_ICON_IDS = [
  "group",
  "chat",
  "sparkles",
  "home",
  "heart",
  "star",
  "music",
  "school",
  "work",
  "globe",
  "map",
  "puzzle",
  "trophy",
  "fire",
  "gaming",
  "rocket",
  "movie",
  "camera",
  "code",
  "book",
  "cake",
] as const;

export type GroupIconId = (typeof GROUP_ICON_IDS)[number];

export const DEFAULT_GROUP_ICON: GroupIconId = "group";

export const GROUP_ICON_LABELS: Record<GroupIconId, string> = {
  group: "Group",
  chat: "Chat",
  sparkles: "Sparkles",
  home: "Home",
  heart: "Heart",
  star: "Star",
  music: "Music",
  school: "School",
  work: "Work",
  globe: "Globe",
  map: "Map",
  puzzle: "Puzzle",
  trophy: "Trophy",
  fire: "Fire",
  gaming: "Gaming",
  rocket: "Rocket",
  movie: "Movie",
  camera: "Camera",
  code: "Code",
  book: "Book",
  cake: "Cake",
};

const ICONS: Record<GroupIconId, ComponentType<{ className?: string }>> = {
  group: HiUserGroup,
  chat: HiChatBubbleLeftRight,
  sparkles: HiSparkles,
  home: HiHome,
  heart: HiHeart,
  star: HiStar,
  music: HiMusicalNote,
  school: HiAcademicCap,
  work: HiBriefcase,
  globe: HiGlobeAlt,
  map: HiMapPin,
  puzzle: HiPuzzlePiece,
  trophy: HiTrophy,
  fire: HiFire,
  gaming: FaGamepad,
  rocket: HiRocketLaunch,
  movie: HiFilm,
  camera: HiCamera,
  code: HiCodeBracket,
  book: HiBookOpen,
  cake: HiCake,
};

export function parseGroupIcon(value: unknown): GroupIconId {
  if (
    typeof value === "string" &&
    (GROUP_ICON_IDS as readonly string[]).includes(value)
  ) {
    return value as GroupIconId;
  }
  return DEFAULT_GROUP_ICON;
}

export function groupIconComponent(id: GroupIconId) {
  return ICONS[id];
}
