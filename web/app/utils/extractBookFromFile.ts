import type { ExtractBookErrorResponse, ExtractedBookResponse } from "~/types/extract";

export async function extractBookFromFile(
  file: File,
): Promise<ExtractedBookResponse> {
  const config = useRuntimeConfig();
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await $fetch<ExtractedBookResponse | ExtractBookErrorResponse>(
    "/api/books/extract",
    {
      method: "POST",
      body: formData,
    },
  );

  if ("error" in response) {
    throw new Error(response.error);
  }

  if (!response.content?.trim()) {
    throw new Error("No readable text was found in this file.");
  }

  return response;
}
