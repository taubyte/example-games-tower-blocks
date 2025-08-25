export enum Env {
  DEV = "development",
  PROD = "production",
}

export function getEnv(): Env {
  // Use Vite's environment variable system
  return import.meta.env.MODE === "development" ? Env.DEV : Env.PROD;
}

// Returns the API base URL configured via environment variable only.
// Only supports APP_API_BASE_URL (no defaults, no Vite-prefixed fallback).
export function getApiBaseUrl(): string {
  const base = import.meta.env.APP_API_BASE_URL as string | undefined;
  if (!base || base.trim().length === 0) {
    throw new Error(
      "APP_API_BASE_URL is not set. Please configure it in your .env file."
    );
  }
  return base.replace(/\/$/, "");
}
