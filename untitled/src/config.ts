export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};
