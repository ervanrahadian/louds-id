import { createElement } from "react";

import {
  GROUP_ICON_IDS,
  GROUP_ICON_LABELS,
  groupIconComponent,
  type GroupIconId,
} from "@/lib/group-icons";
import { cn } from "@/lib/utils";

interface GroupIconProps {
  icon?: GroupIconId | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-9",
  md: "size-11",
  lg: "size-14",
};

const iconSizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

export function GroupIcon({
  icon,
  size = "md",
  className,
}: GroupIconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-700 text-white ring-2 ring-white/70",
        sizes[size],
        className,
      )}
    >
      {createElement(groupIconComponent(icon ?? "group"), {
        className: iconSizes[size],
      })}
    </span>
  );
}

interface GroupIconPickerProps {
  value: GroupIconId;
  disabled?: boolean;
  onChange: (id: GroupIconId) => void;
}

export function GroupIconPicker({
  value,
  disabled,
  onChange,
}: GroupIconPickerProps) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-brand-950">
        Group icon
      </legend>
      <div className="grid grid-cols-7 gap-2">
        {GROUP_ICON_IDS.map((id) => {
          const selected = id === value;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-label={GROUP_ICON_LABELS[id]}
              aria-pressed={selected}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full transition-all",
                selected
                  ? "bg-brand-700 text-white shadow-elevated ring-2 ring-brand-700 ring-offset-2"
                  : "bg-brand-50 text-brand-800 ring-1 ring-brand-900/10 hover:bg-brand-100",
              )}
            >
              {createElement(groupIconComponent(id), {
                className: "size-5",
              })}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
