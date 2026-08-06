// import { MenuItem } from "../types/menuItem";

// export interface StoreOption {
//   id: string;
//   name: string;
// }

// export function getUniqueStores(items: MenuItem[]): StoreOption[] {
//   const seen = new Map<string, StoreOption>();
//   for (const item of items) {
//     if (!seen.has(item.store.uuid)) {
//       seen.set(item.store.uuid, {
//         id: item.store.uuid,
//         name: item.store.localName || item.store.name,
//       });
//     }
//   }
//   return Array.from(seen.values());
// }


import type { MenuItem, StoreRef } from "@/src/types/menuItem";

export function getUniqueStores(menuItems: MenuItem[]): StoreRef[] {
  const storesByUuid = new Map<string, StoreRef>();

  for (const item of menuItems) {
    if (!item.store?.uuid) {
      continue;
    }

    if (!storesByUuid.has(item.store.uuid)) {
      storesByUuid.set(item.store.uuid, item.store);
    }
  }

  return Array.from(storesByUuid.values()).sort((first, second) => {
    const firstName = first.localName?.trim() || first.name;
    const secondName = second.localName?.trim() || second.name;

    return firstName.localeCompare(secondName);
  });
}
