"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";
import { BeatLoader } from "react-spinners";
import { useAppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { useSigninMutation } from "@/store/services/authService";
import toast from "react-hot-toast";
import { setToken } from "@/store/reducers/authReducer";

export type Body = {
  email?: string;
  password?: string;
};

function Signin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [emailError, setEmailError] = useState("");
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signin, { isLoading, isSuccess, isError, error, data }] =
    useSigninMutation();

  const handleSignin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid: boolean = true;
    if (email.trim() === "") {
      setEmailError("Email is required*");
      isValid = false;
    }
    if (password.trim() === "") {
      setPasswordError("Password is required*");
      isValid = false;
    } else {
      isValid = true;
      setEmailError("");
      setPasswordError("");
    }

    if (isValid) {
      const body: Body = { email, password };
      signin(body);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message);
      dispatch(setToken(data?.data?.accessToken));
      const timer = setTimeout(() => {
        router.push("/welcome");
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
    <div className="w-screen h-screen flex min-h-[818px]">
      {/* Left section */}
      <div className="hidden lg:block lg:w-[60%] pl-8 xl:pl-24 ">
        <Image
          src={AuthImage}
          alt="auth-image"
          className="h-full w-full object-cover"
        />
      </div>
      {/* Right section */}
      <form
        onSubmit={handleSignin}
        className="w-full lg:w-[50%] px-5 sm:px-[50px] xl:px-[150px] pt-[80px] flex flex-col items-center lg:justify-between"
      >
        <div className="max-w-[500px] lg:max-w-full   w-full">
          <h1 className="text-black-1 font-medium text-[22px] text-center  leading-[30px] ">
            Sign in
          </h1>
          <p className="font-light text-[14px] text-center text-gray-8">
            Sign in to your account
          </p>

          {/* email */}
          <div className="space-y-2 mt-5">
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
              className={`h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full ${
                emailError ? "border-red-1" : "border-gray-9"
              } border-b-[1px] `}
            />
            {emailError && (
              <p className="text-red-1 text-[14px] font-normal">{emailError}</p>
            )}
          </div>

          {/* password */}
          <div className="space-y-2 mt-5">
            <p
              className={`text-[14px] font-normal
                    ${passwordError ? "text-red-1" : "text-gray-8"}
                      `}
            >
              Password
            </p>
            <div
              className={`flex gap-1 items-center ${
                passwordError ? "border-red-1" : "border-gray-9"
              } border-b-[1px]`}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className={`h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full  `}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="text-[14px] font-medium text-black-1 cursor-pointer underline"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            <p className="text-red-1 text-[14px] font-normal -mt-1">
              {passwordError}
            </p>
          </div>
          <div className="flex justify-end pt-4 text-[14px] font-normal text-green-1 ">
            <p
              className="cursor-pointer w-max hover:underline"
              onClick={() => router.push("/forget-password")}
            >
              Forgot password?
            </p>
          </div>
          <button
            type="submit"
            disabled={false}
            className="mt-6 h-[52px] w-full rounded-[12px] text-white font-medium text-[16px]  bg-green-1 cursor-pointer"
          >
            {isLoading ? <BeatLoader color="white" size={8} /> : "Continue"}
          </button>

          <div className="text-center font-normal text-[12px] text-gray-8 mt-5">
            Don&apos;t have an account?{" "}
            <span
              className="text-green-1 hover:underline cursor-pointer"
              onClick={() => router.push("/send-otp")}
            >
              Sign up
            </span>
          </div>
        </div>
        <div className="mb-20">
          <div className="flex justify-center mt-[80px]">
            <div className="h-[30px] w-[70px] bg-green-1 rounded-[6px] text-white flex items-center justify-center text-[18px] font-semibold">
              market
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center font-[400] text-[12px] text-green-1 gap-[6px] mt-3">
            <p>Contact</p>
            <div className="h-1 w-1 bg-green-1 rounded-full"></div>
            <p>Terms and Conditions</p>
            <div className="h-1 w-1 bg-green-1 rounded-full"></div>
            <p>Privacy Policy</p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Signin;
