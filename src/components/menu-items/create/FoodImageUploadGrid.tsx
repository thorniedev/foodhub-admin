"use client";

import MenuItemImageUploadGrid from "./MenuItemImageUploadGrid";

export default function FoodImageUploadGrid({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <MenuItemImageUploadGrid
      label="រូបភាព Food Catalog"
      values={values}
      onChange={onChange}
      mode="FOOD"
      maxImages={4}
    />
  );
}
