"use client";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import React from "react";
import Image from "next/image";
import filterIcon from "@/assets/icons/filter-icon.svg";
import { useGetUsersShopsQuery } from "@/store/services/sellingService";
import noImageAvtar from "@/assets/images/no-image-av.png";
import MyShopsSkeleton from "./MyShopsSkelton";
import productImage from "@/assets/images/product-image.jpg";
import ratingIcons from "@/assets/icons/rating-icons.svg";
interface shopTypes {
  title: string;
  id: string;
  image: string;
  description: string;
}
function ShopProductsList() {
  const { placeholders, error_messages } = useDictionary();
  const { data, isLoading, isFetching, isError, error } =
    useGetUsersShopsQuery("");
  const loading = isLoading || isFetching;
  if (isError) {
    return (
      <div className="h-[80vh] flex items-center justify-center w-full text-red-1">
        {error_messages.shop_error}
      </div>
    );
  }

  return (
    <div className="px-5 md:px-6">
      <div className="flex justify-between items-center md:px-3.5 mt-4">
        <div>
          <h1 className="text-black-1 font-medium text-[16px]">
            {placeholders.total}
          </h1>
          {loading ? (
            <div className="h-[14px] rounded-full w-[50px] bg-gray-200 animate-pulses"></div>
          ) : (
            <h4 className="text-[14px] text-gray-8">
              {data?.data.length ?? 0}{" "}
              {data?.data.length > 1 ? placeholders.shops : placeholders.shop}
            </h4>
          )}
        </div>
        <div className="px-[12px] h-[38px] text-[14px] rounded-full border-[1px] border-gray-9 flex items-center gap-2">
          <Image src={filterIcon} alt="filter_icon" />
          {placeholders.filter}
        </div>
      </div>

      {/* listing  */}
      {/* {!loading && data?.data.length > 0 && ( */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 md:gap-5 mt-4">
        {Array.from({ length: 6 }).map((shop, index) => {
          return (
            <div key={index} className="">
              <div className="h-[180px] sm:h-[230px] rounded-[16px] overflow-hidden">
                <Image
                  src={productImage}
                  alt={"product_img"}
                  className="h-full w-full object-cover"
                />
              </div>
              <h2 className="text-black-1 font-medium text-[16px] mt-3">
                Men’s Blue Jeans High...
              </h2>
              <div className="flex gap-2">
                <Image src={ratingIcons} alt="rating_icon" />
                <span className="text-gray-8 text-[14px] font-normal">(8)</span>
              </div>
              <h2 className="text-green-1 font-normal text-[16px]">Rs 1500</h2>
            </div>
          );
        })}
      </div>
      {/* )} */}
      {/* {
        // no data found
        !loading && data?.data?.length === 0 && (
          <div className="h-[80vh] flex items-center justify-center w-full text-black-1">
            {error_messages.no_shops_data}
          </div>
        )
      }
      {loading && <MyShopsSkeleton />} */}
    </div>
  );
}

export default ShopProductsList;
