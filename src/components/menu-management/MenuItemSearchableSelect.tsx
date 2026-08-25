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
        className={`flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-left text-base font-semibold text-gray-700 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70 ${
          invalid
            ? "border-red-300 bg-red-50/40"
            : open
              ? "border-primary-600 bg-white ring-2 ring-primary-100"
              : "border-gray-200 hover:border-primary-600/50"
        }`}
      >
        <span className={`truncate ${selected ? "text-gray-700" : "text-gray-400 font-normal"}`}>
          {selected ? (
            <>
              {selected.label}
              {selected.sublabel && (
                <span className="ml-2 text-sm text-gray-400 font-normal">
                  {selected.sublabel}
                </span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180 text-primary-800" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[50px] z-[160] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-gray-100 px-3.5 py-2.5">
            <Search size={18} className="shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ស្វែងរក..."
              className="h-8 w-full bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5">
            {filtered.length === 0 && (
              <p className="px-3.5 py-4 text-center text-sm font-medium text-gray-400">
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
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-base font-semibold transition ${
                    isSelected
                      ? "bg-primary-50 text-primary-800 font-bold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary-800"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.sublabel && (
                      <span className="block truncate text-sm font-normal text-gray-400">
                        {option.sublabel}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <Check size={18} className="shrink-0 text-primary-800" />
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
