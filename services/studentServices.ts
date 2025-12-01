import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/students";
const prefix1 = "/api/services";
const prefix2 = "/api/bill";
const prefix3 = "/api/department";

export const GetStudents = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetStudentById = (id: string, schoolId: string) => {
  return axiosGet(`${prefix}/getbysearch/${id}/${schoolId}`);
};

export const PostStudents = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateStudent = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};

export const UpdateStudentProfile = (
  schoolId: string,
  id: string,
  data: object
) => {
  return axiosPatch(`${prefix}/profile/${id}/${schoolId}`, data);
};

export const GetService = (schoolId: string) => {
  return axiosGet(`${prefix1}/create/${schoolId}`);
};

export const GetBill = (schoolId: string) => {
  return axiosGet(`${prefix2}/create/${schoolId}`);
};

export const GetBillById = (schoolId: string, id: string) => {
  return axiosGet(`${prefix2}/${id}/${schoolId}`);
};

export const GetDepartmentList = (schoolId: string) => {
  return axiosGet(`${prefix3}/getlist/${schoolId}`);
};
