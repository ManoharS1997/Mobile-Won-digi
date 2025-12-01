import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/care";

export const GetCare = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetCareById = (schoolId: string, id: string) => {
  return axiosGet(`${prefix}/${id}/${schoolId}`);
};

export const PostCare = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateCare = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/update/${id}/${schoolId}`, data);
};
