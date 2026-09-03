"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";

import type { MenuItemDietaryTypeInput } from "@/src/types/menuItem";

interface DietaryTypeOption {
  uuid: string;
  code?: string | null;
  name?: string | null;
}

const VERIFICATION_STATUSES = ["UNVERIFIED", "VERIFIED", "REJECTED"] as const;

/**
 * Edits the dietary labels a store declares for one menu item.
 *
 * The list arrives seeded from the selected food and is the item's own from
 * then on: adding a label the food does not carry, or removing one it does,
 * is the point of the editor. `onReseed` puts the food's classification back
 * for an admin who wants to start over.
 */
export default function MenuItemDietaryTypesEditor({
  options,
  value,
  onChange,
  onReseed,
  seedCount,
}: {
  options: DietaryTypeOption[];
  value: MenuItemDietaryTypeInput[];
  onChange: (value: MenuItemDietaryTypeInput[]) => void;
  onReseed: () => void;
  seedCount: number;
}) {
  const addRow = () => {
    const firstAvailable = options.find(
      (option) => !value.some((item) => item.dietaryTypeUuid === option.uuid),
    );

    if (!firstAvailable) {
      return;
    }

    onChange([
      ...value,
      {
        dietaryTypeUuid: firstAvailable.uuid,
        verificationStatus: "UNVERIFIED",
        notes: "",
      },
    ]);
  };

  const updateRow = (index: number, patch: Partial<MenuItemDietaryTypeInput>) => {
    onChange(
      value.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  };

  const labelOf = (uuid: string) => {
    const option = options.find((item) => item.uuid === uuid);
    return option?.name ?? option?.code ?? uuid;
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Dietary Types</h3>
          <p className="mt-1 text-sm text-gray-500">
            បញ្ជីនេះចម្លងមកពី Food ដែលបានជ្រើស។ អ្នកអាចបន្ថែម ឬដកចេញ
            ដោយមិនប៉ះពាល់ Food ដើម។
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReseed}
            disabled={seedCount === 0}
            title="យក Dietary Types របស់ Food មកវិញ"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            យកពី Food វិញ ({seedCount})
          </button>

          <button
            type="button"
            onClick={addRow}
            disabled={options.length === 0 || value.length >= options.length}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-50 px-4 text-sm font-bold text-[#137A3D] transition hover:bg-emerald-100 disabled:opacity-50"
          >
            <Plus size={16} />
            បន្ថែម Dietary Type
          </button>
        </div>
      </div>

      {value.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center text-sm text-gray-400">
          មិនមាន Dietary Type ទេ។ Menu Item នេះនឹងរក្សាទុកបញ្ជីទទេ។
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {value.map((row, index) => (
            <div
              key={`${row.dietaryTypeUuid}-${index}`}
              className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 lg:grid-cols-[minmax(180px,1.4fr)_150px_minmax(160px,1fr)_44px]"
            >
              <select
                value={row.dietaryTypeUuid}
                onChange={(event) =>
                  updateRow(index, { dietaryTypeUuid: event.target.value })
                }
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              >
                {options
                  .filter(
                    (option) =>
                      option.uuid === row.dietaryTypeUuid ||
                      !value.some((item) => item.dietaryTypeUuid === option.uuid),
                  )
                  .map((option) => (
                    <option key={option.uuid} value={option.uuid}>
                      {option.name ?? option.code ?? option.uuid}
                    </option>
                  ))}
              </select>

              <select
                value={row.verificationStatus}
                onChange={(event) =>
                  updateRow(index, {
                    verificationStatus: event.target
                      .value as MenuItemDietaryTypeInput["verificationStatus"],
                  })
                }
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              >
                {VERIFICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <input
                value={row.notes ?? ""}
                maxLength={500}
                onChange={(event) => updateRow(index, { notes: event.target.value })}
                placeholder="Notes (optional)"
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={() => removeRow(index)}
                aria-label={`ដក ${labelOf(row.dietaryTypeUuid)} ចេញ`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Verification: មានតែ VERIFIED ប៉ុណ្ណោះដែល Advanced Filter រាប់ជា dietary
        ដែលបានផ្ទៀងផ្ទាត់។
      </p>
    </section>
  );
}
