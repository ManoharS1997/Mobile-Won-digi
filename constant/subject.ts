import { GetDepartmentList } from "@/services/studentServices"; 

export const getSubjectList = async (roleId: string) => {
  try {
    const response = await GetDepartmentList(roleId);
    let entries = response.data.departments;

    return entries;
  } catch (error: any) {
    return { error: error.response?.data?.message || "Failed to fetch billing entries" };
  }
};
