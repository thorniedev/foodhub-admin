export function getIngredientApiErrorMessage(
  error: unknown,
): string {
  if (!error) {
    return "មានបញ្ហាក្នុងការភ្ជាប់ទៅម៉ាស៊ីនមេ។";
  }

  if (
    typeof error ===
      "string" &&
    error.trim()
  ) {
    return error;
  }

  if (
    typeof error !==
      "object" ||
    error === null
  ) {
    return "មានបញ្ហាក្នុងការដំណើរការសំណើ។";
  }

  const object =
    error as Record<
      string,
      unknown
    >;

  const data =
    object.data;

  if (
    typeof data ===
      "string" &&
    data.trim()
  ) {
    return data;
  }

  if (
    typeof data ===
      "object" &&
    data !== null
  ) {
    const body =
      data as Record<
        string,
        unknown
      >;

    const message =
      body.message ??
      body.error ??
      body.errorMessage ??
      body.error_description;

    if (
      typeof message ===
        "string" &&
      message.trim()
    ) {
      return message;
    }

    const fieldErrors =
      body.fieldErrors;

    if (
      Array.isArray(
        fieldErrors,
      )
    ) {
      const messages =
        fieldErrors
          .map((item) => {
            if (
              typeof item !==
                "object" ||
              item === null
            ) {
              return "";
            }

            const field =
              item as Record<
                string,
                unknown
              >;

            return String(
              field.message ??
                "",
            );
          })
          .filter(Boolean);

      if (
        messages.length >
        0
      ) {
        return messages.join(
          ", ",
        );
      }
    }
  }

  if (
    typeof object.error ===
      "string" &&
    object.error.trim()
  ) {
    return object.error;
  }

  if (
    typeof object.message ===
      "string" &&
    object.message.trim()
  ) {
    return object.message;
  }

  return "មានបញ្ហាក្នុងការដំណើរការសំណើគ្រឿងផ្សំ។";
}