import { useState, type FormEvent } from "react";

import { GroupIconPicker } from "@/components/chat/group-icon";
import { Dialog } from "@/components/ui/dialog";
import { DEFAULT_GROUP_ICON, type GroupIconId } from "@/lib/group-icons";
import { cn } from "@/lib/utils";

interface CreateChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: GroupIconId) => Promise<void>;
}

export function CreateChatDialog({
  open,
  onClose,
  onCreate,
}: CreateChatDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<GroupIconId>(DEFAULT_GROUP_ICON);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = name.trim().length > 0 && !submitting;

  const handleClose = () => {
    if (submitting) {
      return;
    }
    setName("");
    setIcon(DEFAULT_GROUP_ICON);
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onCreate(name, icon);
      setName("");
      setIcon(DEFAULT_GROUP_ICON);
      onClose();
    } catch {
      setError("Could not create that group. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="New group"
      description="Give the group a name and an icon. Anyone signed in can join."
    >
      <form onSubmit={(event) => void handleSubmit(event)}>
        <GroupIconPicker value={icon} disabled={submitting} onChange={setIcon} />
        <label className="sr-only" htmlFor="chat-name">
          Group name
        </label>
        <input
          id="chat-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Weekend plans, Project alpha…"
          maxLength={60}
          className="mt-4 w-full rounded-xl border border-brand-200 bg-brand-50/40 px-4 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
        />
        {error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-rose-600">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
              canSubmit
                ? "bg-brand-700 text-white shadow-elevated hover:bg-brand-800"
                : "cursor-not-allowed bg-slate-200 text-slate-400",
            )}
          >
            {submitting ? "Creating…" : "Create group"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
