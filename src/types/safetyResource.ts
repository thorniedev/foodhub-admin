export interface PagedResponse<T> {
  contents: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ListParams {
  page?: number;
  size?: number;
}

export type ResourceStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export interface ApiMessage {
  type: "success" | "error";
  text: string;
}

export function getApiErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេ។";
  }

  const apiError = error as {
    status?: number | string;
    error?: string;
    data?: unknown;
  };

  if (apiError.status === 401) {
    return "401 - សូមចូលប្រើជាគណនី Admin ម្តងទៀត។";
  }

  if (apiError.status === 403) {
    return "403 - គណនីនេះមិនមានសិទ្ធិ ADMIN សម្រាប់ប្រតិបត្តិការនេះទេ។";
  }

  if (apiError.status === 404) {
    return "404 - រកមិនឃើញ API endpoint ដែលបានស្នើ។";
  }

  if (apiError.status === 409) {
    let detail = "";
    if (typeof apiError.data === "object" && apiError.data !== null) {
      const data = apiError.data as Record<string, unknown>;
      detail = String(data.message || data.error || data.detail || "");
    } else if (typeof apiError.data === "string") {
      detail = apiError.data;
    }
    return detail || "មិនអាចលុបជាអចិន្ត្រៃយ៍បានទេ ព្រោះទិន្នន័យនេះកំពុងត្រូវបានប្រើប្រាស់ដោយទិន្នន័យផ្សេងទៀតក្នុងប្រព័ន្ធ (ដូចជា Foods, User Profiles)។ សូមប្រើមុខងារ 'បិទដំណើរការ' ជំនួសវិញ។";
  }

  if (apiError.status === "FETCH_ERROR") {
    return `មិនអាចភ្ជាប់ទៅ Backend បានទេ${
      apiError.error ? `: ${apiError.error}` : ""
    }`;
  }

  if (typeof apiError.data === "string") {
    return apiError.data;
  }

  if (typeof apiError.data === "object" && apiError.data !== null) {
    const data = apiError.data as Record<string, unknown>;

    if (typeof data.message === "string") {
      return data.message;
    }

    if (typeof data.error === "string") {
      return data.error;
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }
  }

  if (apiError.status) {
    return `API Error: ${String(apiError.status)}`;
  }

  return "មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេ។";
}

export function formatAdminDate(value: string): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
