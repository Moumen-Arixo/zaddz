export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/.netlify/functions";

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  // Translate standard backend paths (/api/settings, /api/courses) to Netlify Function paths if needed
  let updatedEndpoint = endpoint;
  if (!import.meta.env.VITE_API_BASE_URL) {
      if (endpoint === "/api/settings") {
          updatedEndpoint = "/theme";
      } else if (endpoint === "/api/courses") {
          updatedEndpoint = "/courses";
      } else if (endpoint.startsWith("/api/gdrive")) {
          updatedEndpoint = "/gdrive"; // The gdrive.ts file will handle all methods
      } else {
          // Route remaining items to api.ts Netlify function and preserve the path inside it
          // e.g., /api/ai/chat -> /.netlify/functions/api/api/ai/chat
          updatedEndpoint = `/api${endpoint}`;
      }
  }

  const url = `${API_BASE_URL}${updatedEndpoint}`;
  return fetch(url, options);
};
