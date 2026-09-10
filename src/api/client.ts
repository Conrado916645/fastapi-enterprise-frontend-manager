import axios from 'axios';
import { ENDPOINTS, API_BASE_URL } from './urls';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Silent Refresh Logic ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 0. Network error — the request went out but no response came back at
    // all (server down, connection refused, DNS failure, timeout, etc). This
    // is what a crashed/unreachable backend looks like to axios; a 500 or a
    // CORS-blocked response due to a server-side error is NOT this — those
    // still have error.response and fall through to the checks below.
    if (!error.response && error.request) {
      window.dispatchEvent(new CustomEvent('BACKEND_OFFLINE'));
      return Promise.reject(error);
    }

    // 1. Detect Forced Password Change Requirement (403 Forbidden)
    if (error.response?.status === 403 && error.response?.data?.detail === 'PASSWORD_CHANGE_REQUIRED') {
      window.dispatchEvent(new CustomEvent('REQUIRE_PASSWORD_CHANGE'));
      return Promise.reject(error);
    }

    // 2. Handle 401 Unauthorized (Silent Refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Prevent infinite loops on auth endpoints
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        return handleLogout(error);
      }

      try {
        // Send refresh_token in the JSON body
        const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.auth.refreshToken}`, {
          refresh_token: refreshToken 
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        localStorage.setItem('access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return handleLogout(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout(error: any) {
  console.error("Session expired or invalid. Logging out.");
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'; 
  }
  return Promise.reject(error);
}