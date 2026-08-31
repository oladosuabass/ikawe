import type { ExtractBookErrorResponse, ExtractedBookResponse } from "~/types/extract";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const formData = await readFormData(event);
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw createError({
      statusCode: 400,
      statusMessage: "No file uploaded",
    });
  }

  const upstream = new FormData();
  upstream.append("file", file, file.name);

  try {
    return await $fetch<ExtractedBookResponse>(
      `${config.t2sApiBase}/ikawe/extract-book`,
      {
        method: "POST",
        body: upstream,
      },
    );
  } catch (error) {
    const message =
      typeof error === "object" &&
      error &&
      "data" in error &&
      typeof (error as { data?: ExtractBookErrorResponse }).data?.error ===
        "string"
        ? (error as { data: ExtractBookErrorResponse }).data.error
        : "Could not extract text from this file.";

    throw createError({
      statusCode: 502,
      statusMessage: message,
    });
  }
});
