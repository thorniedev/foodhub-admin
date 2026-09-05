const fs = require('fs');
const path = 'src/components/shops/ShopsManager.tsx';
let content = fs.readFileSync(path, 'utf8');

const MENU_FILTER_OPTIONS = '\nconst MENU_FILTER_OPTIONS = [\n  { value: "ALL", label: "ស្ថានភាពមុខម្ហូបទាំងអស់" },\n  { value: "HAS_MENU", label: "មានមុខម្ហូប" },\n  { value: "NO_MENU", label: "គ្មានមុខម្ហូប" },\n];\n';
content = content.replace('const SORT_OPTIONS:', MENU_FILTER_OPTIONS + '\nconst SORT_OPTIONS:');

content = content.replace('const [openFilter, setOpenFilter] = useState<string>("ALL");', 'const [openFilter, setOpenFilter] = useState<string>("ALL");\n  const [menuFilter, setMenuFilter] = useState<string>("ALL");');

content = content.replace('const hasActiveFilters = cityFilter !== "ALL" || openFilter !== "ALL";', 'const hasActiveFilters = cityFilter !== "ALL" || openFilter !== "ALL" || menuFilter !== "ALL";');

content = content.replace('setOpenFilter("ALL");', 'setOpenFilter("ALL");\n    setMenuFilter("ALL");');

const filterLogic = '\n    // Menu filter\n    if (menuFilter !== "ALL") {\n      const count = store.menuItemCount || 0;\n      if (menuFilter === "HAS_MENU" && count === 0) return false;\n      if (menuFilter === "NO_MENU" && count > 0) return false;\n    }\n';
content = content.replace('// Open/Close filter', filterLogic + '\n    // Open/Close filter');

const selectComponent = '\n          <div className="w-full sm:w-[180px] lg:w-[210px]">\n            <CustomSelect\n              value={menuFilter}\n              onChange={(val) => { setMenuFilter(val); setPage(0); }}\n              options={MENU_FILTER_OPTIONS}\n              placeholder="ស្ថានភាពមុខម្ហូប"\n              pill\n            />\n          </div>\n';
content = content.replace('{/* Reset Filters Button */}', selectComponent + '\n          {/* Reset Filters Button */}');

fs.writeFileSync(path, content, 'utf8');