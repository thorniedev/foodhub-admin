export type StoreMediaPurpose = "STORE_LOGO" | "STORE_COVER";

export interface MediaFileResponse {
  uuid: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  widthPx: number | null;
  heightPx: number | null;
  createdAt: string;
}

export interface MediaApiError {
  message?: string;
  detail?: string;
  error?: string;
}
