"use client";
import React from "react";
import Image from "next/image";
import chevron from "@/assets/icons/chev-down-icon.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useGetUserProductsQuery } from "@/store/services/sellingService";
import { useRouter } from "next/navigation";
import testImage from "@/assets/images/product-image.jpg";
import noProductsOrShopIcon from "@/assets/icons/no-products-or-shop.svg";
import { useAppSelector } from "@/store/store";

function PrivateListings() {
  const { placeholders, info_messages } = useDictionary();
  const userId = useAppSelector((state) => state.authReducer.userId);
  const router = useRouter();

  const {
    data: products,
    isLoading,
    isFetching,
  } = useGetUserProductsQuery(userId, { skip: !userId });
  return (
    <div className="px-4 py-5">
      <div className="flex justify-between items-center  ">
        <div>
          <h1 className="text-black-1 font-medium text-[16px]">
            {placeholders.total}
          </h1>

          <h4 className="text-[14px] text-gray-8">
            {products?.data.length ?? 0}{" "}
            {products?.data.length > 1
              ? placeholders.products
              : placeholders.product}
          </h4>
        </div>
        {/* <div className="px-[12px] h-[38px] text-[14px] rounded-full border-[1px] border-gray-9 flex items-center gap-2">
          <Image src={filterIcon} alt="filter_icon" />
          {placeholders.filter}
        </div> */}
      </div>
      {userId && products?.data?.length > 0 ? (
        <div className="mt-6 space-y-7">
          {products?.data?.map(
            (
              product: {
                id: string;
                images: string[];
                title: string;
                price: number;
                reviewCount: number;
              },
              index: number
            ) => (
              <div
                key={index}
                onClick={() => {
                  router.push(
                    `/selling/product-detail?id=${product?.id}&type=personal`
                  );
                }}
                className="flex items-center justify-between hover:bg-[#E6FBFB] p-2 rounded-lg cursor-pointer"
              >
                <div className="flex gap-3 items-center">
                  <Image
                    src={
                      product?.images?.length > 0
                        ? product?.images?.[0]
                        : testImage
                    }
                    height={100}
                    width={100}
                    unoptimized
                    alt="product"
                    className="h-[66px] w-[66px] object-cover rounded-xl"
                  />

                  <div>
                    <h1 className="text-[#030303] font-medium text-[16px]">
                      {product?.title ?? ""}
                    </h1>
                    <h3 className="text-green-1 font-medium text-[14px] space-x-2">
                      <span>
                        {placeholders.Rs} {product?.price}
                      </span>
                      {/* <span className="line-through font-light text-[#4B514F] text-[14px]">
                        {placeholders.Rs} 
                      </span> */}
                      {/* <span className="font-light text-[#4B514F] text-[14px]">
                        (30% off)
                      </span> */}
                    </h3>
                    {/* <h4 className="font-light text-[#4B514F] text-[14px]">
                      {(product?.reviewCount ?? 0) + " " + (product?.reviewCount === 1 ? placeholders.review : placeholders.reviews)}
                    </h4> */}
                  </div>
                </div>
                <div>
                  <Image
                    src={chevron}
                    alt="chevron"
                    className="ltr:-rotate-90 rtl:rotate-90 w-3.5"
                  />
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        !isLoading &&
        !isFetching && (
          <div className="flex min-h-[300px] w-full items-center justify-center px-4 py-10">
            <div className="flex max-w-[320px] flex-col items-center text-center">
              <Image
                src={noProductsOrShopIcon}
                alt=""
                width={140}
                height={140}
                unoptimized
                className="h-auto w-[140px] max-w-full"
              />
              <h2 className="mt-4 text-[16px] font-medium text-[#030303] sm:text-[18px]">
                {info_messages.no_products_yet}
              </h2>
              <p className="mt-2 text-[14px] font-normal leading-relaxed text-[#4B514F]">
                {info_messages.no_private_listings_subtitle}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default PrivateListings;
