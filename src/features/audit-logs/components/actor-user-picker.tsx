"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, Search, User, X } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { useGetAdminUsersQuery } from "@/src/app/store/userProfileApi";
import type { AdminUser } from "@/src/types/userProfile";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SEARCH_DEBOUNCE_MS = 200;
const MAX_RESULTS = 8;

/**
 * The users endpoint accepts `query`/`q` but ignores them — the same page and
 * the same `totalElements` come back with or without a term — so matching has
 * to happen here. The directory is small enough to hold in one page; raise
 * this if it ever outgrows a single fetch, or switch back to server-side
 * search once the backend honours the parameter.
 */
const DIRECTORY_PAGE_SIZE = 200;

export function displayName(user: AdminUser): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || user.primaryEmail || user.uuid;
}

/** Usernames here are often just the email; do not print it twice. */
function secondaryLine(user: AdminUser): string {
  const handle = user.username?.trim();
  const email = user.primaryEmail?.trim();

  if (handle && email && handle.toLowerCase() === email.toLowerCase()) return email;
  if (handle && email) return `@${handle.replace(/^@/, "")} \u00b7 ${email}`;
  if (handle) return `@${handle.replace(/^@/, "")}`;
  return email || user.uuid;
}

function matches(user: AdminUser, needle: string): boolean {
  return [
    displayName(user),
    user.username,
    user.primaryEmail,
    user.firstName,
    user.lastName,
    user.uuid,
  ].some((field) => field?.toLowerCase().includes(needle));
}

interface ActorUserPickerProps {
  /** The UUID currently applied to the filter, if any. */
  value: string;
  onChange: (actorUuid: string) => void;
  className?: string;
}

/**
 * Name-based picker for the audit log's actor filter.
 *
 * The audit endpoint only accepts `actorUuid`, so an admin previously had to
 * find and paste a raw UUID to answer "what did this person change?". This
 * resolves a typed name against the users directory and submits the matching
 * UUID, keeping the API contract unchanged. A pasted UUID is still accepted
 * so existing links and copy-from-table workflows keep working.
 */
export default function ActorUserPicker({
  value,
  onChange,
  className,
}: ActorUserPickerProps) {
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term]);

  // A UUID typed straight into the box is applied as-is; there is nothing to
  // look up and no reason to make the admin pick it out of a list.
  const termIsUuid = UUID_PATTERN.test(debouncedTerm);

  const { data, isFetching } = useGetAdminUsersQuery(
    { page: 0, size: DIRECTORY_PAGE_SIZE, sort: "createdAt,desc" },
    { skip: !open },
  );

  const results = useMemo(() => {
    if (!open || termIsUuid) return [];

    const users = data?.contents ?? [];
    const needle = debouncedTerm.toLowerCase();

    // An empty box lists the directory rather than showing nothing, so the
    // control is useful before the admin knows what they are looking for.
    const filtered = needle
      ? users.filter((user) => matches(user, needle))
      : users;

    return filtered.slice(0, MAX_RESULTS);
  }, [data?.contents, debouncedTerm, open, termIsUuid]);

  // Derived rather than synced through an effect: when the filter is reset or
  // replaced from outside, a selection that no longer matches `value` is
  // simply not used, so there is no stale-state window to clean up.
  const activeSelection = selected && selected.uuid === value ? selected : null;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const select = (user: AdminUser) => {
    setSelected(user);
    setTerm("");
    setOpen(false);
    onChange(user.uuid);
  };

  const clear = () => {
    setSelected(null);
    setTerm("");
    onChange("");
  };

  const commitRawUuid = () => {
    if (!UUID_PATTERN.test(term.trim())) return;
    setSelected(null);
    setOpen(false);
    onChange(term.trim());
  };

  // A UUID applied from elsewhere (a table row, a shared link) has no name to
  // show, so fall back to the raw value rather than rendering an empty chip.
  if (value && !open) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex h-9 w-full items-center gap-2 rounded-lg border bg-muted/50 px-2.5">
          <User size={13} aria-hidden="true" className="shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-xs">
            {activeSelection ? (
              <>
                <span className="font-medium text-foreground">
                  {displayName(activeSelection)}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  {secondaryLine(activeSelection)}
                </span>
              </>
            ) : (
              <span className="font-mono text-foreground" title={value}>
                {value}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={clear}
            aria-label="Clear actor filter"
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
        aria-label="Search actor by name, username, or email"
        placeholder="Search name, username, or email…"
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
            else commitRawUuid();
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="h-9 w-full rounded-lg border bg-background pr-7 pl-8 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/25"
      />

      {isFetching && (
        <Loader2
          size={13}
          aria-hidden="true"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      )}

      {open && (term.trim().length > 0 || results.length > 0) && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Matching users"
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-overlay"
        >
          {results.map((user, index) => (
            <li key={user.uuid}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => select(user)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left transition",
                  index === highlighted ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[0.625rem] font-semibold text-primary-800 dark:bg-primary-950/60 dark:text-primary-300"
                >
                  {displayName(user).charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-foreground">
                    {displayName(user)}
                  </span>
                  <span className="block truncate text-[0.6875rem] text-muted-foreground">
                    {secondaryLine(user)}
                  </span>
                </span>
              </button>
            </li>
          ))}

          {results.length === 0 && (
            <li className="px-2 py-2 text-[0.6875rem] text-muted-foreground">
              {termIsUuid ? (
                <button
                  type="button"
                  onClick={commitRawUuid}
                  className="cursor-pointer font-medium text-primary hover:underline"
                >
                  Filter by this UUID
                </button>
              ) : isFetching ? (
                "Loading users…"
              ) : (
                "No matching users."
              )}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
