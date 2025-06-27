// utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:2117/api',
  withCredentials: true, // Si usas cookies
});

axiosInstance.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token'); // Eliminado: no usar localStorage para JWT en producción
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export default axiosInstance;
