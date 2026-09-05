const fs = require('fs');
const path = 'src/components/shops/ShopsManager.tsx';
let content = fs.readFileSync(path, 'utf8');

const countsBlockMatch = content.match(/\/\* Dynamic counts:[\s\S]*?};\r?\n/);
if (countsBlockMatch) {
  content = content.replace(countsBlockMatch[0], '');
  
  const newCountsBlock = '\n  /* Dynamic counts: Uses main query total for active tab and skips duplicate requests */\n  const counts = {\n    all: filter === "ALL" && hasActiveFilters ? filteredStores.length : filter === "ALL" ? (allStoresData?.length ?? 0) : (allData?.totalElements ?? 0),\n    approved: filter === "APPROVED" && hasActiveFilters ? filteredStores.length : filter === "APPROVED" ? (allStoresData?.length ?? 0) : (approvedData?.totalElements ?? 0),\n    pending: filter === "PENDING" && hasActiveFilters ? filteredStores.length : filter === "PENDING" ? (allStoresData?.length ?? 0) : (pendingData?.totalElements ?? 0),\n    rejected: filter === "REJECTED" && hasActiveFilters ? filteredStores.length : filter === "REJECTED" ? (allStoresData?.length ?? 0) : (rejectedData?.totalElements ?? 0),\n  };\n';

  content = content.replace('const sortedStores = useMemo', newCountsBlock + '\n  const sortedStores = useMemo');
  fs.writeFileSync(path, content, 'utf8');
} else {
  console.error("Could not find counts block");
}