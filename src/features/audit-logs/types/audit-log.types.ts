export interface AuditLogDto {
  uuid: string;
  actorUserUuid: string | null;
  actionCode: string;
  entityType: string;
  entityId: number | null;
  beforeData: string | null; // JSON string or null
  afterData: string | null;  // JSON string or null
  ipAddress: string | null;
  userAgent: string | null;
  occurredAt: string;        // ISO 8601
}

export interface AuditLogFilterParams {
  actorUuid?: string;
  entityType?: string;
  actionCode?: string;
  entityId?: number;
  from?: string;             // ISO 8601
  to?: string;               // ISO 8601
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  contents: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  payload: T;
}

export type EntityType =
  | "STORE"
  | "FOOD"
  | "FOOD_CATEGORY"
  | "CUISINE"
  | "INGREDIENT"
  | "ALLERGEN"
  | "DIETARY_TYPE"
  | "MEDICAL_CONDITION";

export type BadgeColor = "blue" | "green" | "amber" | "red" | "purple" | "cyan";

export interface ActionCodeMetadata {
  code: string;
  entityType: EntityType;
  color: BadgeColor;
  label: string;
  description: string;
}
