"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";

import {
  useUpdateStoreAccountStatusMutation,
  useUpdateStoreOperatingStatusMutation,
  useUpdateStoreReviewStatusMutation,
} from "@/src/app/store/shop/shopApi";
import type { Store } from "@/src/types/shop";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

/* ============================================================
   OPTION SETS
============================================================ */

const REVIEW_OPTIONS = [
  {
    value: "APPROVED",
    label: "អនុម័ត",
    desc: "ហាងត្រូវបានអនុម័ត",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
  {
    value: "REJECTED",
    label: "បដិសេធ",
    desc: "ហាងត្រូវបានបដិសេធ",
    dot: "bg-red-500",
    ring: "ring-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
  },
] as const;

const OPERATING_OPTIONS = [
  {
    value: "OPEN",
    label: "កំពុងបើកដំណើរការ",
    desc: "ហាងកំពុងបើកដំណើរការ",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
  {
    value: "TEMPORARILY_CLOSED",
    label: "បិទបណ្តោះអាសន្ន",
    desc: "ហាងបិទជាបណ្តោះអាសន្ន",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  {
    value: "CLOSED",
    label: "បានបិទ",
    desc: "ហាងបានបិទដំណើរការ",
    dot: "bg-red-500",
    ring: "ring-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
  },
] as const;

const ACCOUNT_OPTIONS = [
  {
    value: "ACTIVE",
    label: "សកម្ម",
    desc: "គណនីហាងកំពុងដំណើរការធម្មតា",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
  {
    value: "SUSPENDED",
    label: "ត្រូវបានផ្អាក",
    desc: "គណនីហាងត្រូវបានផ្អាកដោយអ្នកគ្រប់គ្រង",
    dot: "bg-red-500",
    ring: "ring-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
  },
] as const;

type ReviewValue = "APPROVED" | "REJECTED" | null;
type OperatingValue = "OPEN" | "TEMPORARILY_CLOSED" | "CLOSED";
type AccountValue = "ACTIVE" | "SUSPENDED";
type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1 as Step, label: "ពិនិត្យ" },
  { num: 2 as Step, label: "ដំណើរការ" },
  { num: 3 as Step, label: "គណនី" },
];

/* ============================================================
   COMPONENT
============================================================ */

export default function ShopStatusModal({
  store,
  initialAction,
  onClose,
  onChanged,
}: {
  store: Store | null;
  initialAction?: string;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}) {
  const [step, setStep] = useState<Step>(1);
  const [review, setReview] = useState<ReviewValue>(null);
  const [notes, setNotes] = useState("");
  const [operating, setOperating] = useState<OperatingValue>("OPEN");
  const [account, setAccount] = useState<AccountValue>("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  const [updateReview, { isLoading: reviewLoading }] = useUpdateStoreReviewStatusMutation();
  const [updateOperating, { isLoading: operatingLoading }] = useUpdateStoreOperatingStatusMutation();
  const [updateAccount, { isLoading: accountLoading }] = useUpdateStoreAccountStatusMutation();
  const isLoading = reviewLoading || operatingLoading || accountLoading;

  /* Pre-fill exactly from API */
  useEffect(() => {
    if (!store) return;

    setStep(1);

    const rv = String(store.reviewStatus || "").toUpperCase().trim();
    setReview(
      rv === "APPROVED" || rv === "APPROVE"
        ? "APPROVED"
        : rv === "REJECTED" || rv === "REJECT"
          ? "REJECTED"
          : null,
    );

    const op = String(store.operatingStatus || "").toUpperCase().trim();
    setOperating(
      op === "TEMPORARILY_CLOSED"
        ? "TEMPORARILY_CLOSED"
        : op === "CLOSED"
          ? "CLOSED"
          : "OPEN",
    );

    const ac = String(store.accountStatus || "").toUpperCase().trim();
    setAccount(ac === "SUSPENDED" ? "SUSPENDED" : "ACTIVE");

    setNotes("");
    setError(null);
  }, [store]);

  /* Lock background scroll */
  useEffect(() => {
    if (!store) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [store]);

  if (!store) return null;

  const goBack = () => {
    setError(null);
    setStep((s) => (s > 1 ? (s - 1) as Step : s));
  };

  const goNext = () => {
    setStep((s) => (s < 3 ? (s + 1) as Step : s));
  };

  const save = async () => {
    try {
      setError(null);
      if (review) {
        await updateReview({
          storeUuid: store.uuid,
          body: { reviewStatus: review, notes: notes.trim() },
        }).unwrap();
      }
      await updateOperating({
        storeUuid: store.uuid,
        body: { operatingStatus: operating },
      }).unwrap();
      await updateAccount({
        storeUuid: store.uuid,
        body: { accountStatus: account },
      }).unwrap();
      await onChanged();
      onClose();
    } catch (err) {
      setError(getShopApiErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[4px]">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-lg font-bold text-gray-900">គ្រប់គ្រងស្ថានភាព</p>
            <p className="mt-0.5 truncate text-sm text-gray-400">{store.storeName}</p>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-2 px-6 pt-5">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                    step === s.num
                      ? "bg-[#137A3D] text-white"
                      : step > s.num
                        ? "bg-emerald-100 text-[#137A3D]"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    step === s.num ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="space-y-2 p-5 pt-4">

          {/* ─ Step 1: Review ─ */}
          {step === 1 && (
            <div className="space-y-2">
              {String(store.reviewStatus || "").toUpperCase() === "PENDING" && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <p className="text-sm font-semibold text-amber-700">ស្ថានភាពបច្ចុប្បន្ន: កំពុងរង់ចាំពិនិត្យ</p>
                </div>
              )}
              {REVIEW_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  opt={opt}
                  isActive={review === opt.value}
                  disabled={isLoading}
                  onClick={() => setReview(opt.value as ReviewValue)}
                />
              ))}
              {review === "REJECTED" && (
                <div className="pt-1">
                  <p className="mb-1.5 text-sm font-semibold text-gray-600">មូលហេតុបដិសេធ</p>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="សរសេរមូលហេតុ..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#137A3D] focus:bg-white focus:ring-2 focus:ring-[#137A3D]/15"
                  />
                </div>
              )}
              {review === null && (
                <p className="pt-1 text-center text-xs text-gray-400">ជ្រើសរើសស្ថានភាពពិនិត្យខាងលើ</p>
              )}
            </div>
          )}

          {/* ─ Step 2: Operating ─ */}
          {step === 2 && (
            <div className="space-y-2">
              {OPERATING_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  opt={opt}
                  isActive={operating === opt.value}
                  disabled={isLoading}
                  onClick={() => setOperating(opt.value)}
                />
              ))}
            </div>
          )}

          {/* ─ Step 3: Account ─ */}
          {step === 3 && (
            <div className="space-y-2">
              {ACCOUNT_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  opt={opt}
                  isActive={account === opt.value}
                  disabled={isLoading}
                  onClick={() => setAccount(opt.value)}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          {/* Back / Cancel */}
          {step === 1 ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-base font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={goBack}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-5 text-base font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              ត្រឡប់
            </button>
          )}

          {/* Next / Save */}
          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && review === null}
              onClick={goNext}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#137A3D] px-7 text-base font-semibold text-white shadow-sm transition hover:bg-[#0f6833] disabled:cursor-not-allowed disabled:opacity-40"
            >
              បន្ទាប់
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void save()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#137A3D] px-7 text-base font-semibold text-white shadow-sm transition hover:bg-[#0f6833] disabled:opacity-60"
            >
              {isLoading && <Loader2 size={17} className="animate-spin" />}
              {isLoading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   OPTION CARD
============================================================ */

function OptionCard({
  opt,
  isActive,
  disabled,
  onClick,
}: {
  opt: {
    label: string;
    desc: string;
    dot: string;
    ring: string;
    bg: string;
    text: string;
    border: string;
  };
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-3.5 text-left transition ${
        isActive
          ? `${opt.bg} ${opt.border}`
          : "border-gray-100 bg-gray-50/60 hover:border-gray-200 hover:bg-gray-50"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          isActive ? `${opt.ring} ring-4` : "ring-2 ring-gray-200"
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full transition ${isActive ? opt.dot : "bg-gray-300"}`} />
      </span>
      <div className="flex-1">
        <p className={`text-base font-bold ${isActive ? opt.text : "text-gray-700"}`}>{opt.label}</p>
        <p className={`text-xs ${isActive ? opt.text : "text-gray-400"}`}>{opt.desc}</p>
      </div>
      {isActive && <span className={`text-sm font-bold ${opt.text}`}>✓</span>}
    </button>
  );
}
