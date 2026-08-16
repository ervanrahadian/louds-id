import { Dialog } from "@/components/ui/dialog";

interface DeleteChatDialogProps {
  open: boolean;
  chatName: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteChatDialog({
  open,
  chatName,
  submitting,
  onClose,
  onConfirm,
}: DeleteChatDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={submitting ? () => undefined : onClose}
      title="Delete this group?"
      description={`${chatName} and its messages will be removed. This cannot be undone.`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onConfirm}
          className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
        >
          {submitting ? "Deleting…" : "Delete group"}
        </button>
      </div>
    </Dialog>
  );
}
