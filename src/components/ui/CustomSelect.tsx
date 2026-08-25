"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

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
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "ជ្រើសរើស...",
  disabled = false,
  error = false,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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
        <div className="absolute left-0 top-full z-[130] mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-gray-150 bg-white p-1.5 shadow-xl shadow-gray-900/10 animate-in fade-in zoom-in-95 duration-150 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {options.map((opt) => {
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
                    <p className="mt-0.5 truncate text-xs text-gray-400 font-normal">
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
          })}
        </div>
      )}
    </div>
  );
}
