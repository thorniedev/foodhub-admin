export interface WeatherCondition {
  id?: number;
  uuid: string;

  code: string;
  name: string;

  localName?: string | null;
  description?: string | null;

  isActive?: boolean;
  active?: boolean;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateWeatherConditionPayload {
  code: string;
  name: string;
  localName?: string | null;
  description?: string | null;
  isActive?: boolean;
  active?: boolean;
}

export interface UpdateWeatherConditionPayload {
  code?: string;
  name?: string;
  localName?: string | null;
  description?: string | null;
  isActive?: boolean;
  active?: boolean;
}

export interface WeatherConditionListParams {
  page?: number;
  size?: number;
  sort?: string;
  query?: string;
  includeInactive?: boolean;
}

export interface WeatherConditionPage {
  contents: WeatherCondition[];

  pageNumber: number;
  pageSize: number;
  numberOfElements: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;
  empty: boolean;
}
