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
  onSearchChange,
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
  onSearchChange?: (query: string) => void;
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
    onSearchChange?.("");
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
        className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left text-[18px] font-semibold leading-7 text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
          invalid
            ? "border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-4 focus:ring-red-100/70"
            : open
              ? "border-[#14833E] bg-white ring-4 ring-emerald-100/70"
              : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className={`truncate ${selected ? "text-slate-800 font-semibold" : "text-slate-400 font-medium"}`}>
          {selected ? (
            <>
              {selected.label}
              {selected.sublabel && (
                <span className="ml-2 text-[16px] text-slate-400 font-normal">
                  ({selected.sublabel})
                </span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X size={18} />
            </span>
          )}
          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180 text-[#14833E]" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[62px] z-[200] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-100">
          <div className="mb-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2">
            <Search size={20} className="shrink-0 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                onSearchChange?.(nextQuery);
              }}
              placeholder="ស្វែងរក..."
              className="h-9 w-full bg-transparent text-[18px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onSearchChange?.("");
                }}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <p className="px-4 py-5 text-center text-[18px] font-medium text-slate-400">
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
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-[18px] leading-7 transition ${
                    isSelected
                      ? "bg-emerald-50 text-[#14833E] font-bold"
                      : "text-slate-700 font-semibold hover:bg-emerald-50/60 hover:text-[#14833E]"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.sublabel && (
                      <span className="block truncate text-[16px] font-normal text-slate-400">
                        {option.sublabel}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#14833E]">
                      <Check size={18} />
                    </span>
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
