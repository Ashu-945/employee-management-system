import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080/api', // Spring Boot default
});

// Add a request interceptor to inject the token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor to handle global 401 Unauthorized errors
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid/expired - clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const onAdminRoute = window.location.pathname.startsWith('/admin');
            const redirectTo = onAdminRoute ? '/admin/login' : '/login';
            if (window.location.pathname !== redirectTo) {
                window.location.href = redirectTo;
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
