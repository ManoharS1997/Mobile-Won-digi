import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix1 = "/api/staff";
const prefix2 = "/api/students";
const prefix3 = "/api/login";
const prefix4 = "/api/classnotes";
const prefix5 = "/api/role";
export const GetStaffById = (id: string, schoolId: string) => {
  return axiosGet(`${prefix1}/get/${id}/${schoolId}`);
};

export const GetStudentById = (id: string, schoolId: string) => {
  return axiosGet(`${prefix2}/getbysearch/${id}/${schoolId}`);
};

export const LoginUser = (data: object) => {
  return axiosPost("/login", data);
};

export const SendOtp = (data: object) => {
  return axiosPost("/send-email-otp", data);
};

export const ForgotSendOtp = (data: object) => {
  return axiosPost("/send-email-otp-forPassword", data);
};

export const VerifyOtp = (data: object) => {
  return axiosPost("/verify-otp", data);
};

export const RegisterUser = (data: object) => {
  return axiosPost("/register-login", data);
};

export const ResetPassword = (email: string, data: object) => {
  return axiosPatch(`${prefix3}/updatepassword/${email}`, data);
};

export const GetFileUrl = (data: object) => {
  return axiosPost(`${prefix4}/getfileurl`, data, {
    "Content-Type": "multipart/form-data",
  });
};

export const UpdateStudentProfile = (
  schoolId: string,
  id: string,
  data: object
) => {
  return axiosPatch(`${prefix2}/profile/${id}/${schoolId}`, data);
};

export const UpdateStaffProfile = (
  schoolId: string,
  id: string,
  data: object
) => {
  return axiosPatch(`${prefix1}/profile/${id}/${schoolId}`, data);
};

export const GetRoleByName = (schoolId: string, rolename: string) => {
  return axiosGet(`${prefix5}/getaction/${rolename}/${schoolId}`);
};

export const UpdateIntro = (userId: string, data: object) => {
  return axiosPatch(`${prefix3}/updateintro/${userId}`, data);
};

export const GetRole = (schoolId: string) => {
  return axiosGet(`${prefix5}/create/${schoolId}`);
};
