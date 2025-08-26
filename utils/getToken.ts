import { getCookie } from "cookies-next";
export const getToken = () => {
  return getCookie("token");
};
