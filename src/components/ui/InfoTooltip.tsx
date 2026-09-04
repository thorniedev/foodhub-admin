"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

import { cn } from "@/src/lib/utils";

interface InfoTooltipProps {
  /** Explanation shown on hover and on keyboard focus. */
  label: string;
  className?: string;
  /** Kept for source compatibility; placement is now measured, not declared. */
  align?: "left" | "right";
}

const BUBBLE_WIDTH = 260;
const GAP = 8;
const EDGE = 8;

/**
 * Small accessible explainer for unfamiliar analytics terms.
 *
 * The bubble renders in a portal with fixed positioning. Rendering it inline
 * meant every trigger inside a card with `overflow-hidden` — which is most of
 * them — had its own tooltip clipped away, and triggers near the right edge
 * pushed the bubble off screen.
 */
export default function InfoTooltip({ label, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    below: boolean;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    // Flip below the trigger when there is not enough room above.
    const below = rect.top < 120;

    const left = Math.min(
      Math.max(EDGE, rect.left + rect.width / 2 - BUBBLE_WIDTH / 2),
      window.innerWidth - BUBBLE_WIDTH - EDGE,
    );

    setPosition({
      top: below ? rect.bottom + GAP : rect.top - GAP,
      left,
      below,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    place();

    const onScrollOrResize = () => place();
    // `capture` so the handler also fires for scrolls inside the dashboard's
    // own scroll container, not just the window.
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, place]);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          event.preventDefault();
          setOpen((previous) => !previous);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="cursor-pointer rounded-full text-muted-foreground/70 transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Info size={14} aria-hidden="true" />
      </button>

      {open &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: BUBBLE_WIDTH,
              transform: position.below ? undefined : "translateY(-100%)",
            }}
            className="pointer-events-none z-[100] block rounded-lg bg-foreground px-3 py-2 text-xs leading-5 font-normal text-background shadow-overlay"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
