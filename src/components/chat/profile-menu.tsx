import { useEffect, useRef, useState } from "react";
import { HiArrowRightOnRectangle, HiShieldCheck } from "react-icons/hi2";

import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import type { AppUser } from "@/lib/types";

interface ProfileMenuProps {
  user: AppUser;
  onSignOut: () => Promise<void>;
  onManageAdmins?: () => void;
}

export function ProfileMenu({
  user,
  onSignOut,
  onManageAdmins,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const handleSignOut = async () => {
    await onSignOut();
    setConfirm(false);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="rounded-full"
      >
        <Avatar src={user.photo} name={user.displayName} email={user.email} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full left-0 z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-elevated"
        >
          <p className="truncate px-3 pt-2 text-sm font-semibold text-brand-950">
            {user.displayName}
          </p>
          <p className="truncate px-3 pb-2 text-xs text-slate-500">
            {user.email}
          </p>
          {onManageAdmins ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onManageAdmins();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
            >
              <HiShieldCheck className="size-4" aria-hidden />
              Manage admins
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setConfirm(true);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
          >
            <HiArrowRightOnRectangle className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      ) : null}

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Sign out?"
        description="You can jump back in anytime with Google."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            Sign out
          </button>
        </div>
      </Dialog>
    </div>
  );
}
