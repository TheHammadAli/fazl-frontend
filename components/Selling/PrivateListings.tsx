"use client";
import React from "react";
import Image from "next/image";
import chevron from "@/assets/icons/chev-down-icon.svg";
import dummyProd from "@/assets/images/product-image.jpg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useGetShopOrdersQuery } from "@/store/services/sellingService";
import { useSearchParams } from "next/navigation";
import noImageAvtar from "@/assets/images/no-image-av.png";
function PrivateListings() {
  const id = useSearchParams().get("id");
  const { tabs, placeholders, error_messages } = useDictionary();
  const tabsList = [
    "all",
    "in_progress",
    "order_received",
    "cancelled",
    "sold",
  ];

  const { data: orders, isLoading, isFetching } = useGetShopOrdersQuery(id);
  return (
    <div className="px-4 py-5">
      <div className="flex flex-wrap gap-2 ">
        {tabsList?.map((tab, index) => {
          return (
            <div
              key={index}
              className={` py-2 leading-[14px] px-3 rounded-full border-[1px] text-[14px] font-normal text-[#030303] ${
                index === 0
                  ? "border-green-1 bg-[#E6FBFB]"
                  : "border-[#D3D3D3] bg-transparent"
              }`}
            >
              {tabs?.[tab as keyof typeof tabs]}
            </div>
          );
        })}
      </div>
      {orders?.data?.length > 0 ? (
        <div className="mt-6 space-y-7">
          {orders?.data?.map(
            (
              order: {
                status: string;

                product: {
                  title: string;
                  price: number | string;
                  images: string[];
                } | null;
              },
              index: number
            ) => (
              <div
                key={index}
                className="flex items-center justify-between hover:bg-[#E6FBFB] p-2 rounded-lg cursor-pointer"
              >
                <div className="flex gap-3">
                  <Image
                    src={
                      (order?.product?.images?.length ?? 0) > 0
                        ? (order?.product?.images[0] as string)
                        : noImageAvtar
                    }
                    height={100}
                    width={100}
                    alt="product"
                    className="h-[66px] w-[66px] object-cover rounded-xl"
                  />
                  <div>
                    <h1 className="text-[#030303] font-medium text-[16px]">
                      {order?.product?.title ?? ""}
                    </h1>
                    <h3 className="text-green-1 font-medium text-[14px]">
                      {placeholders.Rs} {order?.product?.price ?? ""}
                    </h3>
                    <h4 className="font-normal text-[#E92440] text-[14px]">
                      {
                        placeholders?.[
                          order?.status as keyof typeof placeholders
                        ]
                      }
                    </h4>
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
          <div className="w-full  h-[300px] flex items-center justify-center">
            {error_messages.no_orders_data}
          </div>
        )
      )}
    </div>
  );
}

export default PrivateListings;
