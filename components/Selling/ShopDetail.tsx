"use client";

import Image from "next/image";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import chevron from "@/assets/icons/chev-down-icon.svg";
import profileImg from "@/assets/images/dummy-profile-image.jpg";
import tickGray from "@/assets/icons/completed-tick-gray.svg";
import locationIcon from "@/assets/icons/location-gray.svg";
import ShopProducts from "./ShopProducts";
import { useGetShopDetailQuery } from "@/store/services/sellingService";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import ShopInfoSkelton from "./ShopInfoSkelton";
import { useGetUserDetailQuery } from "@/store/services/profileService";

export default function ShopDetail() {
  const router = useRouter();
  const { pages, placeholders } = useDictionary();
  const id = useSearchParams().get("id");
  const userData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const { user } = userData;
  const {
    data: shop,
    isLoading: isShopLoading,
    isSuccess: isShopSuccess,
    isFetching: isShopFetching,
  } = useGetShopDetailQuery(id, {
    skip: !id,
  });

  useEffect(() => {
    if (!id) {
      router.back();
    }
  }, []);
  return (
    <div>
      <div className="px-5 md:px-6 h-[61px] border-b-[1px] border-gray-9 bg-white w-full  flex justify-center">
        <div className="w-full min-w-max  overflow-scroll flex items-center gap-[6px] font-normal text-[14px] mt-5">
          <span className="text-gray-8">{pages.selling}</span>
          <Image
            src={chevron}
            alt="chevron"
            className="-rotate-90 rtl:rotate-90"
          />
          <span className="text-gray-8">{placeholders.my_shops}</span>
          <Image
            src={chevron}
            alt="chevron"
            className="-rotate-90 rtl:rotate-90"
          />
          <span className="text-green-1">{shop?.data?.title ?? ""}</span>
        </div>
      </div>
      <div className="md:flex min-h-screen">
        {/* Sidebar */}

        <div className="md:w-[35%] border-r-[1px] border-gray-9 p-4 xl:p-6 space-y-[16px] md:space-y-[20px]">
          <h2 className="text-black-1 font-semibold text-[16px] leading-none">
            {placeholders.about}
          </h2>
          <div>
            {isShopLoading || isShopFetching ? (
              <ShopInfoSkelton />
            ) : (
              <div className="space-y-[16px] md:space-y-[20px]">
                <div className="flex items-center gap-[14px]">
                  <div className="h-[66px] w-[66px] min-w-[66px] rounded-full overflow-hidden">
                    {shop?.data?.image ? (
                      <Image
                        src={profileImg}
                        alt="profile"
                        className="rounded-full h-full w-full object-cover"
                      />
                    ) : (
                      <div className="uppercase text-green-1 text-[24px] font-medium h-full w-full flex items-center justify-center bg-green-4">
                        {shop?.data?.title?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="  text-black-3 text-[18px] font-medium">
                      {shop?.data?.title}
                    </h2>
                    <p className="text-[16px] font-normal text-gray-13">
                      {user?.email ?? ""}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-[14px] font-normal">
                  <h3 className="text-gray-8">{placeholders.about_us}</h3>
                  <h3 className="text-green-1 cursor-pointer underline">
                    {placeholders.edit}
                  </h3>
                </div>

                <div className=" font-light text-[15px] text-black-1 -mt-3">
                  <p>{shop?.data?.description}</p>
                  <div className="mt-3 space-y-1">
                    <div className="flex gap-1.5  items-center">
                      <Image src={tickGray} alt="tick" />
                      <span className="text-gray-8 font-light text-[14px]">
                        {user?.email ?? ""}
                      </span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <Image src={locationIcon} alt="location" />
                      <span className="text-gray-8 font-light text-[14px]">
                        {shop?.data?.address ?? ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex lg:justify-between gap-2 mt-4">
                  <div className="bg-gray-12 h-[73px] px-4 xl:px-6 w-[168px]  rounded-[14px] flex flex-col justify-center">
                    <p className="text-[14px] text-gray-8  font-normal">
                      {placeholders.total_orders}
                    </p>
                    <p className="font-medium text-[20px] text-black-1">21</p>
                  </div>

                  <div className="bg-gray-12 h-[73px]  px-4 xl:px-6 w-[168px]  rounded-[14px] flex flex-col justify-center">
                    <p className="text-[14px] text-gray-8  font-normal">
                      {placeholders.products_sold}
                    </p>
                    <p className="font-medium text-[20px] text-black-1">21</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() =>
                      router.push(`/selling/list-product?id=${shop?.data?.id}`)
                    }
                    className="w-full max-w-[400px] bg-green-1 text-[16px] h-[46px] font-medium text-white flex items-center justify-center rounded-xl cursor-pointer"
                  >
                    {placeholders.list_product}
                  </button>
                  <button className="w-full max-w-[400px] bg-white border-[1px] border-green-1 text-green-1 text-[16px] h-[46px] font-medium flex items-center justify-center rounded-xl cursor-pointer">
                    {placeholders.promote_shop}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-[65%] xl:pr-5">
          <ShopProducts />
        </div>
      </div>
    </div>
  );
}
