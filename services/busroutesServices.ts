import { axiosGet, axiosPatch, axiosPost } from "@/utils/axiosHelpers";

const prefix = "/api/busroute";
const prefix1 = "/api/googlemap";

export const GetBusRoutesById = (schoolId: string) => {
  return axiosGet(`${prefix}/all/${schoolId}`);
};

export const GetBusRoutesByRouteId = (routeId: string, schoolId: string) => {
  return axiosGet(`${prefix}/${routeId}/${schoolId}`);
};

export const FetchDistanceMatrix = (data: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}) => {
  return axiosPost(`${prefix1}/distance`, data);
};

export const FetchRoutePolyline = (data: object) => {
  return axiosPost(`${prefix1}/polyline`, data);
};

export const UpdateDistanceData = (data: object) => {
  return axiosPost(`${prefix1}/remaining`, data);
};

export const UpdateRouteForDriver = (
  schoolId: string,
  routeId: string,
  data: object
) => {
  return axiosPatch(`${prefix}/sync/${routeId}/${schoolId}`, data);
};
