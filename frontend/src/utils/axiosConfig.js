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
            // A full page redirect is a bit aggressive but ensures secure state, 
            // though typically handled softly via Context API where possible.
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
