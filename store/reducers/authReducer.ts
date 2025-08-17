import { createSlice } from "@reduxjs/toolkit";
import { setCookie, getCookie } from "cookies-next";
// import { deleteCookie } from "cookies-next";

// type lernerSignin = {
//   legalName: string;
//   email: string;
// };
// let lerner_signin_information: lernerSignin = {
//   legalName: "",
//   email: "",
// };

let otpInfo = {
  type: "",
  phone: "",
  email: "",
};
let confirmedPwd: boolean = false;
let user = {};

if (typeof window !== "undefined") {
  const otpData = localStorage.getItem("otpInfo");
  const confirmedPwdData = localStorage.getItem("confirmedPwd");
  user = getCookie("user") || {};
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
    user: user,
    // personalInformation: {},
    // signInLearnerInformation: lerner_signin_information
    //   ? lerner_signin_information
    //   : {},
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
    setUser: (state, action) => {
      state.user = action.payload;
      setCookie("user", JSON.stringify(action.payload));
    },
  },
});

export const { setOtpInfo, setConfirmPwd, setUser } = authSlice.actions;

export default authSlice.reducer;
