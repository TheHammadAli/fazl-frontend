import { useDictionary } from "@/dictionaries/DictionaryProvider";
import React, { useEffect, useRef, useState } from "react";
import chevron from "@/assets/icons/chev-down-icon.svg";
import Image from "next/image";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import locationIcon from "@/assets/icons/location-icon.svg";
import {
  useGetLocationsQuery,
  useSignupMutation,
} from "@/store/services/authService";
// import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/store/store";
import countries from "country-list-with-dial-code-and-flag";
import { useDebounce } from "use-debounce";
import { validatePhone } from "../Auth/SendOtp";
import dummyProfile from "@/assets/images/profile-placehonder.png";
import chevDown from "@/assets/icons/chev-down-icon.svg";
import { BeatLoader } from "react-spinners";

interface Location {
  description?: string;

  type?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}
interface ProfileInfoTypes {
  toggle: boolean;
  setToggle: (value: boolean) => void;
}
function ProfileInfo({ toggle, setToggle }: ProfileInfoTypes) {
  const { placeholders, error_messages } = useDictionary();
  // const router = useRouter();
  // const {
  //   email: emailData,
  //   phone: phoneData,
  //   type,
  // } = useAppSelector((state) => state?.authReducer?.otpInfo);
  const countryRef = useRef<HTMLDivElement | null>(null);
  const locationRef = useRef<HTMLDivElement | null>(null);
  // const [isOpen, setIsOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const allCountries = countries.getAll();
  // const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [location, setLocation] = useState<Location>({});
  const [signup, { isLoading, isSuccess, isError, error, data }] =
    useSignupMutation();
  const [locationError, setLocationError] = useState("");
  // const [phoneError, setPhoneError] = useState("");
  const [profile, setProfile] = useState<string | null>(null);
  // const [countryCodeError, setCountryCodeError] = useState("");
  // const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  // const simplified = allCountries.map(({ name, dial_code }) => ({
  //   name,
  //   dial_code,
  // }));

  const [debouncedLocationSearch] = useDebounce(locationSearch, 500);

  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    isSuccess: isLocationsSuccess,
    isFetching: isLocationsFetching,
  } = useGetLocationsQuery(
    {
      q: debouncedLocationSearch,
    },
    { skip: locationSearch.trim() == "" || locationSearch == null }
  );

  // const filteredCountryCodes =
  //   search === ""
  //     ? simplified
  //     : simplified?.filter((c) =>
  //         c.name.toLowerCase().includes(search.toLowerCase())
  //       );

  // useClickOutside(countryRef, () => {
  //   setIsOpen(false);
  // });
  useClickOutside(locationRef, () => {
    setIsLocationOpen(false);
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid: boolean = true;
    const checkField = (
      value: string,
      setter: React.Dispatch<React.SetStateAction<string>>,
      message: string
    ) => {
      if (value.trim() === "") {
        setter(message);
        isValid = false;
      } else {
        setter("");
      }
    };

    checkField(firstName, setFirstNameError, error_messages.firstname_required);
    checkField(lastName, setLastNameError, error_messages.lastname_required);
    if (Object.keys(location).length === 0) {
      setLocationError(error_messages.location_required);
      isValid = false;
    } else {
      setLocationError("");
    }

    // if (type === "phone") {
    if (email.trim() === "") {
      setEmailError(error_messages.email_required);
      isValid = false;
    } else if (!regex.test(email)) {
      setEmailError(error_messages.valid_email);
      isValid = false;
    } else {
      setEmailError("");
    }
    // }

    // if (type === "email") {
    // checkField(countryCode, setCountryCodeError, "Country code is required*");

    // if (phone.trim() === "") {
    //   setPhoneError("Phone number is required*");
    //   isValid = false;
    // } else if (validatePhone(phone) === false) {
    //   setPhoneError("Please enter valid phone number");
    //   isValid = false;
    // } else {
    //   setPhoneError("");
    // }
    // }
    if (isValid) {
      const payload = {
        // email: type === "email" ?
        emailData: email,
        password: "ddddd",
        name: firstName + " " + lastName,
        // phone: type === "phone" ? phoneData : phone,
        address: location?.description,
        location: {
          type: "Point",
          coordinates: [location?.coordinates?.lat, location?.coordinates?.lng],
        },
      };
      const formData = new FormData();
      (Object.keys(payload) as (keyof typeof payload)[]).forEach((key) => {
        const value = payload[key];
        if (value !== undefined) {
          if (key === "location") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (profile && typeof profile === "string") {
        formData.append("image", profile);
      }

      // signup(formData);
    }
  };
  return (
    <div className="w-full  h-max">
      <div className="px-6 xl:px-0 h-[61px] border-b-[1px] border-gray-9 bg-white w-full  flex justify-center">
        <div className="w-full  max-w-[520px] flex items-center gap-[6px] font-normal text-[14px] mt-5">
          <svg
            onClick={() => {
              setToggle(!toggle);
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            stroke="#007781"
            className="size-5 mr-2 md:hidden cursor-pointer rtl:rotate-180"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>

          <span className="text-gray-8">{placeholders.profile}</span>
          <Image
            src={chevron}
            alt="chevron"
            className="-rotate-90 rtl:rotate-90"
          />
          <span className="text-green-1">Nouman Malik</span>
        </div>
      </div>
      {/*Edit Profile Info */}
      <div className=" px-6 xl:px-0 flex justify-center">
        <form onSubmit={handleSubmit} className="w-full  max-w-[520px]  ">
          <div className="mt-5 flex gap-[14px] items-center  w-full ">
            <div className="h-[62px] overflow-hidden  font-medium text-[16px] text-black-2 rounded-[22px] w-[62px] bg-[#E6FBFB] flex items-center justify-center">
              {typeof profile === "string" ? (
                <img
                  src={profile ?? ""}
                  alt=""
                  className="object-cover h-full w-full"
                />
              ) : firstName && lastName ? (
                firstName.slice(0, 1) + lastName.slice(0, 1)
              ) : (
                <Image
                  src={dummyProfile}
                  alt="profile"
                  className="h-[100px] w-[100px] object-cover"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setProfile(URL.createObjectURL(e.target.files[0]));
                }
              }}
              id="profile-photo"
            />
            <label
              htmlFor="profile-photo"
              className="text-[14px] font-medium text-green-1 underline cursor-pointer"
            >
              {placeholders.add_photo}
            </label>
          </div>
          {/* first name */}
          <div className="space-y-1 mt-5 w-full">
            <p
              className={`text-[14px] font-normal  ${
                firstNameError ? "text-red-1" : "text-gray-8"
              }`}
            >
              {placeholders.firstname}
            </p>
            <input
              type="text"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFirstName(e.target.value)
              }
              className="h-[28px] text-[15px] text-black-1 font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
            />
            {firstNameError && (
              <p className="text-red-1 text-[14px] font-normal">
                {firstNameError}
              </p>
            )}
          </div>
          {/* last name */}
          <div className="space-y-1 mt-5 w-full">
            <p
              className={`text-[14px] font-normal  ${
                lastNameError ? "text-red-1" : "text-gray-8"
              }`}
            >
              {placeholders.Lastname}
            </p>
            <input
              type="text"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLastName(e.target.value)
              }
              className="h-[28px] text-[15px] text-black-1  font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
            />
            {lastNameError && (
              <p className="text-red-1 text-[14px] font-normal">
                {lastNameError}
              </p>
            )}
          </div>
          {/* email address */}
          {/* {mounted && type === "phone" && ( */}
          <div className="space-y-1 mt-5 w-full">
            <p
              className={`text-[14px] font-normal  ${
                emailError ? "text-red-1" : "text-gray-8"
              }`}
            >
              {placeholders.email_address}
            </p>
            <input
              type="email"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              value={email}
              className="h-[28px] text-[15px] text-black-1  font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
            />
            {emailError && (
              <p className="text-red-1 text-[14px] font-normal">{emailError}</p>
            )}
          </div>
          {/* )} */}
          {/* phone number
          {mounted && type === "email" && (
            <div className="w-full">
              <div className="mt-5 w-full">
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
                        onChange={(e) => {
                          setSearch(e.target.value);
                        }}
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
          )} */}
          {/* location */}
          <div className="mt-5 w-full">
            <div
              className={`text-[14px] font-normal w-full ${
                locationError ? "text-red-1" : "text-gray-8"
              }`}
            >
              {placeholders.choose_location}
            </div>
            <div ref={locationRef} className="relative inline-block w-full">
              <div
                className="pb-1 w-full max-w-[350px] flex items-center  justify-between mt-1 cursor-pointer"
                onClick={() => {
                  setIsLocationOpen(!isLocationOpen);
                }}
              >
                <h2 className="text-[15px] font-normal text-black-1">
                  {location?.description
                    ? location.description
                    : placeholders.choose_location}
                </h2>
                <Image
                  src={chevDown}
                  alt="chev-down"
                  className="h-[16px] w-[12px]"
                  height={100}
                  width={100}
                />
              </div>
              <div className="h-[1px]  bg-gray-9"></div>
              {isLocationOpen && (
                <div className="absolute z-20 max-w-[350px] w-full bg-white pt-1   ">
                  <input
                    type="text"
                    placeholder="Search country..."
                    className="w-full px-4 font-light py-2 outline-none  text-sm border border-gray-200 rounded-md  "
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                  <div className="max-h-[250px] border overflow-scroll border-gray-200 rounded-md shadow-md mt-2">
                    {!isLocationsLoading &&
                      !isLocationsFetching &&
                      locationsData?.data?.length > 0 &&
                      locationsData?.data?.map(
                        (data: Location, index: number) => (
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
                                <h2>{data?.description}</h2>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    {!isLocationsLoading &&
                      !isLocationsFetching &&
                      locationsData?.data?.length === 0 && (
                        <div className="text-[15px]  text-gray-8 px-4 py-2 text-sm cursor-pointer font-light hover:bg-gray-100">
                          No locations found
                        </div>
                      )}
                    {(isLocationsLoading || isLocationsFetching) && (
                      <div className="w-full space-y-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 h-[40px] animate-pulse"
                          ></div>
                        ))}
                      </div>
                    )}
                    {!locationsData &&
                      !isLocationsLoading &&
                      !isLocationsFetching && (
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
          <div className="flex items-center gap-2 mt-1 w-full">
            <Image
              src={locationIcon}
              className="h-[13px] w-[11px]"
              alt="Country Flag"
            />
            <p className="text-[#030303] font-medium text-[14px] underline cursor-pointer">
              {placeholders.choose_map_location}
            </p>
          </div>
          <div></div>{" "}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6  h-[55px] w-[222px] rounded-[12px] text-white font-medium text-[16px]  bg-green-1 cursor-pointer"
          >
            {isLoading ? (
              <BeatLoader color="white" size={8} />
            ) : (
              placeholders.save
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileInfo;
