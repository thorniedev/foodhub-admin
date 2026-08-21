"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

export default function StoreSelect({
  value,
  options,
  onChange,
  className = "",
  menuClassName = "",
  disabled = false,
  ariaLabel = "Select option",
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-label={ariaLabel}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-gray-50 px-4 text-left text-base text-gray-800 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? "border-[#136C34] bg-white ring-2 ring-[#136C34]/10"
            : "border-gray-200 hover:border-[#136C34]/50"
        }`}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 top-[54px] z-[250] max-h-64 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.18)] ${menuClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${
                  isSelected
                    ? "bg-emerald-50 text-[#137A3D]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#137A3D]"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={16} className="text-[#137A3D]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
