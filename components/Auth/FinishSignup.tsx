"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import chevDown from "@/assets/icons/chev-down-icon.svg";
import countries from "country-list-with-dial-code-and-flag";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import locationIcon from "@/assets/icons/location-icon.svg";
import { locations } from "@/assets/content/locations";
import { BeatLoader } from "react-spinners";
import { useAppSelector } from "@/store/store";
import { validatePhone } from "./SendOtp";
import { useSignupMutation } from "@/store/services/authService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function FinishSignup({ password }: { password: string }) {
  const router = useRouter();
  const {
    email: emailData,
    phone: phoneData,
    type,
  } = useAppSelector((state) => state.authReducer.otpInfo);
  const countryRef = useRef<HTMLDivElement | null>(null);
  const locationRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const allCountries = countries.getAll();
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [location, setLocation] = useState<{
    name?: string;
    subtitle?: string;
    type?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  }>({});
  const [signup, { isLoading, isSuccess, isError, error, data }] =
    useSignupMutation();
  const [locationError, setLocationError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [countryCodeError, setCountryCodeError] = useState("");
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const simplified = allCountries.map(({ name, dial_code }) => ({
    name,
    dial_code,
  }));

  const filteredCountryCodes =
    search === ""
      ? simplified
      : simplified?.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        );
  const filteredLocations =
    locationSearch === ""
      ? locations
      : locations?.filter(
          (c) =>
            c.name.toLowerCase().includes(locationSearch) ||
            c.subtitle?.toLowerCase().includes(locationSearch)
        );

  useClickOutside(countryRef, () => {
    setIsOpen(false);
  });
  useClickOutside(locationRef, () => {
    setIsLocationOpen(false);
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const checkField = (
      value: string,
      setter: React.Dispatch<React.SetStateAction<string>>,
      message: string
    ) => {
      if (value.trim() === "") {
        setter(message);
      } else {
        setter("");
      }
    };
    checkField(firstName, setFirstNameError, "First name is required*");
    checkField(lastName, setLastNameError, "Last name is required*");
    if (Object.keys(location).length === 0) {
      setLocationError("Location is required*");
    } else {
      setLocationError("");
    }

    if (type === "phone") {
      if (email.trim() === "") {
        setEmailError("Email is required*");
      } else if (!regex.test(email)) {
        setEmailError("Please enter a valid email");
      } else {
        setEmailError("");
      }
    }

    if (type === "email") {
      checkField(countryCode, setCountryCodeError, "Country code is required*");

      if (phone.trim() === "") {
        setPhoneError("Phone number is required*");
      } else if (validatePhone(phone) === false) {
        setPhoneError("Please enter valid phone number");
      } else {
        setPhoneError("");
      }
    }
    if (
      !emailError &&
      !phoneError &&
      !countryCodeError &&
      !locationError &&
      !firstNameError &&
      !lastNameError
    ) {
      const payload = {
        email: type === "email" ? emailData : email,
        password: password,
        name: firstName + " " + lastName,
        phone: type === "phone" ? phoneData : phone,
        address: location?.name + " " + location?.subtitle,
        location: {
          type: "Point",
          coordinates: [
            location?.coordinates?.latitude,
            location?.coordinates?.longitude,
          ],
        },
      };
      signup(payload);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message);
      localStorage.removeItem("otpInfo");
      localStorage.removeItem("confirmedPwd");

      const timer = setTimeout(() => {
        router.push("/signin");
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
    <div className="w-[50%] px-[50px] xl:px-[140px] pt-[70px]  ">
      <form onSubmit={handleSubmit} className="">
        <h1 className="text-black-1 font-medium text-[22px] w-[334px]  leading-[30px] ">
          Finish Signing up{" "}
        </h1>
        <p className=" text-[16px] font-light text-gray-8">
          {type === "email" ? emailData : phoneData}
        </p>{" "}
        <div className="mt-5 flex gap-[14px] items-center  ">
          <div className="h-[62px] font-medium text-[16px] text-black-2 rounded-[22px] w-[62px] bg-[#E6FBFB] flex items-center justify-center">
            NM
          </div>
          <input type="file" className="hidden" id="profile-photo" />
          <label
            htmlFor="profile-photo"
            className="text-[14px] font-medium text-green-1 underline cursor-pointer"
          >
            Add photo
          </label>
        </div>
        {/* first name */}
        <div className="space-y-1 mt-5">
          <p
            className={`text-[14px] font-normal  ${
              firstNameError ? "text-red-1" : "text-gray-8"
            }`}
          >
            First name
          </p>
          <input
            type="text"
            value={firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFirstName(e.target.value)
            }
            className="h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
          />
          {firstNameError && (
            <p className="text-red-1 text-[14px] font-normal">
              {firstNameError}
            </p>
          )}
        </div>
        {/* last name */}
        <div className="space-y-1 mt-5">
          <p
            className={`text-[14px] font-normal  ${
              lastNameError ? "text-red-1" : "text-gray-8"
            }`}
          >
            Last name
          </p>
          <input
            type="text"
            value={lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLastName(e.target.value)
            }
            className="h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
          />
          {lastNameError && (
            <p className="text-red-1 text-[14px] font-normal">
              {lastNameError}
            </p>
          )}
        </div>
        {/* email address */}
        {type === "phone" && (
          <div className="space-y-1 mt-5">
            <p
              className={`text-[14px] font-normal  ${
                emailError ? "text-red-1" : "text-gray-8"
              }`}
            >
              Email address
            </p>
            <input
              type="email"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              value={email}
              className="h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
            />
            {emailError && (
              <p className="text-red-1 text-[14px] font-normal">{emailError}</p>
            )}
          </div>
        )}
        {/* phone number */}
        {type === "email" && (
          <div>
            <div className="mt-5">
              <div
                className={`text-[14px] font-normal  ${
                  countryCodeError ? "text-red-1" : "text-gray-8"
                }`}
              >
                Country code
              </div>
              <div ref={countryRef} className="relative inline-block w-full">
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
                  <div className="absolute z-20  text-gray-8 w-full text-[14px] bg-white pt-1">
                    <input
                      type="text"
                      placeholder="Search country..."
                      className="w-full px-4 font-light py-2 outline-none  text-sm border border-gray-200 rounded-md  "
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className=" border   max-h-[250px] overflow-scroll hide-scrollbar  border-gray-200 rounded-md shadow-md mt-2">
                      {filteredCountryCodes.length > 0 ? (
                        filteredCountryCodes?.map((data, index) => (
                          <div
                            onClick={() => {
                              setCountryName(data?.name);
                              setCountryCode(data?.dial_code);
                              setPhone(data?.dial_code);
                              setIsOpen(false);
                            }}
                            className="text-[14px]  text-gray-8 px-4 py-2 text-sm cursor-pointer font-light hover:bg-gray-100"
                            key={index}
                          >{`(${data.dial_code}) ${data.name}`}</div>
                        ))
                      ) : (
                        <div className="text-[14px]  text-gray-8 px-4 py-2 text-sm cursor-pointer font-light">
                          No country found
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {countryCodeError && (
                  <p className="text-red-1 text-[14px] font-normal">
                    {countryCodeError}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-5">
              <p
                className={`text-[14px] font-normal  ${
                  phoneError ? "text-red-1" : "text-gray-8"
                }`}
              >
                Phone number
              </p>
              <input
                type="phone"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPhone(e.target.value);
                }}
                className={`h-[28px] text-[14px] text-gray-8  font-normal focus:outline-none w-full ${
                  phoneError ? "border-red-1" : "border-gray-9"
                } border-b-[1px] `}
              />
              {phoneError && (
                <p className="text-red-1 text-[14px] font-normal">
                  {phoneError}
                </p>
              )}
            </div>
          </div>
        )}
        {/* location */}
        <div className="mt-5">
          <div
            className={`text-[14px] font-normal  ${
              locationError ? "text-red-1" : "text-gray-8"
            }`}
          >
            Choose location
          </div>
          <div ref={locationRef} className="relative inline-block w-full">
            <div
              className="pb-1 w-full flex items-center border-b-[1px] border-gray-9 justify-between mt-1 cursor-pointer"
              onClick={() => {
                setIsLocationOpen(!isLocationOpen);
              }}
            >
              <h2 className="text-[15px] font-normal text-gray-8">
                {location.name ? location.name : "Choose location"}
              </h2>
              <Image
                src={chevDown}
                alt="chev-down"
                className="h-[16px] w-[12px]"
                height={100}
                width={100}
              />
            </div>
            {isLocationOpen && (
              <div className="absolute z-20  w-full bg-white pt-1   ">
                <input
                  type="text"
                  placeholder="Search country..."
                  className="w-full px-4 font-light py-2 outline-none  text-sm border border-gray-200 rounded-md  "
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
                <div className="max-h-[250px] border overflow-scroll border-gray-200 rounded-md shadow-md mt-2">
                  {filteredLocations?.length > 0 ? (
                    filteredLocations?.map((data, index) => (
                      <div
                        onClick={() => {
                          setLocation(data);
                          setIsLocationOpen(false);
                        }}
                        className="text-[15px]  text-gray-8 px-4 py-2 text-sm cursor-pointer font-light hover:bg-gray-100"
                        key={index}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={locationIcon}
                            alt=""
                            className="h-[18px] w-[14px]"
                          />
                          <div>
                            <h1 className="font-medium">{data.name}</h1>
                            <h2>{data.subtitle}</h2>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[15px]  text-gray-8 px-4 py-2 text-sm cursor-pointer font-light hover:bg-gray-100">
                      No locations found
                    </div>
                  )}
                </div>
              </div>
            )}
            {locationError && (
              <p className="text-red-1 text-[14px] font-normal">
                {locationError}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Image
            src={locationIcon}
            className="h-[13px] w-[11px]"
            alt="Country Flag"
          />
          <p className="text-[#030303] font-medium text-[14px] underline cursor-pointer">
            Choose location on map
          </p>
        </div>
        <div className=" font-light text-[14px] text-gray-11 mt-5 max-w-[306px]">
          By selecting Agree and continue, I agree to Knayf’s{" "}
          <span className="hover:underline text-green-1 font-medium ">
            Terms of Service
          </span>{" "}
          and acknowledge the{" "}
          <span className="hover:underline text-green-1 font-medium ">
            Privacy Policy
          </span>{" "}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 h-[52px] w-full rounded-[12px] text-white font-medium text-[16px]  bg-green-1 cursor-pointer"
        >
          {isLoading ? <BeatLoader color="white" size={8} /> : "Continue"}
        </button>
        <div className="flex justify-center mt-[80px]">
          <div className="h-[30px] w-[70px] bg-green-1 rounded-[6px] text-white flex items-center justify-center text-[18px] font-semibold">
            Knayf
          </div>
        </div>
        <div className=" flex justify-center items-center font-[400] text-[12px] text-green-1 gap-[6px] mt-3">
          <p>Contact</p>
          <div className="h-1 w-1 bg-green-1 rounded-full"></div>
          <p>Terms and Conditions</p>
          <div className="h-1 w-1 bg-green-1 rounded-full"></div>
          <p>Privacy Policy</p>
        </div>
        <div className="h-[50px]"></div>
      </form>
    </div>
  );
}

export default FinishSignup;
