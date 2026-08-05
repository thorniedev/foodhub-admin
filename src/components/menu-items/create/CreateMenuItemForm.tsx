"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, X } from "lucide-react";
import { useCreateMenuItemMutation, useGetMenuItemsQuery } from "@/src/app/store/menuItemApi";
import { useGetShopsQuery } from "@/src/app/store/shopApi";
import {
  AllergenDeclaration,
  CodeName,
  CreateMenuItemPayload,
  DietaryType,
} from "@/src/types/menuItem";
import MenuItemImageUploadGrid from "./MenuItemImageUploadGrid";

function slugCode(name: string) {
  return name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInput("");
  };
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button type="button" onClick={add} className="bg-emerald-600 text-white rounded-lg px-3 hover:bg-emerald-700">
          <Plus size={16} />
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {values.map((v) => (
            <span key={v} className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface CreateMenuItemFormProps {
  kind: "food" | "drink";
  redirectTo: string;
}

export default function CreateMenuItemForm({ kind, redirectTo }: CreateMenuItemFormProps) {
  const router = useRouter();
  const [createMenuItem, { isLoading }] = useCreateMenuItemMutation();
  const { data: menuItems = [] } = useGetMenuItemsQuery();
  const { data: shops = [] } = useGetShopsQuery();

  const existingCategories = useMemo(() => {
    const map = new Map<string, CodeName>();
    menuItems.forEach((m) => map.set(m.food.category.code, m.food.category));
    return Array.from(map.values());
  }, [menuItems]);

  const existingCuisines = useMemo(() => {
    const map = new Map<string, CodeName>();
    menuItems.forEach((m) => map.set(m.food.cuisine.code, m.food.cuisine));
    return Array.from(map.values());
  }, [menuItems]);

  const existingMealTypes = useMemo(() => {
    const map = new Map<string, CodeName>();
    menuItems.forEach((m) => m.mealTypes.forEach((mt) => map.set(mt.code, mt)));
    return Array.from(map.values());
  }, [menuItems]);

  const AGE_GROUPS: CodeName[] = [
    { code: "CHILD", name: "Child" },
    { code: "TEEN", name: "Teen" },
    { code: "ADULT", name: "Adult" },
    { code: "SENIOR", name: "Senior" },
  ];

  const [thumbnail, setThumbnail] = useState("");
  const [name, setName] = useState("");
  const [localName, setLocalName] = useState("");
  const [description, setDescription] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(10);
  const [isFeatured, setIsFeatured] = useState(false);
  const [storeUuid, setStoreUuid] = useState("");
  const [canonicalName, setCanonicalName] = useState("");
  const [category, setCategory] = useState<CodeName | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [cuisine, setCuisine] = useState<CodeName | null>(null);
  const [newCuisineName, setNewCuisineName] = useState("");
  const [spiceLevel, setSpiceLevel] = useState(0);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [mealTypes, setMealTypes] = useState<CodeName[]>([]);
  const [newMealTypeName, setNewMealTypeName] = useState("");
  const [dietaryTypeNames, setDietaryTypeNames] = useState<string[]>([]);
  const [allergenNames, setAllergenNames] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [beveragePairings, setBeveragePairings] = useState<string[]>([]);
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [carbohydrate, setCarbohydrate] = useState<number | "">("");
  const [fat, setFat] = useState<number | "">("");

  const toggleAgeGroup = (code: string) => {
    setAgeGroups((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const toggleMealType = (mt: CodeName) => {
    setMealTypes((prev) =>
      prev.some((m) => m.code === mt.code) ? prev.filter((m) => m.code !== mt.code) : [...prev, mt]
    );
  };

  const addCustomMealType = () => {
    const trimmed = newMealTypeName.trim();
    if (!trimmed) return;
    setMealTypes((prev) => [...prev, { code: slugCode(trimmed), name: trimmed }]);
    setNewMealTypeName("");
  };

  const handleSubmit = async () => {
    const selectedStore = shops.find((s) => s.uuid === storeUuid);
    if (!localName.trim() || !name.trim() || !category || !cuisine || !selectedStore) return;

    const dietaryTypes: DietaryType[] = dietaryTypeNames.map((n) => ({
      code: slugCode(n),
      name: n,
      verificationStatus: "UNVERIFIED",
    }));

    const allergenDeclarations: AllergenDeclaration[] = allergenNames.map((n) => ({
      code: slugCode(n),
      name: n,
      declarationType: "MAY_CONTAIN",
      riskLevel: "MEDIUM",
      verificationStatus: "UNVERIFIED",
    }));

    const payload: CreateMenuItemPayload = {
      name,
      localName,
      description,
      localDescription,
      thumbnail: thumbnail || null,
      gallery: thumbnail ? [thumbnail] : [],
      price,
      currencyCode: "USD",
      preparationTimeMinutes,
      availabilityStatus: "AVAILABLE",
      isFeatured,
      source: "MANUAL",
      store: {
        uuid: selectedStore.uuid,
        name: selectedStore.storeName,
        localName: selectedStore.storeName,
        logoUrl: selectedStore.logoUrl,
        coverImageUrl: selectedStore.coverImageUrl,
        addressLine: selectedStore.addressLine,
        district: selectedStore.district,
        city: selectedStore.city,
        latitude: selectedStore.latitude ?? undefined,
        longitude: selectedStore.longitude ?? undefined,
        operatingStatus: selectedStore.operatingStatus,
        averageRating: selectedStore.averageRating,
        totalReviews: selectedStore.totalReviews,
      },
      food: {
        uuid: crypto.randomUUID(),
        canonicalName: canonicalName || name,
        category,
        cuisine,
        spiceLevel,
        ageGroups: AGE_GROUPS.filter((a) => ageGroups.includes(a.code)),
      },
      mealTypes,
      dietaryTypes,
      allergenDeclarations,
      ingredients,
      beveragePairings,
      nutrition: {
        calories: calories === "" ? undefined : calories,
        protein: protein === "" ? undefined : protein,
        carbohydrate: carbohydrate === "" ? undefined : carbohydrate,
        fat: fat === "" ? undefined : fat,
      },
    };

    await createMenuItem(payload);
    router.push(redirectTo);
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#136C34]">
        {kind === "food" ? "បន្ថែមម្ហូបថ្មី" : "បន្ថែមភេសជ្ជៈថ្មី"}
      </h1>

      {/* Basic info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">ព័ត៌មានមូលដ្ឋាន</h2>
        <MenuItemImageUploadGrid imageUrl={thumbnail} onChange={setThumbnail} />

        <div>
          <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះ (ខ្មែរ) *</label>
          <input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">ឈ្មោះ (English) *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">ការពិពណ៌នា (ខ្មែរ)</label>
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">ការពិពណ៌នា (English)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">តម្លៃ (USD)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">ពេលវេលារៀបចំ (នាទី)</label>
            <input
              type="number"
              value={preparationTimeMinutes}
              onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-emerald-600" />
          <span className="text-sm text-gray-600">ជាមុខម្ហូបលេចធ្លោ (Featured)</span>
        </label>
      </div>

      {/* Store */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">ហាង *</h2>
        <select
          value={storeUuid}
          onChange={(e) => setStoreUuid(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">ជ្រើសរើសហាង</option>
          {shops.map((s) => (
            <option key={s.uuid} value={s.uuid}>
              {s.storeName}
            </option>
          ))}
        </select>
      </div>

      {/* Classification */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">ការចាត់ថ្នាក់</h2>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">ប្រភេទ *</label>
          <div className="flex gap-2">
            <select
              value={category?.code ?? ""}
              onChange={(e) => setCategory(existingCategories.find((c) => c.code === e.target.value) ?? null)}
              className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">ជ្រើសរើសប្រភេទ</option>
              {existingCategories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="ឬបញ្ចូលប្រភេទថ្មី"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => {
                if (!newCategoryName.trim()) return;
                setCategory({ code: slugCode(newCategoryName), name: newCategoryName.trim() });
                setNewCategoryName("");
              }}
              className="px-3 py-2 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
            >
              + ថ្មី
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">ម្ហូបជាតិ *</label>
          <div className="flex gap-2">
            <select
              value={cuisine?.code ?? ""}
              onChange={(e) => setCuisine(existingCuisines.find((c) => c.code === e.target.value) ?? null)}
              className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">ជ្រើសរើសម្ហូបជាតិ</option>
              {existingCuisines.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <input
              value={newCuisineName}
              onChange={(e) => setNewCuisineName(e.target.value)}
              placeholder="ឬបញ្ចូលម្ហូបជាតិថ្មី"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => {
                if (!newCuisineName.trim()) return;
                setCuisine({ code: slugCode(newCuisineName), name: newCuisineName.trim() });
                setNewCuisineName("");
              }}
              className="px-3 py-2 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
            >
              + ថ្មី
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">កម្រិតហឹរ (0-3)</label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSpiceLevel(lvl)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                  spiceLevel === lvl ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-2 block">ក្រុមអាយុ</label>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.code}
                type="button"
                onClick={() => toggleAgeGroup(ag.code)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${
                  ageGroups.includes(ag.code)
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {ag.name}
              </button>
            ))}
          </div>
        </div>

        <TagInput label="គ្រឿងផ្សំ" values={ingredients} onChange={setIngredients} placeholder="បន្ថែមគ្រឿងផ្សំ..." />
        <TagInput label="ភេសជ្ជៈដែលសមទៅនឹងម្ហូបនេះ" values={beveragePairings} onChange={setBeveragePairings} placeholder="ឧ. តែក្តៅ" />
        <TagInput label="ប្រភេទរបបអាហារ (Dietary tags)" values={dietaryTypeNames} onChange={setDietaryTypeNames} placeholder="ឧ. ហាឡាល់" />
        <TagInput label="សារធាតុអាលែហ្សី" values={allergenNames} onChange={setAllergenNames} placeholder="ឧ. Fish, Egg" />
      </div>

      {/* Meal types */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">សម្រាប់អាហារពេល</h2>
        <div className="flex flex-wrap gap-2">
          {existingMealTypes.map((mt) => (
            <button
              key={mt.code}
              type="button"
              onClick={() => toggleMealType(mt)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${
                mealTypes.some((m) => m.code === mt.code)
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {mt.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newMealTypeName}
            onChange={(e) => setNewMealTypeName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomMealType()}
            placeholder="បន្ថែមពេលវេលាថ្មី"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="button" onClick={addCustomMealType} className="px-3 py-2 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50">
            + ថ្មី
          </button>
        </div>
      </div>

      {/* Nutrition */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">ជីវជាតិ (ស្រេចចិត្ត)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Calories</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Protein (g)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Carbs (g)</label>
            <input
              type="number"
              value={carbohydrate}
              onChange={(e) => setCarbohydrate(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fat (g)</label>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          onClick={() => router.push(redirectTo)}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          បោះបង់
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
        >
          <Save size={16} />
          រក្សាទុក
        </button>
      </div>
    </div>
  );
}