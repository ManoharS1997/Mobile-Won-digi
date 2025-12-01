import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/favourite";

export const GetFavouriteById = (schoolId: string, id: string) => {
  return axiosGet(`${prefix}/${id}/${schoolId}`);
};

export const PostFavourite = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateFavourite = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};
