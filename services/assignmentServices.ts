import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/assignment";

export const GetAssignment = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetAssignmentById = (schoolId: string, assignId: string) => {
  return axiosGet(`${prefix}/${assignId}/${schoolId}`);
};

export const PostAssignment = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateAssignment = (
  schoolId: string,
  assignId: string,
  data: object
) => {
  return axiosPatch(`${prefix}/${assignId}/${schoolId}`, data);
};
