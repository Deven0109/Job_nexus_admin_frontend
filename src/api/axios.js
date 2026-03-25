import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5600/api';
export const BASE_URL = API_URL.replace('/api', '');

/**
 * Axios instance with base URL and interceptors
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Tunnel-Skip-Header': 'true',
    },
    withCredentials: true, // Send cookies for refresh token
});

/**
 * Request interceptor
 * Attaches access token to every request
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jobnexus_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor
 * Handles 401 errors by attempting token refresh
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/logout')
        ) {
            if (isRefreshing) {
                // Queue the request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${API_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newToken = data.data.accessToken;
                localStorage.setItem('jobnexus_admin_token', newToken);
                api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

                processQueue(null, newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Clear auth state and redirect to login
                localStorage.removeItem('jobnexus_admin_token');
                localStorage.removeItem('jobnexus_admin_user');
                window.location.href = '/#/signin';

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // If it still fails with 401 after retry, securely redirect
        if (error.response?.status === 401 && originalRequest._retry) {
            localStorage.removeItem('jobnexus_admin_token');
            localStorage.removeItem('jobnexus_admin_user');
            window.location.href = '/#/signin';
        }

        return Promise.reject(error);
    }
);

export default api;
