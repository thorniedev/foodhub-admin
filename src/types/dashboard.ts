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