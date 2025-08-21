"use client";
import React from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";
import Arrow from "@/assets/icons/right-gray-arrow-icon.svg";
function Wellcome() {
  return (
    <div className="w-screen h-screen lg:flex lg:min-h-[100vh]">
      <div className="w-full lg:w-[60%] lg:pl-8 xl:pl-24 ">
        <Image
          src={AuthImage}
          alt="auth-image"
          className="h-[360px] lg:h-full w-full object-cover"
        />
      </div>
      <div className="w-ful px-5  lg:w-[50%] sm:px-[50px] xl:px-[150px] pt-5 lg:pt-[80px] lg:flex lg:flex-col justify-between">
        <div className="w-full flex flex-col items-center lg:items-start">
          {" "}
          <h1 className="text-black-1 font-medium text-[22px] lg:w-[334px]  leading-[30px] ">
            Welcome to market{" "}
          </h1>
          <p className="font-light text-[16px] text-gray-8">
            The marketplace to discover, sell, and grow
          </p>
          <p className=" text-[16px] font-light text-gray-8">
            — locally and globally.{" "}
          </p>
          <div className=" max-w-[500px] lg:max-w-full cursor-pointer mt-12 w-full bg-[#C7F1EE80] flex gap-[10px] justify-between items-start lg:h-[102px] rounded-[12px] p-5">
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
          <div className="max-w-[500px] lg:max-w-full cursor-pointer w-full mt-3 bg-[#C7F1EE80] flex gap-[10px] justify-between items-start lg:h-[102px] rounded-[12px] p-5">
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
        <div className=" py-10 lg:py-0">
          <div className="flex justify-center lg:-mt-28">
            <div className="h-[30px] w-[70px] bg-green-1 rounded-[6px] text-white flex items-center justify-center text-[18px] font-semibold">
              market
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
