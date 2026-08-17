import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { HiCheck, HiPaperAirplane, HiXMark } from "react-icons/hi2";

import { cn } from "@/lib/utils";

interface ComposerContext {
  title: string;
  preview: string;
}

interface MessageComposerProps {
  disabled?: boolean;
  initialText?: string;
  context?: ComposerContext | null;
  contextKey?: string | null;
  submitLabel?: "send" | "save";
  placeholder?: string;
  onCancelContext?: () => void;
  onSend: (text: string) => Promise<void> | void;
}

export function MessageComposer({
  disabled,
  initialText = "",
  context = null,
  contextKey = null,
  submitLabel = "send",
  placeholder = "Write a message — Enter to send",
  onCancelContext,
  onSend,
}: MessageComposerProps) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0 && !disabled;

  useEffect(() => {
    setText(initialText);
    setError(null);
  }, [contextKey, initialText]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  useEffect(() => {
    if (!contextKey) {
      return;
    }
    ref.current?.focus();
  }, [contextKey]);

  const submit = async () => {
    const message = text.trim();
    if (!message || disabled) {
      return;
    }
    const previous = text;
    setError(null);
    if (submitLabel !== "save") {
      setText("");
    }
    try {
      await onSend(message);
      setText("");
    } catch {
      setText(previous);
      setError(
        submitLabel === "save"
          ? "Could not save edit. Try again."
          : "Could not send message. Try again.",
      );
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && context && onCancelContext) {
      event.preventDefault();
      onCancelContext();
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className="min-w-0 max-w-full shrink-0 overflow-hidden border-t border-slate-200 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
      {context ? (
        <div className="flex min-w-0 items-start gap-2 px-3 pt-3 sm:px-5">
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border-l-4 border-brand-700 bg-brand-50 px-3 py-2">
            <p className="truncate text-xs font-semibold text-brand-700">
              {context.title}
            </p>
            <p className="mt-0.5 line-clamp-2 wrap-break-word text-xs text-slate-500">
              {context.preview}
            </p>
          </div>
          {onCancelContext ? (
            <button
              type="button"
              onClick={onCancelContext}
              aria-label="Cancel"
              className="shrink-0 rounded-xl p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <HiXMark className="size-5" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className="flex min-w-0 items-end gap-2 px-3 pt-3 sm:px-5"
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
          placeholder={placeholder}
          className="max-h-40 min-h-11 min-w-0 flex-1 resize-none rounded-2xl border border-brand-200 bg-brand-50/40 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label={submitLabel === "save" ? "Save edit" : "Send message"}
          onMouseDown={(event) => event.preventDefault()}
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all",
            canSend
              ? "bg-brand-700 shadow-elevated hover:bg-brand-800"
              : "cursor-not-allowed bg-slate-300",
          )}
        >
          {submitLabel === "save" ? (
            <HiCheck className="size-5" aria-hidden />
          ) : (
            <HiPaperAirplane className="size-5" aria-hidden />
          )}
        </button>
      </form>
      {error ? (
        <p className="px-3 pt-2 text-xs font-medium text-rose-600 sm:px-5">
          {error}
        </p>
      ) : null}
    </div>
  );
}
