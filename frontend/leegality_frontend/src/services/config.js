// backend url, defaults to relative /api in production and localhost in dev
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export const API_URL = API_BASE_URL;

export default API_BASE_URL;

