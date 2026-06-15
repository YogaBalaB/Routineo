// src/lib/api.ts
// Central API base URL — set VITE_API_URL in your .env file
// In production, we use a relative URL to support deployment on any domain/port
export const API_URL = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_URL ?? "http://localhost:3000");

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    if (response.ok) return {} as T;
    throw new Error(`Request failed with status ${response.status}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(response.ok ? `Invalid JSON response: ${text}` : text);
  }
}


