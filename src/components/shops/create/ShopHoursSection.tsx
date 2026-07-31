"use client";

interface ShopHoursSectionProps {
  openTime: string;
  onOpenTimeChange: (value: string) => void;
  closeTime: string;
  onCloseTimeChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export default function ShopHoursSection({
  openTime,
  onOpenTimeChange,
  closeTime,
  onCloseTimeChange,
  description,
  onDescriptionChange,
}: ShopHoursSectionProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm text-gray-600 mb-2 block">
          ពេលវេលា <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">ម៉ោងបើកនៅ</label>
            <input
              type="text"
              value={openTime}
              onChange={(e) => onOpenTimeChange(e.target.value)}
              placeholder="8:30ព្រឹក"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">ម៉ោងបិទនៅ</label>
            <input
              type="text"
              value={closeTime}
              onChange={(e) => onCloseTimeChange(e.target.value)}
              placeholder="10:00យប់"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600 mb-1 block">ការពិពណ៌នាហាង</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          placeholder="ហាងមាន អាហារពេលកើដ៏ពេញនិយម គឺសាច់ជ្រូកហាន់ស្លឹង ប្រឡាក់ទឹកដួង និងខ្លីស ដុតលើផ្សើង រូបប្រើដាមួយចាយក្តៅៗ..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>
    </div>
  );
}