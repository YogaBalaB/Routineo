// src/lib/api.ts
// Central API base URL — set VITE_API_URL in your .env file
// In production, we use a relative URL to support deployment on any domain/port
export const API_URL = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_URL ?? "http://localhost:3000");


