"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableOption = {
  value: string;
  label: string;
  sublabel?: string;
};

export default function MenuItemSearchableSelect({
  value,
  options,
  onChange,
  placeholder = "ជ្រើសរើស...",
  emptyLabel = "រកមិនឃើញលទ្ធផលទេ",
  disabled = false,
  invalid = false,
  clearable = false,
  ariaLabel = "ជ្រើសរើស",
}: {
  value: string;
  options: SearchableOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(term) ||
        option.sublabel?.toLowerCase().includes(term),
    );
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : setOpen(true))}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-gray-50 px-4 text-left text-sm text-gray-800 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
          invalid
            ? "border-red-300 bg-red-50/40"
            : open
              ? "border-[#137A3D] bg-white ring-4 ring-emerald-50"
              : "border-gray-200 hover:border-[#137A3D]/50"
        }`}
      >
        <span className={`truncate ${selected ? "" : "text-gray-400"}`}>
          {selected ? (
            <>
              {selected.label}
              {selected.sublabel && (
                <span className="ml-1.5 text-xs text-gray-400">
                  {selected.sublabel}
                </span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>

        <span className="flex shrink-0 items-center gap-1">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[54px] z-[160] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search size={15} className="shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ស្វែងរក..."
              className="h-8 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-gray-400">
                {emptyLabel}
              </p>
            )}

            {filtered.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isSelected
                      ? "bg-emerald-50 text-[#137A3D]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#137A3D]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.sublabel && (
                      <span className="block truncate text-xs font-normal text-gray-400">
                        {option.sublabel}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <Check size={16} className="shrink-0 text-[#137A3D]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
