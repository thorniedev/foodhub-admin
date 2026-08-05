// import CreateFoodForm from "@/src/components/food-types/create/CreateFoodForm";

// export default function CreateFoodPage() {
//   return <CreateFoodForm />;
// }



import CreateMenuItemForm from "../../../../../components/menu-items/create/CreateMenuItemForm";

export default function CreateFoodPage() {
  return <CreateMenuItemForm kind="food" redirectTo="/food-types/dishes" />;
}