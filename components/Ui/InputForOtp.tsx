"use client";
import React, { useState } from "react";
import OtpInput from "react-otp-input";
type InputForOtpProps = {
  otp: string;
  setOtp: (value: string) => void;
};

function InputForOtp({ otp, setOtp }: InputForOtpProps) {
  return (
    <OtpInput
      containerStyle={"gap-2"}
      inputStyle={
        "h-[52px] w-[52px] min-w-[52px] outline-none border border-black-1 rounded-[12px] text-[14px] font-normal text-center"
      }
      value={otp}
      onChange={setOtp}
      numInputs={4}
      renderSeparator={false}
      renderInput={(props) => <input {...props} />}
    />
  );
}

export default InputForOtp;
