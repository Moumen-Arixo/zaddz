export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  // Translate standard backend paths (/api/settings, /api/courses) to Netlify Function paths if needed
  if (!import.meta.env.VITE_API_BASE_URL && window.location.hostname.includes("netlify.app")) {
      let updatedEndpoint = endpoint;
      if (endpoint === "/api/settings") {
          updatedEndpoint = "/theme";
      } else if (endpoint === "/api/courses") {
          updatedEndpoint = "/courses";
      } else if (endpoint.startsWith("/api/gdrive")) {
          updatedEndpoint = "/gdrive"; // The gdrive.ts file will handle all methods
      } else {
          // Route remaining items to api.ts Netlify function and preserve the path inside it
          updatedEndpoint = `/api${endpoint}`;
      }
      const url = `/.netlify/functions${updatedEndpoint}`;
      return fetch(url, options);
  }

  // Vercel / Standard Node.js backend
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const url = `${baseUrl}${endpoint}`;
  return fetch(url, options);
};
