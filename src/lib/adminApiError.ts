import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type MaybeRecord = Record<string, unknown>;

function isRecord(value: unknown): value is MaybeRecord {
  return typeof value === "object" && value !== null;
}

function readMessage(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (!isRecord(data)) {
    return null;
  }

  for (const key of ["message", "detail", "error", "error_description"]) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function translateBackendMessage(message: string): string {
  const clean = message.trim();

  if (clean.includes("User cannot be permanently deleted because the account is referenced by existing records")) {
    return "មិនអាចលុបគណនីអ្នកប្រើប្រាស់នេះចេញពីប្រព័ន្ធបានទេ ពីព្រោះមានទិន្នន័យពាក់ព័ន្ធ (កម្រងព័ត៌មាន/Profiles)។ សូមលុបកម្រងព័ត៌មានជាមុនសិន ឬបើក Cascade delete ក្នុង Backend។";
  }

  if (clean.includes("Email is already used") || clean.includes("email already exists")) {
    return "អ៊ីមែលនេះត្រូវបានប្រើប្រាស់រួចហើយ។ សូមប្រើអ៊ីមែលផ្សេងទៀត។";
  }

  if (clean.includes("Username is already used") || clean.includes("username already exists")) {
    return "ឈ្មោះគណនី (Username) នេះត្រូវបានប្រើប្រាស់រួចហើយ។";
  }

  if (clean.includes("User not found")) {
    return "រកមិនឃើញគណនីគណនីអ្នកប្រើប្រាស់នេះទេ។";
  }

  if (clean.includes("Profile not found")) {
    return "រកមិនឃើញកម្រងព័ត៌មាននេះទេ។";
  }

  return clean;
}

export function getAdminApiErrorMessage(error: unknown): string {
  if (!error) {
    return "មានបញ្ហាមិនស្គាល់។ សូមសាកល្បងម្តងទៀត។";
  }

  if (isRecord(error) && "status" in error) {
    const queryError = error as FetchBaseQueryError;
    const backendMessage = "data" in queryError ? readMessage(queryError.data) : null;

    if (backendMessage) {
      return translateBackendMessage(backendMessage);
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
