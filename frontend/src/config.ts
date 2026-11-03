const rawUri = import.meta.env.VITE_BACKEND_URI;

if (!rawUri) {
  throw new Error("VITE_BACKEND_URI is not configured");
}
                    
export const BACKEND_URI = rawUri.replace(/\/+$/, "");