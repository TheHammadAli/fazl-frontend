import { createSlice } from "@reduxjs/toolkit";
import { setCookie, getCookie } from "cookies-next";
import { use } from "react";
// import { deleteCookie } from "cookies-next";

type otpInfoTypes = {
  type: string;
  phone: string;
  email: string;
  password: string;
};
let otpInfo: otpInfoTypes = {
  type: "",
  phone: "",
  email: "",
  password: "",
};
let confirmedPwd: boolean = false;
let token: string = "";
let userId: string = "";

if (typeof window !== "undefined") {
  const otpData = localStorage.getItem("otpInfo");
  const confirmedPwdData = localStorage.getItem("confirmedPwd");
  const cookieToken = getCookie("token");
  const id = getCookie("userId");
  token = typeof cookieToken === "string" ? cookieToken : "";
  userId = typeof id === "string" ? id : "";
  if (otpData) {
    otpInfo = JSON.parse(otpData);
  }
  if (confirmedPwdData === "true") {
    confirmedPwd = true;
  } else {
    confirmedPwd = false;
  }
}
const authSlice = createSlice({
  name: "authSlice",
  initialState: {
    otpInfo: otpInfo,
    confirmedPwd: confirmedPwd,
    token: token,
    userId: userId,
  },
  reducers: {
    setOtpInfo: (state, action) => {
      state.otpInfo = action.payload;
      localStorage.setItem("otpInfo", JSON.stringify(action.payload));
    },
    setConfirmPwd: (state, action) => {
      state.confirmedPwd = action.payload;
      localStorage.setItem("confirmedPwd", action.payload);
    },

    setToken: (state, action) => {
      state.token = action.payload;
      setCookie("token", action.payload);
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
      setCookie("userId", action.payload);
    },
    logout: (state) => {
      state.token = "";
      state.userId = "";
      localStorage.removeItem("otpInfo");
      localStorage.removeItem("confirmedPwd");
      setCookie("token", "");
      setCookie("userId", "");
    },
  },
});

export const { setOtpInfo, setConfirmPwd, setToken, setUserId, logout } =
  authSlice.actions;

export default authSlice.reducer;
