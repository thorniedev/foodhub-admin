export interface Banner {
  id: string;
  location: string;
  name: string;
  description: string;
  image_url: string;
  isdisplay?: boolean;
}

export type BannerFormData = Omit<Banner, "id">;
