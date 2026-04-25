import axios from 'axios';

// Create an Axios instance pointing directly to the backend server.
// Per absolute rules, we DO NOT use a proxy in package.json/vite.config.js.
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crms_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling (like token expiry)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we receive a 401 Unauthorized, we could gracefully clear the auth state
    // But since context handles that, we'll just propagate the error here.
    return Promise.reject(error);
  }
);

export default axiosInstance;
