// import { LucideIcon } from "lucide-react";

// // ---------- Sidebar ----------
// export interface SidebarSubItem {
//   label: string;
//   href: string;
// }

// export interface SidebarNavItem {
//   label: string;
//   href?: string;
//   icon: LucideIcon;
//   children?: SidebarSubItem[];
// }

// // ---------- Stat Cards ----------
// export interface StatCardData {
//   id: string;
//   label: string;
//   value: string;
//   subLabel?: string;
//   icon: string; // key used to map to an icon component
//   iconBg: string; // tailwind bg color class
// }

// // ---------- Line Chart (User Growth) ----------
// export interface UserGrowthPoint {
//   month: string;
//   users: number;
// }

// // ---------- Donut Chart (User Status) ----------
// export interface UserStatusSegment {
//   label: string;
//   value: number;
//   color: string;
// }

// // ---------- Bar Chart (Orders) ----------
// export interface OrdersPoint {
//   month: string;
//   orders: number;
// }

// // ---------- Full dashboard data shape ----------
// export interface DashboardData {
//   stats: StatCardData[];
//   userGrowth: UserGrowthPoint[];
//   userStatus: UserStatusSegment[];
//   ordersOverTime: OrdersPoint[];
// }

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  subLabel?: string;
  icon: string;
  iconBg: string;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
}

export interface UserStatusSegment {
  label: string;
  value: number;
  color: string;
}

export interface OrdersPoint {
  month: string;
  orders: number;
}

export interface DashboardData {
  stats: StatCardData[];
  userGrowth: UserGrowthPoint[];
  userStatus: UserStatusSegment[];
  ordersOverTime: OrdersPoint[];
}