// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { ChevronDown, Settings } from "lucide-react";
// import { dashboardFooterNav, dashboardNav } from "../../config/dashboardNav";


// export default function Sidebar() {
//   const pathname = usePathname();
//   const [openMenus, setOpenMenus] = useState<string[]>(["អ្នកប្រើប្រាស់", "ប្រភេទអាហារ"]);

//   const toggleMenu = (label: string) => {
//     setOpenMenus((prev) =>
//       prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
//     );
//   };

//   return (
//     <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between">
//       <div>
//         {/* Logo */}
//         <div className="h-20 flex items-center px-6">
//           <Image src="/Image/logo.png" alt="FoodHub" width={40} height={40} />
//         </div>

//         {/* Nav */}
//         <nav className="px-3 mt-2 space-y-1">
//           {dashboardNav.map((item) => {
//             const Icon = item.icon;
//             const isActive = item.href === pathname;
//             const isOpen = openMenus.includes(item.label);

//             if (item.children) {
//               return (
//                 <div key={item.label}>
//                   <button
//                     onClick={() => toggleMenu(item.label)}
//                     className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
//                   >
//                     <span className="flex items-center gap-3 text-sm font-medium">
//                       <Icon size={18} />
//                       {item.label}
//                     </span>
//                     <ChevronDown
//                       size={16}
//                       className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
//                     />
//                   </button>
//                   {isOpen && (
//                     <div className="ml-9 mt-1 space-y-1">
//                       {item.children.map((child) => (
//                         <Link
//                           key={child.href}
//                           href={child.href}
//                           className={`block px-3 py-2 rounded-lg text-sm transition ${
//                             pathname === child.href
//                               ? "text-emerald-700 font-medium"
//                               : "text-gray-500 hover:bg-gray-50"
//                           }`}
//                         >
//                           {child.label}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               );
//             }

//             return (
//               <Link
//                 key={item.label}
//                 href={item.href ?? "#"}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
//                   isActive
//                     ? "bg-yellow-400 text-gray-900"
//                     : "text-gray-700 hover:bg-gray-50"
//                 }`}
//               >
//                 <Icon size={18} />
//                 {item.label}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Footer nav (globe / feedback link) */}
//         <nav className="px-3 mt-6 space-y-1">
//           {dashboardFooterNav.map((item) => {
//             const Icon = item.icon;
//             return (
//               <Link
//                 key={item.label}
//                 href={item.href ?? "#"}
//                 className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
//               >
//                 <Icon size={18} />
//                 {item.label}
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Bottom: settings + profile */}
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
//             <p className="text-xs text-gray-400">admin@foodsite.com</p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }


// "use client";

// import { Search, Bell } from "lucide-react";
// import { usePathname } from "next/navigation";
// import { navRouteMap } from "../../config/dashboardNav";

// export default function Topbar() {
//   const pathname = usePathname();
//   const title = navRouteMap[pathname] ?? "ផ្ទាំងគ្រប់គ្រង";

//   return (
//     <header className="h-20 flex items-center justify-between px-8 border-b border-gray-100 bg-white">
//       <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

//       <div className="flex-1 max-w-xl mx-8">
//         <div className="relative">
//           <Search
//             size={18}
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
//           />
//           <input
//             type="text"
//             placeholder="ស្វែងរកម្ហូបអាហារ និង ភៅជនីយដ្ឋាន..."
//             className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
//           />
//         </div>
//       </div>

//       <div className="flex items-center gap-5">
//         <button className="relative text-gray-500 hover:text-gray-700">
//           <Bell size={20} />
//           <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500" />
//         </button>
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-semibold">
//             A
//           </div>
//           <span className="text-sm font-medium text-gray-700">Admin</span>
//         </div>
//       </div>
//     </header>
//   );
// }
















"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Settings } from "lucide-react";
import { dashboardFooterNav, dashboardNav } from "../../config/dashboardNav";

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["ប្រភេទអាហារ"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between">
      <div>
        <div className="h-20 flex items-center px-6">
          <Image src="/Image/logo.png" alt="FoodHub" width={40} height={40} />
        </div>

        <nav className="px-3 mt-2 space-y-1">
          {dashboardNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === pathname;
            const isOpen = openMenus.includes(item.label);

            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <Icon size={18} />
                      {item.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition ${
                            pathname === child.href
                              ? "text-emerald-700 font-medium"
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

            return (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-yellow-400 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <nav className="px-3 mt-6 space-y-1">
          {dashboardFooterNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 pb-4 space-y-1">
        <Link
          href="/dashboard/settings"
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
            <p className="text-xs text-gray-400">admin@foodsite.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}