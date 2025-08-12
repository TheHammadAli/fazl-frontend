import React from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";

function Signup() {
  return (
    <div className="w-screen h-screen flex">
      {/* Left section */}
      <div className="w-[60%] pl-8 xl:pl-24 ">
        <Image
          src={AuthImage}
          alt="auth-image"
          className="h-full w-full object-cover"
        />
      </div>
      {/* Right section */}
      <div className="w-[50%] px-[50px] xl:px-[150px] pt-[80px]">
        <h1 className="text-black-1 font-medium text-[22px] w-[334px]  leading-[30px] ">
          Your local marketplace for Products and Services
        </h1>
        <p className="font-normal text-[16px] text-gray-8">Let’s get started</p>
      </div>
    </div>
  );
}

export default Signup;
