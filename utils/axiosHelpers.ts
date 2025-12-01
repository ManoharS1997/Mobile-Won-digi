/**
 * Author: NowIT Services - WON Apps
 * Date: 2025-03-11
 * Purpose: Handles utility of api methods.
 */

import axiosInstance from "@/axios/axios";

export function axiosGet<T>(
  url: string,
  params?: T,
  headers: Record<string, string> = {}
) {
  return axiosInstance.get(url, {
    params,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function axiosPost<T>(
  url: string,
  data: T | object,
  headers: Record<string, string> = {}
) {
  return axiosInstance.post(url, data, {
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function axiosPatch<T>(
  url: string,
  data: T | object,
  headers: Record<string, string> = {}
) {
  return axiosInstance.patch(url, data, {
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function axiosPut<T>(
  url: string,
  data: T | object,
  headers: Record<string, string> = {}
) {
  return axiosInstance.put(url, data, {
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function axiosDelete<T>(
  url: string,
  params?: T,
  headers: Record<string, string> = {}
) {
  return axiosInstance.delete(url, {
    params,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
