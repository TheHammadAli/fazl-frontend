"use client";
import React, { useState } from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";
import { BeatLoader } from "react-spinners";
import { useAppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { useSigninMutation } from "@/store/services/authService";
import toast from "react-hot-toast";
import {
  setProfileCompleted,
  setToken,
  setUserId,
} from "@/store/reducers/authReducer";
import { BASE_URL } from "@/assets/content/constants";
import GoogleIcon from "@/assets/icons/google-icon.svg";

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

  const [signin, { isLoading }] = useSigninMutation();

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required*");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPasswordError("Password is required*");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    try {
      const body: Body = { email, password };

      // 🔥 PRO TIP — unwrap
      const res = await signin(body).unwrap();

      toast.success(res.message);

      // ✅ Store tokens
      dispatch(
        setToken({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        })
      );

      // ✅ Store user
      localStorage.setItem("user", JSON.stringify({ user: res.data.user }));

      dispatch(setUserId(res.data.user.id));

      // ✅ Navigation
      if (!res?.data?.user?.phone) {
        dispatch(setProfileCompleted(false));
        router.replace("/complete-info");
      } else {
        dispatch(setProfileCompleted(true));

        router.replace("/welcome");
      }
    } catch (err) {
      const errorData = err as { data?: { message?: string } };

      toast.error(errorData?.data?.message || "Something went wrong!", {
        duration: 4000,
      });
    }
  };

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
        <div className="max-w-[500px] w-full">
          <h1 className="text-black-1 font-medium text-[22px] text-center">
            Sign in
          </h1>
          <p className="font-light text-[14px] text-center text-gray-8">
            Sign in to your account
          </p>

          {/* Email */}
          <div className="space-y-2 mt-5">
            <p
              className={`text-[14px] ${
                emailError ? "text-red-1" : "text-gray-8"
              }`}
            >
              Email
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-[28px] w-full border-b ${
                emailError ? "border-red-1" : "border-gray-9"
              } focus:outline-none`}
            />
            {emailError && (
              <p className="text-red-1 text-[14px]">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2 mt-5">
            <p
              className={`text-[14px] ${
                passwordError ? "text-red-1" : "text-gray-8"
              }`}
            >
              Password
            </p>
            <div
              className={`flex items-center border-b ${
                passwordError ? "border-red-1" : "border-gray-9"
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[28px] w-full focus:outline-none"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer underline"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            {passwordError && (
              <p className="text-red-1 text-[14px]">{passwordError}</p>
            )}
          </div>

          <div className="flex justify-end pt-4 text-[14px] text-green-1">
            <p
              className="cursor-pointer hover:underline"
              onClick={() => router.push("/forget-password")}
            >
              Forgot password?
            </p>
          </div>

          <button
            type="submit"
            className="mt-6 h-[52px] w-full rounded-[12px] bg-green-1 text-white"
            disabled={isLoading}
          >
            {isLoading ? <BeatLoader color="white" size={8} /> : "Continue"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`${BASE_URL}/auth/google`)}
            className="mt-6 h-[52px] w-full rounded-[12px] bg-blue-1 text-white flex items-center justify-center gap-2"
          >
            <Image src={GoogleIcon} alt="google_icon" />
            Continue with Google
          </button>

          <div className="text-center text-[12px] text-gray-8 mt-5">
            Don&apos;t have an account?{" "}
            <span
              className="text-green-1 cursor-pointer hover:underline"
              onClick={() => router.push("/send-otp")}
            >
              Sign up
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Signin;
