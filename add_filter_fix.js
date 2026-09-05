const fs = require('fs');
const path = 'src/components/shops/ShopsManager.tsx';
let content = fs.readFileSync(path, 'utf8');

const importStr = 'import { useGetPublishedMenuItemsQuery } from "@/src/app/store/menuManagementApi";';
content = content.replace('import type {', importStr + '\nimport type {');

const queryStr = '\n  const menuItemsQuery = useGetPublishedMenuItemsQuery({\n    page: 0,\n    size: 5000,\n  });\n\n  const storesWithMenu = useMemo(() => {\n    const s = new Set<string>();\n    (menuItemsQuery.data?.content || []).forEach(m => {\n       if (m.storeUuid) s.add(m.storeUuid);\n       else if (m.store?.uuid) s.add(m.store.uuid);\n    });\n    return s;\n  }, [menuItemsQuery.data]);\n';
content = content.replace('const { data: allData } = useGetShopsQuery(', queryStr + '\n  const { data: allData } = useGetShopsQuery(');

const filterLogic = '\n    // Menu filter\n    if (menuFilter !== "ALL") {\n      const hasMenu = storesWithMenu.has(store.uuid);\n      if (menuFilter === "HAS_MENU" && !hasMenu) return false;\n      if (menuFilter === "NO_MENU" && hasMenu) return false;\n    }\n';
content = content.replace(/\/\/ Menu filter[\s\S]*?(?=\/\/ Open\/Close filter)/, filterLogic + '\n    ');

fs.writeFileSync(path, content, 'utf8');