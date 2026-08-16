import { useState, type FormEvent } from "react";
import { HiShieldCheck, HiTrash } from "react-icons/hi2";

import { Dialog } from "@/components/ui/dialog";
import { OWNER_EMAIL } from "@/lib/admins";
import { cn } from "@/lib/utils";

interface AdminsDialogProps {
  open: boolean;
  admins: string[];
  onClose: () => void;
  onAdd: (email: string) => Promise<void>;
  onRemove: (email: string) => Promise<void>;
}

export function AdminsDialog({
  open,
  admins,
  onClose,
  onAdd,
  onRemove,
}: AdminsDialogProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = email.trim().length > 0 && !submitting;

  const handleClose = () => {
    if (submitting) {
      return;
    }
    setEmail("");
    setError(null);
    onClose();
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAdd(email);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (value: string) => {
    setError(null);
    try {
      await onRemove(value);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove that admin.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Manage admins"
      description="Admins can create and delete groups. Only you can change this list."
    >
      <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
        {admins.map((value) => {
          const owner = value === OWNER_EMAIL;
          return (
            <li
              key={value}
              className="flex items-center gap-2 rounded-xl bg-brand-50/70 px-3 py-2 ring-1 ring-brand-900/10"
            >
              <HiShieldCheck className="size-4 shrink-0 text-brand-700" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-brand-950">
                {value}
              </span>
              {owner ? (
                <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                  Owner
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleRemove(value)}
                  aria-label={`Remove ${value}`}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <HiTrash className="size-4" aria-hidden />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <form
        onSubmit={(event) => void handleAdd(event)}
        className="mt-4 flex flex-col gap-2"
      >
        <label className="sr-only" htmlFor="admin-email">
          Admin email
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@email.com"
          className="w-full rounded-xl border border-brand-200 bg-brand-50/40 px-4 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
        />
        {error ? (
          <p role="alert" className="text-sm font-medium text-rose-600">
            {error}
          </p>
        ) : null}
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
          {submitting ? "Adding…" : "Add admin"}
        </button>
      </form>
    </Dialog>
  );
}
