import {
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosDelete,
} from "@/utils/axiosHelpers";

const prefix = "/api/result";
const prefix1 = "/api/students";

export const GetResult = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetResultById = (
  schoolId: string,
  examid: string,
  studentid: string
) => {
  return axiosGet(
    `${prefix}/getresultsbyid?examId=${examid}&studentId=${studentid}&schoolId=${schoolId}`
  );
};

export const GetResultForStudent = (
  schoolId: string,
  examid: string,
  studentid: string
) => {
  return axiosGet(
    `${prefix}/getresultsbyid?examId=${examid}&studentId=${studentid}&schoolId=${schoolId}`
  );
};

export const PostResult = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateResult = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};

export const DeleteResult = (schoolId: string, id: string) => {
  return axiosDelete(`${prefix}/${id}/${schoolId}`);
};

export const GetStudentResults = (
  schoolId: string,
  className: string,
  section: string,
  subject: string,
  exam: string
) => {
  return axiosGet(
    `${prefix1}/getresultsbyvalues?grade=${className}&section=${section}&subject=${subject}&exam=${exam}&schoolId=${schoolId}`
  );
};
