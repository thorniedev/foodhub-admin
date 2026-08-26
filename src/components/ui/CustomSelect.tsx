"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  align?: "left" | "right" | string;
  searchable?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "ជ្រើសរើស...",
  disabled = false,
  error = false,
  className = "",
  align = "left",
  searchable,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isSearchable = searchable ?? options.length > 7;

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.description?.toLowerCase().includes(q),
    );
  }, [options, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (open && isSearchable) {
      setSearchQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open, isSearchable]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`flex h-12 w-full items-center justify-between rounded-2xl border bg-white px-4 text-left text-base transition outline-none disabled:cursor-not-allowed disabled:bg-gray-50 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : open
              ? "border-primary-600 ring-2 ring-primary-100 shadow-sm"
              : "border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
        }`}
      >
        <span
          className={`truncate font-medium ${
            selectedOption ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180 text-primary-700" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`absolute top-full z-[130] mt-1.5 flex max-h-80 w-full flex-col overflow-hidden rounded-2xl border border-gray-150 bg-white p-1.5 shadow-xl shadow-gray-900/10 animate-in fade-in zoom-in-95 duration-150 ${align === "right" ? "right-0" : "left-0"}`}
        >
          {/* Optional Search Input */}
          {isSearchable && (
            <div className="relative mb-1.5 p-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរក..."
                className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-7 text-sm text-gray-800 outline-none transition focus:border-primary-600 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-64 space-y-0.5 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs font-semibold text-gray-400">
                មិនរកឃើញទិន្នន័យ
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-base transition ${
                      isSelected
                        ? "bg-primary-50/80 font-semibold text-primary-800"
                        : "text-gray-700 hover:bg-emerald-50/60 hover:text-primary-800"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{opt.label}</p>
                      {opt.description && (
                        <p className="mt-0.5 truncate text-xs font-normal text-gray-400">
                          {opt.description}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <Check
                        size={16}
                        className="ml-2 shrink-0 text-primary-800"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
