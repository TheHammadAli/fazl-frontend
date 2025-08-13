"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";
import chevDown from "@/assets/icons/chev-down-icon.svg";
import countries from "country-list-with-dial-code-and-flag";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import Input from "../Ui/Input";
import GoogleIcon from "@/assets/icons/google-icon.svg";
import mailIcon from "@/assets/icons/email-icon.svg";

function Signup() {
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const allCountries = countries.getAll();
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const simplified = allCountries.map(({ name, dial_code }) => ({
    name,
    dial_code,
  }));
  useClickOutside(optionsRef, () => {
    setIsOpen(false);
  });
  return (
    <div className="w-screen h-screen flex min-h-[818px]">
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
        <div className="mt-5">
          <div className="text-[14px] font-normal text-gray-8">
            Country code
          </div>
          <div ref={optionsRef} className="relative inline-block w-full">
            <div
              className="pb-1 w-full flex items-center border-b-[1px] border-gray-9 justify-between mt-1 cursor-pointer"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              <h2 className="text-[15px] font-normal text-gray-8">
                {countryCode && countryName
                  ? `${countryName} (${countryCode})`
                  : "Select country code"}
              </h2>
              <Image
                src={chevDown}
                alt="chev-down"
                className="h-[16px] w-[12px]"
                height={100}
                width={100}
              />
            </div>
            {isOpen && (
              <div className="absolute z-20  w-full bg-white border   max-h-[450px] overflow-scroll border-gray-200 rounded-md shadow-md mt-2">
                {simplified.map((data, index) => (
                  <div
                    onClick={() => {
                      setCountryName(data?.name);
                      setCountryCode(data?.dial_code);
                      setIsOpen(false);
                    }}
                    className="text-[15px]  text-gray-8 px-4 py-2 text-sm cursor-pointer font-light hover:bg-gray-100"
                    key={index}
                  >{`(${data.dial_code}) ${data.name}`}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2 mt-5">
          <p className="text-[14px] font-normal text-gray-8">Phone number</p>
          <Input
            type="phone"
            className="h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
          />
        </div>
        <button className="mt-6 h-[52px] w-full rounded-[12px] text-white font-medium text-[16px]  bg-green-1 cursor-pointer">
          Continue
        </button>
        <div className="flex gap-[10px] items-center text-[#19191999] text-[16px] font-normal mt-5">
          <div className="w-full h-[1px] bg-gray-2"></div>
          or
          <div className="w-full h-[1px] bg-gray-2"></div>
        </div>
        <button className="mt-6 h-[52px] w-full rounded-[12px] text-white    bg-blue-1 flex items-center justify-center gap-2 text-[15px] font-normal cursor-pointer">
          <Image src={GoogleIcon} alt="google_icon" />{" "}
          <h3>Continue with Google</h3>
        </button>
        <button className="mt-6 h-[52px] w-full rounded-[12px] text-black    bg-gray-10 flex items-center justify-center gap-2 text-[15px] font-normal cursor-pointer">
          <Image src={mailIcon} alt="mail_icon" /> <h3>Continue with Google</h3>
        </button>

        <div className="text-center font-normal text-[12px] text-gray-8 mt-5">
          Already have an account? <span className="text-green-1">Sign in</span>
        </div>
        <div className="flex justify-center mt-[80px]">
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
  );
}

export default Signup;
