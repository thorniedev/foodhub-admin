"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { cn } from "@/src/lib/utils";

const SEARCH_DEBOUNCE_MS = 200;
const MAX_RESULTS = 8;

interface CatalogEntityLike {
  id?: number;
  name: string;
  code?: string;
}

interface CatalogEntityPickerProps<T extends CatalogEntityLike> {
  /** Numeric id currently applied to the `entityId` filter, if any. */
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  /** All rows to search — the caller owns fetching (see the two call sites). */
  entities: T[];
  isLoading: boolean;
  placeholder: string;
  emptyLabel: string;
  className?: string;
}

/**
 * Name-search picker for the audit log's Entity Target ID, for the entity
 * types that actually carry a numeric id in their catalog list response.
 *
 * Verified against the live API: Food Category and Cuisine rows include a
 * real numeric `id` alongside their `uuid`, so a name typed here can resolve
 * to the same id the audit log stores. Store's admin list endpoint does not
 * return a numeric id at all (only `uuid`), and Food/Allergen/Dietary
 * Type/Medical Condition are either UUID-only or code-keyed — so this
 * component is intentionally only wired up for the two types where the
 * lookup is real, not decorative.
 *
 * Filtering is client-side because these lists are small (well under a
 * thousand rows) and, per the actor picker, this backend has previously
 * ignored a `query` param on a list endpoint rather than erroring — silently
 * returning unfiltered results is worse here than fetching once and matching
 * locally.
 */
export default function CatalogEntityPicker<T extends CatalogEntityLike>({
  value,
  onChange,
  entities,
  isLoading,
  placeholder,
  emptyLabel,
  className,
}: CatalogEntityPickerProps<T>) {
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const selected = useMemo(
    () => (value !== undefined ? entities.find((entity) => entity.id === value) : undefined),
    [entities, value],
  );

  const results = useMemo(() => {
    if (!open) return [];
    const needle = debouncedTerm.toLowerCase();
    const withId = entities.filter(
      (entity): entity is T & { id: number } => entity.id !== undefined,
    );
    const filtered = needle
      ? withId.filter(
          (entity) =>
            entity.name.toLowerCase().includes(needle) ||
            entity.code?.toLowerCase().includes(needle),
        )
      : withId;
    return filtered.slice(0, MAX_RESULTS);
  }, [entities, debouncedTerm, open]);

  const select = (entity: T & { id: number }) => {
    setTerm("");
    setOpen(false);
    onChange(entity.id);
  };

  const clear = () => {
    setTerm("");
    onChange(undefined);
  };

  if (value !== undefined && !open) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex h-9 w-full items-center gap-2 rounded-lg border bg-muted/50 px-2.5">
          <span className="min-w-0 flex-1 truncate text-xs">
            {selected ? (
              <>
                <span className="font-medium text-foreground">{selected.name}</span>
                <span className="ml-1 text-muted-foreground">#{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">#{value}</span>
            )}
          </span>
          <button
            type="button"
            onClick={clear}
            aria-label="Clear entity target filter"
            className="shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground transition hover:text-foreground"
          >
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search
        size={13}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
      />

      <input
        type="text"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-label={placeholder}
        placeholder={placeholder}
        value={term}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setTerm(event.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlighted((index) => Math.min(index + 1, results.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter") {
            event.preventDefault();
            if (results[highlighted]) select(results[highlighted]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="h-9 w-full rounded-lg border bg-background pr-7 pl-8 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/25"
      />

      {isLoading && (
        <Loader2
          size={13}
          aria-hidden="true"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      )}

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={emptyLabel}
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-overlay"
        >
          {results.map((entity, index) => (
            <li key={entity.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => select(entity)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition",
                  index === highlighted ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                <span className="truncate text-xs font-medium text-foreground">
                  {entity.name}
                </span>
                <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                  #{entity.id}
                </span>
              </button>
            </li>
          ))}

          {results.length === 0 && (
            <li className="px-2 py-2 text-[0.6875rem] text-muted-foreground">
              {isLoading ? "Loading…" : emptyLabel}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
