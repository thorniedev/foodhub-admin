// "use client";

// import { useMemo } from "react";
// import { useGetMenuItemsQuery } from "../../../../store/menuItemApi";
// import { getUniqueStores } from "../../../../../lib/getUniqueStores";
// import { FoodDraft } from "@/src/components/food-types/create/ClassificationSection";
// import CreateFoodForm from "@/src/components/food-types/create/CreateFoodForm";

// export default function CreateFoodPage() {
//   const { data: menuItems = [] } = useGetMenuItemsQuery();
//   const restaurants = useMemo(() => getUniqueStores(menuItems), [menuItems]);

//   const handleSaveDraft = (data: FoodDraft) => {
//     console.log("draft", data);
//   };

//   const handlePublish = (data: FoodDraft) => {
//     console.log("publish", data);
//   };

//   return (
//     <div className="max-w-3xl mx-auto">
//       <CreateFoodForm
//         restaurants={restaurants}
//         onSaveDraft={handleSaveDraft}
//         onPublish={handlePublish}
//       />
//     </div>
//   );
// }


"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { useGetMenuItemsQuery } from "@/src/app/store/menuItemApi";
import CreateFoodForm from "@/src/components/food-types/create/CreateFoodForm";
import { getUniqueStores } from "@/src/lib/getUniqueStores";

export default function CreateFoodPage() {
  const { data: menuItems = [], isLoading, isError } =
    useGetMenuItemsQuery();

  const restaurants = useMemo(
    () => getUniqueStores(menuItems),
    [menuItems],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        កំពុងផ្ទុកទិន្នន័យហាង...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
        មិនអាចទាញយកទិន្នន័យហាងបានទេ។
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CreateFoodForm restaurants={restaurants} />
    </div>
  );
}
