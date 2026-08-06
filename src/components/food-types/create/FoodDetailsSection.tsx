// "use client";

// import { UtensilsCrossed } from "lucide-react";

// const NAME_MAX = 80;
// const DESC_MAX = 500;

// interface FoodDetailsSectionProps {
//   name: string;
//   onNameChange: (value: string) => void;
//   description: string;
//   onDescriptionChange: (value: string) => void;
// }

// export default function FoodDetailsSection({
//   name,
//   onNameChange,
//   description,
//   onDescriptionChange,
// }: FoodDetailsSectionProps) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
//       <div className="flex items-center gap-2">
//         <UtensilsCrossed size={20} className="text-[#136C34]" />
//         <h2 className="text-lg sm:text-xl font-bold text-gray-800">ព័ត៌មានលម្អិតអំពីអាហារ</h2>
//       </div>

//       <div>
//         <label className="text-sm font-medium text-gray-600 mb-2 block">
//           ឈ្មោះអាហារ <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="text"
//           value={name}
//           maxLength={NAME_MAX}
//           onChange={(e) => onNameChange(e.target.value)}
//           placeholder="ឧទាហរណ៍: គុយទាវសាច់គោ"
//           className="w-full px-4 py-3 text-sm bg-[#F7F3EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//         />
//         <p className="text-xs text-gray-400 text-right mt-1">
//           {name.length}/{NAME_MAX}
//         </p>
//       </div>

//       <div>
//         <label className="text-sm font-medium text-gray-600 mb-2 block">
//           ការពិពណ៌នា <span className="text-red-500">*</span>
//         </label>
//         <textarea
//           value={description}
//           maxLength={DESC_MAX}
//           onChange={(e) => onDescriptionChange(e.target.value)}
//           rows={4}
//           placeholder="ពិពណ៌នាអំពីសាជាតិ សាច់ធាតុនានា គ្រឿងផ្សំ និងអ្វីដែលធ្វើឱ្យមុខនេះពិសេស។ ជួយអ្នកដទៃស្គាល់ថាហេតុអ្វីគួរសាកល្បងមុខនេះ។"
//           className="w-full px-4 py-3 text-sm bg-[#F7F3EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//         />
//         <div className="flex justify-between text-xs text-gray-400 mt-1">
//           <span>Min. 50 characters recommended</span>
//           <span>
//             {description.length}/{DESC_MAX}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { UtensilsCrossed } from "lucide-react";

const NAME_MAX = 80;
const DESCRIPTION_MAX = 500;

interface FoodDetailsSectionProps {
  foodName: string;
  onFoodNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export default function FoodDetailsSection({
  foodName,
  onFoodNameChange,
  description,
  onDescriptionChange,
}: FoodDetailsSectionProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <UtensilsCrossed size={20} className="text-[#136C34]" />
        <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
          ព័ត៌មានលម្អិតអំពីអាហារ
        </h2>
      </div>

      <div>
        <label
          htmlFor="food-name"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          ឈ្មោះអាហារ <span className="text-red-500">*</span>
        </label>

        <input
          id="food-name"
          type="text"
          value={foodName}
          maxLength={NAME_MAX}
          onChange={(event) => onFoodNameChange(event.target.value)}
          placeholder="ឧទាហរណ៍៖ គុយទាវសាច់គោ"
          className="w-full rounded-xl bg-[#F7F3EC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <p className="mt-1 text-right text-xs text-gray-400">
          {foodName.length}/{NAME_MAX}
        </p>
      </div>

      <div>
        <label
          htmlFor="food-description"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          ការពិពណ៌នា <span className="text-red-500">*</span>
        </label>

        <textarea
          id="food-description"
          value={description}
          maxLength={DESCRIPTION_MAX}
          onChange={(event) => onDescriptionChange(event.target.value)}
          rows={5}
          placeholder="ពិពណ៌នាអំពីរសជាតិ គ្រឿងផ្សំ និងអ្វីដែលធ្វើឱ្យម្ហូបនេះពិសេស។"
          className="w-full resize-none rounded-xl bg-[#F7F3EC] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>Min. 50 characters recommended</span>
          <span>
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
      </div>
    </section>
  );
}
