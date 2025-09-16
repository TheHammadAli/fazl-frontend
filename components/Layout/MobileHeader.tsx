"use client";

import { act, useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import logo from "@/assets/icons/logo-with-text.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import dummyProfile from "@/assets/images/profile-placehonder.png";
import { links } from "@/assets/content/links";
import { usePathname, useRouter } from "next/navigation";
import copyRight from "@/assets/icons/copyright.svg";
import LangSwitcher from "../Ui/LangSwitcher";
import { useGetUserDetailQuery } from "@/store/services/profileService";
import { useAppSelector } from "@/store/store";
export default function MobileHeader() {
  const { userId } = useAppSelector((state) => state.authReducer);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const { pages, placeholders, currentLanguage } = useDictionary();
  const {
    data: profileData,
    isLoading: profileLoading,
    isFetching: profileFetching,
    isError: profileError,
    refetch,
  } = useGetUserDetailQuery(userId, { skip: userId === "" });
  return (
    <header className="bg-white  h-[80px] flex items-center  lg:hidden border-b-[1px] border-gray-9 ">
      <div className="px-5 w-full max-w-7xl mx-auto  ">
        <nav
          aria-label="Global"
          className=" flex  items-center gap-5 justify-between w-full "
        >
          <div className="bg-green-1  rounded-[6px] py-1.5 px-1.5 w-max leading-[18px] text-white font-medium text-[18px]">
            <p className="">{placeholders.market}</p>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
        </nav>
        <Dialog
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
          className="lg:hidden"
        >
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0  z-50 w-full ltr:right-0  overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                {/* <Image src={logo} alt="logo" /> */}
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div>
                  {links.map((link, index) => {
                    const active: boolean = path.includes(link?.href);
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push(link.href);
                        }}
                        className={` flex items-center gap-3 py-3 cursor-pointer`}
                      >
                        <Image
                          src={active ? link.icon?.active : link.icon?.inactive}
                          alt="icon"
                        />
                        <h2
                          className={`font-normal text-[14px] ${
                            active ? "text-green-1" : "text-gray-8"
                          } leading-none`}
                        >
                          {
                            pages?.[
                              link?.title?.toLocaleLowerCase() as keyof typeof pages
                            ]
                          }
                        </h2>
                      </div>
                    );
                  })}
                  <div
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push("/profile");
                    }}
                    className=" flex items-center gap-3 py-3 hover:bg-green-3 cursor-pointer"
                  >
                    <Image
                      src={
                        profileData?.data?.image &&
                        !profileData?.data?.image.includes("default-avatar")
                          ? `${
                              profileData?.data?.image
                            }?t=${new Date().getTime()}`
                          : dummyProfile
                      }
                      height={100}
                      width={100}
                      alt="icon"
                      unoptimized
                      className={`h-[26px] w-[26px] rounded-full object-cover ${
                        path.includes("/profile") &&
                        "border-[2px] border-green-1"
                      }`}
                    />
                    <h2
                      className={`font-normal text-[14px] ${
                        path.includes("/profile")
                          ? "text-green-1"
                          : "text-gray-8"
                      } leading-none`}
                    >
                      {pages.profile}
                    </h2>
                  </div>
                  <div className=" flex flex-col items-center mt-20">
                    <div className="flex items-center gap-[6px] text-[12px] font-normal">
                      <span className="text-green-1 underline cursor-pointer">
                        {placeholders.company}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-gray-7"></div>
                      <span className="text-green-1 underline cursor-pointer">
                        {placeholders.contact}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-gray-7"></div>
                      <span className="text-green-1 underline cursor-pointer">
                        {placeholders.terms}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-gray-7"></div>
                      <div className="text-green-1 underline cursor-pointer text-[12px] font-normal -mt-[2px]">
                        {placeholders.privacy}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ">
                      <div className="flex gap-[3px] pt-1 min-w-max">
                        <Image src={copyRight} alt="icon" />
                        <span className="text-gray-6 text-[12px] font-light">
                          2025 {placeholders.market}
                        </span>
                      </div>
                      <div className="pt-2">
                        <LangSwitcher />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </div>
    </header>
  );
}
