import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/exam";

export const GetExam = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetExamById = (schoolId: string, id: string) => {
  return axiosGet(`${prefix}/${id}/${schoolId}`);
};

export const PostExam = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const CreateExam = (schoolId: string, examId: string, data: object) => {
  return axiosPatch(`${prefix}/${examId}/${schoolId}`, data);
};

export const UpdateExam = (schoolId: string, examId: string, data: object) => {
  return axiosPatch(`${prefix}/update/${examId}/${schoolId}`, data);
};
