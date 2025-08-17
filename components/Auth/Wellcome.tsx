"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";
import Arrow from "@/assets/icons/right-gray-arrow-icon.svg";
function Wellcome() {
  return (
    <div className="w-screen h-screen flex min-h-[100vh]">
      {/* Left section */}
      <div className="w-[60%] pl-8 xl:pl-24 ">
        <Image
          src={AuthImage}
          alt="auth-image"
          className="h-full w-full object-cover"
        />
      </div>
      {/* Right section */}
      <div className="w-[50%] px-[50px] xl:px-[150px] pt-[80px] flex flex-col justify-between">
        <div>
          {" "}
          <h1 className="text-black-1 font-medium text-[22px] w-[334px]  leading-[30px] ">
            Welcome to Knayf{" "}
          </h1>
          <p className="font-light text-[16px] text-gray-8">
            The marketplace to discover, sell, and grow
          </p>
          <p className=" text-[16px] font-light text-gray-8">
            — locally and globally.{" "}
          </p>
          <div className=" cursor-pointer mt-12 w-full bg-[#C7F1EE80] flex gap-[10px] justify-between items-start h-[102px] rounded-[12px] p-5">
            <div>
              <h2 className="text-[16px] leading-tight font-medium text-black-1">
                List a Product or Item
              </h2>
              <p className="text-[14px] font-light text-[#4B514F] leading-[20px] mt-1">
                Sell physical goods through your own shop — from electronics to
                clothing and more.
              </p>
            </div>
            <Image src={Arrow} alt="arrow" />
          </div>
          <div className="cursor-pointer w-full mt-3 bg-[#C7F1EE80] flex gap-[10px] justify-between items-start h-[102px] rounded-[12px] p-5">
            <div>
              <h2 className="text-[16px] leading-tight font-medium text-black-1">
                List a Product or Item
              </h2>
              <p className="text-[14px] font-light text-[#4B514F] leading-[20px] mt-1">
                Sell physical goods through your own shop — from electronics to
                clothing and more.
              </p>
            </div>
            <Image src={Arrow} alt="arrow" />
          </div>
        </div>
        <div className="">
          <div className="flex justify-center -mt-28">
            <div className="h-[30px] w-[70px] bg-green-1 rounded-[6px] text-white flex items-center justify-center text-[18px] font-semibold">
              Knayf
            </div>
          </div>
          <div className="flex justify-center items-center font-[400] text-[12px] text-green-1 gap-[6px] mt-3">
            <p>Contact</p>
            <div className="h-1 w-1 bg-green-1 rounded-full"></div>
            <p>Terms and Conditions</p>
            <div className="h-1 w-1 bg-green-1 rounded-full"></div>
            <p>Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wellcome;
