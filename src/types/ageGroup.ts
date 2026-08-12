export interface AgeGroup {
  id?: number;

  uuid: string;

  code: string;

  name: string;

  minAge: number;

  maxAge: number;

  description: string | null;

  isActive: boolean;

  createdAt?: string | null;

  updatedAt?: string | null;
}

export interface AgeGroupPage {
  contents: AgeGroup[];

  pageNumber: number;

  pageSize: number;

  totalElements: number;

  totalPages: number;

  first: boolean;

  last: boolean;
}

export interface GetAgeGroupsParams {
  page?: number;

  size?: number;

  sort?: string;
}

export interface AgeGroupFormValues {
  code: string;

  name: string;

  minAge: string;

  maxAge: string;

  description: string;

  isActive: boolean;
}

export interface CreateAgeGroupPayload {
  code: string;

  name: string;

  minAge: number;

  maxAge: number;

  description: string | null;

  isActive: boolean;
}

export type UpdateAgeGroupPayload =
  Partial<CreateAgeGroupPayload>;