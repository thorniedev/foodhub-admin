"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface CustomDatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  maxDate?: string; // YYYY-MM-DD (defaults to today)
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

const MONTH_NAMES_KH = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const WEEKDAY_NAMES_KH = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];

type ViewMode = "DAYS" | "MONTHS" | "YEARS";

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "ជ្រើសរើសថ្ងៃ...",
  maxDate = new Date().toISOString().split("T")[0],
  disabled = false,
  error = false,
  className = "",
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("DAYS");
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to current date
  const parsedValue = value ? new Date(value) : null;
  const initialDate = parsedValue && !isNaN(parsedValue.getTime()) ? parsedValue : new Date();

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [yearPage, setYearPage] = useState(Math.floor(initialDate.getFullYear() / 12));

  // Sync internal month/year state when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
        setYearPage(Math.floor(d.getFullYear() / 12));
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setViewMode("DAYS");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Formatting date for display (DD/MM/YYYY)
  const formatDisplayDate = (valStr?: string) => {
    if (!valStr) return "";
    const parts = valStr.split("-");
    if (parts.length !== 3) return valStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const formatted = `${currentYear}-${m}-${d}`;

    if (maxDate && formatted > maxDate) {
      return;
    }

    onChange(formatted);
    setOpen(false);
    setViewMode("DAYS");
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const parts = value.split("-");
    if (parts.length !== 3) return false;
    return (
      Number(parts[0]) === currentYear &&
      Number(parts[1]) === currentMonth + 1 &&
      Number(parts[2]) === day
    );
  };

  const isDisabledDay = (day: number) => {
    if (!maxDate) return false;
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const formatted = `${currentYear}-${m}-${d}`;
    return formatted > maxDate;
  };

  // 12-Year Decade Grid
  const startYear = yearPage * 12;
  const yearGrid = Array.from({ length: 12 }, (_, i) => startYear + i);
  const maxAllowedYear = new Date(maxDate).getFullYear() || new Date().getFullYear();

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
            setViewMode("DAYS");
          }
        }}
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
            value ? "text-gray-900 font-semibold" : "text-gray-400"
          }`}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </span>

        <div className="flex items-center gap-1 text-primary-700">
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              title="លុបកាលបរិច្ឆេទ"
              className="mr-1 flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={13} />
            </span>
          )}
          <CalendarIcon size={18} className="shrink-0 text-primary-800" />
        </div>
      </button>

      {/* Floating Custom Calendar Popover - Opens ABOVE input */}
      {open && (
        <div className="absolute left-0 bottom-full z-[140] mb-2 w-[265px] rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl shadow-gray-900/15 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Navigation */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            {viewMode === "DAYS" ? (
              <>
                <button
                  type="button"
                  onClick={prevMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-primary-800"
                  title="ខែមុន"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("MONTHS")}
                    className="rounded-lg bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-800 transition hover:bg-emerald-50 hover:text-primary-800"
                  >
                    {MONTH_NAMES_KH[currentMonth]}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setYearPage(Math.floor(currentYear / 12));
                      setViewMode("YEARS");
                    }}
                    className="rounded-lg bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-800 transition hover:bg-emerald-50 hover:text-primary-800"
                  >
                    {currentYear}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-primary-800"
                  title="ខែបន្ទាប់"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            ) : viewMode === "MONTHS" ? (
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-bold text-gray-700 px-1">ជ្រើសរើសខែ</span>
                <button
                  type="button"
                  onClick={() => setViewMode("DAYS")}
                  className="rounded-lg px-2 py-0.5 text-xs font-bold text-primary-800 transition hover:bg-emerald-50"
                >
                  ត្រឡប់
                </button>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between">
                <button
                  type="button"
                  onClick={() => setYearPage((p) => Math.max(0, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-primary-800"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-xs font-bold text-gray-700">
                  {startYear} - {startYear + 11}
                </span>

                <button
                  type="button"
                  onClick={() => setYearPage((p) => p + 1)}
                  disabled={startYear + 12 > maxAllowedYear}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-primary-800 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* VIEW MODE: DAYS */}
          {viewMode === "DAYS" && (
            <>
              {/* Weekday Names Header */}
              <div className="mt-2 grid grid-cols-7 text-center">
                {WEEKDAY_NAMES_KH.map((wk, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-bold text-gray-400 py-0.5"
                  >
                    {wk}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="mt-0.5 grid grid-cols-7 gap-0.5 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-7 w-7" />
                ))}

                {Array.from({ length: daysInMonth }, (_, idx) => {
                  const day = idx + 1;
                  const selected = isSelected(day);
                  const disabledDay = isDisabledDay(day);
                  const todayDay = isToday(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => handleSelectDay(day)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition ${
                        selected
                          ? "bg-primary-800 text-white shadow-sm font-bold"
                          : disabledDay
                            ? "cursor-not-allowed text-gray-300 bg-gray-50/40"
                            : todayDay
                              ? "border border-primary-600 text-primary-800 font-bold bg-primary-50/50"
                              : "text-gray-700 hover:bg-emerald-50 hover:text-primary-800"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW MODE: MONTHS (3x4 Grid) */}
          {viewMode === "MONTHS" && (
            <div className="mt-2 grid grid-cols-3 gap-1.5 py-1">
              {MONTH_NAMES_KH.map((monthName, idx) => {
                const isCurrent = idx === currentMonth;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(idx);
                      setViewMode("DAYS");
                    }}
                    className={`rounded-xl py-2 text-xs font-semibold transition ${
                      isCurrent
                        ? "bg-primary-800 text-white font-bold shadow-sm"
                        : "bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-primary-800"
                    }`}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW MODE: YEARS (3x4 Grid) */}
          {viewMode === "YEARS" && (
            <div className="mt-2 grid grid-cols-3 gap-1.5 py-1">
              {yearGrid.map((y) => {
                const isCurrent = y === currentYear;
                const isFutureYear = y > maxAllowedYear;
                return (
                  <button
                    key={y}
                    type="button"
                    disabled={isFutureYear}
                    onClick={() => {
                      setCurrentYear(y);
                      setViewMode("DAYS");
                    }}
                    className={`rounded-xl py-2 text-xs font-semibold transition ${
                      isCurrent
                        ? "bg-primary-800 text-white font-bold shadow-sm"
                        : isFutureYear
                          ? "cursor-not-allowed bg-gray-50 text-gray-300 opacity-40"
                          : "bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-primary-800"
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Quick Actions */}
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const formatted = today.toISOString().split("T")[0];
                if (!maxDate || formatted <= maxDate) {
                  setCurrentYear(today.getFullYear());
                  setCurrentMonth(today.getMonth());
                  onChange(formatted);
                  setOpen(false);
                  setViewMode("DAYS");
                }
              }}
              className="text-primary-800 transition hover:underline"
            >
              ថ្ងៃនេះ (Today)
            </button>

            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setViewMode("DAYS");
              }}
              className="text-gray-400 transition hover:text-gray-600"
            >
              បោះបង់ (Clear)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
