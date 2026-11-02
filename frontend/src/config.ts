const rawUri = import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";
export const BACKEND_URI = rawUri.replace(/\/+$/, "");