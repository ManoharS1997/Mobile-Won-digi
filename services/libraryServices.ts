import {
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosDelete,
} from "@/utils/axiosHelpers";

const prefix = "/api/book";
const prefix1 = "/api/library";

export const GetBook = (schoolId: string) => {
  return axiosGet(`${prefix}/create/${schoolId}`);
};

export const GetBookById = (id: string, schoolId: string) => {
  return axiosGet(`${prefix}/${id}/${schoolId}`);
};

export const PostBook = (data: object) => {
  return axiosPost(`${prefix}`, data);
};

export const UpdateBook = (schoolId: string, id: string, data: object) => {
  return axiosPatch(`${prefix}/${id}/${schoolId}`, data);
};

export const GetUser = (schoolId: string) => {
  return axiosGet(`${prefix1}/create/${schoolId}`);
};

export const GetBookDetail = (
  schoolid: string,
  bookid: string,
  subid: string
) => {
  return axiosGet(`${prefix1}/get/${bookid}/${subid}/${schoolid}`);
};

export const GetUserBooks = (schoolid: string, id: string, check: string) => {
  return axiosGet(`${prefix1}/${id}/${check}/${schoolid}`);
};

export const GetLibraryByUserAndBook = (
  schoolid: string,
  userid: string,
  bookid: string
) => {
  return axiosGet(`${prefix1}/view/${userid}/${bookid}/${schoolid}`);
};

export const GetBooks = (schoolid: string, id: string) => {
  return axiosGet(`${prefix1}/books/${id}/${schoolid}`);
};

export const PostUser = (data: object) => {
  return axiosPost(`${prefix1}`, data);
};

export const UpdateBookReturnStatus = (
  schoolid: string,
  bookid: string,
  subid: string,
  startdate: string,
  enddate: string,
  data: object
) => {
  return axiosPatch(
    `${prefix1}/change/${bookid}/${subid}/${startdate}/${enddate}/${schoolid}`,
    data
  );
};

export const UpdateUser = (
  schoolid: string,
  bookid: string,
  userid: string,
  data: object
) => {
  return axiosPatch(`${prefix1}/${bookid}/${userid}/${schoolid}`, data);
};

export const UpdateFine = (
  schoolid: string,
  bookid: string,
  subid: string,
  startdate: string,
  enddate: string,
  data: object
) => {
  return axiosPatch(
    `${prefix1}/fine/${bookid}/${subid}/${startdate}/${enddate}/${schoolid}`,
    data
  );
};

export const DeleteUser = (schoolid: string, id: string) => {
  return axiosDelete(`${prefix1}/${id}/${schoolid}`);
};
