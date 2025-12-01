import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/inventory";

export const GetInventory = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetInventoryById = (schoolid: string, invId: string) => {
  return axiosGet(`${prefix}/${invId}/${schoolid}`);
};

export const PostInventory = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateInventory = (schoolid: string, invId: string, data: object) => {
  return axiosPatch(`${prefix}/${invId}/${schoolid}`, data);
};
