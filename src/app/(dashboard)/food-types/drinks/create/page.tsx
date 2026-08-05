// import CreateDrinkForm from "@/src/components/drinks/create/CreateDrinkForm";

// export default function CreateDrinkPage() {
//   return <CreateDrinkForm />;
// }



import CreateMenuItemForm from "../../../../../components/menu-items/create/CreateMenuItemForm";

export default function CreateDrinkPage() {
  return <CreateMenuItemForm kind="drink" redirectTo="/food-types/drinks" />;
}