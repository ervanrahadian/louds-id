import { useState, type FormEvent } from "react";

import { GroupIconPicker } from "@/components/chat/group-icon";
import { Dialog } from "@/components/ui/dialog";
import { DEFAULT_GROUP_ICON, type GroupIconId } from "@/lib/group-icons";
import { cn } from "@/lib/utils";

interface RenameChatDialogProps {
  open: boolean;
  initialName: string;
  initialIcon?: GroupIconId;
  onClose: () => void;
  onRename: (name: string, icon: GroupIconId) => Promise<void>;
}

export function RenameChatDialog({
  open,
  initialName,
  initialIcon = DEFAULT_GROUP_ICON,
  onClose,
  onRename,
}: RenameChatDialogProps) {
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState<GroupIconId>(initialIcon);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = name.trim();
  const changed = trimmed !== initialName.trim() || icon !== initialIcon;
  const canSubmit = trimmed.length > 0 && changed && !submitting;

  const handleClose = () => {
    if (submitting) {
      return;
    }
    setName(initialName);
    setIcon(initialIcon);
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
      await onRename(trimmed, icon);
      setError(null);
      onClose();
    } catch {
      setError("Could not update that group. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Edit group"
      description="Update the name or icon. Everyone in the group will see the change."
    >
      <form onSubmit={(event) => void handleSubmit(event)}>
        <GroupIconPicker value={icon} disabled={submitting} onChange={setIcon} />
        <label className="sr-only" htmlFor="rename-chat">
          Group name
        </label>
        <input
          id="rename-chat"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Group name"
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
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
