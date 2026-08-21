import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function messageFromData(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data;
  if (!isObject(data)) return null;

  for (const key of ["message", "detail", "error", "error_description"]) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return isObject(data.data) ? messageFromData(data.data) : null;
}

export function getShopApiErrorMessage(error: unknown): string {
  if (!error) return "មានបញ្ហាមិនស្គាល់។ សូមសាកល្បងម្តងទៀត។";

  if (isObject(error) && "status" in error) {
    const queryError = error as FetchBaseQueryError;
    const backendMessage =
      "data" in queryError ? messageFromData(queryError.data) : null;

    if (backendMessage) return backendMessage;

    switch (queryError.status) {
      case 400:
        return "ទិន្នន័យមិនត្រឹមត្រូវ។ សូមពិនិត្យ form ម្តងទៀត។";
      case 401:
        return "Admin session មិនត្រឹមត្រូវ ឬ token បានផុតកំណត់។";
      case 403:
        return "គណនីនេះមិនមានសិទ្ធិ ADMIN សម្រាប់ហាង endpoint នេះទេ។";
      case 404:
        return "រកមិនឃើញ Store ដែលបានស្នើ។";
      case 409:
        return "Store ឬ email នេះមានរួចហើយ ឬមាន conflict។";
      case "FETCH_ERROR":
        return "មិនអាចភ្ជាប់ទៅ FoodHub backend បានទេ។";
      default:
        return `សំណើបរាជ័យ (${String(queryError.status)})។`;
    }
  }

  return error instanceof Error ? error.message : "ប្រតិបត្តិការបរាជ័យ។";
}
