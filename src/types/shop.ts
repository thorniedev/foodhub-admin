export type ShopStatus = "active" | "stopped" | "banned";

export interface Shop {
  id: number;
  name: string;
  phone: string;
  province: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMapUrl: string;
  openingHours: string;
  closingHours: string;
  rating: number;
  logo: string;
  coverImage: string;
  status: ShopStatus;
}