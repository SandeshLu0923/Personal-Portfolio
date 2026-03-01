export const fetchJson = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const isJson = response.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json");

    const body = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error(body?.error || "Request failed.");
    }

    return body;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Request timed out. If this is Render free tier cold start, wait a few seconds and retry."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
