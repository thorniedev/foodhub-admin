export type UserRole = "customer" | "seller";
export type UserStatus = "active" | "pending" | "suspended";

export interface AppUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  joinDate: string;
  status: UserStatus;
  shopName?: string; // only for sellers
}