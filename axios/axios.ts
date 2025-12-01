import { baseUrl } from "@/constant";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 20000,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
);

export default axiosInstance;
