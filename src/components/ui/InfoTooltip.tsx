"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";

import { cn } from "@/src/lib/utils";

interface InfoTooltipProps {
  /** Explanation shown on hover and on keyboard focus. */
  label: string;
  className?: string;
  align?: "left" | "right";
}

/**
 * Small accessible explainer for unfamiliar analytics terms.
 * The trigger is a real button: reachable by Tab, dismissible with Escape,
 * and linked to its bubble through aria-describedby.
 */
export default function InfoTooltip({
  label,
  className,
  align = "left",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((previous) => !previous)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="rounded-full p-0.5 text-gray-400 transition hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
      >
        <Info size={15} aria-hidden="true" />
      </button>

      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "absolute bottom-full z-50 mb-2 w-60 rounded-xl bg-gray-900 px-3 py-2 text-sm leading-relaxed font-normal text-white shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
