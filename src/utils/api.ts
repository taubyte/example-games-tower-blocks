// Frontend now uses relative API paths; no base URL needed.
export function getApiBaseUrl(): string {
  return import.meta.env.APP_API_BASE_URL
    ? import.meta.env.APP_API_BASE_URL
    : window.location.origin;
}
