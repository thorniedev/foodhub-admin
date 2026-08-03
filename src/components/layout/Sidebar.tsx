// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { ChevronDown, Settings } from "lucide-react";
// import { dashboardNav } from "../../config/dashboardNav";
// import type { NavItem } from "../../config/dashboardNav";

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [openMenus, setOpenMenus] = useState<string[]>(["ប្រភេទអាហារ"]);

//   const toggleMenu = (label: string) => {
//     setOpenMenus((prev) =>
//       prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
//     );
//   };

//   const renderItem = (item: NavItem) => {
//     const Icon = item.icon;

//     if (item.children) {
//       const isOpen = openMenus.includes(item.label);
//       return (
//         <div key={item.label}>
//           <button
//             onClick={() => toggleMenu(item.label)}
//             className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
//           >
//             <span className="flex items-center gap-3 text-lg font-medium">
//               <Icon size={22} />
//               {item.label}
//             </span>
//             <ChevronDown
//               size={16}
//               className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
//             />
//           </button>
//           {isOpen && (
//             <div className="ml-9 mt-1 space-y-1">
//               {item.children.map((child) => (
//                 <Link
//                   key={child.href}
//                   href={child.href}
//                   className={`block px-3 py-2 rounded-lg text-sm transition ${
//                     pathname === child.href
//                       ? "text-[#136C34] font-medium"
//                       : "text-gray-500 hover:bg-gray-50"
//                   }`}
//                 >
//                   {child.label}
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       );
//     }

//     const isActive = item.href === pathname;
//     return (
//       <Link
//         key={item.label}
//         href={item.href ?? "#"}
//         className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-lg font-medium transition ${
//           isActive
//             ? "bg-[#136C34] text-white"
//             : "text-gray-700 hover:bg-gray-50"
//         }`}
//       >
//         <Icon size={18} />
//         {item.label}
//       </Link>
//     );
//   };

//   return (
//     <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between">
//       <div>
//         <div className="h-20 flex items-center px-6">
//           <Image src="/Image/logo.png" alt="FoodHub" width={90} height={90} />
//         </div>

//         <nav className="px-3 mt-2 space-y-1">
//           {dashboardNav.map(renderItem)}
//         </nav>
//       </div>

//       <div className="px-3 pb-4 space-y-1">
//         <Link
//           href="/dashboard/settings"
//           className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
//         >
//           <Settings size={18} />
//           ការកំណត់
//         </Link>
//         <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
//           <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-semibold">
//             A
//           </div>
//           <div className="text-sm">
//             <p className="font-medium text-gray-800">Admin</p>
//             <p className="text-xs text-gray-400">foodhub@gmail.com</p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }
















// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import {
//   LayoutGrid,
//   Store,
//   Users,
//   Layers,
//   Globe,
//   Settings,
//   ChevronDown,
//   X,
// } from "lucide-react";
// import { DASHBOARD_NAV, NAV_FOOTER, NavGroup } from "../../config/dashboardNav";
// import { useSidebar } from "../../context/SidebarContext";

// const ICON_MAP = {
//   grid: LayoutGrid,
//   shop: Store,
//   users: Users,
//   layers: Layers,
//   globe: Globe,
//   settings: Settings,
// };

// function NavGroupItem({ group }: { group: NavGroup }) {
//   const pathname = usePathname();
//   const { close } = useSidebar();
//   const Icon = ICON_MAP[group.icon];

//   const hasChildren = !!group.children?.length;
//   const isChildActive = group.children?.some((c) => pathname.startsWith(c.href));
//   const [expanded, setExpanded] = useState(isChildActive ?? false);

//   const isActive = group.href ? pathname === group.href : isChildActive;

//   if (!hasChildren && group.href) {
//     return (
//       <Link
//         href={group.href}
//         onClick={close}
//         className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
//           isActive
//             ? "bg-emerald-700 text-white"
//             : "text-emerald-50 hover:bg-emerald-800/60"
//         }`}
//       >
//         <Icon size={18} />
//         {group.label}
//       </Link>
//     );
//   }

//   return (
//     <div>
//       <button
//         onClick={() => setExpanded((prev) => !prev)}
//         className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
//           isActive ? "text-white" : "text-emerald-50 hover:bg-emerald-800/60"
//         }`}
//       >
//         <span className="flex items-center gap-3">
//           <Icon size={18} />
//           {group.label}
//         </span>
//         <ChevronDown
//           size={16}
//           className={`transition-transform ${expanded ? "rotate-180" : ""}`}
//         />
//       </button>

//       {expanded && (
//         <div className="ml-9 mt-1 flex flex-col gap-1">
//           {group.children?.map((child) => {
//             const childActive = pathname === child.href;
//             return (
//               <Link
//                 key={child.href}
//                 href={child.href}
//                 onClick={close}
//                 className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
//                   childActive
//                     ? "bg-emerald-700 text-white"
//                     : "text-emerald-100 hover:bg-emerald-800/60"
//                 }`}
//               >
//                 {child.label}
//               </Link>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// export default function Sidebar() {
//   const { isOpen, close } = useSidebar();

//   return (
//     <>
//       {isOpen && (
//         <div
//           onClick={close}
//           className="fixed inset-0 bg-black/40 z-40 lg:hidden"
//         />
//       )}

//       <aside
//         className={`fixed lg:static top-0 left-0 h-screen w-64 bg-emerald-900 flex flex-col z-50 transition-transform duration-300 ease-in-out
//           ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
//       >
//         <div className="flex items-center justify-between px-5 py-5">
//           <Link href="/" onClick={close} className="flex items-center gap-2">
//             <Image src="/Image/logo.png" alt="FoodHub" width={36} height={36} />
//             <span className="text-white font-bold text-lg">ហ្គូបហាប់</span>
//           </Link>
//           <button
//             onClick={close}
//             className="lg:hidden text-emerald-100 hover:text-white"
//           >
//             <X size={22} />
//           </button>
//         </div>

//         <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-1">
//           {DASHBOARD_NAV.map((group) => (
//             <NavGroupItem key={group.label} group={group} />
//           ))}
//         </nav>

//         <div className="px-3 pb-4 flex flex-col gap-1 border-t border-emerald-800 pt-3">
//           <Link
//             href={NAV_FOOTER.href}
//             onClick={close}
//             className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-emerald-50 hover:bg-emerald-800/60"
//           >
//             <Settings size={18} />
//             {NAV_FOOTER.label}
//           </Link>

//           <div className="flex items-center gap-2 px-4 py-3 mt-1 bg-emerald-800/40 rounded-lg">
//             <div className="w-8 h-8 rounded-full bg-white text-emerald-800 flex items-center justify-center text-sm font-bold">
//               A
//             </div>
//             <div className="min-w-0">
//               <p className="text-sm font-medium text-white truncate">Admin</p>
//               <p className="text-xs text-emerald-200 truncate">
//                 foodhub@gmail.com
//               </p>
//             </div>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }



"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Settings, X } from "lucide-react";
import { dashboardNav } from "../../config/dashboardNav";
import type { NavItem } from "../../config/dashboardNav";
import { useSidebar } from "../../context/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [openMenus, setOpenMenus] = useState<string[]>(["ប្រភេទអាហារ"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;

    if (item.children) {
      const isOpenMenu = openMenus.includes(item.label);
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleMenu(item.label)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <span className="flex items-center gap-3 text-lg font-medium">
              <Icon size={22} />
              {item.label}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                isOpenMenu ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpenMenu && (
            <div className="ml-9 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={close}
                  className={`block px-3 py-2 rounded-lg text-sm transition ${
                    pathname === child.href
                      ? "text-[#136C34] font-medium"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    const isActive = item.href === pathname;
    return (
      <Link
        key={item.label}
        href={item.href ?? "#"}
        onClick={close}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-lg font-medium transition ${
          isActive ? "bg-[#136C34] text-white" : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div>
          <div className="h-20 flex items-center justify-between px-6">
            <Image
              src="/Image/logo.png"
              alt="FoodHub"
              width={90}
              height={90}
            />
            <button
              onClick={close}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="px-3 mt-2 space-y-1">
            {dashboardNav.map(renderItem)}
          </nav>
        </div>

        <div className="px-3 pb-4 space-y-1">
          <Link
            href="/settings"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Settings size={18} />
            ការកំណត់
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800">Admin</p>
              <p className="text-xs text-gray-400">foodhub@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}