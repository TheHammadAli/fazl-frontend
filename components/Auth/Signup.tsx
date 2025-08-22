"use client";
import React, { useState } from "react";
import AuthImage from "@/assets/images/auth-image.png";
import Image from "next/image";
import FinishSignup from "./FinishSignup";
import SetPassword from "./SetPassword";
import { useAppSelector } from "@/store/store";
function Signup() {
  const { confirmedPwd } = useAppSelector((state) => state.authReducer);
  const [password, setPassword] = useState("");
  return (
    <div className="flex  justify-center w-screen min-h-[818px] hide-scrollbar">
      <div className="hidden lg:block lg:w-[60%] pl-8 xl:pl-24   ">
        <Image
          src={AuthImage}
          alt="auth-image"
          className="h-full w-full object-cover"
        />
      </div>

      {confirmedPwd ? (
        <FinishSignup password={password} />
      ) : (
        <SetPassword password={password} setPassword={setPassword} />
      )}
    </div>
  );
}

export default Signup;
