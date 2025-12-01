import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/circular";

export const GetCircular = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetCircularById = (schoolId: string, cirId: string) => {
  return axiosGet(`${prefix}/${cirId}/${schoolId}`);
};

export const PostCircular = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateCircular = (schoolId: string, cirId: string, data: object) => {
  return axiosPatch(`${prefix}/${cirId}/${schoolId}`, data);
};

export const UpdateStatus = (schoolId: string, cirId: string, data: object) => {
  return axiosPatch(`${prefix}/update/${cirId}/${schoolId}`, data);
};
