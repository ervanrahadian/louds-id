import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { HiPaperAirplane } from "react-icons/hi2";

import { cn } from "@/lib/utils";

interface MessageComposerProps {
  disabled?: boolean;
  onSend: (text: string) => Promise<void> | void;
}

export function MessageComposer({ disabled, onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0 && !disabled;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const submit = async () => {
    const message = text.trim();
    if (!message || disabled) {
      return;
    }
    setText("");
    await onSend(message);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-end gap-2 border-t border-slate-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-3"
    >
      <label className="sr-only" htmlFor="message-input">
        Message
      </label>
      <textarea
        id="message-input"
        ref={ref}
        rows={1}
        value={text}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message — Enter to send"
        className="max-h-40 min-h-11 flex-1 resize-none rounded-2xl border border-brand-200 bg-brand-50/40 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all",
          canSend
            ? "bg-brand-700 shadow-elevated hover:bg-brand-800"
            : "cursor-not-allowed bg-slate-300",
        )}
      >
        <HiPaperAirplane className="size-5" aria-hidden />
      </button>
    </form>
  );
}
