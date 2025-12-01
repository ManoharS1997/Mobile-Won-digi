import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
} from "@/utils/axiosHelpers";

const prefix = "/api/classnotes";

export const GetClassnotes = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetAllnotes = (schoolId: string) => {
  return axiosGet(`${prefix}/getallnotes/${schoolId}`);
};

export const GetClassnotesById = (schoolId: string, id: string) => {
  return axiosGet(`${prefix}/${id}/${schoolId}`);
};

export const PostClassnotes = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateClassnotes = (
  schoolId: string,
  id: string,
  data: object
) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};

export const DeleteClassnotes = (schoolId: string, id: string) => {
  return axiosDelete(`${prefix}/${id}/${schoolId}`);
};

export const GetFileUrl = (fileData: any) => {
  return axiosPost(`${prefix}/getfileurl`, fileData, {
    "Content-Type": "multipart/form-data",
  });
};
