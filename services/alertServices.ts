import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
} from "@/utils/axiosHelpers";

const prefix = "/api/alert";

export const GetAlertById = (schoolId: string, id: string) => {
  return axiosGet(`${prefix}/${id}/${schoolId}`);
};

export const PostAlert = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateAlert = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};

export const DeleteAlert = (schoolId: string, deleteId: string) => {
  return axiosDelete(`${prefix}/${deleteId}/${schoolId}`);
};

export const DeleteAllAlert = (schoolId: string, userId: string) => {
  return axiosDelete(`${prefix}/deleteall/${userId}/${schoolId}`);
};

export const UpdateAllAlert = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/alltrue/${id}/${schoolId}`, data);
};
