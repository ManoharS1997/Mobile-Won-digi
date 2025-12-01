import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/transport";
const prefix2 = "/api/services";

export const GetTransport = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetTransportById = (schoolId: string, user_id: string) => {
  return axiosGet(`${prefix}/${user_id}/${schoolId}`);
};

export const PostTransport = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateTransport = (
  schoolId: string,
  user_id: string,
  data: object
) => {
  return axiosPatch(`${prefix}/${user_id}/${schoolId}`, data);
};

export const GetServiceByName = (schoolId: string, subcategory: string) => {
  return axiosGet(`${prefix2}/getbyname/${subcategory}/${schoolId}`);
};
