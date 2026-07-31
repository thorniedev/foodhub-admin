// export type ShopStatus = "active" | "stopped" | "banned";

// export interface Shop {
//   id: number;
//   name: string;
//   phone: string;
//   province: string;
//   address: string;
//   latitude: number;
//   longitude: number;
//   googleMapUrl: string;
//   openingHours: string;
//   closingHours: string;
//   rating: number;
//   logo: string;
//   coverImage: string;
//   status: ShopStatus;
// }




// export type ShopStatus = "active" | "pending" | "disabled";

// export interface Shop {
//   id: string;
//   images: string[];
//   name: string;
//   address: string;
//   openTime: string;
//   closeTime: string;
//   description: string;
//   socialLink: string;
//   latitude: number | null;
//   longitude: number | null;
//   status: ShopStatus;
// }

// export type CreateShopPayload = Omit<Shop, "id" | "status"> & {
//   status: "draft" | "published";
// };



export type ShopStatus = "active" | "stopped" | "banned";

export interface Shop {
  id: string;
  logo: string;
  name: string;
  rating: number;
  openingHours: string;
  closingHours: string;
  province: string;
  address: string;
  phone: string;
  status: ShopStatus;
}