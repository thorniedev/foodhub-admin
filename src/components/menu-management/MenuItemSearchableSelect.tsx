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
        className={`flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-full border bg-white px-5 text-left text-lg font-normal leading-7 text-gray-700 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
          invalid
            ? "border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : open
              ? "border-[#137A3D] bg-white ring-2 ring-emerald-100"
              : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className={`truncate ${selected ? "text-gray-700 font-normal" : "text-gray-400 font-normal"}`}>
          {selected ? (
            <>
              {selected.label}
              {selected.sublabel && (
                <span className="ml-2 text-lg text-gray-400 font-normal">
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
              className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X size={18} />
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180 text-[#137A3D]" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[54px] z-[200] overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
          <div className="mb-2 flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50/80 px-4 py-2">
            <Search size={18} className="shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                onSearchChange?.(nextQuery);
              }}
              placeholder="ស្វែងរក..."
              className="h-8 w-full bg-transparent text-lg font-normal text-gray-700 outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onSearchChange?.("");
                }}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto pr-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {filtered.length === 0 && (
              <p className="px-4 py-5 text-center text-lg font-normal text-gray-400">
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
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-lg font-normal leading-7 transition ${
                    isSelected
                      ? "bg-emerald-50 text-[#137A3D]"
                      : "text-gray-700 hover:bg-emerald-50/60 hover:text-[#137A3D]"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.sublabel && (
                      <span className="block truncate text-lg font-normal text-gray-400">
                        {option.sublabel}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#137A3D]">
                      <Check size={16} />
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
