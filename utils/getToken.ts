import { getCookie } from "cookies-next";

function readCookie(name: string): string {
  const value = getCookie(name);
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return "";
  return trimmed;
}

export const getToken = () => readCookie("token");

export const getRefreshToken = () => readCookie("refreshToken");
