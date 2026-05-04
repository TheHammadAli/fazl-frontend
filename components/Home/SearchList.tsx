"use client";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import React, { use, useState } from "react";
import Image from "next/image";
import filterIcon from "@/assets/icons/filter-icon.svg";
import noImageAvtar from "@/assets/images/no-image-av.png";
import ratingIcons from "@/assets/icons/rating-icons.svg";
import { useSearchParams } from "next/navigation";
import crossIcon from "@/assets/icons/cross-icon.svg";
import searchIcon from "@/assets/icons/searchIcon.svg";
import { useRouter } from "next/navigation";
import {
  useSearchProductsQuery,
  useSearchServicesQuery,
} from "@/store/services/homeService";
import AllProductsSkeleton from "./AllProductsSkelton";
import { useDebounce } from "use-debounce";

function SearchList() {
  const { placeholders, error_messages } = useDictionary();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    category: categoryId,
    tab,
    search,
  } = Object.fromEntries(searchParams.entries());
  const [searchValue, setSearchValue] = useState(search || "");
  const [debounceSearch] = useDebounce(searchValue, 500);

  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
  } = useSearchProductsQuery(
    {
      // category: categoryId,
      name: debounceSearch,
    },
    {
      skip:
        // !categoryId || 
        tab !== "products"
    }
  );
  const {
    data: servicesData,
    isLoading: servicesLoading,
    isFetching: servicesFetching,
  } = useSearchServicesQuery(
    {
      // category: categoryId,
      name: debounceSearch,
    },
    {
      skip:
        //  !categoryId ||
        tab !== "services"
    }
  );

  const loading =
    productsLoading || productsFetching || servicesLoading || servicesFetching;
  return (
    <div className="px-5 md:px-10 py-8">
      {/* Search */}
      <div className="relative">
        <Image
          className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2"
          src={searchIcon}
          alt="search_icon"
        />

        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={`${placeholders.search_for} ${placeholders?.[tab as keyof typeof placeholders]
            }
          `}
          className=" h-[46px] px-8 text-[14px] placeholder:text-[14px] text-[#727272] placeholder:text-[#727272] font-normal w-full bg-[#EEF2F3] focus:outline-0 rounded-[8px]"
        />
        <Image
          className="absolute w-3 ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 cursor-pointer "
          onClick={() => setSearchValue("")}
          src={crossIcon}
          alt="cross_icon"
        />
      </div>
      <div className="flex justify-between items-center md:px-3.5 mt-4">
        <div>
          <h1 className="text-black-1 font-medium text-[16px]">
            {placeholders.all}
          </h1>
          {loading ? (
            <div className="h-[14px] rounded-full w-[50px] bg-gray-200 animate-pulses"></div>
          ) : (
            <h4 className="text-[14px] text-gray-8">
              {(tab === "products"
                ? productsData?.meta?.total
                : servicesData?.meta?.total) ?? 0}{" "}
              {tab === "products"
                ? productsData?.meta?.total > 1
                  ? placeholders.products
                  : placeholders.product
                : productsData?.meta?.total > 1
                  ? placeholders.services
                  : placeholders.service}
            </h4>
          )}
        </div>
        <div className="px-[12px] h-[38px] text-[14px] rounded-full border-[1px] border-gray-9 flex items-center gap-2">
          <Image src={filterIcon} alt="filter_icon" />
          {placeholders.filter}
        </div>
      </div>

      {loading ? (
        <AllProductsSkeleton />
      ) : (
        tab === "products"
          ? productsData?.meta?.total > 0
          : servicesData?.meta?.total > 0
      ) ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2  md:gap-x-5 md:gap-y-14 mt-4">
          {(tab === "products"
            ? productsData?.data?.items
            : servicesData?.data
          )?.map(
            (
              item: {
                id: string;
                title: string;
                price: string | number;
                images: string[];
              },
              index: number
            ) => {
              return (
                <div
                  key={index}
                  className=" cursor-pointer"
                  onClick={() => {
                    if (tab === "products") {
                      router.push(`/buy-product?id=${item?.id}`);
                    } else if (tab === "services") {
                      router.push(`/book-service?id=${item?.id}`);
                    }
                  }}
                >
                  <div className="h-[180px] sm:h-[276px] rounded-[16px] overflow-hidden">
                    <Image
                      src={
                        item?.images?.length > 0
                          ? item?.images?.[0]
                          : noImageAvtar
                      }
                      alt={"product_img"}
                      height={100}
                      width={100}
                      className="h-full w-full object-cover bg-gray-12"
                      unoptimized
                    />
                  </div>
                  <h2 className="text-black-1 font-medium text-[16px] mt-3 line-clamp-1 first-letter:capitalize ">
                    {item?.title}
                  </h2>
                  <div className="flex gap-2">
                    <Image src={ratingIcons} alt="rating_icon" />
                    <span className="text-gray-8 text-[14px] font-normal">
                      (8)
                    </span>
                  </div>
                  <h2 className="text-green-1 font-normal text-[16px]  ">
                    {placeholders.Rs} {item?.price}
                  </h2>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div className="h-[80vh] flex items-center justify-center w-full text-black-1">
          {error_messages.no_product_data}
        </div>
      )}
    </div>
  );
}

export default SearchList;
