"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";
import chevDown from "@/assets/icons/chev-down-icon.svg";
import countries from "country-list-with-dial-code-and-flag";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import GoogleIcon from "@/assets/icons/google-icon.svg";
import mailIcon from "@/assets/icons/email-icon.svg";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { BeatLoader } from "react-spinners";
import { useSendOtpMutation } from "@/store/services/authService";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/store/store";
import { setOtpInfo } from "@/store/reducers/authReducer";
import { useRouter } from "next/navigation";

export type Body = {
  email?: string;
  phoneNumber?: string;
};

export const validatePhone = (phone: string): boolean => {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber ? phoneNumber.isValid() : false;
};

function ForgetPassword() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [withEmail, setWithEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [email, setEmail] = useState("");

  const [sendOtp, { isLoading, isSuccess, isError, data, error }] =
    useSendOtpMutation();

  const handleSendOtp = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid: boolean = true;
    let body: Body = {};
    if (email.trim().length === 0) {
      setEmailError("Email is required*");
      isValid = false;
    } else if (regex.test(email) === false) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
      body = { ...body, email };
    }

    if (isValid) {
      sendOtp(body);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message);
      //   dispatch(
      //     setOtpInfo({
      //       type: withEmail ? "email" : "phone",
      //       phone,
      //       email,
      //     })
      //   );
      const timer = setTimeout(() => {
        router.push("/verify-otp");
      }, 1500);

      return () => clearTimeout(timer);
    }
    if (isError && "data" in error) {
      toast.error(
        (error?.data as { message?: string })?.message ||
          "something went wrong!"
      );
    }
  }, [isSuccess, isError, data, error]);
  return (
    <div className="w-screen h-screen lg:flex min-h-[818px] hide-scrollbar pt-[50px] lg:pt-0">
      {/* Left section */}
      <div className=" hidden lg:block lg:w-[60%] lg:pl-8 xl:pl-24   ">
        <Image
          src={AuthImage}
          alt="auth-image"
          className="h-full w-full object-cover "
        />
      </div>
      {/* Right section */}
      <div className="w-full flex justify-center lg:justify-start  lg:w-[50%] px-5  sm:px-[50px] xl:px-[150px] lg:pt-[80px] ">
        <div className=" w-full flex flex-col  items-center  lg:items-start max-w-[500px] lg:max-w-full">
          <h1 className="text-black-1   font-medium text-[22px] text-center lg:text-start w-[334px]  leading-[30px] ">
            Forget password
          </h1>
          <p className="font-normal text-[16px] text-gray-8"></p>
          Enter your email.
          {/* email */}
          <div className="space-y-2 mt-5 w-full ">
            <p
              className={`text-[14px] font-normal  ${
                emailError ? "text-red-1" : "text-gray-8"
              }`}
            >
              Email
            </p>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className={`h-[28px]  text-[14px] text-gray-8  font-normal focus:outline-none w-full ${
                emailError ? "border-red-1" : "border-gray-9"
              } border-b-[1px] `}
            />
            {emailError && (
              <p className="text-red-1 text-[14px] font-normal">{emailError}</p>
            )}
          </div>
          <button
            onClick={handleSendOtp}
            disabled={isLoading}
            className="mt-6 h-[52px] w-full rounded-[12px] text-white font-medium text-[16px]  bg-green-1 cursor-pointer"
          >
            {isLoading ? <BeatLoader color="white" size={8} /> : "Continue"}
          </button>
          <div className="flex justify-center mt-[80px] w-full">
            <div className="h-[30px] w-[70px] bg-green-1 rounded-[6px] text-white flex items-center justify-center text-[18px] font-semibold">
              market
            </div>
          </div>
          <div className="w-full flex justify-center items-center font-[400] text-[12px] text-green-1 gap-[6px] mt-3">
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

export default ForgetPassword;
