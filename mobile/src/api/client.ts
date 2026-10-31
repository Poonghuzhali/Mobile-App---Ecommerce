import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_CONNECT_HINT } from '../config';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !(original as { _retry?: boolean })._retry) {
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) {
        (original as { _retry?: boolean })._retry = true;
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
          useAuthStore.getState().setTokens(data.access, refresh);
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const code = error.code ?? '';
      if (code === 'ECONNABORTED') {
        return `Request timed out. API: ${API_BASE_URL}\n\n${API_CONNECT_HINT}`;
      }
      return `Cannot reach server at ${API_BASE_URL}. ${API_CONNECT_HINT}`;
    }
    const data = error.response?.data as Record<string, unknown> | string | undefined;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') return data.detail;
      const first = Object.values(data)[0];
      if (Array.isArray(first) && first[0]) return String(first[0]);
      if (typeof first === 'string') return first;
    }
  }
  return fallback;
}
