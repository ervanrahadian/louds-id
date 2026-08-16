import { HiChatBubbleLeftRight, HiInbox } from "react-icons/hi2";

import { Reveal } from "@/components/ui/reveal";

interface EmptyChatProps {
  variant: "select" | "thread";
  canCreate?: boolean;
}

export function EmptyChat({ variant, canCreate = true }: EmptyChatProps) {
  if (variant === "select") {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-brand-900/5 text-brand-800 ring-1 ring-brand-900/10">
          <HiChatBubbleLeftRight className="size-8" aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-brand-950">
          Pick a conversation
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          {canCreate
            ? "Choose a group on the left, or create a new one to start talking."
            : "Choose a group on the left to start talking."}
        </p>
      </div>
    );
  }

  return (
    <Reveal from="zoom">
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand-900/5 text-brand-800 ring-1 ring-brand-900/10">
          <HiInbox className="size-7" aria-hidden />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-brand-950">
          No messages yet
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          Be the first to say hello. Messages show up here for everyone in the
          group.
        </p>
      </div>
    </Reveal>
  );
}
