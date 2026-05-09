"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import tickIcon from "@/assets/icons/tick-circle.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
interface Props {
  setStatus: (val: string) => void;
}
function ProductListed({ setStatus }: Props) {
  const id = useSearchParams().get("id") as string;
  const type = useSearchParams().get("type") as string;
  const router = useRouter();
  const { info_messages, placeholders } = useDictionary();
  return (
    <div className="w-full max-w-[422px]">
      <div className="flex flex-col items-center mt-[80px]">
        <Image src={tickIcon} alt="tick-icon" className=" rounded-full" />
        <h1 className="font-medium text-[22px] text-black-1 mt-3">
          {info_messages.product_listed}
        </h1>
        <h3 className="text-center text-[14px] font-normal text-gray-8 max-w-[310px]">
          {info_messages.most_listings}
        </h3>
      </div>

      <div className="mt-42">
        {/* <button className="mt-6  h-[50px] w-full rounded-[12px] text-white font-medium text-[16px]  bg-green-1 cursor-pointer">
          {placeholders.boost_product}
        </button> */}
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="mt-6 border-[1px] border-green-1 text-green-1   h-[50px] w-full rounded-[12px] hover:text-white font-medium text-[16px] hover:bg-green-1 cursor-pointer"
        >
          {placeholders.list_another}
        </button>
        <div className="text-center flex justify-center w-full text-green-1 font-medium text-[16px] mt-6 ">
          <p
            className="w-max cursor-pointer hover:underline"
            onClick={() => {
              if (type && type === "personal") {
                router.push(`/selling`);
              } else {
                router.push(`/selling/shop-detail?id=${id}`);
              }
            }}
          >
            {" "}
            {placeholders.later}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductListed;
