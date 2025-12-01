import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/diary";

export const GetDiaryBySchool = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetDiaryById = (staffId: string, schoolId: string) => {
  return axiosGet(`${prefix}/${staffId}/${schoolId}`);
};

export const PostDiary = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateDiary = (schoolid: string, diaryId: string, data: object) => {
  return axiosPatch(`${prefix}/${diaryId}/${schoolid}`, data);
};
