"use client";
import React from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";
import Arrow from "@/assets/icons/right-gray-arrow-icon.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useRouter } from "next/navigation";
import LangSwitcher from "../Ui/LangSwitcher";
import Footer from "./Footer";
function Wellcome() {
  const router = useRouter();
  const { info_messages, placeholders } = useDictionary();
  return (
    <div className="w-screen h-screen lg:flex lg:min-h-[100vh]">
      <div className="w-full lg:w-[60%] ltr:lg:pl-8 ltr:xl:pl-24 rtl:lg:pr-8 rtl:xl:pr-24 ">
        <Image
          src={AuthImage}
          alt="auth-image"
          className="h-[360px] lg:h-full w-full object-cover"
        />
      </div>
      <div className="w-ful px-5  lg:w-[50%] sm:px-[50px] xl:px-[150px] pt-5 lg:pt-[80px] lg:flex lg:flex-col justify-between">
        <div className="w-full flex flex-col items-center lg:items-start">
          <div className="w-full flex justify-between">
            <div className="mb-5">
              <LangSwitcher />
            </div>
            <div
              onClick={() => router.push("/home")}
              className="font-normal text-[14px] text-black-1 cursor-pointer hover:underline"
            >
              {placeholders["skip" as keyof typeof placeholders] ?? "Skip"}
            </div>
          </div>
          <h1 className="text-black-1 font-medium text-[22px] w-full  leading-[30px] rtl:text-right ltr:text-left ">
            {info_messages.welcome_market}
          </h1>
          <p className="font-light text-[16px] text-gray-8 rtl:text-right ltr:text-left">
            {info_messages.discover_market}
          </p>
          <p className=" text-[16px] font-light text-gray-8 rtl:text-right ltr:text-left w-full  ">
            {info_messages.locally_globally}
          </p>
          <div
            onClick={() => router.push("/selling")}
            className=" max-w-[500px] lg:max-w-full cursor-pointer mt-12 w-full bg-[#C7F1EE80]  flex rtl:flex-row-reverse gap-[10px] justify-between items-start lg:h-[102px] rounded-[12px] p-5"
          >
            <div>
              <h2 className="text-[16px] rtl:text-right ltr:text-left leading-tight font-medium text-black-1">
                {info_messages.list_product}
              </h2>
              <p className="text-[14px] rtl:text-right ltr:text-left font-light text-[#4B514F] leading-[20px] mt-1">
                {info_messages.sell_physical}
              </p>
            </div>
            <Image src={Arrow} alt="arrow" className="rtl:-rotate-90" />
          </div>

          <div
            onClick={() => router.push("/services")}
            className="max-w-[500px] lg:max-w-full cursor-pointer w-full mt-3 bg-[#C7F1EE80] flex rtl:flex-row-reverse gap-[10px] justify-between items-start lg:h-[102px] rounded-[12px] p-5"
          >
            <div>
              <h2 className="text-[16px] rtl:text-right ltr:text-left leading-tight font-medium text-black-1">
                {info_messages.list_service}
              </h2>
              <p className="text-[14px] rtl:text-right ltr:text-left font-light text-[#4B514F] leading-[20px] mt-1">
                {info_messages.offer_expertise}
              </p>
            </div>
            <Image src={Arrow} alt="arrow" className="rtl:-rotate-90 " />
          </div>
        </div>
        <div className="mt-14 lg:mt-0 lg:mb-14  w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Wellcome;
