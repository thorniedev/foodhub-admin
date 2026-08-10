"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AlertTriangle, LoaderCircle, X } from "lucide-react";

import type { Allergen, AllergenFormValues } from "@/src/types/allergen";

const EMPTY_FORM: AllergenFormValues = {
  code: "",
  name: "",
  description: "",
  active: true,
};

type Props = {
  open: boolean;
  allergen: Allergen | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: AllergenFormValues) => Promise<void>;
};

function createInternalName(code: string): string {
  const cleanCode = code.trim().replace(/[_-]+/g, " ");

  if (!cleanCode) {
    return "";
  }

  return cleanCode
    .toLowerCase()
    .replace(/\b[a-z]/g, (character) => character.toUpperCase());
}

export default function AllergenFormModal({
  open,
  allergen,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<AllergenFormValues>(EMPTY_FORM);

  const [validationError, setValidationError] = useState("");

  /* =======================================================
     INITIAL DATA
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (allergen) {
      setForm({
        code: allergen.code,
        name: allergen.name,
        description: allergen.description ?? "",
        active: allergen.active,
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setValidationError("");
  }, [open, allergen]);

  if (!open) {
    return null;
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const code = form.code.trim();

    if (!code) {
      setValidationError("សូមបំពេញអាឡែស៊ី។");

      return;
    }

    /*
     * name is hidden from Admin,
     * but backend still requires it.
     */
    const generatedName = createInternalName(code);

    setValidationError("");

    await onSubmit({
      ...form,

      code,

      // Internal backend value
      name: generatedName,

      description: form.description.trim(),
    });
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        {/* ===============================================
            HEADER
        ================================================ */}

        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-4xl font-bold text-[#136C34]">
              {allergen ? "កែប្រែអាឡែស៊ី" : "បន្ថែមអាឡែស៊ីថ្មី"}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===============================================
            FORM
        ================================================ */}

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* =============================================
              ALLERGEN

              This is actually backend `code`
          ============================================== */}

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ឈ្មោះអាឡែស៊ី *
            </label>

            <input
              value={form.code}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,

                  code: event.target.value,
                }))
              }
              placeholder="ឧ. សណ្ដែកដី"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          {/* =============================================
              DESCRIPTION
          ============================================== */}

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ការពិពណ៌នា
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,

                  description: event.target.value,
                }))
              }
              placeholder="សរសេរការពិពណ៌នាអំពីអាឡែស៊ី..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          {/* =============================================
              ACTIVE STATUS
          ============================================== */}

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xl font-semibold text-[#F97316]">សកម្ម</p>

              <p className="mt-0.5 text-base text-gray-500">
                បើក ដើម្បីឱ្យកំណត់ត្រានេះសកម្ម។
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,

                  active: event.target.checked,
                }))
              }
              className="h-5 w-5 accent-[#F97316]"
            />
          </label>


          {validationError && (
            <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle size={18} className="shrink-0" />

              {validationError}
            </div>
          )}

          {/* =============================================
              ACTIONS
          ============================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
            >
              {saving && <LoaderCircle size={17} className="animate-spin" />}

              {allergen ? "រក្សាទុកការកែប្រែ" : "បន្ថែម"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
