export function getMenuItemApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    if ("data" in error) {
      const data = (error as { data?: unknown }).data;

      if (typeof data === "string" && data.trim()) {
        return data;
      }

      if (typeof data === "object" && data !== null) {
        const objectData = data as Record<string, unknown>;
        const message = objectData.message;
        const errorMessage = objectData.error;

        if (typeof message === "string" && message.trim()) {
          return message;
        }

        if (typeof errorMessage === "string" && errorMessage.trim()) {
          return errorMessage;
        }
      }
    }

    if ("error" in error) {
      const value = (error as { error?: unknown }).error;
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "មិនអាចបំពេញសំណើបានទេ។ សូមសាកល្បងម្តងទៀត។";
}
