export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  order: number;
  status: "active" | "inactive";
  createdAt: string;
}

// Fields the create/edit form is allowed to send
export type BannerFormData = Omit<Banner, "id" | "createdAt">;
