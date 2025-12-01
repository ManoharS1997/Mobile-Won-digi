import {
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosDelete,
} from "@/utils/axiosHelpers";

const prefix = "/api/calendar";

export const GetCalendar = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetCalendarById = (schoolId: string, id: string) => {
  return axiosGet(`${prefix}/${id}/${schoolId}`);
};

export const PostCalendar = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateCalendar = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};

export const DeleteCalendar = (schoolId: string, id: string) => {
  return axiosDelete(`${prefix}/${id}/${schoolId}`);
};
