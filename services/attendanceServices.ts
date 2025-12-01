import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/attendence";
const prefix1 = "/api/students";
const prefix2 = "/api/staff";
const prefix3 = "/api/role";
const prefix4 = "/api/staffattendance";

export const GetAttendance = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetAttendanceByDate = (
  schoolId: string,
  date: string,
  period: string
) => {
  return axiosGet(`${prefix}/${date}/${period}/${schoolId}`);
};

export const GetAttendanceId = (examid: string, studentid: string) => {
  return axiosGet(
    `${prefix}/getresultsbyid?examId=${examid}&studentId=${studentid}`
  );
};

export const GetAttendanceForStudent = (schoolId: string, userid: string) => {
  return axiosGet(`${prefix}/getbyId/${userid}/${schoolId}`);
};

export const GetAttendanceStaff = (schoolId: string, userid: string) => {
  return axiosGet(`${prefix4}/getbyId/${userid}/${schoolId}`);
};

export const PostAttendance = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateAttendance = (
  schoolId: string,
  id: string,
  data: object
) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};

export const GetStudentsForAttendance = (
  schoolId: string,
  date: Date,
  grade: string,
  section: string,
  period: string
) => {
  return axiosGet(
    `${prefix1}/getbyvalues?date=${date}&grade=${grade}&section=${section}&period=${period}&schoolId=${schoolId}`
  );
};

export const GetAttendanceForStaff = (
  schoolId: string,
  date: any,
  title: string,
  department: string
) => {
  return axiosGet(
    `${prefix2}/getbyvalues?date=${date}&title=${title}&department=${department}&schoolId=${schoolId}`
  );
};

export const GetRole = (schoolId: string) => {
  return axiosGet(`${prefix3}/create/${schoolId}`);
};

export const PostStaffAttendance = (data: object) => {
  return axiosPost(`${prefix4}`, data);
};

export const UpdateStaffAttendance = (
  schoolId: string,
  id: string,
  data: object
) => {
  return axiosPatch(`${prefix4}/${id}/${schoolId}`, data);
};
