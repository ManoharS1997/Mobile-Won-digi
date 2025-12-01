import { axiosGet } from "@/utils/axiosHelpers";

const prefix = "/api/timetable";

export const GetTimeTableByClassandSection = (
  schoolId: string,
  grade: string,
  section: string
) => {
  return axiosGet(
    `${prefix}/byclassandsection/${grade}/${section}/${schoolId}`
  );
};

export const GetTimeTableByName = (schoolId: string, timetablename: string) => {
  return axiosGet(`${prefix}/getaction/${timetablename}/${schoolId}`);
};
