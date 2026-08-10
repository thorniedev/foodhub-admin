
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
