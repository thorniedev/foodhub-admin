import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type MaybeRecord = Record<string, unknown>;

function isRecord(value: unknown): value is MaybeRecord {
  return typeof value === "object" && value !== null;
}

function extractFieldErrors(data: MaybeRecord): string[] {
  const messages: string[] = [];

  if (data.fieldErrors && typeof data.fieldErrors === "object") {
    if (Array.isArray(data.fieldErrors)) {
      for (const item of data.fieldErrors) {
        if (typeof item === "string" && item.trim()) {
          messages.push(item.trim());
        } else if (item && typeof item === "object") {
          const f = item as { field?: string; message?: string; error?: string };
          const text = f.message || f.error;
          if (text) {
            messages.push(f.field ? `${f.field}: ${text}` : text);
          }
        }
      }
    } else {
      for (const [field, error] of Object.entries(data.fieldErrors)) {
        if (typeof error === "string" && error.trim()) {
          messages.push(`${field}: ${error.trim()}`);
        } else if (Array.isArray(error)) {
          const text = error.filter(Boolean).join(", ");
          if (text) messages.push(`${field}: ${text}`);
        }
      }
    }
  }

  if (data.errors && typeof data.errors === "object") {
    if (Array.isArray(data.errors)) {
      for (const item of data.errors) {
        if (typeof item === "string" && item.trim()) {
          messages.push(item.trim());
        } else if (item && typeof item === "object") {
          const f = item as { field?: string; message?: string; defaultMessage?: string };
          const text = f.message || f.defaultMessage;
          if (text) {
            messages.push(f.field ? `${f.field}: ${text}` : text);
          }
        }
      }
    } else {
      for (const [field, error] of Object.entries(data.errors)) {
        if (typeof error === "string" && error.trim()) {
          messages.push(`${field}: ${error.trim()}`);
        }
      }
    }
  }

  return messages;
}

function readMessage(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (!isRecord(data)) {
    return null;
  }

  const fieldErrors = extractFieldErrors(data);
  if (fieldErrors.length > 0) {
    return fieldErrors.join(" | ");
  }

  for (const key of ["message", "detail", "error", "error_description", "description"]) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

export function getAdminApiErrorMessage(error: unknown): string {
  if (!error) {
    return "មានបញ្ហាមិនស្គាល់។ សូមសាកល្បងម្តងទៀត។";
  }

  if (isRecord(error) && "status" in error) {
    const queryError = error as FetchBaseQueryError;
    const backendMessage = "data" in queryError ? readMessage(queryError.data) : null;

    if (backendMessage) {
      return backendMessage;
    }

    if (queryError.status === 400) {
      return "ទិន្នន័យដែលបានផ្ញើមិនត្រឹមត្រូវ។ សូមពិនិត្យម្តងទៀត។";
    }

    if (queryError.status === 401) {
      return "សម័យចូលប្រើបានផុតកំណត់ ឬមិនមាន Admin token ត្រឹមត្រូវ។ សូមចូលប្រើម្តងទៀត។";
    }

    if (queryError.status === 403) {
      return "គណនីនេះមិនមានសិទ្ធិ ADMIN សម្រាប់ប្រតិបត្តិការនេះទេ។";
    }

    if (queryError.status === 404) {
      return "រកមិនឃើញទិន្នន័យដែលបានស្នើ។";
    }

    if (queryError.status === 409) {
      return "ប្រតិបត្តិការនេះប៉ះទង្គិចជាមួយទិន្នន័យដែលមានស្រាប់។";
    }

    if (queryError.status === "FETCH_ERROR") {
      return "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។ សូមពិនិត្យ backend និង network។";
    }

    return `សំណើបរាជ័យ (${String(queryError.status)})។`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "មានបញ្ហាក្នុងការដំណើរការ។ សូមសាកល្បងម្តងទៀត។";
}
