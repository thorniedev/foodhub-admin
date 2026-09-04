"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Shown instead of `label` below `sm`, when the full label will not fit. */
  shortLabel?: string;
}

interface SegmentedProps<T extends string> {
  /** `T` is inferred from here, never from the two below. */
  options: readonly SegmentedOption<T>[];
  value: NoInfer<T>;
  // A `useState` setter is `Dispatch<SetStateAction<T>>`, whose parameter is
  // `T | ((prev: T) => T)`. Without `NoInfer` that parameter joins inference
  // and collapses `T` to `string`, so every call site would have to name its
  // own type argument.
  onChange: (value: NoInfer<T>) => void;
  /** Names the group for assistive tech. */
  label: string;
  size?: "sm" | "default";
  className?: string;
}

/**
 * Single-choice pill switch — date presets, chart metric toggles.
 *
 * The dashboard hand-rolled this markup in four places with four slightly
 * different paddings; they all route through here now so a change to the
 * control changes every instance.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "default",
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border/70 bg-muted/70 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            // With a short label the button renders two text nodes and hides
            // one with CSS. CSS does not remove it from the accessibility
            // tree, so without this the button would announce both spellings
            // back to back. The full label is the name at every width.
            aria-label={option.shortLabel ? option.label : undefined}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer rounded-full font-medium transition-[color,background-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              size === "sm" ? "h-6 px-2.5 text-[0.6875rem]" : "h-7 px-3 text-xs",
              active
                ? "bg-background text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.shortLabel ? (
              <span aria-hidden="true">
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.shortLabel}</span>
              </span>
            ) : (
              option.label
            )}
          </button>
        );
      })}
    </div>
  );
}
