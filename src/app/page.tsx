// import Sidebar from "@/components/layout/Sidebar";
// import Topbar from "@/components/layout/Topbar";

// import Sidebar from "../components/layout/Sidebar";
// import Topbar from "../components/layout/Topbar";

// export default function DashboardLayout({
//   children,
//   stats,
//   growth,
//   status,
//   orders,
// }: {
//   children: React.ReactNode;
//   stats: React.ReactNode;
//   growth: React.ReactNode;
//   status: React.ReactNode;
//   orders: React.ReactNode;
// }) {
//   return (
//     <div className="h-screen w-full overflow-hidden bg-gray-50 flex">
//       {/* Sidebar: fixed width, full height, never scrolls with content */}
//       <div className="h-screen shrink-0">
//         <Sidebar />
//       </div>

//       {/* Right column: Topbar fixed at top, only this area scrolls */}
//       <div className="flex-1 h-screen flex flex-col overflow-hidden">
//         <Topbar />

//         <div className="flex-1 overflow-y-auto p-6 space-y-6">
//           {/* @stats slot */}
//           {stats}

//           {/* @growth + @status slots side by side */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//             <div className="lg:col-span-2">{growth}</div>
//             {status}
//           </div>

//           {/* @orders slot */}
//           {orders}

//           {/* implicit children slot (dashboard/page.tsx) */}
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }


export default function RootPage() {
  return null;
}
