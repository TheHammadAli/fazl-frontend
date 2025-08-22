import { createSlice } from "@reduxjs/toolkit";
import { setCookie, getCookie } from "cookies-next";
// import { deleteCookie } from "cookies-next";

type otpInfoTypes = {
  type: string;
  phone: string;
  email: string;
};
let otpInfo: otpInfoTypes = {
  type: "",
  phone: "",
  email: "",
};
let confirmedPwd: boolean = false;
let token: string = "";

if (typeof window !== "undefined") {
  const otpData = localStorage.getItem("otpInfo");
  const confirmedPwdData = localStorage.getItem("confirmedPwd");
  const cookieToken = getCookie("token");
  token = typeof cookieToken === "string" ? cookieToken : "";
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
  },
});

export const { setOtpInfo, setConfirmPwd, setToken } = authSlice.actions;

export default authSlice.reducer;
