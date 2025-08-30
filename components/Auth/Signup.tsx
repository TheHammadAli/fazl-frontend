"use client";
import React, { useEffect, useState } from "react";
import AuthImage from "@/assets/images/auth-image.png";
import Image from "next/image";
import FinishSignup from "./FinishSignup";
import { useAppSelector } from "@/store/store";
import { useRouter } from "next/navigation";
function Signup() {
  const router = useRouter();
  const otpInfo = useAppSelector((state) => state.authReducer.otpInfo);
  useEffect(() => {
    if (otpInfo?.type === "") {
      router.push("/send-otp");
    } else if (otpInfo?.password === "") {
      router.push("/set-password");
    }
  }, []);
  if (otpInfo?.password !== "" && otpInfo?.type !== "") {
    return (
      <div className="flex  justify-center w-screen min-h-[818px] hide-scrollbar">
        <div className="hidden lg:block lg:w-[60%] pl-8 xl:pl-24   ">
          <Image
            src={AuthImage}
            alt="auth-image"
            className="h-full w-full object-cover"
          />
        </div>

        <FinishSignup />
      </div>
    );
  } else {
    return null;
  }
}

export default Signup;
