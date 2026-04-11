"use client";
import { links } from "@/assets/content/links";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import React, { type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import dummyProfile from "@/assets/images/profile-placehonder.png";
import copyRight from "@/assets/icons/copyright.svg";
import LangSwitcher from "../Ui/LangSwitcher";
import { useAppSelector } from "@/store/store";
import { useGetUserDetailQuery } from "@/store/services/profileService";
import { Dialog, DialogPanel } from "@headlessui/react";

// Avoid SSR + hydration issues with cookies, sockets, and Headless UI Dialog.
const Notifications = dynamic(() => import("../Updates/Notifications"), {
  ssr: false,
});

function Sidebar({
  unreadCount,
  setReadCount,
  openSidebar,
  setOpenSidebar,
}: {
  unreadCount: number;
  setReadCount: Dispatch<SetStateAction<number>>;
  openSidebar: boolean;
  setOpenSidebar: (open: boolean) => void;
}) {
  const { userId } = useAppSelector((state) => state.authReducer);

  const { placeholders, pages } = useDictionary();
  const { data: profileData } = useGetUserDetailQuery(userId, {
    skip: userId === "",
  });
  const path = usePathname();
  const router = useRouter();
  return (
    <div
      className="bg-white hidden lg:flex flex-col justify-between border-r-[1px] border border-gray-9 w-[228px] min-w-[228px] h-screen min-h-screen
    pt-[30px] px-[10px]"
    >
      <Dialog
        open={openSidebar}
        onClose={setOpenSidebar}
        className=""
      ><div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0  z-50 w-full ltr:right-0  overflow-y-auto bg-white w-full lg:max-w-[340px] shadow-menu">
          <Notifications
            setOpenSidebar={setOpenSidebar}
            setReadCount={setReadCount}
            unreadCount={unreadCount}
          />
        </DialogPanel>
      </Dialog>
      <div className="space-y-[22px]">
        <div className="bg-green-1 mx-[14px] rounded-[6px] py-1.5 px-1.5 w-max leading-[18px] text-white font-medium text-[18px]">
          <p className="">{placeholders.market}</p>
        </div>
        <div>
          {links.map((link, index) => {
            const active: boolean = path.includes(link?.href);
            const isUpdatesLink = link.href === "/updates";
            const isLinkActive = isUpdatesLink ? openSidebar || active : active;
            return (
              <div
                key={index}
                onClick={() => { if (link.href !== "/updates") { router.push(link.href) } else { setOpenSidebar(true) } }}
                className="px-[14px] flex items-center gap-3 py-3 hover:bg-green-3 cursor-pointer"
              >
                <Image
                  src={isLinkActive ? link.icon?.active : link.icon?.inactive}
                  alt="icon"
                />

                <h2
                  className={`font-normal text-[14px] ${isLinkActive ? "text-green-1" : "text-gray-8"
                    } leading-none`}
                >
                  {
                    pages?.[
                    link?.title?.toLocaleLowerCase() as keyof typeof pages
                    ]
                  }
                </h2>
                {isUpdatesLink && (
                  <div className="min-w-[1.25rem] shrink-0 rounded-full bg-green-1 px-1 py-0.5 text-center text-[10px] font-medium leading-none text-white">
                    {unreadCount || 0}
                  </div>
                )}
              </div>
            );
          })}
          <div
            onClick={() => router.push("/profile")}
            className="px-[14px] flex items-center gap-3 py-3 hover:bg-green-3 cursor-pointer"
          >
            <Image
              src={
                profileData?.data?.image &&
                  !profileData?.data?.image.includes("default-avatar")
                  ? `${profileData?.data?.image}?t=${new Date().getTime()}`
                  : dummyProfile
              }
              height={100}
              width={100}
              alt="icon"
              unoptimized
              loading="lazy"
              className={`h-[26px] w-[26px] rounded-full object-cover ${path.includes("/profile") && "border-[2px] border-green-1"
                }`}
            />
            <h2
              className={`font-normal text-[14px] ${path.includes("/profile") ? "text-green-1" : "text-gray-8"
                } leading-none`}
            >
              {pages.profile}
            </h2>
          </div>
        </div>
      </div>

      <div className=" px-[14px] pb-20">
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
        </div>
        <div className="text-green-1 underline cursor-pointer text-[12px] font-normal -mt-[2px]">
          {placeholders.privacy}
        </div>
        <div className="flex items-center gap-2">
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
  );
}

export default Sidebar;
