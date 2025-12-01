import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/query";

export const GetQuery = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetQueryById = (schoolId: string, id: string) => {
  return axiosGet(`${prefix}/${id}/${schoolId}`);
};

export const PostQuery = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateQuery = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};

export const UpdateStatus = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/update/${id}/${schoolId}`, data);
};
