import * as React from "react";

import { cn } from "@/src/lib/utils";

interface SwitchProps
  extends Omit<React.ComponentProps<"input">, "type" | "onChange" | "checked"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * A toggle switch backed by a real `<input type="checkbox">`.
 *
 * The input itself carries the interactive/accessible surface (role, name,
 * checked state, click and keyboard handling) — `sr-only` hides it visually
 * without removing it from the accessibility tree or from `fireEvent.click`,
 * so `getByRole("checkbox", { name })` keeps working exactly as it did
 * against the old raw checkbox. Everything drawn (track, thumb, colour) is a
 * sibling `<span>` styled purely off the input's `:checked` state via the
 * `peer` variant — there is no second piece of state to keep in sync.
 */
function Switch({ className, checked, onCheckedChange, id, ...props }: SwitchProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <span className={cn("relative inline-flex h-5 w-9 shrink-0 items-center", className)}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-background peer-disabled:opacity-55"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0.5 size-4 rounded-full bg-background shadow-card transition-transform peer-checked:translate-x-4"
      />
    </span>
  );
}

export { Switch };
