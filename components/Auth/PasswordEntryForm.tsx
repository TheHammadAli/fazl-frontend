"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import AuthImage from "@/assets/images/auth-image.png";
import { BeatLoader } from "react-spinners";
import greenTick from "@/assets/icons/green-tick-icon.svg";
import redCross from "@/assets/icons/red-cross-icon.svg";
import Footer from "./Footer";

export type PasswordEntryFormProps = {
  title: string;
  subtitle: string;
  submitLabel?: string;
  isLoading?: boolean;
  onSubmit: (password: string) => void;
};

function PasswordEntryForm({
  title,
  subtitle,
  submitLabel = "Continue",
  isLoading = false,
  onSubmit,
}: PasswordEntryFormProps) {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationStatus, setValidationStatus] = useState({
    length: false,
    specialCharacter: false,
    noSpaces: false,
  });

  useEffect(() => {
    const hasLength = password.length >= 8;
    const hasSpecialCharacter = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(
      password,
    );
    const hasNoSpaces = !password.includes(" ");
    if (password !== "") {
      setValidationStatus({
        length: hasLength,
        specialCharacter: hasSpecialCharacter,
        noSpaces: hasNoSpaces,
      });
      if (!hasLength || !hasSpecialCharacter || !hasNoSpaces) {
        setPasswordError("Password must meet all requirements.");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (confirmPassword !== "" && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let valid = true;

    if (password === "") {
      setPasswordError("Password is required*");
      valid = false;
    }
    if (confirmPassword === "") {
      setConfirmPasswordError("Confirm password is required*");
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }

    if (
      !validationStatus.length ||
      !validationStatus.specialCharacter ||
      !validationStatus.noSpaces
    ) {
      setPasswordError("Password must meet all requirements.");
      valid = false;
    }

    if (valid) {
      onSubmit(password);
    }
  };

  return (
    <div className="w-screen h-screen lg:flex min-h-[818px] hide-scrollbar pt-[50px] lg:pt-0">
      <div className=" hidden lg:block lg:w-[60%] lg:pl-8 xl:pl-24   ">
        <Image
          src={AuthImage}
          alt="auth-image"
          className="h-full w-full object-cover "
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full lg:w-[50%] flex flex-col lg:justify-between px-5 sm:px-[50px] xl:px-[150px] pt-[80px]"
      >
        <div className="w-full flex flex-col items-center lg:items-start">
          <h1 className="text-black-1 font-medium text-[22px] w-[334px]  leading-[30px] text-center lg:text-left">
            {title}
          </h1>
          <p className="font-normal text-[16px] text-gray-8 text-center lg:text-left">
            {subtitle}
          </p>

          <div className="space-y-2 mt-5 w-full max-w-[500px] lg:max-w-full">
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
                className="h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full  "
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
          {password !== "" && (
            <div className="mt-3 space-y-2 w-full  max-w-[500px] lg:max-w-full">
              <div className="flex items-center gap-[4px] ">
                <Image
                  src={validationStatus.length ? greenTick : redCross}
                  alt="validation status"
                  className="inline-block "
                />
                <p
                  className={`text-[14px] font-normal ${
                    validationStatus.length ? "text-green-1" : "text-red-500"
                  }`}
                >
                  Must be at least 8 characters
                </p>
              </div>
              <div className="flex items-center gap-[4px]">
                <Image
                  src={
                    validationStatus.specialCharacter ? greenTick : redCross
                  }
                  alt="validation status"
                  className="inline-block "
                />
                <p
                  className={`text-[14px] font-normal leading-none ${
                    validationStatus.specialCharacter
                      ? "text-green-1"
                      : "text-red-500"
                  }`}
                >
                  Must have at least one special character
                </p>
              </div>
              <div className="flex items-center gap-[4px]">
                <Image
                  src={validationStatus.noSpaces ? greenTick : redCross}
                  alt="validation status"
                  className="inline-block "
                />
                <p
                  className={`text-[14px] font-normal ${
                    validationStatus.noSpaces ? "text-green-1" : "text-red-500"
                  }`}
                >
                  Can&apos;t contain spaces
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 mt-5 w-full  max-w-[500px] lg:max-w-full">
            <p
              className={`text-[14px] font-normal
            ${confirmPasswordError ? "text-red-1" : "text-gray-8"}
              `}
            >
              Confirm password
            </p>
            <div
              className={`flex gap-1 items-center ${
                confirmPasswordError ? "border-red-1" : "border-gray-9"
              } border-b-[1px]`}
            >
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                className="h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full  "
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[14px] font-medium text-black-1 cursor-pointer underline"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </span>
            </div>

            {confirmPasswordError && (
              <p className="text-red-1 text-[14px] font-normal">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6  max-w-[500px] lg:max-w-full h-[52px] w-full rounded-[12px] text-white font-medium text-[16px]  bg-green-1 cursor-pointer"
          >
            {isLoading ? <BeatLoader color="white" size={8} /> : submitLabel}
          </button>
        </div>
        <div className="mt-14 w-full">
          <Footer />
        </div>
      </form>
    </div>
  );
}

export default PasswordEntryForm;
