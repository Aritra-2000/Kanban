import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";


const API: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers:{
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

API.interceptors.request.use((config : InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
},(error)=>{
    return Promise.reject(error);
  }
)

export default API;