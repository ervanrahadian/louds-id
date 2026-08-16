import { HiChatBubbleLeftRight } from "react-icons/hi2";

import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center px-5"
      >
        <a
          href="#home"
          className="inline-flex items-center gap-2 text-lg font-bold text-white"
        >
          <HiChatBubbleLeftRight className="size-6" aria-hidden />
          {siteConfig.name}
        </a>
      </nav>
    </header>
  );
}
