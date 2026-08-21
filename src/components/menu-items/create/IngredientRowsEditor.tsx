"use client";

import { Plus, Trash2 } from "lucide-react";

import type { CreateStoreMenuItemIngredient } from "@/src/types/menuItem";

interface IngredientOption {
  uuid: string;
  code?: string | null;
  name?: string | null;
  isActive?: boolean;
}

export default function IngredientRowsEditor({
  options,
  value,
  onChange,
}: {
  options: IngredientOption[];
  value: CreateStoreMenuItemIngredient[];
  onChange: (value: CreateStoreMenuItemIngredient[]) => void;
}) {
  const addRow = () => {
    const firstAvailable = options.find(
      (option) => !value.some((item) => item.ingredientUuid === option.uuid),
    );

    if (!firstAvailable) {
      return;
    }

    onChange([
      ...value,
      {
        ingredientUuid: firstAvailable.uuid,
        quantity: 1,
        unit: "g",
        isOptional: false,
        notes: "",
      },
    ]);
  };

  const updateRow = (
    index: number,
    patch: Partial<CreateStoreMenuItemIngredient>,
  ) => {
    onChange(
      value.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">គ្រឿងផ្សំរបស់ Menu Item</h3>
          <p className="mt-1 text-sm text-gray-500">
            ជ្រើស Ingredient ដែលមានស្រាប់ ហើយកំណត់បរិមាណ និងឯកតា។
          </p>
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={options.length === 0 || value.length >= options.length}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-50 px-4 text-sm font-bold text-[#137A3D] transition hover:bg-emerald-100 disabled:opacity-50"
        >
          <Plus size={16} />
          បន្ថែម Ingredient
        </button>
      </div>

      {value.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center text-sm text-gray-400">
          មិនទាន់មាន Ingredient ទេ។ វាជាជម្រើស Optional។
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {value.map((row, index) => (
            <div
              key={`${row.ingredientUuid}-${index}`}
              className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 lg:grid-cols-[minmax(180px,1.5fr)_110px_110px_120px_minmax(160px,1fr)_44px]"
            >
              <select
                value={row.ingredientUuid}
                onChange={(event) =>
                  updateRow(index, { ingredientUuid: event.target.value })
                }
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              >
                {options.map((option) => (
                  <option key={option.uuid} value={option.uuid}>
                    {option.name ?? option.code ?? option.uuid}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                value={row.quantity}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
                onChange={(event) => {
                  const val = Number(event.target.value || 0);
                  if (val < 0) return;
                  updateRow(index, {
                    quantity: val,
                  });
                }}
                placeholder="Quantity"
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              />

              <input
                value={row.unit}
                onChange={(event) => updateRow(index, { unit: event.target.value })}
                placeholder="g, ml, pcs"
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              />

              <label className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={row.isOptional}
                  onChange={(event) =>
                    updateRow(index, { isOptional: event.target.checked })
                  }
                />
                Optional
              </label>

              <input
                value={row.notes ?? ""}
                onChange={(event) => updateRow(index, { notes: event.target.value })}
                placeholder="Notes"
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={() => removeRow(index)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                aria-label="Remove ingredient"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
