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
  } finally {
    clearTimeout(timeoutId);
  }
};
